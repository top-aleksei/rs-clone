'use strict';

module.exports = (app) => {
  const indexController = require('./../Controller/IndexController');
  const usersController = require('./../Controller/UsersController');

  app.route('/').get(indexController.index);

  app.route('/api/users').get(usersController.users);
  app.route('/api/users/register').post(usersController.create);
  app.route('/api/users/autorization').post(usersController.autorization);
};
