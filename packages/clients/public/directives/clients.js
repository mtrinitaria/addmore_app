'use strict';

function toCurrency(x) {
  x = x.toString().replace(/\,/g,'');
  x = parseFloat(x).toFixed(2);
  return x.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/*function toNumber(x) {
  x = x.toString().replace(/\,/g,'');
  return parseFloat(x);
}*/

// var ticker;
angular.module('mean.clients').directive('addwatch',
  function() {
    return {
      restrict: 'A',
      $scope: {
        'bindSummary' : '='
      },
      link: function($scope, elm, attr, ngModelCtrl) {

        $scope.$watch(attr.ngModel, function(newValue) {
          var rate, loan_amt, months;
          switch (attr.addwatch) {
            case 'loanAmount': 
              var value = newValue || 0;
              $scope.loanSummaries.loanAmount.value = toCurrency(value);
            break;
            case 'loanCycle': 
              value = newValue || 0;
              $scope.loanSummaries.loanCycle.value = value;
            break;
            case 'terms': 
              // var rate = newValue.rate || 0;
              rate = $scope.newClientForm.interestRate.rate || 0;
              loan_amt = $scope.newClientForm.loanAmount || 0;
              months = newValue.months || 0;
              console.log('terms', loan_amt , rate , months);
              // $scope.loanSummaries.interestRate.value = (rate * 100) + '%';
              $scope.loanSummaries.interestAmount.value = toCurrency(loan_amt * rate * months);
              $scope.loanSummaries.loanAmountInterest.value = toCurrency(loan_amt * (1 + (rate * months)));
              $scope.loanSummaries.terms.value = newValue.name || '0';
              // months = newValue.months;
              // console.log('months', months);
            break;
            case 'interestRate': 
              rate = newValue.rate || 0;
              loan_amt = $scope.newClientForm.loanAmount || 0;
              months = $scope.newClientForm.terms.months || 0;
              console.log('interestRate', loan_amt , rate , months);
              $scope.loanSummaries.interestAmount.value = toCurrency(loan_amt * rate * months);
              $scope.loanSummaries.loanAmountInterest.value = toCurrency(loan_amt * (1 + (rate * months)));
              $scope.loanSummaries.terms.value = newValue.name || '0';
              $scope.loanSummaries.interestRate.value = newValue.name || '0%';
            break;
          }
        });

      }

    };
  }
);
