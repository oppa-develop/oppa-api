const express = require('express');
const router = express.Router();
const WebpayPlus = require('transbank-sdk').WebpayPlus;
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../.env')
});

WebpayPlus.commerceCode = process.env.TBK_COMMERCE_CODE;
WebpayPlus.apiKey = process.env.TBK_KEY;
WebpayPlus.environment = process.env.TBK_ENVIRONMENT;

WebpayPlus.configureForProduction(process.env.TBK_COMMERCE_CODE, process.env.TBK_KEY);

/**
 * @swagger
 * /transbank/pay:
 *  post:
 *    tags:
 *    - name: transbank
 *    description: To pay a service.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              amount:
 *                type: integer
 *                example: 9990
 *              session_id:
 *                type: integer
 *                example: 1234
 *              buy_order:
 *                type: string
 *                example: cltbk20211102
 *              return_url:
 *                type: string
 *                example: http://localhost:3000/api/transbank/check
 *    responses:
 *      '200':
 *        description: Carga esta url en el cliente para iniciar el pago.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/pay', (req,res) => {
  const {
    amount,
    buy_order,
    session_id,
    return_url
  } = req.body

  WebpayPlus.Transaction.create(buy_order, session_id, amount, return_url)
    .then(response => {
      console.log('/pay response:', response);
      res.status(200).send(response);
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

/**
 * @swagger
 * /transbank/check:
 *  post:
 *    tags:
 *    - name: transbank
 *    description: To pay a service.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              token:
 *                type: string
 */
router.post('/check', (req,res) => {
  const {
    token_ws
  } = req.body

  console.log(req.body)

  WebpayPlus.Transaction.commit(token_ws)
    .then(response => {
      console.log('/check response:', response);
      res.status(200).send('<script>window.close();</script>')
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

/**
 * @swagger
 * /transbank/voucher:
 *  post:
 *    tags:
 *    - name: transbank
 *    description: To pay a service.
 */
 router.post('/voucher', (req,res) => {
  const {
    token_ws
  } = req.body

  console.log(req.body)

  WebpayPlus.Transaction.status(token_ws)
    .then(response => {
      console.log('/voucher response:', response);
      res.status(200).send(response)
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

module.exports = router;
