const express = require('express');
const router = express.Router();
const usersModel = require('../models/users.model');
const helpers = require('../libs/helpers');

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
 * /users/{id}:
 *  get:
 *    tags:
 *    - name: users
 *    description: Get user by id.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: integer
 *      required: true
 *      description: Numeric ID of the user to get.
 *    responses:
 *      '200':
 *        description: Returns a the user for the given id.
 */
router.get('/:id', /* verifyRole.admin, */ (req, res) => {
  const { id } = req.params;

  usersModel.getUserById(id)
    .then(user => {
      user.forEach(user => {
        delete user['password']
      });
      res.status(200).json({
        success: true,
        message: `User with id ${user.id}.`,
        user
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
 * /users/new:
 *  post:
 *    tags:
 *    - name: users
 *    description: Create a new user
 *    requestBody:
 *      content:
 *        application/json:
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
 *              img_url:
 *                type: string
 *                example: https://image.freepik.com/foto-gratis/sonriente-joven-gafas-sol-tomando-selfie-mostrando-pulgar-arriba-gesto_23-2148203116.jpg
 *              roles_role_id: 
 *                type: integer
 *                example: 1
 *    responses:
 *      '200':
 *        description: Returns the new user.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/new',/*  verifyRole.teacher, */ async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phone,
    rut,
    password,
    gender,
    img_url,
    roles_role_id
  } = req.body;
  const user = {
    firstname,
    lastname,
    email,
    phone,
    rut,
    password,
    gender,
    img_url,
    state: 'active',
    roles_role_id
  }

  console.log('Creando nuevo usuario', user);
  user.password = await helpers.encyptPassword(user.password);

  usersModel.createUser(user)
    .then(newUser => {

      // check if the user exist on the db
      if (newUser.code == 'ER_DUP_ENTRY') {
        console.log(newUser)
        res.status(500).json({
          success: false,
          message: newUser.sqlMessage
        });
      } else if (newUser.code) {
        console.log(newUser.code);
      } else {

        // if the user is not on the db we create it
        user.user_id = newUser.insertId;
        delete user['password'];
        res.status(200).json({
          success: true,
          message: 'User created successfully.',
          newUser: user
        });
      }

    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        success: false,
        message: err.sqlMessage
      });
    });
});

module.exports = router;