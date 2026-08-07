import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files allowed'), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10,
  },
});

export const uploadSingle = (field) => upload.single(field);
export const uploadMultiple = (field, max = 10) => upload.array(field, max);
export const uploadFields = (fields) => upload.fields(fields);
