'use strict';
/**
 * db/server requests handling service
 * Created by AlexiuS on 09.02.2015.
 */

var ppitDatasource = ppitServices.factory('Datasource', ['$http', '$q', 'DataCache', 'Messages', 'Navigation', 'Auth', 'Core', 'Lang', function($http, $q, DataCache, Messages, Navigation, Auth, Core, Lang) {
	var Datasource = {};
	Datasource.serverURL = _URL + '/index.php';
	//console.log("Datasource binding to ", Datasource.serverURL);
	// structure with requests configurations
	Datasource.dataset = {};
	// cache object
	Datasource.cache = DataCache.init("Datasource");
	// raw data (when cache is not turned on)
	Datasource.data = {};
	// caching flags for requests
	Datasource.isCached = {};
	// get/set/clear data functions with/without cache
	Datasource.setData = function(id, data) {
		if (Datasource.isCached[id]) Datasource.cache.put(id, data);
		else Datasource.data[id] = data;
	};
	Datasource.getData = function(id) {
		var data;
		if (Datasource.isCached[id]) data = Datasource.cache.get(id);
		else data = Datasource.data[id];
		return data;
	};
	Datasource.clearData = function(id) {
		if (Datasource.isCached[id]) Datasource.cache.remove(id);
		else {
			if(angular.isDefined(Datasource.data[id])){
				Datasource.data[id] = undefined;
			}
		}
	};
	// constructor for resource
	Datasource.setSource = function(configList, globalParams) {
		console.log("Datasource.setSource", configList);
		angular.forEach(configList, function (config, key) {
			// $http config parameters
			var baseConfig = {
				method: "GET",
				url: Datasource.serverURL,
				cache: false,
				timeout: _HTTP_TTL
			};
			angular.extend(baseConfig, config);
			var params = angular.isDefined(globalParams) ? angular.copy(globalParams) : {};
			if (angular.isDefined(config.params)) angular.extend(params, config.params);
			baseConfig.params = params;
			Datasource.dataset[key] = baseConfig;
		}, Datasource);
		return true;
	};
	Datasource.resetAll = function() {
		Datasource.dataset = {};
		Datasource.cache.removeAll();
		Datasource.data = {};
		Datasource.loading = {};
	};
	Datasource.resetById = function(id) {
		if(!Datasource.loading[id]) Datasource.clearData(id);
		else {
			var postponedReset = function() {
				Datasource.clearData(id);
				Datasource.loading[id] = false;
			};
			if(angular.isUndefined(Datasource._handlers[id]) || !angular.isArray(Datasource._handlers[id])) Datasource._handlers[id] = [];
			Datasource._handlers[id].push(postponedReset);
		}
	};
	Datasource.reset = function(key, params) {
		var id = Datasource.getRequestId(key, params);
		Datasource.resetById(id);
	};
	// postponed handlers
	Datasource._handlers = {};
	// success handlers
	Datasource.sHandlers = {};
	Datasource.registerSHandler = function(id, handler) {
		if (angular.isUndefined(Datasource.sHandlers[id])) {
			Datasource.sHandlers[id] = [];
		}
		Datasource.sHandlers[id].push(handler);
	};
	Datasource.callSHandlers = function(id, data) {
		// call all success handlers and remove them from the queue
		var r = data;
		if (angular.isDefined(Datasource.sHandlers[id])) {
			while (Datasource.sHandlers[id].length) {
				r = Datasource.sHandlers[id].shift()(r);
			}
		}
		Datasource.eHandlers[id] = [];
		Datasource.sHandlers[id] = [];
		// call all postponed handlers
		if (angular.isDefined(Datasource._handlers[id])) {
			while (Datasource._handlers[id].length) {
				Datasource._handlers[id].shift()();
			}
			Datasource._handlers[id].length = 0;
		}
		return r;
	};
	// error handlers
	Datasource.eHandlers = {};
	Datasource.registerEHandler = function(id, handler) {
		if (angular.isUndefined(Datasource.eHandlers[id])) {
			Datasource.eHandlers[id] = [];
		}
		Datasource.eHandlers[id].push(handler);
	};
	Datasource.callEHandlers = function(id, data) {
		var r = data;
		if (angular.isDefined(r.status) && +r.status > 400) r.fehlertext = "Fehler: " + r.status; // may be i should make a status parsing?
		// call all error handlers and remove them from the queue
		if (angular.isDefined(Datasource.eHandlers[id])) {
			while (Datasource.eHandlers[id].length) {
				r = Datasource.eHandlers[id].shift()(r);
			}
		}
		Datasource.eHandlers[id] = [];
		Datasource.sHandlers[id] = [];
		// call all postponed handlers
		if (angular.isDefined(Datasource._handlers[id])) {
			while (Datasource._handlers[id].length) {
				Datasource._handlers[id].shift()();
			}
			Datasource._handlers[id].length = 0;
		}
		return r;
	};
	// loading flag indicates that request is already started - we should only register handlers
	Datasource.loading = {};
	// creating unique id for request
	Datasource.getRequestId = function(key, params) {
		var baseParams = angular.copy(Datasource.dataset[key].params);
		if(Datasource.dataset[key].method == "GET") angular.extend(baseParams, params);
		var paramStrArr = [];
		angular.forEach(baseParams, function (value, key) {
			var paramStr = key + "=" + (angular.isObject(value) ? angular.toJson(value) : value);
			paramStrArr.push(paramStr);
		});
		return paramStrArr.join('&');
	};
	// combine user params with dataset params
	Datasource.combineParams = function(key, params) {
		var p = angular.copy(Datasource.dataset[key].params);
		angular.extend(p, params);
		return p;
	};
	Datasource._request = function (id, config, success, error) {
		if (!!success) Datasource.registerSHandler(id, success);
		if (!!error) Datasource.registerEHandler(id, error);
		if (!Datasource.loading[id]) {
			var requestConfig = angular.copy(config);
			// create promise to cancel request
			var canceller = $q.defer();
			var cancel = function (reason) {
				canceller.resolve(reason);
			};
			requestConfig.timeout = canceller.promise;
			console.log("request:", id, requestConfig);
			// make a request
			var promise = $http(requestConfig).success(function (data, status, headers, config) {
				var r = data;
				Datasource.loading[id] = false;
				Core.stopLoading();
				console.log("Datasource._request %s success:", id, status, data);
				if (status == 0) {
					// request aborted
					r = {fehler: 0, info: [Lang.getText("requestAborted")]};
					r = Datasource.callEHandlers(id, r);
					return r;
				} else {
					if (angular.isDefined(r.fehler)) {
						switch (+r.fehler) {
							case 0:// no error
								r = Datasource.callSHandlers(id, r);
								//console.log("Datasource success handlers executed:", angular.copy(r));
								break;
							case -2:// authorization error
								// reconnect & try again using one more promise
								var d = $q.defer();
								Auth.relogin(function(id, config) {
									var postponed = Datasource._request(id, config);
									d.resolve(postponed);
								}, [id, config]);
								r = d.promise;
								break;
							default:// db error, wrong params etc.
								if(angular.isDefined(data.fehlermessage)) {
									Messages.addMessage("err", Lang.getText("errorTitle"), data.fehlermessage);
								} else {
									Messages.addMessage("err", Lang.getText("errorTitle"), Lang.getText("unknownError"));
								}
								r = Datasource.callEHandlers(id, data);
						}
					} else {
						r = Datasource.callEHandlers(id, data);
					}
					return r;
				}
			}).error(function (data, status, headers, config) {
				console.error("Datasource._request %s error:", id, status, headers, config);
				Datasource.loading[id] = false;
				Core.stopLoading();
				Datasource.handleError(status, data);
				return Datasource.callEHandlers(id, data);
			});
			var p = {
				promise: promise,
				cancel: cancel
			};
			// set loading flag
			Datasource.loading[id] = true;
			Core.startLoading();
			Datasource.setData(id, p);
			//console.log("Datasource._request debug:", Datasource.loading[id], angular.copy(p));
			return p.promise;
		} else {
			//return Datasource.cache.get(id);
			var r = Datasource.getData(id);
			//console.log("Datasource._request debug:", Datasource.loading[id], p);
			return r.promise;
		}
	};
	// request with cache
	Datasource.requestCached = function(method, params, successHandler, failureHandler) {
		if(angular.isUndefined(Datasource.dataset[method])) console.error("Request '%s' is undefined", method, params);
		var id = Datasource.getRequestId(method, params);
		if(angular.isUndefined(Datasource.isCached[id])) Datasource.isCached[id] = true;
		var request = Datasource.getData(id);
		if (angular.isDefined(request)) {
			request.promise = request.promise.success(successHandler).error(failureHandler);
			Datasource.setData(id, request);
			return request.promise;
		} else {
			var c = Datasource.dataset[method];
			c.params = Datasource.combineParams(method, params);
			return Datasource._request(id, c, successHandler, failureHandler);
		}
	};
	// request without cache
	Datasource.request = function(method, params, successHandler, failureHandler) {
		if(angular.isUndefined(Datasource.dataset[method])) console.error("Request %s is undefined", method);
		var id = Datasource.getRequestId(method, params);
		Datasource.isCached[id] = false;
		if(!!Datasource.loading[id]) {
			var request = Datasource.getData(id);
			if (angular.isDefined(request)) {
				request.promise = request.promise.success(successHandler).error(failureHandler);
				Datasource.setData(id, request);
				return request.promise;
			} else {
				console.error("cleared request is defined!");
			}
		} else {
			Datasource.clearData(id);
			var c = Datasource.dataset[method];
			// check request method
			if(c.method == "POST") {
				c.data = params;
			} else {
				c.params = Datasource.combineParams(method, params);
			}
			return Datasource._request(id, c, successHandler, failureHandler);
		}
	};

	Datasource.handleError = function(status, data) {
		if(status == 503) {
			// WARTUNG MODUS - message should already be added by interceptor
			//Messages.addMessage("wait");
		} else {
			if(_PLATFORM == "debug") Messages.addMessage("wait", Lang.getText("networkErrorTitle"), Lang.getText("networkErrorTextDebug").replace("%URL%", _URL));
			else Messages.addMessage("wait", Lang.getText("networkErrorTitle"), Lang.getText("networkErrorText"));
			Navigation.go("error");
		}
	};
	return Datasource;
}]);