const pool = require('../libs/database');
let recordsModel = {};

recordsModel.getRecordsByUserId = async (user_id) => {
  const [records] = await pool.query('SELECT * FROM records WHERE users_user_id = ? ORDER BY created_at DESC;', [user_id]);
  return records
}

recordsModel.newRecord = async (newRecord) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [row] = await conn.query('INSERT INTO records SET ?', [newRecord])
    const [record] = await conn.query('SELECT * FROM records WHERE record_id=?', [row.insertId])
    await conn.commit();
    return record
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

module.exports = recordsModel;