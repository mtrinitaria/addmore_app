'use strict';

angular.module('mean.payments').controller('PaymentsController', ['$scope', 'Global', 'Payments',
  function($scope, Global, Payments) {
    $scope.global = Global;
    $scope.package = {
      name: 'payments'
    };

    console.log('ahehe');

    $scope.global.createPayment = function(clientId, userId, amount) {
      console.log('craet payment');
      var payment = new Payments({
        clientId: clientId,
        userId: userId,
        amount: amount
      });
      payment.$save(function(response) {
        // $location.path('payments/' + response._id);
        console.log(response);
      });

      // this.title = '';
      // this.content = '';
    };

  }
]);
