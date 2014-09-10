'use strict';

var payments = require('../controllers/payments');

// The Package is past automatically as first parameter
module.exports = function(Payments, app, auth, database) {

  app.route('/payments')
    .get(payments.create)
    .post(auth.requiresLogin, payments.create);


  app.route('/clientswbal')
    .get(payments.clientswbal);


  /*app.get('/payments/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/payments/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/payments/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/payments/example/render', function(req, res, next) {
    Payments.render('index', {
      package: 'payments'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });*/
};
