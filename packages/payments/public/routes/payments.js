'use strict';

angular.module('mean.payments').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('all payments', {
      url: '/payments',
      templateUrl: 'payments/views/list.html'
    });
  }
]);
