(function () {
    'use strict';

    /**
     * @ngdoc overview
     * @name app
     * @description
     * # The login controller is responsible for communicating with the server
     * # to authenticate facilitators and participants.
     */
    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$scope', '$location', '$http', 'UserService',
        'facilitatorLogin', 'LoggerService'
    ];

    

    function LoginController($scope, $location, $http, UserService,
        facilitatorLogin, Logger) {

        var demo = false;

        (function initController() {
            // reset login status?

            demo = false;

            $scope.isFacilitator = facilitatorLogin;

            if ('participant' in $location.search()) {
                $scope.isChangingRoles = true;
            }
            console.log("user:", UserService.user);
        })();

        $scope.demoToggle = function() {
            demo = !demo;
        }

        $scope.isDemo = function(){return demo;}

        $scope.loginParticipant = function () {
            $scope.dataLoading = true;
            if (demo === false){
                UserService.login({
                        username: $scope.sillyname,
                        facilitator: $scope.isFacilitator
                    })
                    .then(function (user) {
                        $location.path('/participant');
                        Logger.createEvent({
                            data: $scope.sillyname + ' successfully logged in',
                            type: 'logIn'
                        });
                    })
                    .catch(function (err) {
                        $scope.error = err;
                        $scope.dataLoading = false;
                        Logger.createEvent({
                            data: 'participant' + $scope.sillyname +
                                'encountered error ' + err + ' while logging in',
                            type: 'authenticateError'
                        });

                    });
            }
            else{

                var name = "";

                for(var i = 0; i < 100; i++){

                    name = $scope.sillyname + i;

                    console.log(name);

                    UserService.login({
                            username: $scope.sillyname,
                            facilitator: $scope.isFacilitator
                        })
                        .then(function (user) {
                            $location.path('/participant');
                            Logger.createEvent({
                                data: $scope.sillyname + ' successfully logged in',
                                type: 'logIn'
                            });
                        })
                        .catch(function (err) {
                            $scope.error = err;
                            $scope.dataLoading = false;
                            Logger.createEvent({
                                data: 'participant' + $scope.sillyname +
                                    'encountered error ' + err + ' while logging in',
                                type: 'authenticateError'
                            });

                        });
                }
            }
        };

        $scope.loginFacilitator = function () {
            $scope.dataLoading = true;
            UserService.login({
                    username: $scope.username,
                    password: $scope.password,
                    facilitator: $scope.isFacilitator
                })
                .then(function (user) {
                    UserService.getGroups()
                        .then(function (groups) {
                            if (groups.length === 1) {
                                $location.path('/facilitator/' + groups[0].id);
                            } else {
                                $location.path('/facilitator/mgmt');
                            }
                        });
                    Logger.createEvent({
                        data: $scope.username + ' successfully logged in',
                        type: 'logIn'
                    });
                })
                .catch(function (err) {
                    $scope.error = err;
                    $scope.dataLoading = false;
                    Logger.createEvent({
                        data: 'facilitator ' + $scope.username +
                            ' encountered error ' + err + ' while logging in',
                        type: 'authenticateError'
                    });
                });
        };

        $scope.switchRoute = function () {
            if ($location.path() === '/login') {
                $location.path('/login/facilitator');
            } else if ($location.path() === '/login/facilitator') {
                $location.path('/login');
            }
        };
    }

})();