'use strict';

const response = require('../response');
const db = require('./../settings/db');
const bcrypt = require('bcryptjs');

exports.users = (req, res) => {
  db.query(
    'SELECT `id`, `name`, `wins`, `best` FROM `players`',
    (error, rows, fields) => {
      if (error) {
        response.status(400, error, res);
      } else {
        response.status(200, rows, res);
      }
    }
  );
};

exports.create = (req, res) => {
  db.query(
    "SELECT `id`,`name` FROM `players` WHERE `name` = '" + req.body.name + "'",
    (error, rows, fields) => {
      if (error) {
        response.status(400, error, res);
      } else if (typeof rows !== 'undefined' && rows.length > 0) {
        response.status(400, 'EXIST', res);
      } else {
        const name = req.body.name;
        const salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(req.body.password, salt);

        const sql =
          "INSERT INTO `players` (`name`, `password`, `wins`, `best`) VALUES('" +
          name +
          "','" +
          password +
          "', 0, 0)";
        db.query(sql, (error, results) => {
          if (error) {
            response.status(400, error, res);
          } else response.status(200, results, res);
        });
      }
    }
  );
};
