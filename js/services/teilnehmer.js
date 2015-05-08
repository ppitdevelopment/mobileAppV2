'use strict';
/**
 * Created by AlexiuS on 10.02.2015.
 */
var ppitTeilnehmer = ppitServices.factory('Teilnehmer', ['Datasource', function(Datasource) {
	console.log("Teilnehmer service");
	// define the local namespace
	var Teilnehmer = {};
	Teilnehmer.sources = {
		profileIndex: {
			method	: 'GET',
			params	: {
				'act'		: 'profile'
			}
		},
		profileDelete: {
			method	: 'GET',
			params	: {
				'act'		: 'profile',
				'do'		: 'delete'
			}
		},
		profilePwd: {
			method	: 'POST',
			params	: {
				'act'		: 'profile',
				'do'		: 'pwd'
			}
		}
	};
	Datasource.setSource(Teilnehmer.sources, {});
	Teilnehmer.getProfile = function(sHandler, eHandler) {
		Datasource.requestCached("profileIndex", {}, sHandler, eHandler);
	};
	Teilnehmer.savePassword = function(pwd, sHandler, eHandler) {
		Datasource.request('profilePwd', {pwd : pwd}, sHandler, eHandler);
	};
	Teilnehmer.deleteFoto = function(sHandler, eHandler) {
		Datasource.request('profileDelete', {}, sHandler, eHandler);
	};
	Teilnehmer.refresh = function() {
		Datasource.reset("profileIndex", {});
	};
	return Teilnehmer;
}]);