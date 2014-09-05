'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Client Schema
 */
var ClientSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  clientName: {
    type:String,
    required:true,
    trim:true
  },
  address1: {
    type:String,
    required:true,
    trim:true
  },
  contactNumber: {
    type:String,
    required:true,
    trim:true
  },
  idType: {
    type:String,
    required:true,
    trim:true
  },
  idNumber: {
    type:String,
    required:true,
    trim:true
  },
  coMaker: {
    type:String,
    required:true,
    trim:true
  },
  loanAmount: {
    type:Number,
    required:true,
    trim:true
  },
  terms: {
    type:Object,
    required:true,
    trim:true
  },
  loanType: {
    type:Object,
    required:true,
    trim:true
  },
  loanStatus: {
    type:Object,
    required:true,
    trim:true
  },
  loanCycle: {
    type:String,
    required:true,
    trim:true
  },
  modePayment: {
    type:Object,
    required:true,
    trim:true
  },
  paymentFrequency: {
    type:Object,
    required:true,
    trim:true
  },
  processingFee: {
    type:Object,
    required:true,
    trim:true
  },
  releaseDate: {
    type:Date,
    required:true,
    trim:true
  },
  loanOfficer: {
    type:Object,
    required:true,
    trim:true
  },
  paymentsSchedule: {
    type:Array,
    required:true,
    trim:true
  },
  outstandingBalance: {
    type:Number,
    required:true,
    trim:true
  },
  nextPayment: {
    type:Object,
    required:true,
    trim:true
  },
  totalAmountPaid: {
    type:Number,
    required:true,
    trim:true
  }
});

/**
 * Validations
 */
/*ClientSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title cannot be blank');

ClientSchema.path('content').validate(function(content) {
  return !!content;
}, 'Content cannot be blank');

ClientSchema.path('client_name').validate(function(client_name) {
  return !!client_name;
}, 'Client name cannot be blank');*/

/**
 * Statics
 */
ClientSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Client', ClientSchema);
