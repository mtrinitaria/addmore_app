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


angular.module('mean.payments').controller('PaymentsController', ['$scope', '$http', 'dateFilter', 'Global', 'Payments',
  function($scope, $http, dateFilter, Global, Payments) {
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
          client.summary = {
            balance: toCurrency(client.outstandingBalance),
            payments:0, 
            nextBalance:0
          };
          console.log(client);
          /*client.paymentData = {
            payments:[], 
            loanOfficer: '',
            clientId: '',
            date: ''
          };*/
        }
      });

      // get loan officers to populate in dorpdown
      $http.get('/loanofficers').success(function(loanOfficers) {
        $scope.loanOfficers = loanOfficers;
      });
    };
    /*$scope.create = function(isValid, client, lo) {
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
    };*/

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



    $scope.weeks = [];
    // $scope.mydate = new Date();
    var now = new Date();
    var day = now.getDay();
    var diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday, 1=monday, 2=tuesday, etc.
    
    var first_day_monday = new Date(now.setDate(diff));
    var last_day_sunday = new Date(first_day_monday.getTime() + (6 * 3600 * 24 * 1000));
    $scope.dateRange = dateFilter(first_day_monday, 'MMM dd, yyyy') + ' - ' + dateFilter(last_day_sunday, 'MMM dd, yyyy');
    // $scope.mydate = first_day_monday;


    // for (var i=0; i < 7; i+=1) {
    //   var d = new Date(first_day_monday.getTime() + (i * 3600 * 24 * 1000));
    //   $scope.weeks[i] = {year:d.getFullYear(), date:dateFilter(d, 'MMM dd'));
    // }

    $scope.moveWeek = function(n) {
      if (n !== 0) {
        first_day_monday = new Date(first_day_monday.getTime() + (n * 7 * 3600 * 24 * 1000));
        last_day_sunday = new Date(first_day_monday.getTime() + (6 * 3600 * 24 * 1000));
        $scope.dateRange = dateFilter(first_day_monday, 'MMM dd, yyyy') + ' - ' + dateFilter(last_day_sunday, 'MMM dd, yyyy');
      }

      for (var i=0; i < 7; i+=1) {
        var d = new Date(first_day_monday.getTime() + (i * 3600 * 24 * 1000));
        $scope.weeks[i] = {year:d.getFullYear(), date:dateFilter(d, 'MMM dd')};
      }
    };
    $scope.moveWeek(0);

    $scope.blurPayment = function(client, loanOfficer, day, payAmount) {
      // console.log('nag blu', client._id, loanOfficer, day, payAmount);
      // console.log('nag blu', day, new Date(day), payAmount);
      // console.log('nag blu', day);
      console.log (client , loanOfficer , payAmount);
      if (client._id && loanOfficer && payAmount) {
        client.outstandingBalance = client.outstandingBalance - payAmount;
        var data = {
          payDate: day.year + ' ' + day.date,
          loanOfficer: loanOfficer,
          clientId: client._id,
          payAmount: toNumber(payAmount)
        };
        // console.log(data);
        var payment = new Payments(data);
        payment.$save(function(response) {
          // $location.path('clients/' + response._id);
          // console.log(response);
          // client.payments.length = 0;

          // console.log(client.totalAmountPaid);

          $http.post('/clients/' + client._id + '/balance/' + client.outstandingBalance).success(function() {
            // $scope.loanOfficers = loanOfficers;
            console.log('ahehe');
          });

        });

        // client.$update(function() {
        //   $scope.global.createPayment(client._id, $scope.global.user._id, toNumber(payment.paidAmount));
        // });
      }
    };

  }
]);

