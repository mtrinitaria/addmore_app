'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Client = mongoose.model('Client'),
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
exports.update = function(req, res) {
  var client = req.client;

  client = _.extend(client, req.body);

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
exports.all = function(req, res) {
  Client.find().sort('-created').populate('user', 'name username').exec(function(err, clients) {
    if (err) {
      return res.json(500, {
        error: 'Cannot list the clients'
      });
    }
    res.json(clients);

  });
};
