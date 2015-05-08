'use strict';
/**
 * Created by AlexiuS on 14.04.2015.
 */
var ppitVertretungsplan = ppitServices.factory('Vertretungsplan', ['Datasource', function(Datasource) {
	//console.log("Vertretungsplan service loading...");
	// define the local namespace
	var Vertretungsplan = {};
	/**
	 * server requests definition
	 */
	Vertretungsplan.sources = {
		'vertretungsplan': {
			method	: 'GET',
			params	: {
				'act'	: 'vertretungsplan'
			}
		}
	};
	Datasource.setSource(Vertretungsplan.sources, {});
	Vertretungsplan.refresh = function() {
		//console.log("Vertretungsplan.refresh");
		Datasource.reset('vertretungsplan', {});
	};
	Vertretungsplan.init = function() {
		console.log("Vertretungsplan.init");
		//Vertretungsplan.refresh();
		// add event listener for wake up of application
		// on mobile devices only once
		if(!Vertretungsplan.started)
			window.document.addEventListener("resume", Vertretungsplan.refresh, false);
		Vertretungsplan.started = true;
	};
	Vertretungsplan.getPlan = function(sHandler, eHandler) {
		console.log("Vertretungsplan.getPlan started");
		Datasource.requestCached('vertretungsplan', {}, sHandler, eHandler);
	};


	Vertretungsplan.init();
	return Vertretungsplan;
}]);