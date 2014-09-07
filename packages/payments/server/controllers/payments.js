'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Payment = mongoose.model('Payment'),
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
  var payment = new Payment(req.body);
  payment.user = req.user;

  payment.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot save the payment'
      });
    }
    res.json(payment);

  });
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
