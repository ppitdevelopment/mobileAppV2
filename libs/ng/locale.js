'use strict';
/**
 * custom localization service
 * Created by AlexiuS on 18.02.2015.
 */
var locale_en = function() {
	var PLURAL_CATEGORY = {ZERO: "zero", ONE: "one", TWO: "two", FEW: "few", MANY: "many", OTHER: "other"};
	function getDecimals(n) {
		n = n + '';
		var i = n.indexOf('.');
		return (i == -1) ? 0 : n.length - i - 1;
	}

	function getVF(n, opt_precision) {
		var v = opt_precision;

		if (undefined === v) {
			v = Math.min(getDecimals(n), 3);
		}

		var base = Math.pow(10, v);
		var f = ((n * base) | 0) % base;
		return {v: v, f: f};
	}
	return {
		"DATETIME_FORMATS": {
			"AMPMS": [
				"AM",
				"PM"
			],
			"DAY": [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday"
			],
			"MONTH": [
				"January",
				"February",
				"March",
				"April",
				"May",
				"June",
				"July",
				"August",
				"September",
				"October",
				"November",
				"December"
			],
			"SHORTDAY": [
				"Sun",
				"Mon",
				"Tue",
				"Wed",
				"Thu",
				"Fri",
				"Sat"
			],
			"SHORTMONTH": [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec"
			],
			"fullDate": "EEEE, MMMM d, y",
			"longDate": "MMMM d, y",
			"medium": "MMM d, y h:mm:ss a",
			"mediumDate": "MMM d, y",
			"mediumTime": "h:mm:ss a",
			"short": "M/d/yy h:mm a",
			"shortDate": "M/d/yy",
			"shortTime": "h:mm a"
		},
		"NUMBER_FORMATS": {
			"CURRENCY_SYM": "$",
			"DECIMAL_SEP": ".",
			"GROUP_SEP": ",",
			"PATTERNS": [
				{
					"gSize": 3,
					"lgSize": 3,
					"maxFrac": 3,
					"minFrac": 0,
					"minInt": 1,
					"negPre": "-",
					"negSuf": "",
					"posPre": "",
					"posSuf": ""
				},
				{
					"gSize": 3,
					"lgSize": 3,
					"maxFrac": 2,
					"minFrac": 2,
					"minInt": 1,
					"negPre": "\u00a4-",
					"negSuf": "",
					"posPre": "\u00a4",
					"posSuf": ""
				}
			]
		},
		"id": "en-us",
		"pluralCat": function(n, opt_precision) {  var i = n | 0;  var vf = getVF(n, opt_precision);  if (i == 1 && vf.v == 0) {    return PLURAL_CATEGORY.ONE;  }  return PLURAL_CATEGORY.OTHER;}
	};
};

var locale_de = function() {
	var PLURAL_CATEGORY = {ZERO: "zero", ONE: "one", TWO: "two", FEW: "few", MANY: "many", OTHER: "other"};
	function getDecimals(n) {
		n = n + '';
		var i = n.indexOf('.');
		return (i == -1) ? 0 : n.length - i - 1;
	}

	function getVF(n, opt_precision) {
		var v = opt_precision;

		if (undefined === v) {
			v = Math.min(getDecimals(n), 3);
		}

		var base = Math.pow(10, v);
		var f = ((n * base) | 0) % base;
		return {v: v, f: f};
	}
	return {
		"DATETIME_FORMATS": {
			"AMPMS": [
				"vorm.",
				"nachm."
			],
			"DAY": [
				"Sonntag",
				"Montag",
				"Dienstag",
				"Mittwoch",
				"Donnerstag",
				"Freitag",
				"Samstag"
			],
			"MONTH": [
				"Januar",
				"Februar",
				"M\u00e4rz",
				"April",
				"Mai",
				"Juni",
				"Juli",
				"August",
				"September",
				"Oktober",
				"November",
				"Dezember"
			],
			"SHORTDAY": [
				"So.",
				"Mo.",
				"Di.",
				"Mi.",
				"Do.",
				"Fr.",
				"Sa."
			],
			"SHORTMONTH": [
				"Jan.",
				"Feb.",
				"M\u00e4rz",
				"Apr.",
				"Mai",
				"Juni",
				"Juli",
				"Aug.",
				"Sep.",
				"Okt.",
				"Nov.",
				"Dez."
			],
			"fullDate": "EEEE, d. MMMM y",
			"longDate": "d. MMMM y",
			"medium": "dd.MM.y HH:mm:ss",
			"mediumDate": "dd.MM.y",
			"mediumTime": "HH:mm:ss",
			"short": "dd.MM.yy HH:mm",
			"shortDate": "dd.MM.yy",
			"shortTime": "HH:mm"
		},
		"NUMBER_FORMATS": {
			"CURRENCY_SYM": "\u20ac",
			"DECIMAL_SEP": ",",
			"GROUP_SEP": ".",
			"PATTERNS": [
				{
					"gSize": 3,
					"lgSize": 3,
					"maxFrac": 3,
					"minFrac": 0,
					"minInt": 1,
					"negPre": "-",
					"negSuf": "",
					"posPre": "",
					"posSuf": ""
				},
				{
					"gSize": 3,
					"lgSize": 3,
					"maxFrac": 2,
					"minFrac": 2,
					"minInt": 1,
					"negPre": "-",
					"negSuf": "\u00a0\u00a4",
					"posPre": "",
					"posSuf": "\u00a0\u00a4"
				}
			]
		},
		"id": "de-de",
		"pluralCat": function(n, opt_precision) {  var i = n | 0;  var vf = getVF(n, opt_precision);  if (i == 1 && vf.v == 0) {    return PLURAL_CATEGORY.ONE;  }  return PLURAL_CATEGORY.OTHER;}
	};
};

angular.module("ngLocale", [], ["$provide", function($provide) {
	function initLocale(locale) {
		var l;
		switch (locale) {
			case "en":
				l = new locale_en();
				break;
			case "de":
			default :
				l = new locale_de();
		}
		return l;
	}
	var ls = window.localStorage;
	var locale = "de";
	if(!!ls) locale = ls.getItem("lang");
	var localeObject = initLocale(locale);
	$provide.value("$locale", localeObject);
}]);