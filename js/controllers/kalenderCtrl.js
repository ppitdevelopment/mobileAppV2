'use strict';
/**
 * Kalender page
 * Created by AlexiuS on 03.02.2015.
 */
var KalenderCtrl = ppitControllers.controller('KalenderCtrl', ['$scope', '$routeParams', 'Core', 'Auth', 'Navigation', 'Kalender', '$filter', 'Teilnehmer', 'SharedState', function ($scope, $routeParams, Core, Auth, Navigation, Kalender, $filter, Teilnehmer, SharedState) {
	console.log('KalenderCtrl');
	SharedState.initialize($scope, "aboModal", {defaultValue:false});
	$scope.selectDay = function(tag) {
		var d = tag.datum;
		if($scope.selectedDate != d) {
			$scope.selectedDate = d;
			Core.setDate(d);
		} else {
			$scope.selectedDate = undefined;
			Core.setDate("");
		}
	};

	$scope.init = function () {
		$scope.imgUrl = _URL + "/img";
		// set up selected date
		var savedDate = Core.getDate();
		if(!savedDate) {
			var td = new Date();
			td = $filter('date')(td, 'dd.MM.yyyy');
			$scope.selectedDate = td;
		} else $scope.selectedDate = savedDate;
		$scope.abo = {
			tage	: [false,false,false,false,false,false,false],
			tageOld	: [false,false,false,false,false,false,false],
			typ		: 0,
			isAbo	: false,
			tagName	: "tagName",
			tagIdx	: -1
		};
		var wShift = parseInt($routeParams.Shift, 10);
		wShift = (!!wShift) ? wShift : 0;
		$scope.shift = wShift;
		//console.log('KalenderCtrl shift:', wShift);
		Navigation.setCurrent({page: "kalender", params: {shift: wShift}});
		$scope.selectedMenue = {
			menue				: {},
			selectedMenueImage	: "css/images/essen.png",
			selectedMenueId		: 0,
			selectedMenueDate	: "",
			menueNachricht		: "",
			selectedMenueClass	: "menue-default"
		};
		// authorization check
		Auth.load();
		if (Auth.loggedIn()) {
			//$scope.sk = Auth.sessionKey;
			//console.log("init:", $scope.kalend);
			Teilnehmer.getProfile(function(data) {
				console.log("Teilnehmer.getProfile succeded:", data);
				var abotageValue = data.teilnehmer.abotage;
				var newAbotage = [false,false,false,false,false,false,false];
				angular.forEach(newAbotage, function(value, key) {
					this[key] = !!(abotageValue & Math.pow(2, key));
				}, newAbotage);
				console.log("abotage:", newAbotage);
				Kalender.setAboInfo({
					aboType	: data.teilnehmer.essenabotyp,
					aboDays	: newAbotage
				});
				$scope.abo.tage = angular.copy(newAbotage);
				$scope.abo.tageOld = angular.copy(newAbotage);
				$scope.abo.typ = data.teilnehmer.essenabotyp;
				$scope.loadWeek();
				return data;
			});
		} else {
			Kalender.clearData();
			Navigation.go('login');
		}
		//$scope.$apply();
	};

	$scope.loadWeek = function() {
		$scope.kalend = Kalender.getWeek($scope.shift, function(data) {
			console.log("loadWeek success:", angular.copy(data));
			return data;
		}, function(data) {
			console.log("error:", data);
			return data;
		});
		//$scope.kalend = Kalender.getWeek($scope.shift);
		console.log("loadWeek start:", angular.copy($scope.kalend));
	};
	$scope.prevWeekAction = function() {
		Core.setDate($scope.selectedDate);
		Navigation.go('kalender',{shift: $scope.shift - 1});
	};
	$scope.todayAction = function() {
		var d = Core.getToday();
		console.log("today:", d);
		Core.setDate(d);
		Navigation.go('kalender',{shift: 0});
	};
	$scope.nextWeekAction = function() {
		Core.setDate($scope.selectedDate);
		Navigation.go('kalender',{shift: $scope.shift + 1});
	};
	$scope.openMenue = function(tagIdx,detailIdx,angebotIdx,menuIdx) {
		console.log("openMenue:", tagIdx,detailIdx,angebotIdx,menuIdx);
		var kostenart = $scope.kalend.details[tagIdx].detail_kostenarten[detailIdx].kostenarten[angebotIdx];
		var isDeselect = kostenart.menues.length == menuIdx;
		var menueDisabled = isDeselect ? kostenart.aenderbar == '0' : kostenart.aenderbar == '0' || kostenart.menues[menuIdx].menge_verfuegbar <= 0 || kostenart.menues[menuIdx].aenderbar == '0';
		if(!menueDisabled) {
			Core.setDate($scope.selectedDate);
			Navigation.go('menue',{week: $scope.shift,day: tagIdx, detail: detailIdx, kostenart: angebotIdx, menue: menuIdx});
		} else console.log("menueDisabled");
	};
	$scope.openKurse = function(termin) {
		//console.log("open kurse", termin);
		Navigation.go('kursedetail',{kursId:termin.kurs_id});
	};
	$scope.aboSelect = function(tag) {
		$scope.abo.tagIdx = tag;
		var datum = $scope.kalend.tage[tag].datum;
		console.log("abo select:", tag, datum, $scope.selectedDate);
		if(datum != $scope.selectedDate) $scope.selectedDate = datum;
		Core.setDate($scope.selectedDate);
		$scope.abo.isAbo = $scope.kalend.tage[tag].isAbo;
		$scope.abo.tagName = $filter('date')(datum, 'EEEE');
		//$scope.abo.modal = true;
		//SharedState.turnOn("aboModal");
	};
	$scope.aboOk = function() {
		console.log("aboOk:", $scope.abo.tagIdx);
		$scope.abo.tage[$scope.abo.tagIdx] = !$scope.abo.isAbo;
		var abotageVal = 0;
		angular.forEach($scope.abo.tage, function(val, key) {
			abotageVal += (val) ? Math.pow(2, key) : 0;
		});
		console.log("aboOk:", abotageVal);
		Kalender.saveAbo(abotageVal, function(data) {
			console.log("inner ok", data);
			Teilnehmer.refresh();
			$scope.init();
			return data;
		});
	};
	$scope.openSubstitution = function(item) {
		console.log("open vertretung", item);
		Navigation.go('vertretungsplan',{vId:item.id});
	};
	$scope.init();
}]);