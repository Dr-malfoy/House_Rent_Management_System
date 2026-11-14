const multer = require('multer');
const path = require('path');
const fs = require('fs');

const housesDir = path.join(__dirname, '../../uploads/houses');
const nidDir = path.join(__dirname, '../../uploads/nid');

// Ensure directories exist
if (!fs.existsSync(housesDir)) fs.mkdirSync(housesDir, { recursive: true });
if (!fs.existsSync(nidDir)) fs.mkdirSync(nidDir, { recursive: true });

// House image storage
const houseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, housesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `house-${uniqueSuffix}${ext}`);
  },
});

// NID storage (private documents)
const nidStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, nidDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `nid-${req.user ? req.user.id : 'anon'}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP image files are allowed.'));
  }
};

const uploadHouseImages = multer({
  storage: houseStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter,
});

const uploadNidDocs = multer({
  storage: nidStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter,
});

module.exports = {
  uploadHouseImages,
  uploadNidDocs,
};
