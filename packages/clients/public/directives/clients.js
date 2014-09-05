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
              var rate = newValue.rate || 0;
              var loan_amt = $scope.newClientForm.loanAmount || 0;
              $scope.loanSummaries.interestRate.value = (rate * 100) + '%';
              $scope.loanSummaries.interestAmount.value = toCurrency(loan_amt * rate);
              $scope.loanSummaries.loanAmountInterest.value = toCurrency(loan_amt * (1 + rate));
              $scope.loanSummaries.terms.value = newValue.name || '0';
            break;
          }
        });

      }

    };
  }
);
