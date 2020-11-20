const express = require('express');
const router = express.Router();
const usersModel = require('../models/users.model');

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
 * /users/new:
 *  post:
 *    tags:
 *    - name: users
 *    description: Create a new user
 *    parameters:
 *      - in: body
 *        description: The user to create
 *        schema:
 *          type: object
 *          required: 
 *            - firstname
 *            - lastname
 *            - password
 *            - email
 *            - role
 *          properties:
 *            firstname:
 *              type: string
 *              example: John
 *            lastname:
 *              type: string
 *              example: Doe
 *            password:
 *              type: string
 *              example: $%&SDF$SD_F-Gs+ad*f45
 *            email:
 *              type: string
 *              example: j.doe@example.com
 *            role: 
 *              type: string
 *              example: companion
 *              enum:
 *                - elder
 *                - companion
 *                - server
 *    responses:
 *      '200':
 *        description: Returns the new user.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolen
 *              example: true
 *            message:
 *              type: string
 *              example: User created successfully.
 *            userData:
 *              type: object
 *              properties:
 *                id:
 *                  type: integer
 *                  example: 1
 *                firstname:
 *                  type: string
 *                  example: John
 *                lastname:
 *                  type: string
 *                  example: Doe
 *                email:
 *                  type: string
 *                  example: j.doe@example.com
 *                wallet:
 *                  type: integer
 *                  example: null
 *      '401':
 *        description: Error. Unauthorized action.
 *        schema:
 *          type: object
 *          properties:
 *            success:
 *              type: boolean
 *              example: false
 *            message:
 *              type: string
 *              example: Error. Unauthorized action. 
 */
router.post('/new',/*  verifyRole.teacher, */ async (req, res) => {
  const {
    firstname,
    lastName,
    email,
    password,
    role
  } = req.body;
  const user = {
    firstname,
    lastName,
    email,
    password,
    role,
    state: 'active'
  }

  console.log('Creando nuevo usuario');
  user.password = await helpers.encyptPassword(user.password);

  usersModel.createUser(user)
    .then(newUser => {
      console.log({
        newUser: newUser.code
      })

      // check if the user exist on the db
      if (newUser.code == 'ER_DUP_ENTRY') {
        console.log(newUser)
        res.status(500).json({
          success: false,
          message: newUser.sqlMessage
        });
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
      res.status(500).json({
        success: false,
        message: err.sqlMessage
      });
    });
});

module.exports = router;