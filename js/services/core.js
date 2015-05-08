'use strict';
/* Core application service */

var ppitCore = ppitServices.factory('Core', ['$rootScope', '$window', 'Storage', 'Auth', 'Navigation', 'Messages', function($rootScope, $window, Storage, Auth, Navigation, Messages) {
	var Core = {};
	// customer id is hardcoded now - will be upgraded to real values
	// in later versions
	Core.customerId = 1;
	Core.getCustomerId = function() {
		return Core.customerId;
	};
	// sleep duration in milliseconds
	Core.sleepDuration = 60000;
	// current sleep timestamp
	Core.sleepTimestamp = 0;
	Core.getSleepTime = function() {
		var sleep = Storage.load("sleep");
		var d = new Date();
		if(sleep === null) sleep = d.getTime();
		return sleep;
	};
	Core.setSleepTime = function() {
		var d = new Date();
		Storage.save("sleep", d.getTime());
	};
	// sleep handler
	/*
	 * sleep handler - runs when user switches to another application
	 * or goes to the home screen of the mobile os
	 */
	Core.sleepHandler = function() {
		if(_PLATFORM == "ios") {
			$window.setTimeout(function() { // iOS wrapper
				Core.setSleepTime();
			}, 0);
		} else {
			Core.setSleepTime();
		}
	};
	/*
	 * handler is called when the application awakes from the sleep mode
	 * this handler checks if the application was too long in the sleep mode
	 * if it is true then it will try to relogin and go the start page
	 */
	Core.realResumeHandler = function() {
		//console.log("Core.resumeHandler");
		var d = new Date();
		if(d.getTime() - Core.getSleepTime() > Core.sleepDuration) {
			//console.log("timeout!");
			//alert("Core.resumeHandler: timeout expired");
			Auth.relogin(function() {
				var startPage = Core.getStart();
				Navigation.go(startPage);
				$rootScope.$apply();
			});
			return true;
		} else {
			//alert("no timeout");
			return false;
		}
	};
	// resume handler
	Core.resumeHandler = function() {
		//alert("Core.resumeHandler!");
		if(_PLATFORM == "ios") {
			$window.setTimeout(function() { // iOS wrapper
				Core.realResumeHandler();
			}, 0);
		} else {
			Core.realResumeHandler();
		}
	};
	// set up cordova events listeners
	$window.document.addEventListener("deviceready", function() {
		$window.document.addEventListener("pause", Core.sleepHandler, false);
		$window.document.addEventListener("resume", Core.resumeHandler, false);
	}, false);
	/*
	 * Current date saving/loading functions
	 */
	Core.setDate = function(d) {
		//console.log("Settings.setDate: ",d);
		Storage.save("datum", d);
	};
	Core.getDate = function() {
		var d = Storage.load("datum");
		if(d === null) {
			//console.log("date is empty");
			d = Core.getToday();
		}
		return d;
	};
	Core.getToday = function() {
		var dt = new Date();
		var d = dt.toISOString();
		d = d.slice(0,10);
		return d;
	};
	/*
	 * loading flag
	 */
	Core.startLoading = function() {
		$rootScope.loading = true;
	};
	Core.stopLoading = function() {
		$rootScope.loading = false;
	};
	$rootScope.$on('$routeChangeStart', Core.startLoading);
	$rootScope.$on('$routeChangeSuccess', Core.stopLoading);
	/*
	 * Maintenance mode
	 */
	Core.setWartung = function(goNow) {
		Messages.addMessage("wait");
		if(goNow) Navigation.go("error");
	};
	return Core;
}]);