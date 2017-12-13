(function () {
	'use strict';

	angular.module('authentication', ['ngCookies'])
		.service('UserService', UserService);

	UserService.$inject = ['$http', '$cookies', '$q', 'GroupsService', 'LoggerService'];

	function UserService($http, $cookies, $q, GroupsService, Logger) {
		var userService = this;

		// To be called on success of register and login
		this.auth = function (data, deferred) {
			this.user = data.user;
			$cookies.putObject('thoughtswap-user', this.user);
			deferred.resolve(this.user);
		};

		this.login = function (options) {
			var deferred = $q.defer();

			if (options.facilitator) {
				$http.post('/signin', {
						user: {
							username: options.username,
							password: options.password
						}
					})
					.success(function (data) {
						this.auth(data, deferred);
					}.bind(this))

					.error(function (data, status) {
						deferred.reject(data);
					});
			} else {
				$http.post('/signin', {
						user: {
							username: options.username
						}
					})
					.success(function (data) {
						this.auth(data, deferred);
					}.bind(this))

					.error(function (data, status) {
						deferred.reject(data);
					});
			}

			return deferred.promise;
		};

		// this.loginDemo = function (options) {
		// 	var deferred = $q.defer();

		// 	// probably won't matter
		// 	if (options.facilitator) {
		// 		$http.post('/signin', {
		// 				user: {
		// 					username: options.username,
		// 					password: options.password
		// 				}
		// 			})
		// 			.success(function (data) {
		// 				this.auth(data, deferred);
		// 			}.bind(this))

		// 			.error(function (data, status) {
		// 				deferred.reject(data);
		// 			});
		// 	} else {
		// 		var i = 0;
		// 		// capping at 100 for now. not ideal.
		// 		while (i < 100){
		// 			var iString = ""+i;

		// 			var name = options.username + i;

		// 			var rejected = false;

		// 			$http.post('/signin', {
		// 					user: {
		// 						username: name
		// 					}
		// 				})
		// 				.success(function (data) {
		// 					this.auth(data, deferred);
		// 					// success = true;
		// 				}.bind(this))

		// 				.error(function (data, status) {
		// 					deferred.reject(data);
		// 				});

		// 			console.log(deferred.promise);

		// 			i++;
		// 		}
		// 	}

		// 	return deferred.promise;
		// };

		this.isLoggedIn = function () {
			var isLoggedIn = this.hasOwnProperty('user') && this.user !== null;

			if (!isLoggedIn && $cookies.getObject('thoughtswap-user') && $cookies.getObject('thoughtswap-user') !== null) {
				this.user = $cookies.getObject('thoughtswap-user');
				//console.log(this.user);
				isLoggedIn = true;
			}

			return isLoggedIn;
		};

		this.isFacilitator = function () {
			return this.isLoggedIn() && this.user && this.user.role === 'facilitator';
		};

		this.isParticipant = function () {
			return this.isLoggedIn() && this.user && this.user.role === 'participant';
		};

		this.isParticipant = function () {
			return this.isLoggedIn() && this.user && this.user.role === 'participant';
		};

		this.register = function (options) {
			var deferred = $q.defer();

			$http.post('/signup', {
					user: {
						email: options.email,
						username: options.username,
						password: options.password
					}
				})
				.success(function (data) {
					console.log('Got http success', data);
					this.auth(data, deferred);
				}.bind(this))
				.error(function (data, status) {
					console.log('Error');
					deferred.reject(data);
				});

			return deferred.promise;
		};

		this.logout = function () {
			var deferred = $q.defer();
			$cookies.remove('thoughtswap-user');
			Logger.createEvent({
				data: this.user.role + ' ' + this.user.username + ' successfully logged out',
				type: 'logOut'
			});
			var userId = this.user.id;
			this.user = null;

			$http.post('/signout', {
					user: {
						id: userId
					}
				})
				.success(function (data) {
					console.log(data);
					GroupsService.groups = [];
					deferred.resolve();
				})
				.error(function (data, status) {
					deferred.reject(data);
				});

			return deferred.promise;
		};

		this.getGroups = function () {
			console.log(this.user);
			return GroupsService.getGroups({
				id: this.user.id
			});
		};

	}

})();