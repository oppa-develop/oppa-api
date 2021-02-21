const pool = require('../libs/database');

let authModel = {};

authModel.getUserByEmail = async (email) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let [user] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE email = ?', [email]);
    const [addresses] = await conn.query('SELECT * FROM addresses WHERE users_user_id = (SELECT user_id FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE email = ?);', [email]);
    const [credit] = await conn.query('SELECT total FROM wallet_movements WHERE wallet_movements.users_user_id = ? ORDER BY created_at DESC LIMIT 1', [user[0].user_id])
    user[0].addresses = addresses;
    user[0].credit = credit[0]?.total || 0;
    await conn.commit();
    return user[0]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

module.exports = authModel;