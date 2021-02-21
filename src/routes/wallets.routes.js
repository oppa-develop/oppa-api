const express = require('express');
const { getWalletMovements } = require('../models/wallets.model');
const router = express.Router();
const walletsModel = require('../models/wallets.model');

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
      console.log(err);
      res.status(401).json({
        success: false,
        message: err.message
      });
    });
});

module.exports = router;