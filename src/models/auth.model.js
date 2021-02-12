const pool = require('../libs/database');

let authModel = {};

authModel.getUserByEmail = async (email) => {
  const [user] = await pool.query('SELECT admin_id, client_id, provider_id, users.* FROM users LEFT JOIN admins ON admins.users_user_id = user_id LEFT JOIN clients ON clients.users_user_id = user_id LEFT JOIN providers ON providers.users_user_id = user_id WHERE email = ?', [email]);
  return user
}

module.exports = authModel;