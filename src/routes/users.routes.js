const express = require('express');
const router = express.Router();
const usersModel = require('../models/users.model');
const verifyRole = require('../libs/verifyRole');
const helpers = require('../libs/helpers');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

/**
 * @swagger
 * /users/:
 *  get:
 *    tags:
 *    - name: users
 *    description: Get all users
 *    responses:
 *      '200':
 *        description: Returns a list containing all users.
 */
router.get('/', /* verifyRole.admin, */ (req, res) => {
  usersModel.getUsers()
    .then(users => {
      users.forEach(user => {
        delete user['password']
      });
      res.status(200).json({
        success: true,
        message: 'all users.',
        users
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /users/clients:
 *  get:
 *    tags:
 *    - name: users
 *    description: Get all clients
 *    responses:
 *      '200':
 *        description: Returns a list containing all clients.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/clients', /* verifyRole.admin, */ (req, res) => {
  usersModel.getClients()
    .then(clients => {
      clients.forEach(user => {
        delete user['password']
      });
      res.status(200).json({
        success: true,
        message: 'all clients.',
        clients
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /users/providers:
 *  get:
 *    tags:
 *    - name: users
 *    description: Get all providers
 *    responses:
 *      '200':
 *        description: Returns a list containing all providers.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.get('/providers', /* verifyRole.admin, */ (req, res) => {
  usersModel.getProviders()
    .then(providers => {
      providers.forEach(user => {
        delete user['password']
      });
      res.status(200).json({
        success: true,
        message: 'all providers.',
        providers
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /users/{user_id}:
 *  get:
 *    tags:
 *    - name: users
 *    description: Get user by id.
 *    parameters:
 *    - in: path
 *      name: user_id
 *      schema:
 *        type: integer
 *      required: true
 *      description: Numeric ID of the user to get.
 *    responses:
 *      '200':
 *        description: Returns the user for the given id.
 *      '404':
 *        description: Error. User not found.
 */
router.get('/:user_id', /* verifyRole.admin, */ (req, res) => {
  const { user_id } = req.params;
  
  usersModel.getUserById(user_id)
    .then(user => {
      if (user.length == 0) {
        res.status(404).json({
          success: false,
          message: `User with id ${user_id} not found.`,
        });
      } else {
        user.forEach(user => {
          delete user['password']
        });
        res.status(200).json({
          success: true,
          message: `User with id ${user_id}.`,
          user
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /users/{user_id}/credit:
 *  get:
 *    tags:
 *    - name: users
 *    description: Get credit from user for the given id.
 *    parameters:
 *    - in: path
 *      name: user_id
 *      schema:
 *        type: integer
 *      required: true
 *      description: Numeric ID of the user to get credit.
 *    responses:
 *      '200':
 *        description: Returns the credit of the user for the given id.
 *      '404':
 *        description: Error. User not found.
 */
router.get('/:user_id/credit', /* verifyRole.admin, */ (req, res) => {
  const { user_id } = req.params;
  
  usersModel.getCreditByUserId(user_id)
    .then(credit => {
      res.status(200).json({
        success: true,
        message: `Credits for user with id ${user_id}.`,
        credit
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /users/{client_id}/seniors:
 *  get:
 *    tags:
 *    - name: users
 *    description: Get client's seniors by client_id.
 *    parameters:
 *    - in: path
 *      name: client_id
 *      schema:
 *        type: integer
 *        example: 2
 *      required: true
 *      description: Numeric ID of the user to get seniors.
 *    responses:
 *      '200':
 *        description: Returns the a list of user's seniors for the given client_id.
 *      '404':
 *        description: Error. client_id not found.
 */
router.get('/:client_id/seniors', /* verifyRole.admin, */ (req, res) => {
  const { client_id } = req.params;
  
  usersModel.getUserSeniors(client_id)
    .then(seniors => {
      if (seniors.length == 0) {
        res.status(404).json({
          success: false,
          message: `The client with id ${client_id} has no seniors.`,
        });
      } else {
        seniors.forEach(user => {
          delete user['password']
        });
        res.status(200).json({
          success: true,
          message: `Seniors for the user with id ${client_id}.`,
          seniors
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /users/new-client:
 *  post:
 *    tags:
 *    - name: users
 *    description: Create a new user with role client
 *    requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              firstname:
 *                type: string
 *                example: John
 *              lastname:
 *                type: string
 *                example: Doe
 *              email:
 *                type: string
 *                example: j.doe@example.com
 *              phone:
 *                type: string
 *                example: "+56947381649"
 *              rut:
 *                type: string
 *                example: 5.391.260-5
 *              password:
 *                type: string
 *                example: $%&SDF$SD_F-Gs+ad*f45
 *              gender:
 *                type: string
 *                example: hombre
 *              birthdate: 
 *                type: datetime
 *                example: 2020-03-28
 *              image_ext: 
 *                type: string
 *                example: jpg
 *              image:
 *                type: string
 *                format: binary
 *    responses:
 *      '200':
 *        description: Returns the new user.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/new-client', async (req, res) => {
  console.log('user.router', req.body)
  const {
    firstname,
    lastname,
    password,
    gender,
    rut,
    email,
    phone,
    birthdate,
    image_ext
  } = req.body;
  const userImage = req.file
  const user = {
    firstname,
    lastname,
    password,
    gender,
    rut,
    email,
    phone,
    birthdate: new Date(birthdate),
    created_at: new Date(),
    img_url: userImage ? `api/public/images/${userImage?.filename}`:null,
    state: 'active',
    email_verified: 'none'
  }

  user.token = jwt.sign({ firstname: user.firstname, lastName: user.lastName, email: user.email, tokenType: 'session' }, process.env.SECRET);

  console.log('Creando nuevo usuario');
  user.password = await helpers.encyptPassword(user.password);

  usersModel.createClient(user)
    .then(newUser => {
      delete newUser['password'];
      res.status(200).json({
        success: true,
        message: 'User created successfully.',
        newUser
      });
    })
    .catch(err => {

      // borramos la imagen del usuario
      try {
        fs.unlinkSync(path.join(__dirname, `../public/images/${userImage.filename}`))
      } catch(err) {
        console.error(err)
      }

      console.log(err);
      res.status(500).json({
        success: false,
        message: err.code || err.message
      });
    });

});

/**
 * @swagger
 * /users/new-provider:
 *  post:
 *    tags:
 *    - name: users
 *    description: Create a new user with role provider
 *    requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              firstname:
 *                type: string
 *                example: John
 *              lastname:
 *                type: string
 *                example: Doe
 *              email:
 *                type: string
 *                example: j.doe@example.com
 *              phone:
 *                type: string
 *                example: "+56947381649"
 *              rut:
 *                type: string
 *                example: 5.391.260-5
 *              password:
 *                type: string
 *                example: $%&SDF$SD_F-Gs+ad*f45
 *              gender:
 *                type: string
 *                example: male
 *              birthdate: 
 *                type: datetime
 *                example: 2020-03-28
 *              image_ext: 
 *                type: string
 *                example: jpg
 *              image:
 *                type: string
 *                format: binary
 *    responses:
 *      '200':
 *        description: Returns the new user.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/new-provider',/*  verifyRole.teacher, */ async (req, res) => {
  const {
    firstname,
    lastname,
    password,
    gender,
    rut,
    email,
    phone,
    birthdate,
    image_ext
  } = req.body;
  const userImage = req.file
  const user = {
    firstname,
    lastname,
    password,
    gender,
    rut,
    email,
    phone,
    birthdate: new Date(birthdate),
    created_at: new Date(),
    img_url: `api/public/providers-images/${userImage.filename}`,
    state: 'active',
    email_verified: 'none'
  }

  user.token = jwt.sign({ firstname: user.firstname, lastName: user.lastName, email: user.email, tokenType: 'session' }, process.env.SECRET); // cambiar por secret variable de entorno

  console.log('Creando nuevo usuario');
  user.password = await helpers.encyptPassword(user.password);

  usersModel.createProvider(user)
    .then(newUser => {
      delete newUser['password'];
      res.status(200).json({
        success: true,
        message: 'User created successfully.',
        newUser
      });
    })
    .catch(err => {

      // borramos la imagen del usuario
      try {
        fs.unlinkSync(path.join(__dirname, `../public/images/${userImage.filename}`))
      } catch(err) {
        console.error(err)
      }

      console.log(err);
      res.status(500).json({
        success: false,
        message: err.code || err.message
      });
    });

});

/**
 * @swagger
 * /users/new-admin:
 *  post:
 *    tags:
 *    - name: users
 *    description: Create a new user with role admin
 *    requestBody:
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              firstname:
 *                type: string
 *                example: John
 *              lastname:
 *                type: string
 *                example: Doe
 *              email:
 *                type: string
 *                example: j.doe@example.com
 *              phone:
 *                type: string
 *                example: "+56947381649"
 *              rut:
 *                type: string
 *                example: 5.391.260-5
 *              password:
 *                type: string
 *                example: $%&SDF$SD_F-Gs+ad*f45
 *              gender:
 *                type: string
 *                example: male
 *              birthdate: 
 *                type: datetime
 *                example: 2020-03-28
 *              image_ext: 
 *                type: string
 *                example: jpg
 *              image:
 *                type: string
 *                format: binary
 *    responses:
 *      '200':
 *        description: Returns the new user.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/new-admin',/*  verifyRole.teacher, */ async (req, res) => {
  const {
    firstname,
    lastname,
    password,
    gender,
    rut,
    email,
    phone,
    birthdate,
    image_ext
  } = req.body;
  const userImage = req.file
  const user = {
    firstname,
    lastname,
    password,
    gender,
    rut,
    email,
    phone,
    birthdate: new Date(birthdate),
    created_at: new Date(),
    img_url: `api/public/images/${userImage.filename}`,
    state: 'active',
    email_verified: 'none'
  }

  user.token = jwt.sign({ firstname: user.firstname, lastName: user.lastName, email: user.email, tokenType: 'session' }, process.env.SECRET); // cambiar por secret variable de entorno

  console.log('Creando nuevo usuario');
  user.password = await helpers.encyptPassword(user.password);

  usersModel.createAdmin(user)
    .then(newUser => {
      delete newUser['password'];
      res.status(200).json({
        success: true,
        message: 'User created successfully.',
        newUser
      });
    })
    .catch(err => {

      // borramos la imagen del usuario
      try {
        fs.unlinkSync(path.join(__dirname, `../public/images/${userImage.filename}`))
      } catch(err) {
        console.error(err)
      }

      console.log(err);
      res.status(500).json({
        success: false,
        message: err.code || err.message
      });
    });

});

/**
 * @swagger
 * /users/add-senior:
 *  post:
 *    tags:
 *    - name: users
 *    description: Set a senior to a client
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              user_client_id:
 *                type: integer
 *                example: 2
 *              senior_client_id:
 *                type: integer
 *                example: 3
 *    responses:
 *      '200':
 *        description: Returns a list of the client's seniors.
 *      '401':
 *        description: Error. Unauthorized action.
 *      '404':
 *        description: Error. Client or senior does not exist.
 *      '409':
 *        description: Error. The senior could not have more than one user associated.
 */
router.post('/add-senior',/*  verifyRole.teacher, */ async (req, res) => {
  const {
    user_client_id,
    senior_client_id,
  } = req.body;
  const addData = {
    user_client_id,
    senior_client_id,
    created_at: new Date()
  }

  console.log('Asignando senior');

  usersModel.addSenior(addData)
    .then(clientSeniors => {
      // delete newUser['password'];
      res.status(200).json({
        success: true,
        message: 'User created successfully.',
        clientSeniors
      });
    })
    .catch(err => {
      console.log(err);
      switch(err.code) {
        case 'ER_NO_REFERENCED_ROW_2':
          err.message = 'Client or senior does not exist.'
          err.httpError = 404
          break
        case 'ER_DUP_ENTRY':
          err.message = 'The senior could not have more than one user associated.'
          err.httpError = 409
          break
        default:
          err.message = err.code
          err.httpError = 400
          break
      }
      res.status(err.httpError).json({
        success: false,
        message: err.message
      });
    });

});

module.exports = router;