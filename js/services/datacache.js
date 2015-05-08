'use strict';
/**
 * cache implementation
 * Created by AlexiuS on 10.02.2015.
 */
var ppitDataCache = ppitServices.factory('DataCache', ['$cacheFactory', function($cacheFactory) {
	var DataCache = {};
	DataCache.pool = {};
	DataCache.reset = function() {
		this.pool = {};
	};
	DataCache.get = function(id) {
		if(angular.isDefined(DataCache.pool[id])) return DataCache.pool[id];
		else return DataCache.init(id);
	};
	DataCache.init = function(id) {
		console.log("DataCache.constructor:", id);
		var t = new Date();
		var dcItem = {
			id			: id,
			created		: t.getTime(),
			data		: $cacheFactory(id),
			ttl			: _CACHE_TTL,
			timestamp	: {},
			saved		: {},
			isExpired	: function(key) {
				var t = new Date();
				var currentTime = t.getTime();
				return (angular.isUndefined(this.timestamp[key])) || (currentTime - this.timestamp[key] > this.ttl);
			},
			isSet		: function(key) {
				return !!this.saved[key];
			},
			// $cacheFactory interface implementation
			put			: function(key, value) {
				//console.log("cache %s put", id, key);
				var t = new Date();
				this.timestamp[key] = t.getTime();
				this.saved[key]	= true;
				this.data.put(key, value);
			},
			remove		: function(key) {
				this.timestamp[key] = 0;
				this.saved[key]	= false;
				return this.data.remove(key);
			},
			get			: function(key) {
				if(this.isExpired(key)) {
					return undefined;
				} else {
					return this.data.get(key);
					/*
					var v = this.data.get(key);
					return angular.copy(v);
					*/
				}
			},
			removeAll	: function() {
				this.timestamp = {};
				this.saved	= {};
				return this.data.removeAll();
			},
			destroy		: function() {
				this.timestamp = {};
				this.saved	= {};
				return this.data.destroy();
			},
			info		: function() {
				return this.data.info();
			}
		};
		DataCache.pool[id] = dcItem;
		return dcItem;
	};
	return DataCache;
}]);