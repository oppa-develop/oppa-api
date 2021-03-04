const pool = require('../libs/database');
let walletsModel = {};

walletsModel.getWalletMovements = async (user_id) => {
  const [walletsMovements] = await pool.query('SELECT * FROM wallet_movements WHERE users_user_id = ? ORDER BY created_at DESC;', [user_id]);
  return walletsMovements
}

walletsModel.updateCredits = async (movement) => {
  let conn = null;
  
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query('INSERT INTO wallet_movements SET ?;', [movement]);
    const [credit] = await conn.query('SELECT total FROM wallet_movements WHERE users_user_id = ? ORDER BY wallet_movements_id DESC LIMIT 1', [movement.users_user_id]);
    await conn.commit();
    return credit
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

module.exports = walletsModel;