const mysql = require('mysql2');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('DATABASE CONNECTION WAS CLOSED');
    } else if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('DATABASE HAS TO MANY CONNECTIONS');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('DATABASE CONNECTION WAS REFUSED', err);
    } else if (err.code === 'PROTOCOL_SEQUENCE_TIMEOUT') {
      console.error('DATABASE CONNECTION TIMEOUT');
    } else {
      console.log(err);
    }
  }

  if (connection) {
    connection.release();
    console.log('DATABASE CONNECTION SUCCEED');
  }
  return;
});



module.exports = pool.promise();