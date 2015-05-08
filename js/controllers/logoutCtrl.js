'use strict';
/**
 * Created by AlexiuS on 04.02.2015.
 */
var LogoutCtrl = ppitControllers.controller('LogoutCtrl', ['$scope', 'Auth', 'Navigation', function($scope, Auth, Navigation) {
	console.log('LogoutCtrl');
	$scope.init = function() {
		Auth.load();
		Auth.logout(function() {
			Navigation.go("login");
		});
	};
	$scope.init();
}]);

