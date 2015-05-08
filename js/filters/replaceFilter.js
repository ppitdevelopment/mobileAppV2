'use strict';
/**
 * Created by AlexiuS on 08.04.2015.
 */
var replaceFilter = ppitFilters.filter('replace', function() {
	return function(input, searchvalue, newvalue) {
		input = input || '';
		return input.replace(searchvalue, newvalue);
	};
});