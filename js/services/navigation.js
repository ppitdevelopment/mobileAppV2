'use strict';
/* Navigation service */

var ppitNavigation = ppitServices.factory('Navigation', ['$rootScope', '$window', 'Storage', 'Messages', '$location', function($rootScope, $window, Storage, Messages, $location) {
	var Navigation = {};
	// history storage
	Navigation.history = [];
	// current page
	Navigation.current = undefined;
	Navigation.setCurrent = function(newPage) {
		if(!angular.isDefined(Navigation.current)) {
			Navigation.current = newPage;
		} else {
			if(angular.isDefined(newPage.page) && !angular.equals(Navigation.current, newPage)) {
				Navigation.current = newPage;
			}
		}
		Storage.save("nav.current", angular.toJson(Navigation.current));
	};
	Navigation.prepareUrl = function(page, params) {
		// core page url selection
		var url = "/" + page;
		var paramTeil = "";
		switch(page) {
			case "kalender":
				var newShift = (angular.isDefined(params) && angular.isDefined(params.shift)) ? params.shift : 0;
				paramTeil = "/" + newShift;
				break;
			case "menue":
				//{day: tagIdx, detail: detailIdx, kostenart: angebotIdx, menue: menuIdx}
				paramTeil = "/" + params.week + "/" + params.day + "/" + params.detail + "/" + params.kostenart + "/" + params.menue;
				break;
			case "kurse":
				paramTeil = (angular.isDefined(params)) ? "/" + params.mode : "";
				break;
			case "kursedetail":
				paramTeil = "/" + params.kursId;
				break;
			case "vertretungsplan":
				paramTeil = (angular.isDefined(params)) ? "/" + params.vId : "";
				break;
			default:
				paramTeil = "";
		}
		return url + paramTeil;
	};
	// main navigation function
	Navigation.go = function(page, params, isBack) {
		var isMsg = Messages.messages.length > 0;
		var newUrl = Navigation.prepareUrl(page, params);
		if(!isBack && angular.isDefined(Navigation.current)) Navigation.history.push(angular.copy(Navigation.current));
		//alert("Nav.go: " + isMsg);
		if(!isBack && isMsg) {
			var skippedPage = {"page": page, "params": params};
			Navigation.history.push(skippedPage);
			$location.path("error");
		} else {
			Navigation.current = {"page": page, "params": params};
			console.log("Nav.go result: ", newUrl);
			$location.path(newUrl);
		}
	};
	Navigation.goCurrent = function() {
		var p;
		if(angular.isDefined(Navigation.current)) {
			p = Navigation.current;
		} else {
			var c = Storage.load("nav.current");
			if(!c) {
				p = {"page":Storage.getStart()};
			} else {
				p = angular.fromJson(c);
			}
		}
		console.log("goCurrent: ", p);
		var newUrl = Navigation.prepareUrl(p.page, p.params);
		console.log("goCurrent: ", newUrl);
		$location.path(newUrl);
	};
	Navigation.logoutClean = function() {
		Navigation.current = undefined;
		Navigation.history = [];
		Storage.clear("nav.current");
	};
	// "go back" function
	Navigation.goBack = function(hard) {
		// software "back" functionality
		//console.log("Nav.goBack history: ", this.history);
		var newUrl = {page: Storage.getStart()};
		if(Navigation.history.length > 0) {
			newUrl = Navigation.history.pop();
		}
		//console.log("Nav.goBack go: ", newUrl);
		//alert("Nav.goBack "+newUrl.page);
		Navigation.go(newUrl.page, newUrl.params, true);
	};
	// hardware back button functionality
	Navigation.backHard = function(e) {
		e.preventDefault();
		if(angular.isDefined(Navigation.current) && (Navigation.current.page == Storage.getStart() || Navigation.current.page == 'login')) {
			navigator.app.exitApp();
		} else {
			Navigation.go(Storage.getStart());
			$rootScope.$apply();
		}
	};
	$window.document.addEventListener("deviceready", function() {
		$window.document.addEventListener("backbutton", Navigation.backHard, false);
	}, false);
	return Navigation;
}]);