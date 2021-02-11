const express = require('express');
const router = express.Router();
const authModel = require('../models/auth.models');
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
 * /auth/login:
 *  post:
 *    tags:
 *    - name: auth
 *    description: To login users
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: test@example.com
 *              password:
 *                type: string
 *                example: test1234
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
router.post('/login', (req, res) => {
  const {
    email,
    password
  } = req.body;
  const login = {
    email,
    password
  }
  
  authModel.getUserByEmail(login.email)
    .then(userFound => {
      // console.log(userFound[0]);
      if(userFound[0].state == 'active'){
        helpers.matchPassword(login.password, userFound[0].password)
        .then((success) => {
          if(success){
            delete userFound[0].password;
            const token = jwt.sign({ userFound }, process.env.SECRET);
            userFound[0].token = token;
            res.status(200).json({
              success: true,
              message: 'Loggin success.',
              user: userFound[0]
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
      console.log(err);
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

module.exports = router;