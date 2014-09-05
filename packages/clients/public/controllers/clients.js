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

angular.module('mean.clients').controller('ClientsController', ['$scope', '$stateParams', '$location', 'dateFilter', 'Global', 'Clients',
  function($scope, $stateParams, $location, dateFilter, Global, Clients) {
    $scope.global = Global;
    $scope.package = {
      name: 'clients'
    };
    var DATE_FORMAT = 'yyyy/MM/dd';

    $scope.scheulePayments = [];

    // console.log($stateParams, $location.path() , Global);
    $scope.locPath = $location.path();

    /*
    to select the ng-model use:
    $scope.newClientForm.terms
    */
    $scope.newClientForm = [
      { label:'Client Name', type:'text', id:'clientName' } ,
      { label:'Address', type:'text', id:'address1' } ,
      { label:'Contact #', type:'text', id:'contactNumber' } ,
      { label:'ID Type', type:'text', id:'idType' } ,
      { label:'ID Number', type:'text', id:'idNumber' } ,
      { label:'Co-Maker', type:'text', id:'coMaker' } ,
      { label:'Loan Amount', type:'text', id:'loanAmount' } ,
      { label:'Terms', type:'select', list:[{name:'90', terms:90, rate:0.135, weeks:12, days:90}, {name:'120', terms:120, rate:0.18, weeks:17, days:120}], id:'terms' } ,
      { label:'Loan Type', type:'select', list:[{name:'Line 1'}, {name:'Line 2'}, {name:'Emergency'}], id:'loanType' } ,
      { label:'Loan Status', type:'select', list:[{name:'New'}, {name:'Renewal'}], id:'loanStatus' } ,
      { label:'Loan Cycle', type:'text', id:'loanCycle' } ,
      { label:'Mode of Payment', type:'select', list:[{name:'Cash'}, {name:'PDC'}], id:'modePayment' } ,
      { label:'Payment Frequency', type:'select', list:[{name:'Daily'}, {name:'Weekly'}], id:'paymentFrequency' } ,
      { label:'Processing Fee', type:'select', list:[{name:'3.5%', rate:0.035}, {name:'4.5%', rate:0.045}, {name:'5%', rate:0.05}], id:'processingFee' } ,
      { label:'Release Date', type:'date', id:'releaseDate' } ,
      { label:'Loan Officer', type:'select', list:[{name:'Officer 1'}, {name:'Officer 2'}], id:'loanOfficer' }
    ];
    
    $scope.loanSummaries = [
      { label:'Loan Cycle:', value:0, id:'loanCycle' },
      { label:'Loan Amount:', value:0, id:'loanAmount' },
      { label:'Interest Rate:', value:0, id:'interestRate' },
      { label:'Interest Amount:', value:0, id:'interestAmount' },
      { label:'Loan Amount + Interest:', value:0, id:'loanAmountInterest' },
      { label:'Terms:', value:0, id:'terms' },
      { label:'Release Date:', value:0, id:'releaseDate' },
      { label:'Maturity Date:', value:0, unlink:'/clients/new', id:'maturityDate' },
      { label:'Daily Amortization:', value:0, unlink:'/clients/new', id:'amortization' },
      { label:'Count:', value:0, unlink:'/clients/new', id:'count' },
      { label:'Running Balance:', value:0, unlink:'/clients/new', id:'runningBalance' },
      { label:'Discrepancy:', value:0, unlink:'/clients/new', id:'discrepancy' },
      { label:'Total Amount Paid:', value:0, unlink:'/clients/new', id:'totalAmountPaid' },
      { label:'Outstanding Balance:', value:0, unlink:'/clients/new', id:'outstandingBalance' },
      { label:'Next Payment Schedule:', value:0, unlink:'/clients/new', id:'nextPayment' }
    ];


    var resetForm = function() {
      for (var i=0;i < $scope.newClientForm.length; i+=1) {
        $scope.newClientForm[$scope.newClientForm[i].id] = '';
      }
      for (i=0;i < $scope.loanSummaries.length; i+=1) {
        $scope.loanSummaries[$scope.loanSummaries[i].id] = $scope.loanSummaries[i];
      }
    };
    resetForm();

    $scope.create = function(isValid) {
      if (isValid) {
        // values of input and select element
        var clientData = {};
        for (var i = 0, len = $scope.newClientForm.length; i < len; i+=1) {
          clientData[$scope.newClientForm[i].id] = $scope.newClientForm[$scope.newClientForm[i].id];
        }
        
        // generate schedule of payments
        var paymentsSchedule = [];
        var payLen = ($scope.newClientForm.paymentFrequency.name === 'Weekly' ? $scope.newClientForm.terms.weeks : $scope.newClientForm.terms.days);
        var WEEK = 7 * 24 * 60 * 60 * 1000;
        var DAY = 24 * 60 * 60 * 1000;
        var new_d,dd,mm,yy;
        var relDate = new Date($scope.newClientForm.releaseDate);
        var loanPlusInterest = $scope.newClientForm.loanAmount * (1 + $scope.newClientForm.terms.rate);
        var payAmt = loanPlusInterest / payLen;

        for (i=0;i < payLen; i+=1) {
          var payData = {};
          payData.status = 0;
          if ($scope.newClientForm.paymentFrequency.name === 'Weekly') {
            new_d = new Date(relDate.setTime(relDate.getTime() + WEEK));
          } else {
            new_d = new Date(relDate.setTime(relDate.getTime() + DAY));
          }
          dd = new_d.getDate();
          dd = (dd.toString().length === 1 ? '0' + dd: dd);
          mm = new_d.getMonth() + 1;
          mm = (mm.toString().length === 1 ? '0' + mm: mm);
          yy = new_d.getFullYear();

          payData.date = yy + '/' + mm + '/' + dd;
          payData.paymentAmount = payAmt;
          payData.paymentId = (new Date().getTime() + Math.floor((1 + Math.random()) * 999999999)).toString(16);
          
          paymentsSchedule[i] = payData;
        }

        // above is the generated payment schedule
        clientData.paymentsSchedule = paymentsSchedule;

        // initial outstanding balance for new client is loan + interest
        clientData.outstandingBalance = loanPlusInterest;

        // initial next payment is the first paymen schedule
        clientData.nextPayment = paymentsSchedule[0].date;

        // initial total amount paid is 0
        clientData.totalAmountPaid = 0;

        // save new client
        var client = new Clients(clientData);
        client.$save(function(response) {
          $location.path('clients/' + response._id);
          // console.log(response);
        });

        // $scope.submitted = false;
        resetForm();
      } else {
        $scope.submitted = true;
      }
    };


    $scope.update = function(isValid) {
      if (isValid) {
        var client = $scope.client;
        if (!client.updated) {
          client.updated = [];
        }
        client.updated.push(new Date().getTime());


        // client.loanAmount = parseFloat(client.loanAmount.split(',').join('');
        // client.outstandingBalance = client.outstandingBalance.split(',').join('');

        client.$update(function() {
          // $location.path('clients/' + client._id);
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.findOne = function(id) {
      Clients.get({
        clientId: (id ? id : $stateParams.clientId)
      }, function(client) {
        
        var loan_amt = toNumber(client.loanAmount);

        // format date
        client.releaseDate = dateFilter(client.releaseDate, DATE_FORMAT);
        client.loanAmount = toCurrency(loan_amt);
        client.outstandingBalance = toCurrency(client.outstandingBalance);

        $scope.client = client;

        $scope.loanSummaries.loanCycle.value = client.loanCycle;
        $scope.loanSummaries.loanAmount.value = client.loanAmount;
        $scope.loanSummaries.interestRate.value = (client.terms.rate * 100) + '%';
        $scope.loanSummaries.interestAmount.value = toCurrency(loan_amt * client.terms.rate);

        $scope.loanSummaries.loanAmountInterest.value = toCurrency(loan_amt * (1 + client.terms.rate));
        $scope.loanSummaries.terms.value = client.terms.name;
        $scope.loanSummaries.releaseDate.value = client.releaseDate;
        $scope.loanSummaries.maturityDate.value = client.paymentsSchedule[client.paymentsSchedule.length - 1].date;

        $scope.loanSummaries.amortization.label = client.paymentFrequency.name;
        $scope.loanSummaries.amortization.value = toCurrency(loan_amt * (1 + client.terms.rate) / (client.paymentFrequency.name === 'Weekly' ? client.terms.weeks : client.terms.days));

        var now = new Date();
        var rel_date = new Date(client.releaseDate);
        var diff_date = now.getTime() - rel_date.getTime();
        var DAY = 24 * 60 * 60 * 1000;
        $scope.loanSummaries.count.value = Math.ceil(diff_date / DAY);

        var pay_date;
        var run_bal = 0;
        for (var i=0; i<client.paymentsSchedule.length; i+=1) {
          pay_date = new Date(client.paymentsSchedule[i].date);

          // get running balance
          if (pay_date.getTime() <= now.getTime() && client.paymentsSchedule[i].status === 0) {
            run_bal += toNumber(client.paymentsSchedule[i].paymentAmount);
          }

          // format payment amount
          client.paymentsSchedule[i].paymentAmount = toCurrency(client.paymentsSchedule[i].paymentAmount);
        }
        // console.log(run_bal);
        $scope.loanSummaries.runningBalance.value = toCurrency(run_bal);

        $scope.loanSummaries.discrepancy.value = 0;
        $scope.loanSummaries.totalAmountPaid.value = toCurrency(client.totalAmountPaid);
        $scope.loanSummaries.outstandingBalance.value = toCurrency(client.outstandingBalance);
        $scope.loanSummaries.nextPayment.value = dateFilter(client.nextPayment, DATE_FORMAT);

      });
    };

    $scope.searchClient = function(item) {
      // console.log('item', item);
      // $scope.findOne(item._id);
      $location.path('clients/' + item._id);
    };

    $scope.find = function() {
      Clients.query(function(clients) {
        for (var i=0, len=clients.length; i<len; i+=1) {
          // console.log(clients[i].outstandingBalance);
          clients[i].loanAmount = toCurrency(clients[i].loanAmount);
          clients[i].totalAmountPaid = toCurrency(clients[i].totalAmountPaid);
          clients[i].outstandingBalance = toCurrency(clients[i].outstandingBalance);
          // clients[i].runningBalance = toCurrency(clients[i].runningBalance);
        }
        $scope.clients = clients;
      });
    };

    $scope.updatePayStatus = function(payment) {
      // update status
      payment.status = (payment.status === 1 ? 0 : 1);

      // update outstanding balance
      var bal = 0;
      var amt_paid = 0;
      // var run_bal = 0;
      var run_bal_total = 0;
      var now = new Date();
      var pay_date;
      var next_pay_date;
      var len = $scope.client.paymentsSchedule.length;
      for (var i = 0; i<len; i+=1) {
        if ($scope.client.paymentsSchedule[i].status === 0) {
          bal += toNumber($scope.client.paymentsSchedule[i].paymentAmount);
        } else {
          amt_paid += toNumber($scope.client.paymentsSchedule[i].paymentAmount);
        }
        // to get running balance
        // check if schedule date is less than date now, then check if status is 0
        pay_date = new Date($scope.client.paymentsSchedule[i].date);
        if (pay_date.getTime() <= now.getTime() && i + 1 < len) {
          next_pay_date = $scope.client.paymentsSchedule[i + 1].date;
        }
      }
      $scope.client.nextPayment = next_pay_date;
      $scope.client.loanAmount = toNumber($scope.client.loanAmount);
      $scope.client.outstandingBalance = toNumber(bal);
      $scope.client.totalAmountPaid = toNumber(amt_paid);
      $scope.update(true);


      // update loan summary
      for ( i = 0; i<len; i+=1) {
        pay_date = new Date($scope.client.paymentsSchedule[i].date);
        next_pay_date = new Date($scope.client.nextPayment);
        if (pay_date.getTime() <= next_pay_date.getTime()) {
          run_bal_total += toNumber($scope.client.paymentsSchedule[i].paymentAmount);
        }
      }
      $scope.loanSummaries.totalAmountPaid.value = toCurrency(amt_paid);
      $scope.loanSummaries.outstandingBalance.value = toCurrency(bal);
      $scope.loanSummaries.runningBalance.value = toCurrency(run_bal_total - amt_paid);
    };

    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
      $scope.dt = null;
    };
    $scope.minDate = $scope.minDate ? null : new Date();

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.initDate = new Date('2016-15-20');

  }
]);

