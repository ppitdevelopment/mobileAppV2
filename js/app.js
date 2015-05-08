'use strict';

/**
 * modules definitions
 */
/* Filters */
var ppitFilters = angular.module('ppit.menueplus.filters', []);
/* Services */
var ppitServices = angular.module('ppit.menueplus.services', []);
/* Controllers */
var ppitControllers = angular.module('ppit.menueplus.controllers', ['ppit.menueplus.services', 'ppit.menueplus.filters']);

/**
 * The main ISS Mobile App version 2.0 app module.
 * (c) PPIT 2013-2015
 * 
 * @type {angular.Module}
 */
var ppitapp = angular.module('ppitapp', ['ngRoute', 'ngSanitize', 'mobile-angular-ui', 'ppit.menueplus.controllers', 'ppit.menueplus.services', 'ppit.menueplus.filters']);

ppitapp.config(
		[ '$routeProvider', function($routeProvider) {
			$routeProvider.when('/login', {
				templateUrl : 'pages/login.html'
			}).when('/kalender/:Shift', {
				templateUrl : 'pages/kalender.html'
			}).when('/menue/:week/:day/:detail/:kostenart/:menue', {
				templateUrl : 'pages/menue.html'
			}).when('/kurse', {
				templateUrl : 'pages/kurse.html'
			}).when('/kurse/:mode', {
				templateUrl : 'pages/kurse.html'
			}).when('/kursedetail/:kursId', {
				templateUrl : 'pages/kursedetail.html'
			}).when('/konto', {
				templateUrl : 'pages/konto.html'
			}).when('/profile', {
				templateUrl : 'pages/profile.html'
			}).when('/vertretungsplan', {
				templateUrl : 'pages/vertretungsplan.html'
			}).when('/vertretungsplan/:vId', {
				templateUrl : 'pages/vertretungsplan.html'
			}).when('/kontakt', {
				templateUrl : 'pages/kontakt.html'
			}).when('/error', {
				templateUrl : 'pages/error.html'
			}).when('/logout', {
				templateUrl : 'pages/logout.html'
			}).otherwise({
				redirectTo : '/error'
			});
		} ]);

ppitapp.factory('httpWatcher', ['$injector', function($injector) {
	var watcher = {
			// add session key to every request seamlessly
			request			: function(config) {
				var url = config.url;
				if(url.indexOf(".html") == -1) {
					//console.log("on request:", config.method, url, config.data, config);
					var authSvc = $injector.get('Auth');
					if(!config.params) config.params = {};
					config.params["sk"] = authSvc.sessionKey;
					//console.log("AuthSvc:", authSvc.sessionKey, config.params);
				}
				return config;
			},
			// catch authentication error?
			response			: function(response) {
				//console.log("on response:", response);
				return response;
			},
			// catch maintenance mode of the server
			responseError: function(response) {
				console.log("httpWatcher.responseError:", response);
				if(response.status == 503) {
					var coreSvc = $injector.get('Core');
					//console.log("maintenanceWatcher.coreSvc:", coreSvc);
					if(angular.isDefined(coreSvc)) coreSvc.setWartung(true);
				}
				return response;
			}
	};
	return watcher;
}]);
ppitapp.config([ '$httpProvider', function($httpProvider) {
	// we must change default header from json to urlencoded
	/*
	$httpProvider.defaults.headers.post = {
		"Content-Type" : "application/x-www-form-urlencoded; charset=UTF-8"
	};
	*/
	// add watcher
	$httpProvider.interceptors.push('httpWatcher');
}]);
