const pool = require('../libs/database');

let authModel = {};

authModel.getUserByEmail = async (email) => {
  const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return user
}

module.exports = authModel;