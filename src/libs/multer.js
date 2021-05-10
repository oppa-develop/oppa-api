
const multer = require('multer');
const path = require('path');
let storage = {};

storage.clients = multer.diskStorage({
  destination: path.join(__dirname, `../public/images/users`),
  fileFilter: (req, file, callback) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = req.body.image_ext;

    if (mimetype && extname) callback(null, true)
    callback('Error: File not valid.')
  },
  filename: (req, file, callback) => {
    /**
     * el req de multer solo muestra los datos que vengan ANTES de la imagen,
     * por lo que es recomendable mandar la imagen al final del JSON
     */
    callback(null, req.body.rut + '.' + req.body.image_ext);
  }
});

storage.services = multer.diskStorage({
  destination: path.join(__dirname, `../public/images/services`),
  fileFilter: (req, file, callback) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = req.body.image_ext;

    if (mimetype && extname) callback(null, true)
    callback('Error: File not valid.')
  },
  filename: (req, file, callback) => {
    /**
     * el req de multer solo muestra los datos que vengan ANTES de la imagen,
     * por lo que es recomendable mandar la imagen al final del JSON
     */
    callback(null, req.body.title.replace(/ /g, '_') + '.' + req.body.image_ext);
  }
});

storage.categories = multer.diskStorage({
  destination: path.join(__dirname, `../public/images/categories`),
  fileFilter: (req, file, callback) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = req.body.image_ext;

    if (mimetype && extname) callback(null, true)
    callback('Error: File not valid.')
  },
  filename: (req, file, callback) => {
    /**
     * el req de multer solo muestra los datos que vengan ANTES de la imagen,
     * por lo que es recomendable mandar la imagen al final del JSON
     */
    callback(null, req.body.title.replace(/ /g, '_') + '.' + req.body.image_ext);
  }
});

module.exports = storage;