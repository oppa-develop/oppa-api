const express = require('express');
const router = express.Router();
const paymentModel = require('../models/payments.model');

/**
 * @swagger
 * /payments/new-payment:
 *  post:
 *    tags:
 *    - name: payments
 *    description: Register a new payment
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              amount:
 *                type: number
 *                example: 5000
 *              state:
 *                type: string
 *                example: por pagar
 *              provider_id:
 *                type: number
 *                example: 3
 *              buyOrder:
 *                type: string
 *                example: CLTBK20211105
 *    responses:
 *      '200':
 *        description: Returns the payment registered.
 *      '401':
 *        description: Error. Unauthorized action.
 */
 router.post('/new-payment', async (req, res) => {
  const {
    amount,
    state,
    provider_id,
    buyOrder
  } = req.body;
  const newPayment = {
    amount,
    state,
    created_at: new Date(),
    updated_at: new Date(),
    providers_provider_id: provider_id,
    buyOrder
  };

  paymentModel.registerPayment(newPayment)
    .then(payment => {
      res.status(200).json({
        success: true,
        message: 'Payment registered successfully.',
        payment
      });
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.code || err.message
      });
    });
});

/**
 * @swagger
 * /payments/edit-payment:
 *  post:
 *    tags:
 *    - name: payments
 *    description: Edit a payment
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              payment_id:
 *                type: number
 *                example: 1
 *              state:
 *                type: string
 *                example: pagado
 *    responses:
 *      '200':
 *        description: Returns the payment edited.
 *      '401':
 *        description: Error. Unauthorized action.
 */
 router.post('/edit-payment', async (req, res) => {
  const {
    payment_id,
    state,
  } = req.body;
  const paymentData = {
    payment_id,
    state,
    updated_at: new Date()
  };

  paymentModel.editPayment(paymentData)
    .then(payment => {
      res.status(200).json({
        success: true,
        message: 'Payment edited successfully.',
        payment
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