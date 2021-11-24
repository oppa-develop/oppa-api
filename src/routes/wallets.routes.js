const express = require('express');
const router = express.Router();
const walletsModel = require('../models/wallets.model');
const dayjs = require('dayjs');

/**
 * @swagger
 * /wallets/{user_id}:
 *  get:
 *    tags:
 *    - name: wallets
 *    description: Get wallet movements by user_id.
 *    parameters:
 *    - in: path
 *      name: user_id
 *      schema:
 *        type: integer
 *        example: 4
 *      required: true
 *      description: Numeric ID of the user to get.
 *    responses:
 *      '200':
 *        description: Returns the wallet movements for the given id.
 *      '404':
 *        description: Error. User not found.
 */
router.get('/:user_id', (req, res) => {
  const { user_id } = req.params;

  walletsModel.getWalletMovements(user_id)
    .then(walletMovements => {
      res.status(200).json({
        success: true,
        message: 'Wallet movements for the given id.',
        walletMovements
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
 * /wallets/new-movement:
 *  post:
 *    tags:
 *    - name: wallets
 *    description: Increse/decrese user's credits
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              amount:
 *                type: number
 *                example: 5000
 *              type:
 *                type: string
 *                example: ingreso
 *              user_id:
 *                type: number
 *                example: 3
 *    responses:
 *      '200':
 *        description: Returns the new total amount of credits for the user.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/new-movement', async (req, res) => {
  const {
    amount,
    type,
    user_id
  } = req.body;
  const movement = {
    amount,
    type,
    created_at: new Date(),
    users_user_id: user_id
  }
  
  let buyOrder = "CLM" + dayjs().format('YYYYMMDDHHmmss');

  console.log({movement});

  walletsModel.updateCredits(movement)
    .then(credits => {
      console.log({credits});
      res.status(200).json({
        success: true,
        message: 'Credits modified successfully.',
        credits,
        buyOrder
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