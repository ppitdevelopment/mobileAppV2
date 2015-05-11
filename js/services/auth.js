'use strict';
/* Authorization service */

var ppitAuth = ppitServices.factory('Auth', ['$rootScope', '$http', 'Messages', 'Navigation', 'Storage', function($rootScope, $http, Messages, Navigation, Storage) {
	//console.log('Auth service start');
	var Auth = {};
	// user credentials
	Auth.cred = {
		username : "",
		password : ""
	};
	Auth.serverURL = _URL + '/index.php';
	Auth.resource = {
		login: {
			method	: 'POST',// hardcoded in login()
			params	: {
				'act'		: 'auth',
				'platform'	: _PLATFORM,
				'version'	: _VERSION
			}
		},
		logout: {
			method	: 'POST',// hardcoded in logout()
			params	: {
				'act'		: 'auth',
				'logout'	: 'yes',
				'sk'		: '@sk'
			}
		}
	};
	Auth.request = function(config, successHandler, failHandler) {
		//Core.startLoading();
		$rootScope.loading = true;
		$http(config).success(function(data, status, headers, config) {
			alert("http success " + data + " " + angular.toJson(config));
			$rootScope.loading = false;
			//Core.stopLoading();
			if(!!data) {
				if(angular.isDefined(data.fehler) && data.fehler != 0) {
					//console.log("Fehler: ", data);
					if(angular.isDefined(data.fehlermessage)) {
						Messages.addMessage("err", "Fehler", data.fehlermessage);
					} else {
						Messages.addMessage("err", "Fehler", "Unbekannte Fehler: " + data.fehler);
					}
					if(!!failHandler) failHandler(data);
				} else {
					if(!!successHandler) successHandler(data);
				}
			} else {
				Messages.addMessage("err", "Fehler", "Empty server response");
				if(!!failHandler) failHandler(data);
			}
		}).error(function(data, status, headers, config) {
			alert("http error", status);
			//Core.stopLoading();
			$rootScope.loading = false;
			if(status != 503) {
				Messages.addMessage("wait", "Verbindungsfehler (" + status + ")", "App kann nicht mit " + _URL + " verbunden werden. Bitte überprüfen Sie Ihre Internetverbindung.");
				Navigation.go("error");
			}
			if(!!failHandler) failHandler(data);
		});
	};
	// user session key
	Auth.sessionKey = "";
	// login status of current user
	Auth.loggedIn = function() {
		return (Auth.sessionKey != "");
	};
	// should we remember credentials or not?
	Auth.remember = true;
	// credentials saved?
	Auth.saved = false;
	// buttons available on start page
	// if Auth.pages.konto == true - then konto page is available
	Auth.pages = {};
	// additional rights
	Auth.rights = {};
	// news loaded from server
	Auth.news = undefined;
	// substitutions
	Auth.anzahl_vertretungen = 0;
	Auth.getVertretungen = function() {
		return Auth.anzahl_vertretungen;
	};
	Auth.setVertretungen = function(num) {
		Auth.anzahl_vertretungen = num;
		Storage.save("anzahl_vertretungen", angular.toJson(num));
	};
	// main authorization function
	Auth.login = function(cred, doneHandler, failHandler) {
		alert("Auth.login start");
		// clean previous session info
		Auth.clear();
		// prepare config parameter for $http request
		var url = Auth.serverURL;
		// compile url params
		var getParams = [];
		angular.forEach(Auth.resource.login.params, function(value, key) {
			//console.log(key + ': ' + value);
			var urlPart = key + "=" + value;
			//console.log(urlPart);
			getParams.push(urlPart);
		});
		var getParamsStr = getParams.join('&');
		if(getParams.length > 0) url += '?' + getParamsStr;
		var config = {
				method	: 'POST',
				url		: url,
				data	: cred
		};
		alert("Auth.request start");
		Auth.request(config, function (data) {
			alert("Auth.request success"+data.result.status);
			if (data != "") {
				if (data.result.status == "ok") {
					// login request successfull
					//console.log('hiding page');
					var sk = data.result.key;
					Auth.sessionKey = sk;
					$rootScope.sessionKey = sk;
					Auth.pages = data.pages;
					Auth.rights = data.rechte;
					Auth.kontakt = data.kontakt;
					//console.log("kontakt:", Auth.kontakt);
					Auth.anzahl_vertretungen = data.anzahl_vertretungen;
					Storage.setCookie('sk', sk,null,'/');
					Auth.save(cred);
					Auth.news = undefined;
					Messages.clear();
					var news = data.nachrichten;
					if(angular.isDefined(news)) {
						Auth.news = news;
						angular.forEach(news, function(meldung, type) {
							Messages.addMessage(type, undefined, meldung);
						});
					}
					if (!!doneHandler) doneHandler(data);
				} else {
					//console.log( "false login: ", data );
					if(data.result.status == 0) {
						Messages.addMessage("auth", undefined, "Benutzername oder Passwort falsch!");
					} else if(data.result.status < 0){
						Messages.addMessage("err", undefined, data.fehlermessage);
					} else if(data.result.status > 0) {
						Messages.addMessage("auth", undefined, "Benutzername oder Passwort falsch! Sie müssen " + data.result.status + " Sekunden warten");
					}
					if (!!failHandler)
						failHandler(data);
				}
			} else {
				//console.log("login empty response",	data);
				Messages.addMessage("err", undefined, "Login empty answer");
				if (failHandler)
					failHandler(data);
			}
		}, failHandler);
	};

	// saving credentials for further usage
	Auth.save = function(cred) {
		if(Auth.remember) {
			Auth.cred = cred;
			Storage.save("cred", angular.toJson(cred));
		} else {
			Storage.clear("cred");
		}
		Storage.save("pages", angular.toJson(Auth.pages));
		Storage.save("rights", angular.toJson(Auth.rights));
		Storage.save("kontakt", angular.toJson(Auth.kontakt));
		Storage.save("anzahl_vertretungen", angular.toJson(Auth.anzahl_vertretungen));
		Storage.save("sk", Auth.sessionKey);
		Auth.saved = true;
	};
	// try to load previously saved credentials
	Auth.load = function() {
		var cred = Storage.load("cred");
		if(!!cred) {
			Auth.cred = angular.fromJson(cred);
			Auth.remember = true;
		}
		Auth.pages = angular.fromJson(Storage.load("pages"));
		Auth.rights = angular.fromJson(Storage.load("rights"));
		Auth.kontakt = angular.fromJson(Storage.load("kontakt"));
		Auth.anzahl_vertretungen = angular.fromJson(Storage.load("anzahl_vertretungen"));
		var sk = Storage.load("sk");

		if (!!sk) {
			Auth.sessionKey = sk;
			$rootScope.sessionKey = sk;
			Storage.setCookie('sk',Auth.sessionKey,null,'/');
			Auth.saved = true;
		} else {
			Auth.saved = false;
		}
	};
	// logout function
	Auth.logout = function(redirectFunc) {
		console.log("Auth.logout");
		var params = {"sk":Auth.sessionKey};
		// compile url
		var url = Auth.serverURL;
		var getParams = [];
		angular.forEach(Auth.resource.logout.params, function(value, key) {
			//console.log(key + ': ' + value);
			var urlPart = key + "=";
			var valueStr = value + '';
			if(valueStr.charAt(0) == '@') urlPart += params[valueStr.slice(1)];
			else urlPart += valueStr;
			getParams.push(urlPart);
		});
		var getParamsStr = getParams.join('&');
		if(getParams.length > 0) url += '?' + getParamsStr;
		//console.log("url:", url);
		var config = {
			method	: 'POST',
			url		: url
		};
		Auth.request(config, function(data) {
			console.log("logout success");
			Auth.clear();
			Navigation.logoutClean();
			if(redirectFunc) redirectFunc();
		}, function(data) {
			Auth.clear();
			if(redirectFunc) redirectFunc();
		});
	};
	// clear all data from Auth and clear local storage if available
	Auth.clear = function() {
		//console.log('Auth.clear.');
		Auth.cred = {
			username : "",
			password : ""
		};
		Storage.setCookie('sk',"",null,'/');
		Auth.sessionKey = "";
		Auth.saved = false;
		Storage.clear("sk");
		Storage.clear("pages");
		Storage.clear("rights");
		Storage.clear("kontakt");
		Storage.clear("anzahl_vertretungen");
	};
	/*
	relogin function - allows application to seamlessly continue to work after session expiration event
	 */
	Auth.reloginCallers = [];
	Auth.reloginInPorgress = false;
	Auth.relogin = function(callerFunc, callerParams) {
		Auth.reloginCallers.push({
			"f" : callerFunc,
			"p"	: callerParams// must be an array of callerFunc parameters values
		});
		if(!Auth.reloginInPorgress) {
			var cred = undefined;
			if(Auth.remember) {
				// if credentials is remembered
				cred = Auth.cred;
			} else {
				// try to load them from local storage
				Auth.load();
				if(angular.isDefined(Auth.cred) && Auth.cred !== null) cred = Auth.cred;
			}
			if(angular.isDefined(cred)) {
				Auth.reloginInPorgress = true;
				// try to login
				Auth.login(cred, function(data) {
					Auth.save(cred);
					if(angular.isDefined(Auth.reloginCallers)) {
						while (Auth.reloginCallers.length) {
							// get handler
							var o = Auth.reloginCallers.shift();
							// run it with set of parameters as array
							o.f.apply(this, o.p);
						}
					}
					Auth.reloginInPorgress = false;
				}, function(data) {
					Auth.reloginInPorgress = false;
					Auth.reloginCallers = [];
					Auth.clear();
					Navigation.go("error");
				});
			} else {
				Auth.reloginCallers = [];
				Messages.addMessage("err", undefined, "Session expired.");
				Auth.clear();
				Navigation.go("login");
			}
		}
	};
	return Auth;
}]);