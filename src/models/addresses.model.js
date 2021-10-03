const pool = require('../libs/database');
let addressesModel = {};

addressesModel.getAddressesByUserId = async (user_id) => {
  const [addresses] = await pool.query('SELECT * FROM addresses WHERE users_user_id = ?;', [user_id]);
  return addresses
}

addressesModel.getMostRequestedDistricts = async (limit) => {
  limit = parseInt(limit)
  let [mostRequestedDistricts] = await pool.query(`SELECT region, district, count(*) AS 'quantity' FROM scheduled_services INNER JOIN provider_has_services ON provider_has_services.provider_has_services_id = scheduled_services.provider_has_services_provider_has_services_id INNER JOIN services ON provider_has_services.services_service_id = services.service_id INNER JOIN categories ON categories.category_id = services.categories_category_id INNER JOIN super_categories ON super_categories.super_category_id = categories.super_categories_super_category_id INNER JOIN addresses ON scheduled_services.addresses_address_id = addresses.address_id GROUP BY region, district LIMIT 5;`, [limit])

  return mostRequestedDistricts
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