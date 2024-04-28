import * as XLSX from 'sheetjs-style';
import { Injectable } from '@nestjs/common';
import { parseCellData } from 'src/helpers/parse-cell-data';
import { CommissionsServiceAvailabilityHeaders } from './desired-headers/commissions-service-availability';

@Injectable()
export class GraphsService {
  getCommissionsFromServiceAvailability(file: Express.Multer.File): {
    [key: string]: string;
  }[] {
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    const filteredData = data.map((item) =>
      Object.entries(item).reduce((acc, [key, value]) => {
        if (CommissionsServiceAvailabilityHeaders.includes(key)) {
          if (key === CommissionsServiceAvailabilityHeaders[0]) {
            acc[key] = value;
          } else {
            acc[key] = parseCellData(value);
          }
        }
        return acc;
      }, {}),
    );

    return filteredData;
  }
}
