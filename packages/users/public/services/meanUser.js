'use strict';

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

angular.module('mean.clients').factory('OfficersClients', ['$resource',
  function($resource) {
    return $resource('officersclients/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

angular.module('mean.clients').factory('OfficersStats', ['$resource',
  function($resource) {
    return $resource('officersstats/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
