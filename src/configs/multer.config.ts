import * as path from 'path';
import * as os from 'os';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

const systemTempDirectory = `${os.tmpdir()}/diploma`;
const allowedDocumentFormats = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const defineFileName = (req, file, callback) => {
  const uniqueId = uuidv4();
  const extension = path.extname(file.originalname);
  callback(null, `${uniqueId}${extension}`);
};

const facilityDocumentFilter = (req, file, callback) => {
  if (allowedDocumentFormats.includes(file.mimetype)) {
    callback(null, true);
  } else {
    req.fileValidationError = `Invalid file MIME type - ${file.mimetype} is not supported`;
    callback(null, false);
  }
};

const tempSystemStorage = diskStorage({
  destination: systemTempDirectory,
  filename: defineFileName,
});

const facilityDocumentConfig = {
  storage: tempSystemStorage,
  fileFilter: facilityDocumentFilter,
};

export { facilityDocumentConfig };
