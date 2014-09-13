'use strict';

angular.module('mean.clients').factory('Clients', ['$resource',
  function($resource) {
    return $resource('clients/:clientId', {
      clientId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]).factory('Clients', ['$resource',
  function($resource) {
    return $resource('clients/:clientId/balance/:balance', {
      clientId: '@_id',
      balance: '@balance',
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

angular.module('mean.users').factory('MeanUser', ['$resource',
  function($resource) {
    return $resource('users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
