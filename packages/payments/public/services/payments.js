'use strict';

angular.module('mean.payments').factory('Payments', ['$resource',
  function($resource) {
    return $resource('payments/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

