const express = require('express');
const router = express.Router();
const authModel = require('../models/auth.model');
const jwt = require('jsonwebtoken');
const helpers = require('../libs/helpers');

router.get('/', (req, res) => {
  res.send(200).json({
    success:true,
    message: 'API works!'
  });
});

/**
 * @swagger
 * /auth/login-client:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To login clients
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: t.client@example.com
 *              password:
 *                type: string
 *                example: test
 *            required:
 *              - email
 *              - password
 *    responses:
 *      '200':
 *        description: Returns the user data.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: true
 *            message:
 *              type: string
 *              example: login successful.
 *            userData:
 *              type: object
 *      '401':
 *        description: Unauthorized.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: false
 *            message:
 *              type: string
 *              example: Wrong credentials.
 */
router.post('/login-client', (req, res) => {
  const {
    email,
    password
  } = req.body;
  const login = {
    email,
    password
  }
  
  authModel.getClientByEmail(login.email)
    .then((userFound) => {
      if(userFound.state == 'active'){
        helpers.matchPassword(login.password, userFound.password)
        .then((success) => {
          if(success){
            delete userFound.password;
            const token = jwt.sign({ userFound }, process.env.SECRET);
            userFound.token = token;
            res.status(200).json({
              success: true,
              message: 'Loggin success.',
              user: userFound
            });
          }else {
            throw Error('Password wrong.')
          }
        })
        .catch(err => {
          res.status(401).json({
            success: false,
            message: err.message
          });
        });
      } else if (userFound[0].state == 'bloked') {
        throw Error('User blocked by the Administrator.')
      } else {
        throw Error('Unknown error.')
      }
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /auth/login-client/rut:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To login clients
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              rut:
 *                type: string
 *                example: 12.345.678-9
 *              password:
 *                type: string
 *                example: test
 *            required:
 *              - rut
 *              - password
 *    responses:
 *      '200':
 *        description: Returns the user data.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: true
 *            message:
 *              type: string
 *              example: login successful.
 *            userData:
 *              type: object
 *      '401':
 *        description: Unauthorized.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: false
 *            message:
 *              type: string
 *              example: Wrong credentials.
 */
router.post('/login-client/rut', (req, res) => {
  const {
    rut,
    password
  } = req.body;
  const login = {
    rut,
    password
  }
  
  authModel.getClientByRut(login.rut)
    .then((userFound) => {
      if(userFound.state == 'active'){
        helpers.matchPassword(login.password, userFound.password)
        .then((success) => {
          if(success){
            delete userFound.password;
            const token = jwt.sign({ userFound }, process.env.SECRET);
            userFound.token = token;
            res.status(200).json({
              success: true,
              message: 'Loggin success.',
              user: userFound
            });
          }else {
            throw Error('Password wrong.')
          }
        })
        .catch(err => {
          res.status(401).json({
            success: false,
            message: err.message
          });
        });
      } else if (userFound[0].state == 'bloked') {
        throw Error('User blocked by the Administrator.')
      } else {
        throw Error('Unknown error.')
      }
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /auth/login-provider:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To login providers
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: t.provider@example.com
 *              password:
 *                type: string
 *                example: test
 *            required:
 *              - email
 *              - password
 *    responses:
 *      '200':
 *        description: Returns the user data.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: true
 *            message:
 *              type: string
 *              example: login successful.
 *            userData:
 *              type: object
 *      '401':
 *        description: Unauthorized.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: false
 *            message:
 *              type: string
 *              example: Wrong credentials.
 */
router.post('/login-provider', (req, res) => {
  const {
    email,
    password
  } = req.body;
  const login = {
    email,
    password
  }
  
  authModel.getProviderByEmail(login.email)
    .then((userFound) => {
      if(userFound.state == 'active'){
        helpers.matchPassword(login.password, userFound.password)
        .then((success) => {
          if(success){
            delete userFound.password;
            const token = jwt.sign({ userFound }, process.env.SECRET);
            userFound.token = token;
            res.status(200).json({
              success: true,
              message: 'Loggin success.',
              user: userFound
            });
          }else {
            throw Error('Password wrong.')
          }
        })
        .catch(err => {
          res.status(401).json({
            success: false,
            message: err.message
          });
        });
      } else if (userFound[0].state == 'bloked') {
        throw Error('User blocked by the Administrator.')
      } else {
        throw Error('Unknown error.')
      }
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /auth/login-admin:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To login admins
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: t.admin@example.com
 *              password:
 *                type: string
 *                example: test
 *            required:
 *              - email
 *              - password
 *    responses:
 *      '200':
 *        description: Returns the user data.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: true
 *            message:
 *              type: string
 *              example: login successful.
 *            userData:
 *              type: object
 *      '401':
 *        description: Unauthorized.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: false
 *            message:
 *              type: string
 *              example: Wrong credentials.
 */
router.post('/login-admin', (req, res) => {
  const {
    email,
    password
  } = req.body;
  const login = {
    email,
    password
  }
  
  authModel.getAdminByEmail(login.email)
    .then((userFound) => {
      if(userFound.state == 'active'){
        helpers.matchPassword(login.password, userFound.password)
        .then((success) => {
          if(success){
            delete userFound.password;
            const token = jwt.sign({ userFound }, process.env.SECRET);
            userFound.token = token;
            res.status(200).json({
              success: true,
              message: 'Loggin success.',
              user: userFound
            });
          }else {
            throw Error('Password wrong.')
          }
        })
        .catch(err => {
          throw Error('Email or password wrong.')
        });
      } else if (userFound[0].state == 'bloked') {
        throw Error('User blocked by the Administrator.')
      } else {
        throw Error('Unknown error.')
      }
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /auth/recover-account:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To recover an account
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              rut:
 *                type: string
 *                example: 1.123.123-1
 *            required:
 *              - rut
 *    responses:
 *      '200':
 *        description: Send a code to user over email.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: true
 *            message:
 *              type: string
 *              example: Code sent to email ejemplo@correo.cl.
 *            email:
 *              type: string
 *              example: ejemplo@correo.cl.
 */
router.post('/recover-account', (req, res) => {
  const {
    rut
  } = req.body;
  
  authModel.getUserAndElderByElderRut(rut)
    .then(([supplicantUser, userFound, code]) => { // supplicantUser = usuario al que se le cambiará la clave; si el elder no tiene email, entonces userFound es el usuario apadrinador.
      res.status(200).json({
        success: true,
        message: `Código enviado al email ${userFound ? userFound.email : supplicantUser.email}`,
        email: userFound ? userFound.email : supplicantUser.email
      });
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

/**
 * @swagger
 * /auth/check-passcode:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To check passcode
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              rut:
 *                type: string
 *                example: 1.111.111-1
 *              code:
 *                type: string
 *                example: o68e1zvjmz
 *              password:
 *                type: string
 *                example: contraseña
 *            required:
 *              - rut
 *              - code
 *              - password
 *    responses:
 *      '200':
 *        description: Send a code and the new password.
 */
router.post('/check-passcode', (req, res) => {
  const {
    rut,
    code,
    password
  } = req.body;
  
  authModel.getUserAndElderByElderRut(rut)
    .then(([supplicantUser, userFound, code]) => { // supplicantUser = usuario al que se le cambiará la clave; si el elder no tiene email, entonces userFound es el usuario apadrinador.
      res.status(200).json({
        success: true,
        message: `Código enviado al email ${userFound ? userFound.email : supplicantUser.email}`,
        email: userFound ? userFound.email : supplicantUser.email
      });
    })
    .catch(err => {
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

module.exports = router;