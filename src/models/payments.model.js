const pool = require('../libs/database');
let paymentModel = {};

paymentModel.registerPayment = async (newPayment) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [row] = await conn.query('INSERT INTO payments SET ?;', [newPayment]);
    const [payment] = await conn.query('SELECT * FROM payments WHERE id = ?;', [row.insertId]);

    await conn.commit();
    return payment[0]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

paymentModel.editPayment = async (payment) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [row] = await conn.query('UPDATE payments SET state = ?, updated_at = ? WHERE payment_id = ?;', [payment.state, payment.updated_at, payment.payment_id]);
    const [payment] = await conn.query('SELECT * FROM payments WHERE id = ?;', [payment.payment_id]);

    await conn.commit();
    return payment[0]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

paymentModel.getPayments = async () => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [payments] = await conn.query('SELECT * FROM payments;');
    payments.forEach(pay => {
      const [provider] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE id = ?;', [pay.provider_id]);
      const [client] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE id = ?;', [pay.client_id]);
      pay.provider = provider[0];
      pay.client = client[0];
    });

    await conn.commit();
    return payments
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

module.exports = paymentModel;