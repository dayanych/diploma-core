import {
  Controller,
  Header,
  Options,
  Post,
  Res,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileUploadBody } from 'src/bodies/file-upload.body';
import { facilityDocumentConfig } from 'src/configs/multer.config';
import { MulterValidationError } from 'src/decorators/multer-validation-error.decorator';
import { GraphsService } from '../service/graphs.service';

@ApiTags('Graphs')
@Controller('graphs')
export class GraphsController {
  constructor(private readonly graphsService: GraphsService) {}

  @Options('service-availability/commissions')
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
  @Post('service-availability/commissions')
  @UseInterceptors(FileInterceptor('file', facilityDocumentConfig))
  async getCommissionsFromServiceAvailability(
    @UploadedFile() file: Express.Multer.File,
    @MulterValidationError() multerValidationError: string,
  ): Promise<{
    data: {
      [key: string]: string;
    }[];
  }> {
    if (multerValidationError) {
      throw new UnsupportedMediaTypeException(multerValidationError);
    }

    const data = this.graphsService.getCommissionsFromServiceAvailability(file);

    return { data };
  }
}
