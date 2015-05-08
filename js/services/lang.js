'use strict';
/**
 * Created by AlexiuS on 06.02.2015.
 */

var ppitLang = ppitServices.factory('Lang', ['Storage', '$window', function(Storage, $window) {
	var Lang = {};
	Lang.getLanguages = function() {
		return Lang._languagesAvailable.languages;
	};
	Lang.textDict = {};
	Lang.getCurrentLanguage = function() {
		var langKey = Storage.load("lang");
		if(!langKey) {
			langKey = Lang._languagesAvailable["_default"];
		}
		return langKey;
	};
	Lang.selectLanguage = function(langKey) {
		if(angular.isDefined(Lang._languagesAvailable.languages[langKey])) {
			Storage.save("lang", langKey);
			Lang.textDict = angular.copy(_TEXT[langKey]);
		} else console.error("Wrong language selected!");
	};
	Lang.getText = function(key) {
		return Lang.textDict[key];
	};
	Lang.getDict = function() {
		return Lang.textDict;
	};
	Lang.init = function() {
		// get languages from config
		Lang._languagesAvailable = languagesAvailable;
		// get current (or default) language
		var langKey = Lang.getCurrentLanguage();
		// set text dictionary
		Lang.textDict = angular.copy(_TEXT[langKey]);
	};
	Lang.init();
	return Lang;
}]);