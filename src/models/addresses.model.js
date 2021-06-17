const pool = require('../libs/database');
let addressesModel = {};

addressesModel.getAddressesByUserId = async (user_id) => {
  const [addresses] = await pool.query('SELECT * FROM addresses WHERE users_user_id = ?;', [user_id]);
  return addresses
}

addressesModel.createAddress = async (newAddress) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    await conn.query('INSERT INTO addresses SET ?', [newAddress])
    const [address] = await conn.query('SELECT * FROM addresses WHERE users_user_id=?', [newAddress.users_user_id])
    await conn.commit();
    return address
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

addressesModel.deleteAddress = async (address_id) => {
  const [addressData] = await pool.query('SELECT * FROM addresses WHERE address_id = ?', [address_id])
  await pool.query('DELETE FROM addresses WHERE address_id = ?', [address_id])
  console.log(addressData[0])
  const [userAddresses] = await pool.query('SELECT * FROM addresses WHERE users_user_id = ?', [addressData[0].users_user_id])

  return userAddresses
}

module.exports = addressesModel;