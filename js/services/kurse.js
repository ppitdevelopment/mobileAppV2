'use strict';
/**
 * Created by AlexiuS on 15.04.2015.
 */
var ppitKurse = ppitServices.factory('Kurse', ['Datasource', 'Storage', function(Datasource, Storage) {
	console.log("Kurse service loading...");
	// define the local namespace
	var Kurse = {};
	/**
	 * server requests definition
	 */
	Kurse.sources = {
		'kurse-index': {
			method	: 'GET',
			params	: {
				'act'		: 'kurse',
				'get'		: 'index'
			}
		},
		'kurse-meine': {
			method	: 'GET',
			params	: {
				'act'		: 'kurse',
				'get'		: 'meine'
			}
		},
		'kurse-save': {
			method	: 'POST',
			params	: {
				'act'		: 'kurse',
				'get'		: 'none'
			}
		}
	};
	Datasource.setSource(Kurse.sources, {});
	Kurse.refresh = function() {
		//console.log("Kurse.refresh");
		Datasource.reset('kurse-index', {});
		Datasource.reset('kurse-meine', {});
	};
	Kurse.init = function() {
		console.log("Kurse.init");
		//Kurse.refresh();
		// add event listener for wake up of application
		// on mobile devices only once
		if(!Kurse.started)
			window.document.addEventListener("resume", Kurse.refresh, false);
		Kurse.started = true;
	};
	Kurse.parse = function(value, key) {
		// make a short beschreibung
		if(value.kursstammdaten.beschreibung.length > 100) this[key].kursstammdaten.beschreibung_short = value.kursstammdaten.beschreibung.slice(0,99);
		else this[key].kursstammdaten.beschreibung_short = value.kursstammdaten.beschreibung;
		// parse termine
		if(angular.isDefined(value.termine) && value.termine.length > 0) {
			var tempTermine =  [];
			angular.forEach(value.termine, function(value, index) {
				// recreate proper format of date/time object
				var newTermin = {"start_zeit" : new Date(value.start_zeit),"ende_zeit" : new Date(value.ende_zeit)};
				this.push(newTermin);
			}, tempTermine);
			this[key].termine = tempTermine;
		}
		// check anmeldedaten
		if(angular.isDefined(value.anmeldedaten)) {
			// parse status
			this[key].anmeldedaten.anmeldestatus = parseInt(value.anmeldedaten.anmeldestatus);
			// parse or fix bemerkung
			this[key].anmeldedaten.bemerkung = (angular.isDefined(value.anmeldedaten.bemerkung))? value.anmeldedaten.bemerkung : '';
			// special price overwrites default price
			if(angular.isDefined(value.anmeldedaten.preis_pro_periode) && value.anmeldedaten.preis_pro_periode > 0) {
				this[key].kursstammdaten.preis_pro_periode = value.anmeldedaten.preis_pro_periode;
			}
		} else {
			this[key].anmeldedaten = {};
			this[key].anmeldedaten.anmeldestatus = 0;
			this[key].anmeldedaten.bemerkung = '';
		}
	};
	Kurse.mandantName = "";
	Kurse.getMandantName = function() {
		return Kurse.mandantName;
	};
	Kurse.setMandantName = function(value) {
		Kurse.mandantName = value.toString();
	};
	Kurse.getKurse = function(sHandler, eHandler) {
		console.log("Kurse.getKurse started");
		Datasource.requestCached('kurse-index', {}, function(data) {
			if(angular.isDefined(data) && data.fehler == 0) {
				// prepare data for view (some parsing done in parseKurs() function)
				angular.forEach(data.kursliste, Kurse.parse, data.kursliste);
				if(!!data.mandant_name) Kurse.setMandantName(data.mandant_name);
				if(sHandler) sHandler(data.kursliste);
			} else {
				if(eHandler) eHandler(data);
			}
			return data;
		}, eHandler);
	};
	Kurse.getMeine = function(sHandler, eHandler) {
		console.log("Kurse.getMeine started");
		Datasource.requestCached('kurse-meine', {}, function(data) {
			if(angular.isDefined(data) && data.fehler == 0) {
				// prepare data for view (some parsing done in parseKurs() function)
				angular.forEach(data.kursliste, Kurse.parse, data.kursliste);
				if(!!data.mandant_name) Kurse.setMandantName(data.mandant_name);
				if(sHandler) sHandler(data.kursliste);
			} else {
				if(eHandler) eHandler(data);
			}
			return data;
		}, eHandler);
	};
	Kurse.currentKurs = {};
	Kurse._search = function(kursId, liste) {
		var found = false;
		angular.forEach(liste, function(value, key) {
			//console.log(value);
			if(kursId == value.kursstammdaten.kurs_id) {
				angular.copy(value, this);
				found = true;
			}
		}, Kurse.currentKurs);
		return found;
	};
	Kurse.getKurs = function(kursId, success) {
		Kurse.getKurse(function(iListe) {
			Kurse.setLastPage("index");
			if(!Kurse._search(kursId, iListe)) {
				Kurse.getMeine(function(mListe) {
					Kurse.setLastPage("meine");
					if(!Kurse._search(kursId, mListe)) success({});
					else success(Kurse.currentKurs);
				});
			} else success(Kurse.currentKurs);
		});
	};
	Kurse.setLastPage = function(page) {
		Storage.save("kurse_page", page);
	};
	Kurse.getLastPage = function() {
		return Storage.load("kurse_page");
	};
	Kurse.changeStatus = function(statusData, success) {
		console.log("Kurse.changeStatus", statusData);
		var params = {
			"set"		: "kurse",
			"anmeldung"	: statusData
		};
		Datasource.request('kurse-save', params, function(data) {
			console.log("success", data);
			success(data);
		});
	};
	/*
	Kurse.changeStatus = function(statusData) {
		//console.log("Kurse.changeStatus");
		Auth.load();
		var params = {
			"sk"		: Auth.sessionKey,
			"set"		: "kurse",
			"anmeldung"	: statusData
		};
		Datasource.request('kurse-save', params, function(data) {
			//console.log("success");
			//console.log(data.kurs);
			if(angular.isDefined(data) && data.fehler == 0) {
				if(Kurse.errorFlag) Kurse.clearError();
				var editedKursList = [];
				editedKursList.push(data.kurs);
				//console.log("preparsed kurs list:", editedKursList);
				angular.forEach(editedKursList, Kurse.parseKurs, editedKursList);
				//console.log("postparsed kurs list:", editedKursList);
				var editedKurs = editedKursList[0];
				//console.log("editedKurs ", editedKurs);
				var found = false;
				// search for kurs in cached arrays
				//console.log("search for kurs in cached arrays:");
				//console.log("edited kurs id ", editedKurs.kursstammdaten.kurs_id);
				angular.forEach(Kurse.kurse.kursliste, function(value, key) {
					//console.log("selected kurs id ", value.kursstammdaten.kurs_id);
					if(!found && value.kursstammdaten.kurs_id == editedKurs.kursstammdaten.kurs_id) {
						found = true;
						//console.log(found);
						this[key] = editedKurs;
					}
				}, Kurse.kurse.kursliste);
				// if not found try to look in meinekurse array
				if(!found && Kurse.meineKurse.kursliste) angular.forEach(Kurse.meineKurse.kursliste, function(value, key) {
					if(!found && value.kursstammdaten.kurs_id == kurslist[0].kursstammdaten.kurs_id) {
						found = true;
						this[key] = editedKurs;
					}
				}, Kurse.meineKurse.kursliste);
				angular.copy(editedKurs, Kurse.currentKurs);
				// we need to refresh data as soon as possible
				Kurse.meineKurse = [];
				//console.log("end of saving");
				//console.log(Kurse.kurse.kursliste);
				//Kurse.getKurs(kurslist[0].kursstammdaten.kurse_id);
			} else {
				// error in request data
				if(angular.isDefined(data) && angular.isDefined(data.fehlermessage)) {
					Kurse.raiseError(data.fehler, data.fehlermessage);
				} else Kurse.raiseError(-4, "Incorrect data received!");
			}
		}, function(data) {
			// error connecting to server
			Kurse.raiseError(-1, "Error connecting to the server!");
			//console.log(data);
		});
	};

	*/
	Kurse.init();
	return Kurse;
}]);