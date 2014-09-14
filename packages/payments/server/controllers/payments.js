'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Payment = mongoose.model('Payment'),
  Client = mongoose.model('Client'),
  User = mongoose.model('User'),
  _ = require('lodash');


/**
 * Find payment by id
 */
exports.payment = function(req, res, next, id) {
  Payment.load(id, function(err, payment) {
    if (err) return next(err);
    if (!payment) return next(new Error('Failed to load payment ' + id));
    req.payment = payment;
    next();
  });
};

/**
 * Create an payment
 */
exports.create = function(req, res) {
  // var payment = new Payment(req.body);
  // payment.user = req.user;

  // console.log('create', req.body);


  Payment.find({datetime: req.body.datetime, clientId:req.body.clientId}).sort('-created').exec(function(err, payments) {
    /*data.push({client:client, payments:payments});
    
    ctr -= 1;
    if (ctr === 0) {
      res.json(data);
    }*/
    var payment;
    if (payments.length === 0) {
      payment = new Payment(req.body);
    } else {
      payment = _.extend(payments[0], req.body);
    }
    var clientId = req.body.clientId;
    payment.save(function(err) {
      // if (err) {
      //   return res.json(500, {
      //     error: 'Cannot save the payment'
      //   });
      // }
      // res.json(payment);

      Payment.find().where('clientId', clientId).select('payAmount').exec(function(err, payments) {
        // if (err) {
        //   return res.json(500, {
        //     error: 'Cannot list the payments'
        //   });
        // }
        // res.json(payments);
        console.log('payments',payments);
        var totalAmountPaid = 0;
        for (var i = payments.length - 1; i >= 0; i-=1) {
          totalAmountPaid += payments[i].payAmount;
        }

        res.json({totalAmountPaid: totalAmountPaid});


      });

    });
    
  });

  console.log(req.body);


  /*payment.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot save the payment'
      });
    }
    res.json(payment);

  });*/
};

/**
 * Update an payment
 */
exports.update = function(req, res) {
  var payment = req.payment;

  payment = _.extend(payment, req.body);

  payment.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot update the payment'
      });
    }
    res.json(payment);

  });
};

/**
 * Delete an payment
 */
exports.destroy = function(req, res) {
  var payment = req.payment;

  payment.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the payment'
      });
    }
    res.json(payment);

  });
};

/**
 * Show an payment
 */
exports.show = function(req, res) {
  res.json(req.payment);
};

/**
 * List of Payments
 */
exports.all = function(req, res) {
  Payment.find().sort('-created').populate('user', 'name username').exec(function(err, payments) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the payments'
      });
    }
    res.json(payments);

  });
};


exports.clientswbal = function(req, res) {
  Client.find().where('outstandingBalance').gt(0).sort('-created').populate('user', 'name username').select('clientName loanOfficer totalAmountPaid outstandingBalance loanAmount interestRate').exec(function(err, clients) {
    var ctr = clients.length;
    var data = [];
    function getPayments(client, i) {
      
      Payment.find().where('clientId', client._id).sort('-created').exec(function(err, payments) {
        
        data.push({client:{
          _id:client._id,
          clientName:client.clientName,
          loanAmountInterest:client.loanAmount * (1 + client.interestRate.rate),
          loanOfficer:client.loanOfficer,
          totalAmountPaid:client.totalAmountPaid,
          outstandingBalance:client.outstandingBalance
        }, payments:payments});
        
        ctr -= 1;
        if (ctr === 0) {
          res.json(data);
        }
        
      });
    }
    for (var i = clients.length - 1; i >= 0; i-=1) {
      getPayments(clients[i], i);
    }

  });
};


function getWeekNumber(newDate) {
  var d = new Date(newDate);
  d.setHours(0,0,0);
  d.setDate(d.getDate()+4-(d.getDay()||7));
  return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
}
exports.paymentsdashboard = function(req, res) {
  var d = new Date(req.params.date);
  var totalPerYear = 0;
  var totalPerMonth = 0;
  var totalPerWeek = 0;
  Payment.find().where('year', d.getFullYear()).sort('-created').exec(function(err, payments) {

    for (var i = payments.length - 1; i >= 0; i-=1) {
      totalPerYear += payments[i].payAmount;
    }

    // res.json({year: totalPerYear});
    Payment.find({year:d.getFullYear(), month:d.getMonth()}).exec(function(err, payments) {
      for (var i = payments.length - 1; i >= 0; i-=1) {
        totalPerMonth += payments[i].payAmount;
      }

      // res.json({totalPerYear: totalPerYear, totalPerMonth: totalPerMonth});
      Payment.find({year:d.getFullYear(), week:getWeekNumber(d)}).exec(function(err, payments) {
        for (var i = payments.length - 1; i >= 0; i-=1) {
          totalPerWeek += payments[i].payAmount;
        }

        User.find({role:'loanOfficer'}).sort('-created').select('name').exec(function(err, users) {

          var ctr = users.length;
          
          var data = [];

          // console.log(this.stream());
          function getUsersPayments(user, i) {
            var usersTotalPerYear = 0;
            Payment.find({year:d.getFullYear(), userId:user._id}).exec(function(err, payments) {
              
              for (var i = payments.length - 1; i >= 0; i-=1) {
                usersTotalPerYear += payments[i].payAmount;
              }
              data.push({
                userId:user._id,
                usersTotalPerYear:usersTotalPerYear
              });
              
              ctr -= 1;
              if (ctr === 0) {
                res.json({year: totalPerYear, month: totalPerMonth, week:totalPerWeek, users:data});
              } else {
                getUsersPayments(users[ctr], ctr);
              }
              
              // i+=1;
              // getUsersPayments(users[i], i);
            });
          }
          getUsersPayments(users[0], 0);

          // for (var i = users.length - 1; i >= 0; i-=1) {
            // console.log('########', users[i]);
            // getUsersPayments(users[i], i);
            /*Payment.find({year:d.getFullYear(), loanOfficer:users[i]._id}).exec(function(err, payments) {
              for (var i = payments.length - 1; i >= 0; i-=1) {
                usersTotalPerYear += payments[i].payAmount;
                console.log('########', payments[i].payAmount);
              }
            });*/
          // }

        });


        // res.json({year: totalPerYear, month: totalPerMonth, week:totalPerWeek});
      });
          
    });
    
  });
};


