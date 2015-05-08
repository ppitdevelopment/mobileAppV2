'use strict';
/**
 * Created by AlexiuS on 06.02.2015.
 */
var KontoCtrl = ppitControllers.controller('KontoCtrl', ['$scope', 'Auth', 'Navigation', 'Konto', function($scope, Auth, Navigation, Konto) {
	console.log('KontoCtrl');
	$scope.loadKonto = function() {
		$scope.startDate = Utils.formatDate($scope.selectedStartDate);
		$scope.endDate = Utils.formatDate($scope.selectedEndDate);
		Konto.getKonto($scope.startDate, $scope.endDate, function(data) {
			console.log("buchungen:", data);
			$scope.buchungen = data.buchungen;
			$scope.isLoaded = true;
			return data;
		});
	};
	$scope.init = function() {
		$scope.isLoaded = false;
		$scope.buchungen = [];
		Auth.load();
		if (Auth.loggedIn()) {
			var sDate = new Date();
			sDate.setDate(1);
			$scope.selectedStartDate = sDate;
			var eDate = new Date();
			//eDate.setMonth(eDate.getMonth()+1,0);
			$scope.selectedEndDate = eDate;
			$scope.loadKonto();
			Navigation.setCurrent({"page" : "konto"});
		} else {
			Navigation.go("login");
		}
	};
	$scope.init();
}]);

