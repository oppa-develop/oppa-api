const pool = require('../libs/database');
const helpers = require('../libs/helpers');

let authModel = {};

authModel.getClientByEmail = async (email) => {
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
    await conn.commit();
    return user[0]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

authModel.getUserAndElderByElderRut = async (rut, email) => {
  let conn = null
  let supplicantUser = null;
  let userFound = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    if (rut) {
      let [user] = await conn.query('SELECT admin_id, client_id, provider_id, users.*, (SELECT total FROM wallet_movements WHERE users_user_id = users.user_id ORDER BY wallet_movements.created_at DESC LIMIT 1) as credit FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE rut = ?;', [rut]);
      supplicantUser = user[0];
      if (!supplicantUser.email) {
        let [user] = await conn.query('SELECT admin_id, client_id, provider_id, users.*, (SELECT total FROM wallet_movements WHERE users_user_id = users.user_id ORDER BY wallet_movements.created_at DESC LIMIT 1) as credit FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id = (SELECT user_client_id FROM clients_has_clients WHERE senior_client_id = ? LIMIT 1)', [supplicantUser.client_id]);
        userFound = user[0];
      }
    } else {
      let [user] = await conn.query('SELECT admin_id, client_id, provider_id, users.*, (SELECT total FROM wallet_movements WHERE users_user_id = users.user_id ORDER BY wallet_movements.created_at DESC LIMIT 1) as credit FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE email = ?;', [email]);
      supplicantUser = user[0];
      userFound = null;
    }

    const code = Math.random().toString(36).slice(2);

    await conn.query('UPDATE users SET code = ? WHERE rut = ?;', [code, rut]);

    return [supplicantUser, userFound, code]
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

authModel.changePassword = async (rut, code, password) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [res] = await conn.query('SELECT code FROM users WHERE rut = ?', [rut]);
    if (res[0].code === code) {
      // encriptamos la password y la guardamos en la base de datos
      password = await helpers.encyptPassword(password);
      await conn.query('UPDATE users SET code = NULL, password = ? WHERE rut = ?;', [password, rut]);

      return true
    } else {
      if (conn) await conn.rollback();
      return false
    }
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

module.exports = authModel;