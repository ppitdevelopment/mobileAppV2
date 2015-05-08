'use strict';
/**
 * Created by AlexiuS on 09.02.2015.
 */
var Utils = {
	formatDate	: function(d) {
		// format the date (Date() object) in dd.mm.yyyy format
		//alert("input: " + d);
		var curr_date = d.getDate();
		var curr_month = d.getMonth() + 1; // Months are zero based
		var curr_year = d.getFullYear();
		var dr = '' + (curr_date <= 9 ? '0' + curr_date : curr_date) + '.'
			+ (curr_month <= 9 ? '0' + curr_month : curr_month) + '.'
			+ curr_year;
		//alert("output: " + dr);
		return dr;
	},
	parseDate	: function(ds) { // input - datum field from DB (string)
		var da = ds.split(".");
		var res = '' + da[2] + '-' + da[1] + '-' + da[0];
		return res;
	},
	createDate	: function(d) {
		//creates proper Date object from 2013-04-26 format (JS bug in Android 2.2)
		var da = d.split("-");
		// in Android 2.3 parseInt counts all numbers with leading 0 as octal %)
		var utcDate = Date.UTC(da[0],parseInt(da[1],10) - 1,da[2]);
		var newD = new Date(utcDate);
		return newD;
	},
	parseFullDate	: function(dateString) {// input - datum field from DB (string) dd.mm.yyyy hh:mm
		var dParsing = dateString.split(" ");
		var datum = dParsing[0].split(".");
		var uhrzeit = dParsing[1].split(":");
		//console.log("date parse:", datum, uhrzeit);
		var d = new Date();
		d.setFullYear(datum[2], parseInt(datum[1],10) - 1, datum[0]);
		d.setHours(uhrzeit[0], uhrzeit[1], 0, 0);
		return d;
	}

};