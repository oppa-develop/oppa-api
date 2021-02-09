const pool = require('../libs/database');
let usersModel = {};

usersModel.getUsers = async () => {
  const [rows] = await pool.query('SELECT * FROM users;');
  return rows
}

usersModel.getUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE user_id=?;', [id]);
  return rows
}

usersModel.createUser = async (newUser) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    const [dupEntry] = await conn.query("SELECT * FROM users WHERE rut=? OR email=?", [[newUser.rut], [newUser.email]]);
    
    if (dupEntry.length > 0) throw Error('Duplicate entry'); //verificamos que el rut o email no estén duplicados

    const [userData] = await conn.query("INSERT INTO users SET ?", [newUser]);

    let [adminData] = await conn.query("INSERT INTO admins SET ?", [{ users_user_id: userData.insertId }]);
    await conn.commit();
    newUser.user_id = userData.insertId
    newUser.admin_id = adminData.insertId
    return newUser
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

module.exports = usersModel;