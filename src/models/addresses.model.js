const pool = require('../libs/database');
let addressesModel = {};

addressesModel.getAddressesByUserId = async (id) => {
  const [rows] = await pool.query('SELECT * FROM addresses;');
  return rows
}

addressesModel.createAddress = async (newAddress) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [row] = await conn.query('INSERT INTO addresses SET ?', [newAddress])
    const [address] = await conn.query('SELECT * FROM addresses WHERE address_id=?', [row.insertId])
    await conn.commit();
    return address
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

module.exports = addressesModel;