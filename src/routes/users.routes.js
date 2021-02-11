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
 */
router.get('/:user_id', /* verifyRole.admin, */ (req, res) => {
  const { user_id } = req.params;

  usersModel.getUserById(user_id)
    .then(user => {
      user.forEach(user => {
        delete user['password']
      });
      res.status(200).json({
        success: true,
        message: `User with id ${user[0].user_id}.`,
        user: user[0]
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
 *                example: male
 *              birthdate: 
 *                type: datetime
 *                example: 2020-03-28
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
  const {
    firstname,
    lastname,
    password,
    gender,
    rut,
    email,
    phone,
    birthdate
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
    birthdate
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
    birthdate
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

module.exports = router;