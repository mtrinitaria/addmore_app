'use strict';

angular.module('mean.clients').config(['$stateProvider',
  function($stateProvider) {
    var checkLoggedin = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {

        // console.log('loggedin', user, $scope.global);
        $stateProvider.loanOfficer = user.name;
        // Global.user = user;
        // Authenticated
        if (user !== '0') $timeout(deferred.resolve);

        // Not Authenticated
        else {
          $timeout(deferred.reject);
          $location.url('/login');
        }
      });

      // console.log(deferred.promise);

      return deferred.promise;
    };

    $stateProvider
      .state('all clients', {
        url: '/clients',
        templateUrl: 'clients/views/list.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('new client', {
        url: '/clients/new',
        templateUrl: 'clients/views/new.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('client by id', {
        url: '/clients/:clientId',
        templateUrl: 'clients/views/view.html',
        resolve: {
          loggedin: checkLoggedin
        }
      });
  }
]);
