import * as XLSX from 'sheetjs-style';
import * as fs from 'fs';
import { join } from 'path';
import { format } from 'date-fns';
import { Injectable } from '@nestjs/common';
import { parseCellData } from 'src/helpers/parse-cell-data';
import { getFutureDate } from 'src/helpers/get-future-date';
import { formatDate } from 'src/helpers/format-date';
import { getStylesConfig } from 'src/configs/styles.config';
import { serviceAvailabilityToRemunerationNoticeRows } from './desired-headers/service-availability-to-remuneration-notice';
import { serviceAvailabilityToCommissionsRows } from './desired-headers/service-availability-to-commissions';

@Injectable()
export class ParserService {
  baseStylesConfig = getStylesConfig();
  parseXlsx(file: Express.Multer.File): void {
    const workbook = XLSX.readFile(file.path);

    const sheet = Object.keys(workbook.Sheets).map((key) => ({
      name: key,
      data: XLSX.utils.sheet_to_json(workbook.Sheets[key]),
    }));

    sheet.forEach((item) => {
      console.log(item.data);
    });
  }

  createTable() {}

  parseServiceAvailabilityToRemunerationNotice(
    file: Express.Multer.File,
  ): string {
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    const filteredData = data.map((row) =>
      serviceAvailabilityToRemunerationNoticeRows.reduce(
        (filteredRow, header) => {
          if (row.hasOwnProperty(header)) {
            if (
              header === serviceAvailabilityToRemunerationNoticeRows[1] ||
              header === serviceAvailabilityToRemunerationNoticeRows[2]
            ) {
              const cellData = row[header];
              const cellDataParsed = parseCellData(cellData);
              filteredRow.push(cellDataParsed);
            } else if (
              header === serviceAvailabilityToRemunerationNoticeRows[0]
            ) {
              filteredRow.push(row[header]);
              filteredRow.push('');
            } else if (
              header === serviceAvailabilityToRemunerationNoticeRows[3]
            ) {
              filteredRow.push(getFutureDate(3));
            } else if (
              header === serviceAvailabilityToRemunerationNoticeRows[4]
            ) {
              const idWithName =
                row[serviceAvailabilityToRemunerationNoticeRows[3]] +
                ' ' +
                row[header];

              filteredRow.push(idWithName);
            }
          }
          return filteredRow;
        },
        [],
      ),
    );

    const outputPath = this.createXlsxRemunerationNotice(filteredData);

    return outputPath;
  }

  parseServiceAvailabilityToCommissions(file: Express.Multer.File): string {
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    const filteredData = data.map((row) =>
      serviceAvailabilityToCommissionsRows.reduce((filteredRow, header) => {
        if (row.hasOwnProperty(header)) {
          if (header === serviceAvailabilityToCommissionsRows[0]) {
            const idWithName =
              row[serviceAvailabilityToRemunerationNoticeRows[3]] +
              ' ' +
              row[header];

            filteredRow.push(idWithName);
          } else if (
            header === serviceAvailabilityToCommissionsRows[1] ||
            header === serviceAvailabilityToCommissionsRows[2] ||
            header === serviceAvailabilityToCommissionsRows[3]
          ) {
            const cellData = row[header];
            const cellDataParsed = parseCellData(cellData);
            filteredRow.push(cellDataParsed);
          }
        }
        return filteredRow;
      }, []),
    );

    console.log(filteredData);

    const outputPath = this.createXlsxCommissions(filteredData);

    return outputPath;
  }

  createXlsxRemunerationNotice(data: any[][]): string {
    const aoa = [
      [
        `Уведомление о размере вознаграждений Агента от ${formatDate(new Date())}`,
      ],
      [],
      [],
      [],
      [
        'Наименование Категории операций',
        'Текущая ставка вознаграждения Агента, в том числе НДС,% сумма за 1 платеж (справочно)',
        'Ставка вознаграждения, в том числе НДС 12%,  %/сумма за 1 платеж',
        null,
        'Дата вступления в силу ставки вознаграждения Агента',
        'Комментарии',
      ],
      [
        null,
        null,
        'Нижняя комиссия с мерчанта',
        'Ставка вознаграждения Агента ',
      ],
      ...data,
    ];
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(aoa);

    const merge = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } },
      { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } },
      { s: { r: 4, c: 4 }, e: { r: 5, c: 4 } },
      { s: { r: 4, c: 5 }, e: { r: 5, c: 5 } },
      { s: { r: 4, c: 2 }, e: { r: 4, c: 3 } },
    ];
    sheet['!merges'] = merge;

    const styles = {
      mainHeader: {
        alignment: this.baseStylesConfig.alignment,
        font: { ...this.baseStylesConfig.font, sz: 14, bold: true },
      },
      defaultStyle: {
        ...this.baseStylesConfig,
        font: { ...this.baseStylesConfig.font, sz: 11 },
      },
    };

    for (const cellAddress in sheet) {
      if (cellAddress.startsWith('!')) continue;
      sheet[cellAddress].s = styles.defaultStyle;
    }
    sheet['A1'].s = styles.mainHeader;

    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');

    const folderName = join(process.cwd(), 'documents');

    try {
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
      }
    } catch (err) {
      console.error(err);
    }

    const outputPath = join(
      folderName,
      `remuneration-notice-${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`,
    ).replace(/\\/g, '/');

    XLSX.writeFile(workbook, outputPath);

    return outputPath;
  }

  createXlsxCommissions(data: any[][]): string {
    const aoa = [
      [`Уведомление о коммиссии Агента от ${formatDate(new Date())}`],
      [],
      [],
      [],
      [
        'MFS ID',
        'Верхняя комиссия',
        'Нижняя комиссия',
        'Расчетная специалиста',
      ],
      ...data,
    ];

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(aoa);

    const merge = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
    sheet['!merges'] = merge;

    const styles = {
      mainHeader: {
        alignment: this.baseStylesConfig.alignment,
        font: { ...this.baseStylesConfig.font, sz: 14, bold: true },
      },
      defaultStyle: {
        ...this.baseStylesConfig,
        font: { ...this.baseStylesConfig.font, sz: 11 },
      },
    };

    for (const cellAddress in sheet) {
      if (cellAddress.startsWith('!')) continue;
      sheet[cellAddress].s = styles.defaultStyle;
    }
    sheet['A1'].s = styles.mainHeader;

    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');

    const folderName = join(process.cwd(), 'documents');
    try {
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
      }
    } catch (err) {
      console.error(err);
    }

    const outputPath = join(
      folderName,
      `commissions-${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`,
    ).replace(/\\/g, '/');

    XLSX.writeFile(workbook, outputPath);

    return outputPath;
  }
}
