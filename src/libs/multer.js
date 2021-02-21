
const multer = require('multer');
const path = require('path');
let storage = {};

storage = multer.diskStorage({
  destination: path.join(__dirname, `../public/images`),
  fileFilter: (req, file, callback) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimetype && extname) callback(null, true)
    callback('Error: File not valid.')
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname.toLowerCase())
  }
});

module.exports = storage;