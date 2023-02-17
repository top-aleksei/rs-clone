const mysql = require('mysql');
const env = require('../env');

const connection = mysql.createConnection({
  host: env.host,
  user: env.user,
  password: env.password,
  database: env.database,
});

connection.connect((error) => {
  if (error) {
    return console.log('DB connection error');
  } else {
    connection.query('SET SESSION wait_timeout = 604800');
    return console.log('DB connection succesfull');
  }
});

module.exports = connection;
