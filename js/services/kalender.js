'use strict';
/**
 * Created by AlexiuS on 09.02.2015.
 */

var ppitKalender = ppitServices.factory('Kalender', ['Datasource', 'DataCache', 'Messages', '$window', '$q', function(Datasource, DataCache, Messages, $window, $q) {
	console.log("Kalender service v.3 loading.");
	// define the local namespace
	var Kalender = {};
	/**
	 * server requests definition
	 */
	Kalender.sources = {
		'kalend': {
			method	: 'GET',
			params	: {
				'act'		: 'kalend'
			}
		},
		'kalend-details': {
			method	: 'GET',
			params	: {
				'act'		: 'kalend',
				'info'		: 'details'
			}
		},
		'kalend-abotag': {
			method	: 'POST',
			params	: {
				'act'		: 'kalend',
				'save'		: 'abotage'
			}
		},
		'kalend-menue': {
			method	: 'POST',
			params	: {
				'act'		: 'kalend',
				'save'		: 'menue'
			}
		}
	};
	Datasource.setSource(Kalender.sources, {});
	/*
	 * general properties definition
	 */
	// init flag
	Kalender.started = false;
	// today date
	Kalender.today = new Date();
	// monday and sunday dates for current week
	// they should be calculated on every refresh (!!!)
	// they are used to calculate dateranges for requests
	// starting date of the current week
	Kalender.monday = new Date();
	// ending date of the current week
	Kalender.sunday = new Date();
	Kalender.refresh = function() {
		Kalender.today = new Date();
		// starting date of the week
		Kalender.monday = new Date();
		// ending date of the week
		Kalender.sunday = new Date();
		// calculate shift in days for monday and sunday of current week
		// or next week if today is weekend
		var weekendShift = 0;
		if (Kalender.today.getDay() == 6 || Kalender.today.getDay() == 0) {
			// sunday or saturday
			weekendShift = (Kalender.today.getDay() == 0) ? 1 : 2;
		} else {
			// all other days
			weekendShift = 0 - Kalender.today.getDay() + 1;
		}
		// calculating the starting and finishing dates
		Kalender.monday.setDate(Kalender.monday.getDate() + weekendShift);
		Kalender.sunday.setDate(Kalender.sunday.getDate() + weekendShift + 6);
		Kalender.nachricht_sekretariat = 0;
		Kalender.abo = {
			aboType	: 0,
			aboDays	: [false,false,false,false,false,false,false]
		};
	};
	Kalender.init = function() {
		//console.log("Kalender2.init");
		Kalender.refresh();
		// add event listener for wake up of application
		// on mobile devices only once
		if(!Kalender.started)
			$window.document.addEventListener("resume", Kalender.onResume, false);
		Kalender.started = true;
	};
	/**
	 * abo info methods
	 */
	Kalender.setAboInfo = function(aboInfo) {
		Kalender.abo = aboInfo;
	};
	Kalender.getAboDays = function() {
		return Kalender.abo.aboDays;
	};
	Kalender.isAboday = function(idx, datum) {
		var d = Utils.createDate(datum);
		var td = new Date(); // today
		//console.log("isAbo:", idx, datum, c);
		return (Kalender.abo.aboDays[idx]) && (d >= td);
	};
	/*
	 * refreshing of current data depending on cacheDuration
	 */
	Kalender.onResume = function() {
		//console.log("Kalender.onResume");
		var currentDate = new Date();
		if((currentDate - Kalender.today) >= 86400000) {// more than a day have passed - clear the cache!
			//console.log("Kalender cache expired");
			Kalender.clearData();
			Kalender.refresh();
		}
		//alert("resume!");
	};
	/*
	 * cache related properties & functions
	 */
	Kalender._cache = DataCache.init("Kalender");
	Kalender.setData = function(week, data) {
		Kalender._cache.put(week, data);
	};
	Kalender.getData = function(week) {
		return Kalender._cache.get(week);
	};
	Kalender.clearData = function() {
		Kalender._cache.removeAll();
	};
	// cache wrapper
	Kalender.getWeek = function(shift, sHandler, eHandler) {
		//console.log("Kalender.getWeek", shift);
		var rShift = shift;
		if(!angular.isNumber(shift)) rShift = 0;
		var week = Kalender.getData(rShift);
		if(angular.isDefined(week)) {
			console.log("week is defined", week);
			if(!!sHandler) return sHandler(week);
			else return week;
		} else {
			console.log("week is NOT defined");
			var res = {
				tage	: Kalender.getKalender(rShift, function(data) {
					var week = Kalender.getData(rShift);
					week.tage = data;
					Kalender.setData(rShift, week);
					if(!!sHandler) return sHandler(week);
					else return week;
				}, eHandler),
				details : Kalender.getDetails(rShift, function(data) {
					var week = Kalender.getData(rShift);
					week.details = data;
					Kalender.setData(rShift, week);
					if(!!sHandler) return sHandler(week);
					else return week;
				}, eHandler)
			};
			Kalender.setData(rShift, res);
			return res;
		}
	};
	// calculate dates that should be loaded for requested week shift
	Kalender.calcParams = function(shift) {
		var sDate = new Date();
		var eDate = new Date();
		var sDateShift = Kalender.monday.getDate() + shift * 7;
		var eDateShift = Kalender.sunday.getDate() + shift * 7;
		sDate.setFullYear(Kalender.monday.getFullYear(), Kalender.monday.getMonth(), sDateShift);
		eDate.setFullYear(Kalender.sunday.getFullYear(), Kalender.sunday.getMonth(), eDateShift);
		// set request params
		return {
			'sd'		: Utils.formatDate(sDate),
			'ed'		: Utils.formatDate(eDate)
		};
	};
	/**
	 * main kalender info DB request function
	 */
	Kalender.getKalender = function(shift, sHandler, eHandler) {
		console.log("Kalender.getKalender start");
		var params = Kalender.calcParams(shift);
		return Datasource.request("kalend", params, function(data) {
			//console.log("Kalender.request: kalend", data);
			if(!!data.fehler) {
				if(eHandler) return eHandler(data);
				else return data;
			} else {
				var tageArray = [];
				//console.log("received: ", data);
				// parse received data
				angular.forEach(data.kalender, function(value, index) {
					//console.log("parsing day:", value);
					var newValue = angular.copy(value);
					// format the date
					var d = Utils.parseDate(value.datum);
					newValue.datum = d;
					// check for abo
					newValue.isAbo = Kalender.isAboday(index, d);
					// format dates in event array
					var events = [];
					if(angular.isDefined(value.events) && value.events.length > 0) {
						angular.forEach(value.events, function(event) {
							var pEvent = angular.copy(event);
							pEvent.datum_von = Utils.parseFullDate(event.datum_von);
							pEvent.datum_bis = Utils.parseFullDate(event.datum_bis);
							var today = new Date(newValue.datum);
							pEvent.showTime = (pEvent.datum_von.toDateString() == today.toDateString());
							events.push(pEvent);
						});
						newValue.events = events;
					}
					// format dates in vertretungen array
					var v = [];
					if(angular.isDefined(value.vertretungsplan) && value.vertretungsplan.length > 0) {
						angular.forEach(value.vertretungsplan, function(item) {
							var newV = angular.copy(item);
							newV.datum = Utils.parseFullDate(item.datum_uhrzeit);
							v.push(newV);
						});
						newValue.vertretungsplan = v;
					}
					// check for menues
					var mCounter = 0;
					for(var i = 0; i < value.angebote.length; i++) {
						var angebot = value.angebote[i];
						// select all "Essensgeld" detail_kostenart ids
						if(angebot.detail_kostenart_id == "5946B518504DCEF79B6D74589C54D4D3") mCounter++;
					}
					newValue.menueCount = mCounter;
					// check day flags
					var isAngemeldet = false;
					var hasCourses = false;
					angular.forEach(value.angebote, function(angebot) {
						if(angebot.detail_kostenart_id == "5946B518504DCEF79B6D74589C54D4D3") {
							if(angebot.angemeldet == 1) isAngemeldet = true;
						} else {
							hasCourses = true;
						}
					});
					newValue.hasCourses = hasCourses;
					newValue.angemeldet = isAngemeldet;
					newValue.isEmpty = (value.angebote.length + value.events.length) == 0;
					this.push(newValue);
				}, tageArray);
				console.log("Kalender.request: kalend tageArray", tageArray);
				if(sHandler) return sHandler(tageArray);
				else return tageArray;
			}
		});
	};
	Kalender.getDetails = function(shift, sHandler, eHandler) {
		//console.log("Kalender.getDetails start");
		var params = Kalender.calcParams(shift);
		return Datasource.request('kalend-details', params, function(data) {
			//console.log("Kalender.request: kalend-details", data);
			if(!!data.fehler) {// if data.fehler != 0
				if(eHandler) return eHandler(data);
				else return data;
			} else {
				var detailsArray = [];
				angular.forEach(data.kalender_details, function(value, index) {
					//console.log("parsing detailed date: ", value, index);
					var newValue = angular.copy(value);
					// format the date
					newValue.datum = Utils.parseDate(value.datum);
					// parse titles for detail_kostenarten
					angular.forEach(newValue.detail_kostenarten, function(detail) {
						switch(detail.detail_kostenartart_id) {
							case "5946B518504DCEF79B6D74589C54D4D3":
								detail.title = "essen";
								detail.aboEnabled = ((detail.kostenarten.length > 0) && (detail.kostenarten[0].aenderbar == "1") && Kalender.abo.aboType == 0);
								break;
							case "1F40F57378133B73054B09A391A4FF7E":
								detail.title = "kurse";
								detail.aboEnabled = false;
								break;
							default:
								detail.title = "error";
								detail.aboEnabled = false;
								break;
						}
					});

					//(detail.detail_kostenartart_id == "5946B518504DCEF79B6D74589C54D4D3") && () && ($scope.aboTyp == 0)

					this.push(newValue);
				}, detailsArray);
				Kalender.nachricht_sekretariat = data.nachricht_sekretariat;


				//console.log("Kalender.request: kalend detailsArray", detailsArray);
				if(sHandler) return sHandler(detailsArray);
				else return detailsArray;
				//return detailsArray;
			}
		});
	};
	Kalender.saveAbo = function(aboTage, success, failure) {
		Datasource.request('kalend-abotag', {abotage: aboTage}, function(data) {
			console.log("outer ok", data);
			Kalender.clearData();
			Kalender.refresh();
			if(!!success) data = success(data);
			return data;
		}, failure);
	};
	Kalender.saveMenue = function(auswahl, success, failure) {
		//alert("Kalender.saveMenue");
		Datasource.request('kalend-menue', {auswahl: auswahl}, function(data) {
			console.log("saveMenue clear cache");
			Kalender.clearData();
			Kalender.refresh();
			if(!!success) data = success(data);
			return data;
		}, failure);
	};
	Kalender.init();
	return Kalender;
}]);