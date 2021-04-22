const pool = require('../libs/database');

let authModel = {};

authModel.getClientByEmail = async (email) => {
  console.log(email);
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let [user] = await conn.query(`SELECT admin_id, client_id, provider_id, users.*, (SELECT total FROM wallet_movements WHERE users_user_id = users.user_id ORDER BY wallet_movements.created_at DESC LIMIT 1) AS 'credit' FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE users.email = ?;`, [email]);
    if (user[0]?.client_id) {
      const [addresses] = await conn.query('SELECT * FROM addresses WHERE users_user_id = (SELECT user_id FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE email = ?);', [email]);
      const [elders] = await conn.query(`SELECT admin_id, client_id, provider_id, users.user_id AS 'uid', users.*, (SELECT total FROM wallet_movements INNER JOIN users ON users.user_id = users_user_id WHERE wallet_movements.users_user_id = uid ORDER BY wallet_movements_id DESC LIMIT 1) AS 'credit' FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE client_id in (SELECT clients_has_clients.senior_client_id FROM clients_has_clients WHERE user_client_id = ?);`, [user[0].client_id]);
      user[0].addresses = addresses;
      user[0].elders = elders;
      let i = 0;
      user[0].elders.forEach(async elder => {
        const [elderAddresses] = await conn.query('SELECT * FROM addresses WHERE users_user_id = ?;', [elder.user_id]);
        user[0].elders[i].addresses = elderAddresses;
        i++;
      });

      user[0].credit = user[0].credit;
    } else {
      throw Error('User is not a client')
    }
    console.log(user[0]);
    await conn.commit();
    return user[0]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

authModel.getClientByRut = async (rut) => {
  console.log(rut);
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let [user] = await conn.query(`SELECT admin_id, client_id, provider_id, users.*, (SELECT total FROM wallet_movements WHERE users_user_id = users.user_id ORDER BY wallet_movements.created_at DESC LIMIT 1) AS 'credit' FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE users.rut = ?;`, [rut]);
    if (user[0]?.client_id) {
      const [addresses] = await conn.query('SELECT * FROM addresses WHERE users_user_id = (SELECT user_id FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE rut = ?);', [rut]);
      const [elders] = await conn.query(`SELECT admin_id, client_id, provider_id, users.user_id AS 'uid', users.*, (SELECT total FROM wallet_movements INNER JOIN users ON users.user_id = users_user_id WHERE wallet_movements.users_user_id = uid ORDER BY wallet_movements_id DESC LIMIT 1) AS 'credit' FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE client_id in (SELECT clients_has_clients.senior_client_id FROM clients_has_clients WHERE user_client_id = ?);`, [user[0].client_id]);
      user[0].addresses = addresses;
      user[0].elders = elders;
      let i = 0;
      user[0].elders.forEach(async elder => {
        const [elderAddresses] = await conn.query('SELECT * FROM addresses WHERE users_user_id = ?;', [elder.user_id]);
        user[0].elders[i].addresses = elderAddresses;
        i++;
      });

      user[0].credit = user[0].credit;
    } else {
      throw Error('User is not a client')
    }
    console.log(user[0]);
    await conn.commit();
    return user[0]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

authModel.getProviderByEmail = async (email) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let [user] = await conn.query('SELECT admin_id, client_id, provider_id, users.*, (SELECT total FROM wallet_movements WHERE users_user_id = users.user_id ORDER BY wallet_movements.created_at DESC LIMIT 1) as credit FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE email = ?;', [email]);
    if (user[0]?.provider_id) {
      const [addresses] = await conn.query('SELECT * FROM addresses WHERE users_user_id = (SELECT user_id FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE email = ?);', [email]);
      user[0].addresses = addresses;
    } else {
      throw Error('User is not a provider')
    }
    console.log(user[0]);
    await conn.commit();
    return user[0]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

authModel.getAdminByEmail = async (email) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    let [user] = await conn.query('SELECT admin_id, client_id, provider_id, users.*, (SELECT total FROM wallet_movements WHERE users_user_id = users.user_id ORDER BY wallet_movements.created_at DESC LIMIT 1) as credit FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE email = ?;', [email]);
    if (user[0]?.admin_id) {
      const [addresses] = await conn.query('SELECT * FROM addresses WHERE users_user_id = (SELECT user_id FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE email = ?);', [email]);
      user[0].addresses = addresses;
    } else {
      throw Error('User is not an admin')
    }
    console.log(user[0]);
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