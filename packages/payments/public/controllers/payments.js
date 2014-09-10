'use strict';

function toCurrency(x) {
  x = x.toString().replace(/\,/g,'');
  x = parseFloat(x).toFixed(2);
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function toNumber(x) {
  x = x.toString().replace(/\,/g,'');
  return parseFloat(x);
}

angular.module('mean.payments').controller('PaymentsController', ['$scope', '$http', 'Global', 'Payments',
  function($scope, $http, Global, Payments) {
    $scope.global = Global;
    $scope.package = {
      name: 'payments'
    };

    $scope.clients = [];
    $scope.loanOfficers = [];
    $scope.paymentsForm = [];


    $scope.global.createPayment = function(clientId, userId, amount) {
      var payment = new Payments({
        clientId: clientId,
        userId: userId,
        amount: amount
      });
      payment.$save(function(response) {
        // $location.path('payments/' + response._id);
        console.log(response);
      });
    };

    // API
    $scope.find = function() {
      $http.get('/clientswbal').success(function(clients) {
        $scope.clients = clients;
        for (var i = clients.length - 1; i >= 0; i-=1) {
          var client = clients[i];
          client.payments = [];
          client.summary = {
            balance: toCurrency(client.outstandingBalance),
            payments:0, 
            nextBalance:0
          };
          client.paymentData = {
            payments:[], 
            loanOfficer: '',
            clientId: '',
            date: ''
          };
        }
      });

      $http.get('/loanofficers').success(function(loanOfficers) {
        $scope.loanOfficers = loanOfficers;
      });
    };
    $scope.create = function(isValid, client, lo) {
      // console.log(client.paymentData);
      // console.log(isValid, client, client.paymentData);
      if (isValid) {
        
        client.paymentData = {
          payments: client.payments,
          loanOfficer: lo,
          clientId: client._id
        };
        var payment = new Payments(client.paymentData);
        payment.$save(function(response) {
          // $location.path('clients/' + response._id);
          // console.log(response);
          client.payments.length = 0;
        });
      }
    };

    $scope.addField = function(client, index) {
      client.payments.push({paidAmount: '', date: ''});
    };
    $scope.removeField = function(client, index) {
      client.payments.splice(index, 1);
    };

    $scope.paid = function(client) {
      var pay = 0;
      for (var i = client.payments.length - 1; i >= 0; i-=1) {
        pay += toNumber(client.payments[i].paidAmount || 0);
      }

      client.summary.payments = toCurrency(pay);
      client.summary.nextBalance = toCurrency(client.outstandingBalance - pay);

    };



  }
]);
