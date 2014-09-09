'use strict';

function toCurrency(x) {
  x = x.toString().replace(/\,/g,'');
  x = parseFloat(x).toFixed(2);
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// function toNumber(x) {
//   x = x.toString().replace(/\,/g,'');
//   return parseFloat(x);
// }

angular.module('mean.users')
  .controller('LoginCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global',
    function($scope, $rootScope, $http, $location, Global) {
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
            Global.user = response.user;
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
  .controller('RegisterCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global',
    function($scope, $rootScope, $http, $location, Global) {
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
            Global.user = $scope.user;
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
  .controller('ForgotPasswordCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global',
    function($scope, $rootScope, $http, $location, Global) {
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
  .controller('ResetPasswordCtrl', ['$scope', '$rootScope', '$http', '$location', '$stateParams', 'Global',
    function($scope, $rootScope, $http, $location, $stateParams, Global) {
      $scope.user = {};
      $scope.resetpassword = function() {
        $http.post('/reset/' + $stateParams.tokenId, {
          password: $scope.user.password,
          confirmPassword: $scope.user.confirmPassword
        })
          .success(function(response) {
            $rootScope.user = response.user;
            Global.user = response.user;
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
  .controller('UsersController', ['$scope', '$stateParams', '$rootScope', '$http', '$location', 'dateFilter', 'Global', 'MeanUser', 'Clients', 'OfficersClients', 'OfficersStats', 
    function($scope, $stateParams, $rootScope, $http, $location, dateFilter, Global, MeanUser, Clients, OfficersClients, OfficersStats) {
      $scope.users = [];

      $scope.userRoles = [
        { name:'Admin', value:'admin' } ,
        { name:'Encoder', value:'encoder' } ,
        { name:'Loan Officer', value:'loanOfficer' }
      ];
      // $scope.userRoles.super = $scope.userRoles[0];
      // $scope.userRoles.encoder = $scope.userRoles[1];
      // $scope.userRoles.loanOfficer = $scope.userRoles[2];

      $scope.update = function(userId, role) {
        // console.log('isafs', userId, role);
        $http.post('/usersrole/' + userId + '/' + role, {
          userId: userId,
          role: role
        })
          .success(function(response) {
            // console.log('response');
          });

      };

      // Global.myuser = 'ahehe';

      $scope.find = function() {
        MeanUser.query(function(users) {
          // check user's role
          for (var i = users.length - 1; i >= 0; i-=1) {
            var user = users[i];
            if (user.role) {
              // console.log(user.name, user.role);
              switch (user.role) {
                case 'admin': 
                  user.roleObj = $scope.userRoles[0];
                break;
                case 'encoder': 
                  user.roleObj = $scope.userRoles[1];
                break;
                case 'loanOfficer': 
                  user.roleObj = $scope.userRoles[2];
                break;
              }
            }
          }

          // console.log(users);
          $scope.users = users;

        });
      };

      $scope.findOne = function() {
        MeanUser.get({
          userId: $stateParams.userId
        }, function(user) {
          /*if (user.roles.indexOf('super') !== -1) {
            user.role = 'super';
          } else if (user.roles.indexOf('supervisor') !== -1) {
            user.role = 'supervisor';
          } else if (user.roles.indexOf('encoder') !== -1) {
            user.role = 'encoder';
          } else {
            user.role = 'none';
          }*/

          user.created = dateFilter(new Date(user.created), 'yyyy-MM-dd');

          $scope.profile = user;

          // after getting the profile to get the userId
          // this will look for clients with loanOfficer._id = userId of selected user
          OfficersClients.query(function(clients) {
            for (var i=0, len=clients.length; i<len; i+=1) {
              clients[i].loanAmount = toCurrency(clients[i].loanAmount);
              clients[i].totalAmountPaid = toCurrency(clients[i].totalAmountPaid);
              clients[i].outstandingBalance = toCurrency(clients[i].outstandingBalance);
            }

            // clients.stats = {
            //   today:0,
            //   week:0,
            //   month:0
            // };
            $scope.clients = clients;

            // console.log(clients);
            user.stats = {};
            OfficersStats.query(function(stats) {
              var stat_today = 0;
              var stat_week = 0;
              var stat_month = 0;

              var now = new Date();
              var day = now.getDay();
              var diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday, 1=monday, 2=tuesday, etc.
              // diff = dateFilter(diff, 'yyyy-MM-dd');
              // console.log(dateFilter(new Date(), 'yyyy-MM-dd'));
              var firs_day_monday = new Date(diff);
              firs_day_monday = new Date(dateFilter(firs_day_monday, 'yyyy-MM-dd'));
              firs_day_monday = new Date(firs_day_monday.getTime() - (firs_day_monday.getHours() * 60 * 60 * 1000));
              
              // console.log(diff,firs_day_monday.getHours(), now > firs_day_monday, stat_week);
              var date = new Date();
              var first_day_month = new Date(date.getFullYear(), date.getMonth(), 1);
              // var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

              var paid_date;
              for (var i = stats.length - 1, stat; i >= 0; i-=1) {
                stat = stats[i];
                stat_today += stat.amount;
                paid_date = new Date(stat.created);

                if (paid_date.getTime() > firs_day_monday.getTime()) {
                  stat_week += stat.amount;
                }

                if (paid_date.getTime() > first_day_month.getTime()) {
                  stat_month += stat.amount;
                }

              }
              user.stats.today = toCurrency(stat_today);
              user.stats.week = toCurrency(stat_week);
              user.stats.month = toCurrency(stat_month);

              // $scope.$apply();
              // console.lo
              /*for (var i=0, len=clients.length; i<len; i+=1) {
                clients[i].loanAmount = clients[i].loanAmount;
                clients[i].totalAmountPaid = clients[i].totalAmountPaid;
                clients[i].outstandingBalance = clients[i].outstandingBalance;
              }
              $scope.clients = clients;*/
            });
            

          });
          
        });
      };



    }
  ]);


