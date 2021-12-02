const express = require('express');
const router = express.Router();
const TransaccionCompleta = require('transbank-sdk').TransaccionCompleta;
const dayjs = require('dayjs');
const cert = require('../cert/normal');
const WebPay = require('webpay-nodejs');
const WebpayPlus = require('transbank-sdk').WebpayPlus;

const wp = new WebPay({
  commerceCode: cert.commerceCode,
  publicKey: cert.publicKey,
  privateKey: cert.privateKey,
  webpayKey: cert.webpayKey,
  verbose: true,
  env: WebPay.ENV.INTEGRACION
})

let transaction;
let transactions = {};
let transactionsByToken = {};
let url = process.env.HOST + '/api/transbank';

router.post('/create', async (req, res) => {
  let buyOrder = "CLTBK" + dayjs().format('YYYYMMDDHHmmss');
  let sessionId = "S-" + dayjs().format('YYYYMMDDHHmmss');

  const {
    cvv,
    cardNumber,
    month,
    year,
    amount,
    type
  } = req.body

  console.log(req.body)

  try {
    const createResponse = (type === 'credit') ?
      await TransaccionCompleta.Transaction.create(buyOrder, sessionId, amount, cvv, cardNumber, year + "/" + month) :
      await TransaccionCompleta.Transaction.create(buyOrder, sessionId, amount, undefined, cardNumber, year + "/" + month);

    let transactionData = {
      buyOrder,
      sessionId,
      amount,
      createResponse,
    };

    res.status(200).json({
      success: true,
      message: 'Se creó la transacción con el objetivo de obtener un identificador único.',
      transactionData
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error en la transacción.',
      error
    });
  }
});

router.post('/confirm', async (req, res) => {
  const {
    transactionToken,
  } = req.body

  const confirmResponse = await TransaccionCompleta.Transaction.commit(transactionToken);

  res.status(200).json({
    success: true,
    message: 'Transacción confirmada correctamente.',
    confirmResponse
  });
});

// endpoints de WebpayPlus

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
      res.status(200).send(response)
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

module.exports = router;