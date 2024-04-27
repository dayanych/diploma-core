import { createReadStream } from 'fs';
import type { Response } from 'express';
import * as path from 'path';
import {
  Body,
  Controller,
  Post,
  Res,
  StreamableFile,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { facilityDocumentConfig } from 'src/configs/multer.config';
import { MulterValidationError } from 'src/decorators/multer-validation-error.decorator';
import { FileUploadBody } from 'src/bodies/file-upload.body';
import { ParserService } from '../service/parser.service';
import { ServiceAvailabilityDownloadBody } from './bodies/service-availability-download.body';

@ApiTags('Parser')
@Controller('/parser')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Post('document/download')
  async getStaticFile(
    @Res({ passthrough: true }) res: Response,
    @Body() body: ServiceAvailabilityDownloadBody,
  ): Promise<StreamableFile> {
    const file = createReadStream(body.path);
    const fileName = path.basename(body.path);

    res.set({
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(file);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'User profile photo',
    type: FileUploadBody,
  })
  @Post('service-availability/upload')
  @UseInterceptors(FileInterceptor('file', facilityDocumentConfig))
  async uploadServiceAvailability(
    @UploadedFile() file: Express.Multer.File,
    @MulterValidationError() multerValidationError: string,
  ): Promise<string> {
    if (multerValidationError) {
      throw new UnsupportedMediaTypeException(multerValidationError);
    }

    const outputPath =
      this.parserService.parseServiceAvailabilityToRemunerationNotice(file);

    return outputPath;
  }

  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   description: 'User profile photo',
  //   type: FileUploadBody,
  // })
  // @Post('xlsx/upload')
  // @UseInterceptors(FileInterceptor('file', facilityDocumentConfig))
  // parseXlsx(
  //   @UploadedFile() file: Express.Multer.File,
  //   @MulterValidationError() multerValidationError: string,
  // ): void {
  //   if (multerValidationError) {
  //     throw new UnsupportedMediaTypeException(multerValidationError);
  //   }

  //   this.parserService.parseXlsx(file);
  //   this.parserService.createTable();
  // }
}
