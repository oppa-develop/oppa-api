const pool = require('../libs/database');
let usersModel = {};

usersModel.getUsers = async () => {
  const [rows] = await pool.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id;');
  return rows
}

usersModel.getUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE user_id=?;', [id]);
  return rows
}

usersModel.checkDuplicates = async (rut, email) => {
  let conn = null
  try {
    conn = await pool.getConnection()
    const [dupEntry] = await conn.query("SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE rut=? OR email=?;", [[rut], [email]]);
    return dupEntry
  }catch (error) {
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

usersModel.createClient = async (newUser) => {
  let conn = null;
  
  // verificamos que el usuario no exista previamente en la bdd
  await usersModel.checkDuplicates(newUser.rut, newUser.email)
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [userData] = await conn.query("INSERT INTO users SET ?", [newUser]);
    await conn.query("INSERT INTO clients SET ?", [{ users_user_id: userData.insertId }]);
    const [finalUserData] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id=?;', [userData.insertId])
    await conn.commit();
    return finalUserData
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

usersModel.createProvider = async (newUser) => {
  let conn = null;
  
  // verificamos que el usuario no exista previamente en la bdd
  await usersModel.checkDuplicates(newUser.rut, newUser.email)
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [userData] = await conn.query("INSERT INTO users SET ?", [newUser]);
    await conn.query("INSERT INTO providers SET ?", [{ users_user_id: userData.insertId }]);
    const [finalUserData] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id=?;', [userData.insertId])
    await conn.commit();
    return finalUserData
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

usersModel.createAdmin = async (newUser) => {
  let conn = null;
  
  // verificamos que el usuario no exista previamente en la bdd
  await usersModel.checkDuplicates(newUser.rut, newUser.email)
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [userData] = await conn.query("INSERT INTO users SET ?", [newUser]);
    await conn.query("INSERT INTO admins SET ?", [{ users_user_id: userData.insertId }]);
    const [finalUserData] = await conn.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE user_id=?;', [userData.insertId])
    await conn.commit();
    return finalUserData
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

module.exports = usersModel;