'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Client = mongoose.model('Client'),
  User = mongoose.model('User'),
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
  Client.find().sort('-created').limit(500).select('clientName loanAmount outstandingBalance totalAmountPaid interestRate terms releaseDate').populate('user', 'name username').exec(function(err, clients) {
    
    if (err) {
      return res.json(500, {
        error: 'Cannot list the clients'
      });
    }
    var data = [];
    for (var i=0,len=clients.length;i<len;i+=1) {
      // _id: "54149e5bc832c0abef26b6f2"clientName: "m"interestRate: ObjectloanAmount: 100000loanAmountInterest: "103,500.00"maturityDate: "2014/12/13"outstandingBalance: "99,900.00"releaseDate: "2014-09-13T16:00:00.000Z"terms: ObjecttotalAmountPaid: "3,600.00"
      // clients[i].maturityDate = new Date(clients[i].releaseDate).getTime() + (clients[i].terms.days * 24 * 3600 * 1000);
      data[i] = {
        _id:clients[i]._id,
        clientName:clients[i].clientName,
        loanAmountInterest:clients[i].loanAmount * (1 + clients[i].interestRate.rate),
        maturityDate:new Date(clients[i].releaseDate).getTime() + (clients[i].terms.days * 24 * 3600 * 1000),
        outstandingBalance:clients[i].outstandingBalance,
        totalAmountPaid:clients[i].totalAmountPaid
      };
    }
    res.json(data);
    // res.json(clients);
    /*var datas = [];
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
    */
  });
};

exports.officerclients = function(req, res, next) {
  console.log('ahehe');
  console.log('ahehe');
  console.log('ahehe');
  console.log('ahehe');
  Client.find().where('loanOfficer.name', 'test2').sort('-created').limit(500).select('clientName loanAmount outstandingBalance totalAmountPaid').populate('user', 'name username').exec(function(err, clients) {
    
    if (err) {
      return res.json(500, {
        error: 'Cannot list the clients'
      });
    }
    res.json(clients);
    next();
    /*
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
    
    next();*/
  });
};


exports.loanofficers = function(req, res) {
  User.find().where('role', 'loanOfficer').sort('-created').limit(500).select('name').populate('user', 'name username').exec(function(err, users) {
    
    if (err) {
      return res.json(500, {
        error: 'Cannot list the clients'
      });
    }
    // res.json(clients);
    res.json(users);
  });
};

exports.clientsbalance = function(req, res) {
  console.log('>>>>>>>>', req.params);
/*
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
  });*/

  Client.findOne({
    _id: req.params.clientId
  }, function(err, client) {
    console.log(client);
    client.outstandingBalance = req.params.balance;
    client.totalAmountPaid = req.params.paid;
    client.save(function(err) {
      // req.logIn(user, function(err) {
        // if (err) return next(err);
        // return res.send({
        //   user: user,
        // });
      // });
      res.json(client);
    });
  });



  /*Client.find().where('_id', req.params._id).sort('-created').populate('user', 'name username').exec(function(err, client) {
    console.log(client);
    req.body.outstandingBalance = req.params.balance;
    client = _.extend(client, req.body);    
    client.save(function(err) {
      // if (err) {
      //   return res.json(500, {
      //     error: 'Cannot update the client'
      //   });
      // }
      res.json(client);
    });
    // if (err) {
    //   return res.json(500, {
    //     error: 'Cannot list the clients'
    //   });
    // }
    // // res.json(clients);
    // res.json(users);
  });*/
};
