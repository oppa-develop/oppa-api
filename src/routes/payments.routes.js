const express = require('express');
const router = express.Router();
const cert = require('../cert/normal');
const WebPay = require('webpay-nodejs');

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
let url = 'https://localhost:3000/api/payments';

/**
 * @swagger
 * /payments/pay:
 *  post:
 *    tags:
 *    - name: payments
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
 *    responses:
 *      '200':
 *        description: Carga esta url en el cliente para iniciar el pago.
 *      '401':
 *        description: Error. Unauthorized action.
 */
router.post('/pay', (req,res) => {
  transactions = {};
  transactionsByToken = {};
  var buyOrden = Date.now();
  var amount = req.body.amount;
  transactions[buyOrden] = {
    amount: amount
  };

  /**
   * 2. Enviamos una petición a Transbank para que genere
   * una transacción, como resultado tendremos un token y una url.
   *
   * Nuestra misión es redireccionar al usuario a dicha url y token.
   */
  wp.initTransaction({
    buyOrder: buyOrden,
    sessionId: req.sessionId,
    returnURL: url + '/check',
    finalURL: url + '/voucher',
    amount: amount
  }).then((data) => {
    res.status(200).send({
      url: data.url + '?token_ws=' + data.token
    })
    // Al ser un ejemplo, se está usando GET.
    // Transbank recomienda POST, el cual se debe hacer por el lado del cliente, obteniendo
    // esta info por AJAX... al final es lo mismo, así que no estresarse.

  });
});

/**
 * @swagger
 * /payments/check:
 *  post:
 *    tags:
 *    - name: payments
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
  const token = req.body.token_ws;


  // Si toodo está ok, Transbank realizará esta petición para que le vuelvas a confirmar la transacción.

  /**
   * 3. Cuando el usuario ya haya pagado con el banco, Transbank realizará una petición a esta url,
   * porque así se definió en initTransaction
   */
  console.log('pre token', token);
  wp.getTransactionResult(token).then((transactionResult) => {
      console.log(transactionResult)
      transaction = transactionResult;
      transactions[transaction.buyOrder] = transaction;
      transactionsByToken[token] = transactions[transaction.buyOrder];

      console.log('transaction', transaction);
      /**
       * 4. Como resultado, obtendras transaction, que es un objeto con la información de la transacción.
       * Independiente de si la transacción fue correcta o errónea, debes siempre
       * hacer un llamado a acknowledgeTransaction con el token... Cosas de Transbank.
       *
       * Tienes 30 amplios segundos para hacer esto, sino la transacción se reversará.
       */
      console.log('re acknowledgeTransaction', token)
      return wp.acknowledgeTransaction(token);

    }).then((result2) => {
      console.log('pos acknowledgeTransaction', result2);
      // Si llegas aquí, entonces la transacción fue confirmada.
      // Este es un buen momento para guardar la información y actualizar tus registros (disminuir stock, etc).

      // Por reglamento de Transbank, debes retornar una página en blanco con el fondo
      // psicodélico de WebPay. Debes usar este gif: https://webpay3g.transbank.cl/webpayserver/imagenes/background.gif
      // o bien usar la librería.
      res.send(WebPay.getHtmlTransitionPage(transaction.urlRedirection, token));
    })
    .catch(e => {
      console.log("Error result2", e)
    })
});

/**
 * @swagger
 * /payments/voucher:
 *  post:
 *    tags:
 *    - name: payments
 *    description: To pay a service.
 */
router.post('/voucher', (req,res) => {
  const transaction = transactionsByToken[req.body.token_ws];
  console.log('Mostrar el comprobante', transaction);
  res.send('<script>window.close();</script>')
});

module.exports = router;