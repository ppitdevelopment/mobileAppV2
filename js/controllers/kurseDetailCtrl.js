'use strict';
/**
 * Kurse detail info page
 * Created by AlexiuS on 02.04.2015.
 */
var KurseDetailCtrl = ppitControllers.controller('KurseDetailCtrl', ['$scope', '$routeParams', 'Kurse', 'Auth', 'Navigation', 'SharedState', function ($scope, $routeParams, Kurse, Auth, Navigation, SharedState) {
	console.log('KurseDetailCtrl');
	SharedState.initialize($scope, "statusModal", {defaultValue:false});
	$scope.kursdetail = {
		loaded		: false,
		lastPage	: "",
		inputBemerkung:""
	};
	$scope.statusChange = function(status) {
		console.log("statusChange", status);
		var bemerkung = (status == "10") ? $scope.kursdetail.inputBemerkung : "";
		var kursInfo = { kurs_id : $scope.kurs.kursstammdaten.kurs_id, anmeldestatus : status, bemerkung : bemerkung };
		Kurse.changeStatus(kursInfo, function(data) {
			console.log("success", data);
			Kurse.refresh();
			$scope.init();
		});
	};
	$scope.statusCancel = function() {
		$scope.kursdetail.inputBemerkung = "";
	};
	$scope.submit = function() {
		console.log("submit:", $scope.kurs.anmeldedaten.anmeldestatus);
		if($scope.kurs.anmeldedaten.anmeldestatus == 0) {
			console.log("show modal");
			SharedState.toggle("statusModal");
		} else {
			$scope.statusChange('00');
		}
	};
	$scope.init = function() {
		Auth.load();
		if (Auth.loggedIn()) {
			var kursId = $routeParams.kursId;
			Navigation.setCurrent({"page" : "kursedetail", params: {kursId: kursId}});
			Kurse.getKurs(kursId, function(kurs) {
				$scope.kurs = kurs;
				$scope.kursdetail.lastPage = Kurse.getLastPage();
				$scope.kursdetail.loaded = true;
			});
		} else {
			Kurse.refresh();
			Navigation.go('login');
		}
	};
	$scope.init();
}]);