'use strict';

require('dotenv').config();
const express = require('express');
var cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Initializations
const app = express();

// Settings
app.set('port', process.env.port || 3000);
const swaggerOptions = {
  swaggerDefinition: {
    swagger: '2.0',
    info: {
      version: "1.0.0",
      title: "Nodejs-Express-Mysql-Template",
      description: "This is a nodejs template with express and mysql.",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      } 
    },
    basePath: '/api',
    schemes: ['https']
  },
  apis: ['./src/routes/*.js']
};
const swaggerDocument = swaggerJsDoc(swaggerOptions);

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Headers
app.use(cors());

// Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));

// Public
app.use('/api/public', express.static(path.join(__dirname, './public')));

// Starting the server
app.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});