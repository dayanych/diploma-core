import { ApiProperty } from '@nestjs/swagger';

export class ServiceAvailabilityDownloadBody {
  @ApiProperty({
    type: String,
  })
  path: string;
}
