'use strict';

var clients = require('../controllers/clients');

// Article authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.article.user.id !== req.user.id) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

// The Package is past automatically as first parameter
module.exports = function(Clients, app, auth, database) {

  app.route('/clients')
    .get(clients.all)
    .post(auth.requiresLogin, clients.create);
  app.route('/clients/:clientId')
    .get(clients.show)
    .put(auth.requiresLogin, hasAuthorization, clients.update)
    .delete(auth.requiresLogin, hasAuthorization, clients.destroy);

  // Finish with setting up the clientId param
  app.param('clientId', clients.client);
  /*app.get('/clients/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/clients/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/clients/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/clients/example/render', function(req, res, next) {
    Clients.render('index', {
      package: 'clients'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });*/

};
