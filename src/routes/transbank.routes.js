const express = require('express');
const router = express.Router();
const TransaccionCompleta = require('transbank-sdk').TransaccionCompleta;
const dayjs = require('dayjs');

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

module.exports = router;