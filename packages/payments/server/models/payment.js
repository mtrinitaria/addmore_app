'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Payment Schema
 */
var PaymentSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  clientId: {
    type: String
  },
  userId: {
    type: String
  },
  date: {
    type: String
  },
  week: {
    type: String
  },
  month: {
    type: String
  },
  year: {
    type: String
  },
  datetime: {
    type: String
  },
  payAmount: {
    type: Number
  }
});

/**
 * Statics
 */
PaymentSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Payment', PaymentSchema);
