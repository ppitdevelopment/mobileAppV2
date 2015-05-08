'use strict';
/**
 * Menue selector page
 * Created by AlexiuS on 17.02.2015.
 */
var MenueCtrl = ppitControllers.controller('MenueCtrl', ['$scope', '$routeParams', 'Core', 'Navigation', 'Kalender', function ($scope, $routeParams, Core, Navigation, Kalender) {
	console.log('MenueCtrl');
	$scope.menue = {
		week		: 0,
		day			: 0,
		detail		: 0,
		kostenart	: 0,
		menue		: 0
	};
	$scope.kostenart = {};
	$scope.emptyMenue = {
		menue_nr	: -1,
		bild_id		: "",
		menue_text	: $scope.app.text.deselectMenue,
		preis		: 0,
		ausgewaehlt	: true,
		allergie_konflikte	: [],
		ersatzkomponenten	: [],
		zusatzstoffe		: []
	};
	$scope.selectedMenue = {
		menue				: {},
		selectedMenueImage	: "images/essen.png",
		selectedMenueId		: 0,
		selectedMenueDate	: "",
		menueNachricht		: "",
		selectedMenueClass	: "menue-default"
	};
	$scope.getImageSrc = function(menue) {
		return "";
	};
	$scope.initMenue = function() {
		var l = $scope.kostenart.menues.length;
		for(var i = 0; i<l; i++) {
			if(i != $scope.menue.menue) $scope.kostenart.menues[i].ausgewaehlt = "0";
		}
		if($scope.menue.menue < l) {
			$scope.kostenart.menues[$scope.menue.menue].ausgewaehlt = "1";
			$scope.selectedMenue.menue = angular.copy($scope.kostenart.menues[$scope.menue.menue]);
			$scope.selectedMenue.selectedMenueImage = $scope.getImageSrc($scope.kostenart.menues[$scope.menue.menue]);
			if($scope.kostenart.menues[$scope.menue.menue].bild_id != "") {
				$scope.selectedMenue.selectedMenueClass = "menue-pic";
			} else {
				$scope.selectedMenue.selectedMenueClass = "menue-default";
			}
		} else {
			$scope.selectedMenue.menue = angular.copy($scope.emptyMenue);
			$scope.selectedMenue.selectedMenueImage = "images/essen.png";
			$scope.selectedMenue.selectedMenueClass = "menue-default";
		}
		$scope.selectedMenue.selectedMenueId = $scope.kostenart.kostenart_id;
		var d = Utils.createDate(Core.getDate());
		$scope.selectedMenue.selectedMenueDate = Utils.formatDate(d);
		$scope.menueNachricht = "";
		$scope.nachricht_sekretariat = Kalender.nachricht_sekretariat;
		console.log("result:", $scope.kostenart, $scope.selectedMenue);
	};
	$scope.submitMenu = function() {
		//data.details[$scope.menue.day].detail_kostenarten[$scope.menue.detail].kostenarten[$scope.menue.kostenart] = kostenart;
		console.log("selected menu:", $scope.selectedMenue);
		var auswahl = {'kostenart_id':'','nachricht':'','essen':{}};
		auswahl.kostenart_id = angular.copy($scope.selectedMenue.selectedMenueId);
		auswahl.nachricht = angular.copy($scope.selectedMenue.menueNachricht);
		auswahl.essen = {'datum' : '','menue_nr':0,'komponenten':[]};
		auswahl.essen.menue_nr = 1 * $scope.selectedMenue.menue.menue_nr;
		auswahl.essen.datum = $scope.selectedMenue.selectedMenueDate;
		auswahl.essen.komponenten = [];
		if(angular.isDefined($scope.selectedMenue.menue.ersatzkomponenten)) {
			var l = $scope.selectedMenue.menue.ersatzkomponenten.length;
			if(l > 0) {
				for(var i = 0; i < l; i++) {
					if($scope.selectedMenue.menue.ersatzkomponenten[i].ausgewaehlt == true || $scope.selectedMenue.menue.ersatzkomponenten[i].ausgewaehlt == 1) {
						auswahl.essen.komponenten.push($scope.selectedMenue.menue.ersatzkomponenten[i].speise_id);
					}
				}
			}
		}
		console.log("menue selected: ", auswahl);
		Kalender.saveMenue(auswahl, function(data) {
			console.log('success: ',data);
			if(angular.isDefined(data.fehler) && +data.fehler == 0) {
				// success
				Navigation.goBack();
			} else {
				if(angular.isDefined(data.fehlermessage) && data.fehlermessage != "") {
					$scope.result.text = data.fehlermessage;
				} else $scope.result.text = $scope.app.text.unknownError;
				$scope.result.type = "alert alert-danger";
				$scope.result.ready = true;
				console.log('error: ', data);
			}
		}, function(data) {
			if(angular.isDefined(data.fehlermessage) && data.fehlermessage != "") {
				$scope.result.text = data.fehlermessage;
				console.error('error: ', data.fehlermessage);
			} else {
				$scope.result.text = $scope.app.text.unknownError;
			}
			$scope.result.type = "alert alert-danger";
			$scope.result.ready = true;
		});
	};
	$scope.cancelMenu = function() {
			Navigation.goBack();
	};
	$scope.init = function() {
		$scope.menue = {
			week		: +$routeParams.week,
			day			: +$routeParams.day,
			detail		: +$routeParams.detail,
			kostenart	: +$routeParams.kostenart,
			menue		: +$routeParams.menue
		};
		$scope.result = {
			ready	: false,
			type	: "",
			text	: ""
		};
		console.log("menue init:", $scope.menue);
		Navigation.setCurrent({page: "menue", params: $scope.menue});
		$scope.kalend = Kalender.getWeek($scope.menue.week, function(data) {
			console.log("menue init kalender data:", data);
			if(angular.isDefined(data.details) && angular.isArray(data.details)) {
				$scope.kostenart = angular.copy(data.details[$scope.menue.day].detail_kostenarten[$scope.menue.detail].kostenarten[$scope.menue.kostenart]);
				$scope.initMenue();
			}
			return data;
		});
	};
	$scope.init();
}]);