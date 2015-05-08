'use strict';
/**
 * Created by AlexiuS on 06.02.2015.
 */
var KurseCtrl = ppitControllers.controller('KurseCtrl', ['$scope', '$routeParams', 'Auth', 'Navigation', 'Kurse', function($scope, $routeParams, Auth, Navigation, Kurse) {
	console.log('KurseCtrl');
	$scope.isLoaded = false;
	$scope.kurse = {
		mode		: "index",
		kursliste	: []
	};
	$scope.switchMode = function() {
		if($scope.kurse.mode == "index") $scope.kurse.mode = "meine";
		else $scope.kurse.mode = "index";
		$scope.refresh();
		$scope.setNavigation();
	};
	$scope.loadIndex = function() {
		Kurse.getKurse(function(data) {
			//console.log("kurse success:", data);
			$scope.kurse.kursliste = data;
			$scope.isLoaded = true;
		});
	};
	$scope.loadMeine = function() {
		Kurse.getMeine(function(data) {
			//console.log("kurse success:", data);
			$scope.kurse.kursliste = data;
			$scope.isLoaded = true;
		});
	};
	$scope.setNavigation = function() {
		//console.log("setNavigation:", $scope.kurse.mode);
		Navigation.setCurrent({"page" : "kurse", params: {mode: $scope.kurse.mode}});
		// save last used mode - it will be used on kursedetail page
		Kurse.setLastPage($scope.kurse.mode);
	};
	$scope.refresh = function() {
		$scope.isLoaded = false;
		switch ($scope.kurse.mode) {
			case "index":
				$scope.loadIndex();
				break;
			case "meine":
				$scope.loadMeine();
				break;
		}
	};
	$scope.openKurs = function(kurs) {
		Navigation.go('kursedetail',{kursId:kurs.kursstammdaten.kurs_id});
	};
	$scope.init = function() {
		Auth.load();
		if (Auth.loggedIn()) {
			var mode = $routeParams.mode;
			$scope.kurse.mode = (!!mode)? mode : "index";
			$scope.refresh();
			$scope.setNavigation();
		} else {
			Kurse.refresh();
			Navigation.go('login');
		}
	};
	$scope.init();
}]);

