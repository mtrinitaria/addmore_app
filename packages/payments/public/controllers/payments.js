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

function getWeekNumber(newDate) {
  var d = new Date(newDate);
  d.setHours(0,0,0);
  d.setDate(d.getDate()+4-(d.getDay()||7));
  return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
}


angular.module('mean.payments').controller('PaymentsController', ['$scope', '$http', 'dateFilter', 'Global', 'Payments',
  function($scope, $http, dateFilter, Global, Payments) {
    $scope.global = Global;
    $scope.package = {
      name: 'payments'
    };
    // var orderBy = $filter('orderBy');

    $scope.clients = [];
    $scope.loanOfficers = [];
    $scope.paymentsForm = [];
    $scope.officersDashboard = [];

    $scope.paymentsDashboard = [
      { label:'Week #:', name:'a', value:0, id:'week' },
      { label:'Month:', name:'b', value:0, id:'month' },
      { label:'Year:', name:'c', value:0, id:'year' }
    ];
    for (var j=0;j < $scope.paymentsDashboard.length; j+=1) {
      $scope.paymentsDashboard[$scope.paymentsDashboard[j].id] = $scope.paymentsDashboard[j];
    }



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
          clients[i].clientName = clients[i].client.clientName;
          clients[i].loanOfficer = clients[i].client.loanOfficer.name;
          var client = clients[i].client;
          client.payments = clients[i].payments;
          client.summary = {
            outstandingBalance: toCurrency(client.outstandingBalance),
            totalAmountPaid: toCurrency(client.totalAmountPaid)
          };
          // parse object
          for (var j=0;j < client.payments.length; j+=1) {
            client.payments[client.payments[j].datetime] = client.payments[j].payAmount;
          }

        }
        $scope.clients = clients;
      });

      // get loan officers to populate in dorpdown
      $http.get('/loanofficers').success(function(loanOfficers) {
        $scope.loanOfficers = loanOfficers;

        $scope.officersDashboard = [];
        for (var i = $scope.loanOfficers.length - 1; i >= 0; i-=1) {
          $scope.officersDashboard[i] = {
            label: $scope.loanOfficers[i].name,
            id: $scope.loanOfficers[i]._id,
            day: 0,
            week: 0,
            month: 0,
            year: 10
          };
        }
        // parse object
        for (var j=0;j < $scope.officersDashboard.length; j+=1) {
          $scope.officersDashboard[$scope.officersDashboard[j].id] = $scope.officersDashboard[j];
        }
      });
    };


    $scope.totalPayPerDay = {};

    var onPaymentsDashboard = function(response) {
      // console.log('onPaymentsDashboard', response);
      $scope.paymentsDashboard.week.value = toCurrency(response.week);
      $scope.paymentsDashboard.year.value = toCurrency(response.year);
      $scope.paymentsDashboard.month.value = toCurrency(response.month);

      // console.log('$scope.officersDashboard', $scope.officersDashboard);
      for (var i = response.usersYear.length - 1; i >= 0; i-=1) {
        $scope.officersDashboard[response.usersYear[i].userId].year = toCurrency(response.usersYear[i].usersTotalPerYear);
        $scope.officersDashboard[response.usersMonth[i].userId].month = toCurrency(response.usersMonth[i].usersTotalPerMonth);
        $scope.officersDashboard[response.usersWeek[i].userId].week = toCurrency(response.usersWeek[i].usersTotalPerWeek);
      }
      // for (i = response.usersMonth.length - 1; i >= 0; i-=1) {
      //   $scope.officersDashboard[response.users[i].userId].month = response.users[i].usersTotalPerMonth;
      // }

        // for ( i=0;i < $scope.clients.length; i+=1) {
        //   var client = $scope.clients[i].client;
        //   // console.log(client);
        //   for (var j=0;j < client.payments.length; j+=1) {
        //     // client.payments[client.payments[j].datetime] = client.payments[j].payAmount;
        //     console.log(client.payments);
        //     for (var k = $scope.weeks.length - 1; k >= 0; k-=1) {
        //       console.log($scope.weeks[k].datetime);
        //       $scope.totalPayPerDay[$scope.weeks[k].datetime] = client.payments[$scope.weeks[k].datetime];
        //     }
        //   }
        // }
    };

    $scope.getTotalOfDay = function(d) {
      // 1410624000000
      // d = new Date(d);
      // console.log(1410624000000, d.getTime());
      var total = 0;
      for (var i = $scope.clients.length - 1; i >= 0; i-=1) {
        var client = $scope.clients[i].client;
        if (client.payments[d]) {
          total += client.payments[d];
        }
      }
      return toCurrency(total);
    };



    $scope.weeks = [];
    var now = new Date();

    $scope.NOW = {
      monthDate: dateFilter(now, 'MMM dd'),
      today: dateFilter(now, 'EEE'),
      week: getWeekNumber(now),
      month: dateFilter(now, 'MMMM'),
      year: dateFilter(now, 'yyyy')
    };

    var day = now.getDay();
    var diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday, 1=monday, 2=tuesday, etc.
    
    var first_day_monday = new Date(now.setDate(diff));
    var last_day_sunday = new Date(first_day_monday.getTime() + (6 * 3600 * 24 * 1000));
    $scope.dateRange = dateFilter(first_day_monday, 'MMM dd, yyyy') + ' - ' + dateFilter(last_day_sunday, 'MMM dd, yyyy');


    $scope.moveWeek = function(n) {
      if (n !== 0) {
        first_day_monday = new Date(first_day_monday.getTime() + (n * 7 * 3600 * 24 * 1000));
        last_day_sunday = new Date(first_day_monday.getTime() + (6 * 3600 * 24 * 1000));
        $scope.dateRange = dateFilter(first_day_monday, 'MMM dd, yyyy') + ' - ' + dateFilter(last_day_sunday, 'MMM dd, yyyy');
      }
      // update table's header
      for (var i=0; i < 7; i+=1) {
        var d = new Date(first_day_monday.getTime() + (i * 3600 * 24 * 1000));
        $scope.weeks[i] = {
          year:d.getFullYear(), 
          date:d.getDate() + 1, 
          month:d.getMonth(), 
          week:getWeekNumber(first_day_monday), 
          label:dateFilter(d, 'MMM dd'), 
          datetime: new Date(dateFilter(d, 'yyyy MM dd')).getTime()
        };
      }

      // update payments dashboard
      $scope.paymentsDashboard.month.name = dateFilter(first_day_monday, 'MMMM');
      $scope.paymentsDashboard.week.name = getWeekNumber(first_day_monday);
      $scope.paymentsDashboard.year.name = first_day_monday.getFullYear();

      $scope.NOW.month = dateFilter(first_day_monday, 'MMMM');
      $scope.NOW.week = getWeekNumber(first_day_monday);
      $scope.NOW.year = first_day_monday.getFullYear();



      $http.get('/paymentsdashboard/' + first_day_monday).success(onPaymentsDashboard);
    };
    $scope.moveWeek(0);

    $scope.blurPayment = function(client, day, payAmount) {
      if (client.client._id && payAmount) {
        payAmount = parseFloat(payAmount);
        var data = {
          date: day.date,
          week: day.week,
          month: day.month,
          year: day.year,
          datetime: day.datetime,
          userId: client.client.loanOfficer._id,
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
            $http.get('/paymentsdashboard/' + first_day_monday).success(onPaymentsDashboard);
          });

        });

      }
    };

    $scope.sort = {
        column: '',
        descending: false
    };    
    $scope.changeSorting = function(column) {
      var sort = $scope.sort;
 
      if (sort.column === column) {
          sort.descending = !sort.descending;
      } else {
          sort.column = column;
          sort.descending = false;
      }
      // $scope.sort.column = column;
      // $scope.sort.descending = !$scope.sort.descending;
      // console.log($scope.clients);
      // $scope.clients = orderBy($scope.clients, column, $scope.sort.descending);
    };

  }
]);

