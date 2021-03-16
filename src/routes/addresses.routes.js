const express = require('express');
const router = express.Router();
const addressesModel = require('../models/addresses.model');
const path = require('path');
const fs = require('fs');
const verifyRole = require('../libs/verifyRole');

/**
 * @swagger
 * /addresses/user/{user_id}:
 *  get:
 *    tags:
 *    - name: addresses
 *    description: Get all addresses of the given user_id
 *    parameters:
 *    - in: path
 *      name: user_id
 *      schema:
 *        type: integer
 *        example: 1
 *      required: true
 *      description: Numeric ID of the user to get addresses.
 *    responses:
 *      '200':
 *        description: Returns a list containing all addresses of the given user_id.
 */
router.get('/user/:user_id', /* verifyRole.admin, */ (req, res) => {
  const { user_id } = req.params;

  addressesModel.getAddressesByUserId(user_id)
    .then(addresses => {
      console.log('addresses', addresses.length);
      if (addresses.length == 0) {
        res.status(200).json({
          success: true,
          message: `The user with id = ${user_id} does not have addresses.`
        });
      }else {
        res.status(200).json({
          success: true,
          message: `all addresses for user with id = ${user_id}.`,
          addresses
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
 * /addresses/new-address:
 *  post:
 *    tags:
 *    - name: addresses
 *    description: Create a new address
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              users_user_id:
 *                type: integer
 *                example: 1
 *              street:
 *                type: string
 *                example: Av. Recoleta #1887
 *              other:
 *                type: string
 *                example: depto. 309
 *              district:
 *                type: string
 *                example: Recoleta
 *              region:
 *                type: string
 *                example: Region Metropolitana
 *    responses:
 *      '200':
 *        description: Returns the new address.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/new-address', async (req, res) => {
  const {
    users_user_id,
    street,
    other,
    district,
    region
  } = req.body
  const address = {
    users_user_id,
    street,
    other,
    district,
    region,
    created_at: new Date()
  }

  addressesModel.createAddress(address)
    .then(userAddresses => {
      res.status(200).json({
        success: true,
        message: 'Address created successfully.',
        userAddresses
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.code || err.message
      });
    });
});

module.exports = router;