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
    console.log('Connection is asleep (time to wake it up): ', err);
    setTimeout(handleDisconnect, 1000);
    handleDisconnect();
  } else {
    connection.query('SET SESSION wait_timeout = 604800');
    return console.log('DB connection succesfull');
  }
});

function handleDisconnect() {
  console.log('handleDisconnect()');
  connection.destroy();
  connection = mysql.createConnection(db_config);
  connection.connect(function (err) {
    if (err) {
      console.log(' Error when connecting to db  (DBERR001):', err);
      setTimeout(handleDisconnect, 1000);
    }
  });
}

module.exports = connection;
