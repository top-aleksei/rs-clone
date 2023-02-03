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
    return console.log('DB connection succesfull');
  }
});

module.exports = connection;
