'use strict';

angular.module('mean.clients').controller('ClientsController', ['$scope', '$stateParams', '$location', 'Global', 'Clients',
  function($scope, $stateParams, $location, Global, Clients) {
    $scope.global = Global;
    $scope.package = {
      name: 'clients'
    };

    $scope.scheulePayments = [];


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
      { label:'Loan Amount', type:'text', bindAtSummary:0, id:'loanAmount' } ,
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
    
    $scope.loanSummaries = [];


    var resetForm = function() {
      for (var i=0;i < $scope.newClientForm.length; i+=1) {
        $scope.newClientForm[$scope.newClientForm[i].id] = '';
      }
    };
    resetForm();

    $scope.create = function(isValid) {
        for (var i = 0, len = $scope.newClientForm.length; i < len; i+=1) {
          console.log($scope.newClientForm[$scope.newClientForm[i].id]);
        }
      if (isValid) {
        // input/select values
        var clientData = {};
        for ( i = 0, len = $scope.newClientForm.length; i < len; i+=1) {
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
        clientData.nextPayment = paymentsSchedule[0];

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
        // client.loanPlusInterest = client.loanAmount * (1 + client.terms.rate);
        $scope.client = client;

        $scope.loanSummaries = [
          { label:'Loan Amount:', value:client.loanAmount },
          { label:'Interest Rate:', value:(client.terms.rate * 100) + '%' },
          { label:'Interest Amount:', value:client.loanAmount * client.terms.rate },
          { label:'Loan Amount + Interest:', value:client.loanAmount * (1 + client.terms.rate) },
          { label:client.paymentFrequency.name + ' Amortization:', value: client.loanAmount * (1 + client.terms.rate) / (client.paymentFrequency.name === 'Weekly' ? client.terms.weeks : client.terms.days) },
          { label:'Outstanding Balance:', value:client.outstandingBalance },
          { label:'Loan Cycle:', value:client.loanCycle },
          { label:'Total Amount Paid:', value:client.totalAmountPaid },
          { label:'Maturity Date:', value:client.paymentsSchedule[client.paymentsSchedule.length - 1].date },
        ];
      });
    };

    $scope.searchClient = function(item) {
      // console.log('item', item);
      // $scope.findOne(item._id);
      $location.path('clients/' + item._id);
    };

    $scope.find = function() {
      Clients.query(function(clients) {
        $scope.clients = clients;
      });
    };

    $scope.updatePayStatus = function(payment) {
      // update status
      payment.status = (payment.status === 1 ? 0 : 1);

      // update outstanding balance
      var bal = 0;
      for (var i = 0; i<$scope.client.paymentsSchedule.length; i+=1) {
        if ($scope.client.paymentsSchedule.status === 1) {
          bal += $scope.client.paymentsSchedule.paymentAmount;
        }
      }

      $scope.update(true);
    };

    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
      $scope.dt = null;
    };

    // Disable weekend selection
    // $scope.disabled = function(date, mode) {
    //   return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    // };


    $scope.minDate = $scope.minDate ? null : new Date();

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.initDate = new Date('2016-15-20');
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];


  }
]);

