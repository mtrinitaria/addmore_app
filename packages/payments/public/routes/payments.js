'use strict';

angular.module('mean.payments').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('payments example page', {
      url: '/payments/example',
      templateUrl: 'payments/views/index.html'
    });
  }
]);
