const pool = require('../libs/database');
let usersModel = {};

usersModel.getUsers = () => {
  return pool.query('SELECT * FROM users;');
}

usersModel.getUserById = (id) => {
  return pool.query('SELECT * FROM users WHERE user_id=?;', [id]);
}

usersModel.createUser = (newUser) => {
  return pool.query('INSERT INTO users SET ?', [newUser]);
}

module.exports = usersModel;