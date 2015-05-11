'use strict';
/*
 * LoginCtrl - authorisation page controller
 */
var LoginCtrl = ppitControllers.controller('LoginCtrl', ['$scope', 'Core', 'Auth', 'Navigation', 'Storage', 'Lang', function($scope, Core, Auth, Navigation, Storage, Lang) {
	console.log('LoginCtrl');
	$scope.cred = {
		username : "",
		password : ""
	};
	$scope.user = {
		username : "",
		password : ""
	};
	$scope.remember = true;
	$scope.reset = function() {
		$scope.user = angular.copy($scope.cred);
	};
	$scope.login = function() {
		console.log("login click", $scope.user, $scope.remember);
		if($scope.user.username != "" && $scope.user.password != "") {
			$scope.cred = angular.copy($scope.user);
			Auth.remember = $scope.remember;
			Auth.login($scope.cred, function(data) {
				console.log('AuthCtrl success login', $scope.userStart);
				Navigation.go($scope.userStart);
				/*
				 if(angular.isDefined(data.nachrichten)) {
				 Messages.setAction(function() {
				 Navigation.go(Settings.getStart());
				 });
				 Navigation.go("error");
				 } else {
				 Navigation.go($scope.userStart);
				 }
				 */
				//$scope.$apply();
			}, function() {
				//console.log('AuthCtrl error login');
				Navigation.go("error");
			});
		}

	};
	$scope.testDates = function() {
		alert("dates:"+$scope.selectedStartDate.toDateString());
	};
	$scope.init = function() {
		$scope.selectedStartDate = new Date();
		$scope.selectedEndDate = new Date();
		Auth.load();
		$scope.remember = Auth.remember;
		if($scope.remember) $scope.cred = Auth.cred;
		$scope.reset();
		var s = Storage.getStart();
		console.log("start=", s);
		$scope.userStart = s;
	};
	$scope.init();
}]);