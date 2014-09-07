'use strict';

// function toCurrency(x) {
//   x = x.toString().replace(/\,/g,'');
//   x = parseFloat(x).toFixed(2);
//   return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// }

// function toNumber(x) {
//   x = x.toString().replace(/\,/g,'');
//   return parseFloat(x);
// }

angular.module('mean.users')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
      // This object will be filled by the form
      $scope.user = {};

      // Register the login() function
      $scope.login = function() {
        $http.post('/login', {
          email: $scope.user.email,
          password: $scope.user.password
        })
          .success(function(response) {
            // authentication OK
            $scope.loginError = 0;
            $rootScope.user = response.user;
            $rootScope.$emit('loggedin');
            if (response.redirect) {
              if (window.location.href === response.redirect) {
                //This is so an admin user will get full admin page
                window.location.reload();
              } else {
                window.location = response.redirect;
              }
            } else {
              $location.url('/');
            }
          })
          .error(function() {
            $scope.loginerror = 'Authentication failed.';
          });
      };
    }
  ])
  .controller('RegisterCtrl', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
      $scope.user = {};

      $scope.register = function() {
        $scope.usernameError = null;
        $scope.registerError = null;
        $http.post('/register', {
          email: $scope.user.email,
          password: $scope.user.password,
          confirmPassword: $scope.user.confirmPassword,
          username: $scope.user.username,
          name: $scope.user.name
        })
          .success(function() {
            // authentication OK
            $scope.registerError = 0;
            $rootScope.user = $scope.user;
            $rootScope.$emit('loggedin');
            $location.url('/');
          })
          .error(function(error) {
            // Error: authentication failed
            if (error === 'Username already taken') {
              $scope.usernameError = error;
            } else if (error === 'Email already taken') {
              $scope.emailError = error;
            } else $scope.registerError = error;
          });
      };
    }
  ])
  .controller('ForgotPasswordCtrl', ['$scope', '$rootScope', '$http', '$location',
    function($scope, $rootScope, $http, $location) {
      $scope.user = {};
      $scope.forgotpassword = function() {
        $http.post('/forgot-password', {
          text: $scope.text
        })
          .success(function(response) {
            $scope.response = response;
          })
          .error(function(error) {
            $scope.response = error;
          });
      };
    }
  ])
  .controller('ResetPasswordCtrl', ['$scope', '$rootScope', '$http', '$location', '$stateParams',
    function($scope, $rootScope, $http, $location, $stateParams) {
      $scope.user = {};
      $scope.resetpassword = function() {
        $http.post('/reset/' + $stateParams.tokenId, {
          password: $scope.user.password,
          confirmPassword: $scope.user.confirmPassword
        })
          .success(function(response) {
            $rootScope.user = response.user;
            $rootScope.$emit('loggedin');
            if (response.redirect) {
              if (window.location.href === response.redirect) {
                //This is so an admin user will get full admin page
                window.location.reload();
              } else {
                window.location = response.redirect;
              }
            } else {
              $location.url('/');
            }
          })
          .error(function(error) {
            if (error.msg === 'Token invalid or expired')
              $scope.resetpassworderror = 'Could not update password as token is invalid or may have expired';
            else
              $scope.validationError = error;
          });
      };
    }
  ])
  .controller('UsersController', ['$scope', '$stateParams', '$rootScope', '$http', '$location', 'dateFilter', 'MeanUser', 'Clients', 'OfficersClients',
    function($scope, $stateParams, $rootScope, $http, $location, dateFilter, MeanUser, Clients, OfficersClients) {
      $scope.users = [];

      $scope.find = function() {
        MeanUser.query(function(users) {
          // check user's role
          for (var i = users.length - 1; i >= 0; i-=1) {
            var user = users[i];
            if (user.roles.indexOf('super') !== -1) {
              user.role = 'super';
            } else if (user.roles.indexOf('supervisor') !== -1) {
              user.role = 'supervisor';
            } else if (user.roles.indexOf('encoder') !== -1) {
              user.role = 'encoder';
            }
          }
          $scope.users = users;
        });
      };

      $scope.findOne = function(id) {
        // console.log('$stateParams.userId', id, $stateParams.userId);
        MeanUser.get({
          userId: $stateParams.userId
        }, function(user) {
          if (user.roles.indexOf('super') !== -1) {
            user.role = 'super';
          } else if (user.roles.indexOf('supervisor') !== -1) {
            user.role = 'supervisor';
          } else if (user.roles.indexOf('encoder') !== -1) {
            user.role = 'encoder';
          } else {
            user.role = 'none';
          }

          user.created = dateFilter(new Date(user.created), 'yyyy-MM-dd');

          $scope.profile = user;

          console.log('.....', new OfficersClients());
          OfficersClients.query(function(clients, r) {
            // console.log('r', r);
          // OfficersClients.find({userId: $stateParams.userId}, function(clients) {
            for (var i=0, len=clients.length; i<len; i+=1) {
              clients[i].loanAmount = clients[i].loanAmount;
              clients[i].totalAmountPaid = clients[i].totalAmountPaid;
              clients[i].outstandingBalance = clients[i].outstandingBalance;
            }
            $scope.clients = clients;
          });
          // console.log(user._id );
          /*$http.get('/officerclients/' + user._id)
            .success(function(clients) {
              // for (var i=0, len=clients.length; i<len; i+=1) {
              //   clients[i].loanAmount = toCurrency(clients[i].loanAmount);
              //   clients[i].totalAmountPaid = toCurrency(clients[i].totalAmountPaid);
              //   clients[i].outstandingBalance = toCurrency(clients[i].outstandingBalance);
              // }
              $scope.clients = clients;
              // console.log('clicents', clients);
            })
            .error(function(error) {
              if (error.msg === 'Token invalid or expired')
                $scope.resetpassworderror = 'Could not update password as token is invalid or may have expired';
              else
                $scope.validationError = error;
            });*/
        });
      };



    }
  ]);


