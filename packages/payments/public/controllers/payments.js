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
        // console.log(response);
      });
    };

    // API
    $scope.find = function() {
      $http.get('/clientswbal').success(function(clients) {
        // console.log(clients);
        for (var i = clients.length - 1; i >= 0; i-=1) {
          var client = clients[i].client;
          client.payments = clients[i].payments;
          client.summary = {
            outstandingBalance: toCurrency(client.outstandingBalance),
            totalAmountPaid: toCurrency(client.totalAmountPaid)
          };
          // console.log(client);

          for (var j=0;j < client.payments.length; j+=1) {
            client.payments[client.payments[j].datetime] = client.payments[j].payAmount;
          }
        }
        $scope.clients = clients;
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
        $scope.weeks[i] = {year:d.getFullYear(), date:dateFilter(d, 'MMM dd'), datetime: new Date(dateFilter(d, 'yyyy MM dd')).getTime()};
      }
    };
    $scope.moveWeek(0);

    $scope.blurPayment = function(client, day, payAmount) {
      if (client.client._id && payAmount) {
        payAmount = parseFloat(payAmount);
        var data = {
          date: day.year + ' ' + day.date,
          datetime: day.datetime,
          loanOfficer: client.client.loanOfficer,
          clientId: client.client._id,
          payAmount: toNumber(payAmount)
        };

        var payment = new Payments(data);
        payment.$save(function(response) {
          client.client.outstandingBalance = toNumber(client.client.loanAmountInterest) - response.totalAmountPaid;
          client.client.totalAmountPaid = response.totalAmountPaid;

          client.client.summary = {
            outstandingBalance: toCurrency(client.client.outstandingBalance),
            totalAmountPaid: toCurrency(response.totalAmountPaid)
          };

          $http.post('/client/' + client.client._id + '/balance/' + client.client.outstandingBalance + '/paid/' + client.client.totalAmountPaid).success(function(response) {
            // console.log('ahehe', response); 
          });

        });

      }
    };

  }
]);

