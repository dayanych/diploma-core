import { createReadStream } from 'fs';
import type { Response } from 'express';
import * as path from 'path';
import {
  Body,
  Controller,
  Header,
  Options,
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

  @Options('document/download')
  handleDownloadOptionsRequest(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  }
  @Header('Access-Control-Allow-Origin', 'http://localhost:5173')
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

  @Options('service-availability/upload')
  handleOptionsRequest(@Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  }
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: FileUploadBody,
  })
  @Header('Access-Control-Allow-Origin', 'http://localhost:5173')
  @Post('service-availability/upload')
  @UseInterceptors(FileInterceptor('file', facilityDocumentConfig))
  async uploadServiceAvailability(
    @UploadedFile() file: Express.Multer.File,
    @MulterValidationError() multerValidationError: string,
  ): Promise<{ path: string }> {
    if (multerValidationError) {
      throw new UnsupportedMediaTypeException(multerValidationError);
    }

    const outputPath =
      this.parserService.parseServiceAvailabilityToRemunerationNotice(file);

    return {
      path: outputPath,
    };
  }

  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
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
