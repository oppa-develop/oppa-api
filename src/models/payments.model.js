const dayjs = require('dayjs');
const pool = require('../libs/database');
let paymentModel = {};

paymentModel.registerPayment = async (newPayment) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [row] = await conn.query('INSERT INTO payments SET ?;', [newPayment]);
    const [payment] = await conn.query('SELECT * FROM payments WHERE payment_id = ?;', [row.insertId]);

    await conn.commit();
    console.log('payment', payment[0]);
    return payment[0]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

paymentModel.editPayment = async (paymentData) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    console.log(conn.format('UPDATE payments SET state = ?, updated_at = ? WHERE payment_id = ?;', [paymentData.state, paymentData.updated_at, paymentData.payment_id]))
    const [row] = await conn.query('UPDATE payments SET state = ?, updated_at = ? WHERE payment_id = ?;', [paymentData.state, paymentData.updated_at, paymentData.payment_id]);
    const [payment] = await conn.query('SELECT * FROM payments WHERE payment_id = ?;', [row.payment_id]);

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
    const [payments] = await conn.query('SELECT * FROM payments ORDER BY payment_id DESC;');

    for await (const pay of payments) {
      const [provider] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE provider_id = ?;', [pay.providers_provider_id]);
      const [client] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE client_id = ?;', [pay.clients_client_id]);
      const [service] = await conn.query('SELECT * FROM services WHERE service_id = ?;', [pay.services_service_id]);

      // eliminamos la data sensible
      delete provider[0].password;
      delete provider[0].token;
      delete provider[0].code;
      delete client[0].password;
      delete client[0].token;
      delete client[0].code;
      
      pay.provider = provider[0];
      pay.client = client[0];
      pay.service = service[0];
    }

    await conn.commit();
    return payments
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

paymentModel.getPaymentsByProviderId = async (provider_id) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const date = dayjs().startOf('month').format('YYYY-MM-DD');
    const date2 = dayjs().endOf('month').format('YYYY-MM-DD') + ' 23:59:59';
    
    const [payments] = await conn.query(`SELECT * FROM payments WHERE providers_provider_id = ? ORDER BY payment_id DESC;`, [provider_id]);

    for await (const pay of payments) {
      const [provider] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE provider_id = ?;', [pay.providers_provider_id]);
      const [client] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE client_id = ?;', [pay.clients_client_id]);
      const [service] = await conn.query('SELECT * FROM services WHERE service_id = ?;', [pay.services_service_id]);

      // eliminamos la data sensible
      delete provider[0].password;
      delete provider[0].token;
      delete provider[0].code;
      delete client[0].password;
      delete client[0].token;
      delete client[0].code;

      pay.provider = provider[0];
      pay.client = client[0];
      pay.service = service[0];
    }

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