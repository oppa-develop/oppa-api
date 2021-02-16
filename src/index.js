'use strict';

const express = require('express');
var cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const multer = require('multer');
const storage = require('./libs/multer')
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const https = require('https');

// Initializations
const app = express();

// Settings
app.set('port', process.env.port || 3000);
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      version: "1.0.0",
      title: "Oppa API",
      description: "This is the documentation of the Oppa API REST.",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: 'https://localhost:' + app.get('port') + '/api',
        description: 'Development server (local with test data).'
      },
      {
        url: 'http://oppa.proyectosfit.cl/api',
        description: 'Development server (online with test data).'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};
const swaggerDocument = swaggerJsDoc(swaggerOptions);

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(multer({
  storage
}).single('image')) // atributo name del input de imagen del frontend

// Headers
app.use(cors());

// Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/services', require('./routes/services.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/superCategories', require('./routes/super-categories.routes'));
app.use('/api/addresses', require('./routes/addresses.routes'));

// Public
app.use('/api/public', express.static(path.join(__dirname, './public')));

// Starting the server
/* app.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
}); */
https.createServer({
  key: fs.readFileSync(path.join(__dirname, './ssl/oppa.key')),
  cert: fs.readFileSync(path.join(__dirname, './ssl/oppa.crt'))
}, app).listen(app.get('port'), function(){
  console.log("HTTPS server listening on port " + app.get('port') + "...");
});