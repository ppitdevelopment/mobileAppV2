'use strict';
/**
 * Created by AlexiuS on 06.05.2015.
 */
var ppitKonto = ppitServices.factory('Konto', ['Datasource', 'Storage', function(Datasource, Storage) {
	console.log("Konto service loading...");
	// define the local namespace
	var Konto = {};
	/**
	 * server requests definition
	 */
	Konto.sources = {
		'konto': {
			method	: 'GET',
			params	: {
				'act'		: 'konto'
				//'sd'		: '@sd',
				//'ed'		: '@ed'
			}
		}
	};
	Datasource.setSource(Konto.sources, {});
	Konto.init = function() {
		console.log("Konto.init");
		Konto.aktuellSaldo = 0;
		Konto.kontoHash = [];
	};
	Konto.getSaldo = function() {
		return Konto.aktuellSaldo;
	};
	Konto.getKontoHash = function() {
		var s = Storage.load("konto_hash");
		if(!!s) return angular.fromJson(s);
		else return [];
	};
	Konto.setKontoHash = function(kontoHash) {
		Storage.save("konto_hash", angular.toJson(kontoHash));
	};
	Konto.parse = function(buchung) {
		var id = buchung.id;
		if(Konto.kontoHash.indexOf(id) < 0) {
			buchung.isNew = true;
			Konto.kontoHash.push(id);
		} else buchung.isNew = false;
	};
	Konto.getKonto = function(sd, ed, success) {
		var params = {
			sd	: sd,
			ed	: ed
		};
		Datasource.request("konto", params, function(data) {
			Konto.kontoHash = Konto.getKontoHash();
			console.log("pre parsing:", data, Konto.kontoHash);
			angular.forEach(data.buchungen, Konto.parse);
			Konto.setKontoHash(Konto.kontoHash);
			Konto.aktuellSaldo = data.saldoAktuell;
			if(!!success) return success(data);
			else return data;
		});
	};
	Konto.init();
	return Konto;
}]);