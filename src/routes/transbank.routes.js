const express = require('express');
const router = express.Router();
const TransaccionCompleta = require('transbank-sdk').TransaccionCompleta;

router.post('/create', async (req, res) => {
  // const { user_id } = req.body;
  let buyOrder = "O-" + Math.floor(Math.random() * 10000) + 1;
  let sessionId = "S-" + Math.floor(Math.random() * 10000) + 1;

  const {
    cvv,
    cardNumber,
    month,
    year,
    amount
  } = req.body
  
  console.log(req.body)

  const createResponse = await TransaccionCompleta.Transaction.create(
    buyOrder,
    sessionId,
    amount,
    cvv,
    cardNumber,
    year + "/" + month
  );

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