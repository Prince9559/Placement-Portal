
const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const allowedMimeTypes = {
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedTypes = allowedMimeTypes[extension];

  if (!allowedTypes || !allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only valid PDF, DOC and DOCX files are allowed")
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

module.exports = upload;
