const pool = require('../libs/database');
let usersModel = {};

usersModel.getUsers = () => {
  return pool.query('SELECT * FROM user;');
}

usersModel.getUserById = (id) => {
  return pool.query('SELECT * FROM user WHERE user_id=?;', [id]);
}

usersModel.createUser = (newUser) => {
  return pool.query('INSERT INTO user SET ?', [newUser]);
}

module.exports = usersModel;