'use strict';
/* Storage service */

var ppitStorage = ppitServices.factory('Storage', ['$window', function($window) {
	var Storage = {};
	Storage.ls = $window.localStorage;
	if(!Storage.ls) {
		console.error("Storage service: local storage not available!", $window);
		Storage.ls = {
			storage : {},
			getItem : function(k) {
				return angular.copy(Storage.ls.storage[k]);
			},
			setItem : function(k, v) {
				Storage.ls.storage[k] = angular.copy(v);
			}
		};
	} else {
		var v2check = Storage.ls.getItem("vcheck");
		if(!v2check) {
			Storage.ls.clear();
			Storage.ls.setItem("vcheck", "true");
		}
	}
	Storage.load = function(key) {
		return Storage.ls.getItem(key);
	};
	Storage.save = function(key, value) {
		//console.log("Storage.save", key, value);
		Storage.ls.setItem(key, value);
	};
	Storage.clear = function(key) {
		Storage.ls.removeItem(key);
	};
	Storage.setCookie = function(name, value, expires, path, domain, secure) {
		//console.log('setCookie. path=' + path);
		if (!name || !value) return false;
		var str = name + '=' + encodeURIComponent(value);
		if (!!expires) str += '; expires=' + expires.toGMTString();
		if (!!path)    str += '; path=' + path;
		if (!!domain)  str += '; domain=' + domain;
		if (!!secure)  str += '; secure';
		document.cookie = str;
		//return true;
	};
	/*
	 * Start page user settings saving/loading
	 */
	Storage.setStart = function(p) {
		Storage.save("start", p);
	};
	Storage.getDefaultStart = function() {
		return "kalender";
	};
	Storage.getStart = function() {
		var st = Storage.load("start");
		// if the value is not saved
		if(!st) {
			// default start page - "kalender"
			st = Storage.getDefaultStart();
		}
		//console.log("Storage.getStart:", st);
		return st;
	};
	return Storage;
}]);