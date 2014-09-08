'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Client = mongoose.model('Client'),
  Payment = mongoose.model('Payment'),
  async = require('async'),
  config = require('meanio').loadConfig(),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  templates = require('../template')/*,
  _ = require('lodash')*/;

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
  res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.redirect('#!/login');
};


/**
 * Show an user
 */
exports.show = function(req, res) {
  res.json(req.user);
};

/**
 * List of Clients
 */
exports.all = function(req, res) {
  User.find().sort('-created').populate('user', 'name username').exec(function(err, users) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the users'
      });
    }
    res.json(users);

  });
};

/**
 * Update an article
 */
exports.update = function(req, res) {
  // var user = req.user;
  /*console.log('##############');
  console.log(user.body);
  console.log('##############');

  user = _.extend(user, req.body);


  user.save(function(err) {
    // if (err) {
    //   return res.json(500, {
    //     error: 'Cannot update the user'
    //   });
    // }
    // res.json(user);
    console.log(user);

  });*/
};
exports.usersroleupdate = function(req, res) {
  // var user = req.user;

  console.log('req.params.userId', req.params.userId, req.params);
  User.findOne({
    _id: req.params.userId
  }, function(err, user) {
    console.log(err,user);
    user.role = req.params.role;
    user.save(function(err) {
      // req.logIn(user, function(err) {
        // if (err) return next(err);
        // return res.send({
        //   user: user,
        // });
      // });
    });
    /*if (err) {
      return res.status(400).json({
        msg: err
      });
    }
    if (!user) {
      return res.status(400).json({
        msg: 'Token invalid or expired'
      });
    }
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors) {
      return res.status(400).send(errors);
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.save(function(err) {
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.send({
          user: user,
        });
      });
    });*/
  });

  /*console.log('##############');
  console.log(user.body);
  console.log('##############');

  user = _.extend(user, req.body);


  user.save(function(err) {
    // if (err) {
    //   return res.json(500, {
    //     error: 'Cannot update the user'
    //   });
    // }
    // res.json(user);
    console.log(user);

  });*/
};

var officersclientsUserId;
exports.officersclients = function(req, res) {
  Client.find().sort('-created').where('loanOfficer._id', officersclientsUserId).limit(500).select('clientName loanAmount outstandingBalance totalAmountPaid paymentsSchedule').populate('user', 'name username').exec(function(err, clients) {
    
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
exports.officersstats = function(req, res) {
  Payment.find().sort('-created').where('userId', officersclientsUserId).limit(500).select('userId amount created').populate('user', 'name username').exec(function(err, stats) {
    
    if (err) {
      return res.json(500, {
        error: 'Cannot list the stats'
      });
    }
    res.json(stats);
  });
};

exports.userprofile = function(req, res) {
  officersclientsUserId = req.params.userId;
};



/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
  res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
  var user = new User(req.body);

  user.provider = 'local';

  // because we set our user.provider to local our models/user.js validation will always be true
  req.assert('name', 'You must enter a name').notEmpty();
  req.assert('email', 'You must enter a valid email address').isEmail();
  req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
  req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  // Hard coded for now. Will address this with the user permissions system in v0.3.5
  user.roles = ['authenticated'];
  user.save(function(err) {
    if (err) {
      switch (err.code) {
        case 11000:
          res.status(400).send([{
            msg: 'Email already taken',
            param: 'email'
          }]);
          break;
        case 11001:
          res.status(400).send([{
            msg: 'Username already taken',
            param: 'username'
          }]);
          break;
        default:
          var modelErrors = [];

          if (err.errors) {

            for (var x in err.errors) {
              modelErrors.push({
                param: x,
                msg: err.errors[x].message,
                value: err.errors[x].value
              });
            }

            res.status(400).send(modelErrors);
          }
      }

      return res.status(400);
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/');
    });
    res.status(200);
  });
};
/**
 * Send User
 */
exports.me = function(req, res) {
  res.json(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
  User
    .findOne({
      _id: id
    })
    .exec(function(err, user) {
      if (err) return next(err);
      if (!user) return next(new Error('Failed to load User ' + id));
      req.profile = user;
      next();
      res.json(user);
    });
};



/**
 * Resets the password
 */

exports.resetpassword = function(req, res, next) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (err) {
      return res.status(400).json({
        msg: err
      });
    }
    if (!user) {
      return res.status(400).json({
        msg: 'Token invalid or expired'
      });
    }
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors) {
      return res.status(400).send(errors);
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.save(function(err) {
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.send({
          user: user,
        });
      });
    });
  });
};

/**
 * Send reset password email
 */
function sendMail(mailOptions) {
  var transport = nodemailer.createTransport('SMTP', config.mailer);
  transport.sendMail(mailOptions, function(err, response) {
    if (err) return err;
    return response;
  });
}

/**
 * Callback for forgot password link
 */
exports.forgotpassword = function(req, res, next) {
  async.waterfall([

      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({
          $or: [{
            email: req.body.text
          }, {
            username: req.body.text
          }]
        }, function(err, user) {
          if (err || !user) return done(true);
          done(err, user, token);
        });
      },
      function(user, token, done) {
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      },
      function(token, user, done) {
        var mailOptions = {
          to: user.email,
          from: config.emailFrom
        };
        mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
        sendMail(mailOptions);
        done(null, true);
      }
    ],
    function(err, status) {
      var response = {
        message: 'Mail successfully sent',
        status: 'success'
      };
      if (err) {
        response.message = 'User does not exist';
        response.status = 'danger';
      }
      res.json(response);
    }
  );
};

