'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config({path: path.join(__dirname, '../.env')});
const https = require('http');
const fs = require('fs');
const dayjs = require('dayjs');
const servicesModel = require('./models/services.model');

// Initializations
const app = express();
const server = https.createServer({
  key: fs.readFileSync(path.join(__dirname, './cert/privkey1.pem'), 'utf8'),
  cert: fs.readFileSync(path.join(__dirname, './cert/fullchain1.pem'), 'utf8')
}, app)

// Settings
app.set('port', process.env.PORT || 3000);

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
        url: "http://localhost:" + 3000 + "/api",
        description: "Development server (local with test data)."
      },
      {
        url: "https://api.somosoppa.cl/api",
        description: 'Development server (online with test data).'
      }
    ]
  },
  // apis: ['./src/routes/*.js']
  apis: [path.join(__dirname, './routes/*.js')]
};
const swaggerDocument = swaggerJsDoc(swaggerOptions);

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
/* app.use(multer({
  storage
}).single('image')) // atributo name del input de imagen del frontend */

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
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/wallets', require('./routes/wallets.routes'));
app.use('/api/chats', require('./routes/chats.routes'));
app.use('/api/records', require('./routes/records.routes'));
app.use('/api/transbank', require('./routes/transbank.routes'));

// Public
app.use('/api/public', express.static(path.join(__dirname, './public')));

// Starting the server
server.listen(app.get('port'), () => {
  console.clear()
  console.log("HTTPS server listening on port " + app.get('port'));
});

// websockets configurations
const io = require('socket.io')(server, {
  cors: {
    "origin": "*",
    "methods": "*",
  }
});

const connectionHandlers = require("./handlers/connection.handlers");
const chatHandlers = require("./handlers/chat.handlers");
const notificationHandlers = require("./handlers/notification.handlers");

const onConnection = (socket) => {
  connectionHandlers(io, socket);
  chatHandlers(io, socket);
  notificationHandlers(io, socket);
}

io.on("connection", onConnection);