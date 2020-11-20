const pool = require('../libs/database');

let authModel = {};

authModel.getUserByEmail = (email) => {
  return pool.query('SELECT user FROM user WHERE email = ?', [email]);
}

module.exports = authModel;