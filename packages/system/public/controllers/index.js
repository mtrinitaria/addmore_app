'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', 'Global',
  function($scope, Global) {
    $scope.global = Global;
    
    
    setTimeout(function(){
      $scope.welcomeUser = Global.user.name;
      // console.log($scope.welcomeUser,Global.user.name, $scope.global.authenticated);
      $scope.$apply();
    }, 100);
  }
]);
