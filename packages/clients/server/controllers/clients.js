'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Client = mongoose.model('Client'),
  // Collection = mongoose.model('Collection'),
  _ = require('lodash');


/**
 * Find client by id
 */
exports.client = function(req, res, next, id) {
  Client.load(id, function(err, client) {
    if (err) return next(err);
    if (!client) return next(new Error('Failed to load client ' + id));
    req.client = client;
    next();
  });
};

/**
 * Create an client
 */
exports.create = function(req, res) {
  var client = new Client(req.body);
  client.user = req.user;

  client.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot save the client'
      });
    }
    res.json(client);

  });
};

/**
 * Update an client
 */
exports.update = function(req, res, next) {
  var client = req.client;

  // console.log(req);
  var realBody = {};
  var userCollection;
  for (var n in req.body) {
    if (n !== 'userCollection') {
      realBody[n] = req.body[n];
    } else {
      userCollection = req.body[n];
      console.log('req.body[n]', req.body[n]);
    }
  }

  // client = _.extend(client, req.body);
  client = _.extend(client, realBody);

  client.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot update the client'
      });
    }
    res.json(client);
  });
};

/**
 * Delete an client
 */
exports.destroy = function(req, res) {
  var client = req.client;

  client.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the client'
      });
    }
    res.json(client);

  });
};

/**
 * Show an client
 */
exports.show = function(req, res) {
  res.json(req.client);
};

/**
 * List of Clients
 */
exports.all = function(req, res, a) {
  Client.find().sort('-created').limit(500).select('clientName loanAmount outstandingBalance totalAmountPaid paymentsSchedule').populate('user', 'name username').exec(function(err, clients) {
    
    if (err) {
      return res.json(500, {
        error: 'Cannot list the clients'
      });
    }
    var datas = [];
    for (var i=0,len=clients.length;i<len;i+=1) {
      var dta = {};
      var client = clients[i];
      dta._id = client._id;
      dta.clientName = client.clientName;
      dta.loanAmount = client.loanAmount;
      dta.outstandingBalance = client.outstandingBalance;
      dta.totalAmountPaid = client.totalAmountPaid;
      dta.maturityDate = client.paymentsSchedule[client.paymentsSchedule.length - 1].date;
      datas[i] = dta;
    }
    // res.json(clients);
    res.json(datas);
    // console.log(clients);
  });
};

exports.officerclients = function(req, res, next) {
  console.log('ahehe');
  console.log('ahehe');
  console.log('ahehe');
  console.log('ahehe');
  Client.find().where('loanOfficer.name', 'test2').sort('-created').limit(500).select('clientName loanAmount outstandingBalance totalAmountPaid paymentsSchedule').populate('user', 'name username').exec(function(err, clients) {
    
    if (err) {
      return res.json(500, {
        error: 'Cannot list the clients'
      });
    }
    var datas = [];
    for (var i=0,len=clients.length;i<len;i+=1) {
      var dta = {};
      var client = clients[i];
      dta._id = client._id;
      dta.clientName = client.clientName;
      dta.loanAmount = client.loanAmount;
      dta.outstandingBalance = client.outstandingBalance;
      dta.totalAmountPaid = client.totalAmountPaid;
      dta.maturityDate = client.paymentsSchedule[client.paymentsSchedule.length - 1].date;
      datas[i] = dta;
    }
    // res.json(clients);
    res.json(datas);
    // console.log(clients);
    next();
  });
};
