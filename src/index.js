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
        url: 'http://localhost:' + app.get('port') + '/api',
        description: 'Development server (local with test data).'
      },
      {
        url: process.env.HOST + '/api',
        description: 'Development server (online with test data).'
      }
    ]
  },
  apis: ['./src/routes/*.js']
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

// Public
app.use('/api/public', express.static(path.join(__dirname, './public')));

// Starting the server
server.listen(app.get('port'), () => {
  console.clear()
  console.log("HTTPS server listening on port " + app.get('port'));
});
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["*"]
  }
});

// Socket setup
const servicesModel = require('./models/services.model');
io.on('connection', (socket) => {
  console.log('User connected:', socket.handshake.query.firstname, socket.handshake.query.lastname);
  socket.on('connectToChat', data => {
    console.log('Connecting user to chat:', data.chat);
    if (data.chat) socket.join(data.chat)
  });
  
  socket.on('message', data => {
    console.log('Message:', data.text);
    socket.to(data.chat).broadcast.emit('message', data);
  });

  socket.on('requestService', async data => {
    console.log('usuario', data.receptor.user_id, 'solicita servicio:', data.service_id);
    // await socket.join('requestService' + data.receptor.user_id)

    // buscamos el servicio q le vamos a asignar
    servicesModel.getProvidersHasServices(data.service_id)
      .then(possibleServices => {
        let possibleServicesFiltered = []
        possibleServices.forEach(service => {
          console.log('filtro 1', data.receptor.gender, service.gender, (data.receptor.gender == service.gender || service.gender == 'unisex'));
          if ((data.receptor.gender == service.gender || service.gender == 'unisex') && (dayjs(data.hour).format('HH:mm:ss') > service.start && dayjs(data.hour).format('HH:mm:ss') < service.end)) {
            possibleServicesFiltered.push(service)
          }
        });
        if (possibleServicesFiltered.length == 0) {
          console.log('No service found');
          throw Error('No service found')
        }
        let finalService = possibleServicesFiltered[Math.floor(Math.random() * possibleServicesFiltered.length)]; // de todos los servicios q cumplen con las condiciones dadas, se selecciona uno al azar
        socket.emit('requestService', finalService) // .to('requestService' + data.receptor.user_id) aún no funciona como debe
      })
      .catch(err => {
        let error = new Object();
        error.error = err.message;
        socket.emit('requestService', error);
      })
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.handshake.query.firstname, socket.handshake.query.lastname);
  });
});