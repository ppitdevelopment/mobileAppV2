'use strict';
/*
 * AppCtrl - main application frame controller
 */
var AppCtrl = ppitControllers.controller('AppCtrl', ['$scope', '$rootScope', 'Auth', 'Navigation', 'Core', 'Lang', 'Teilnehmer', function($scope, $rootScope, Auth, Navigation, Core, Lang, Teilnehmer) {
	console.log("Angular.version:", angular.version.full);
	$scope.app = {
		lang		: {},
		loggedIn	: false,
		user		: {
			name	: Lang.getText("loading"),
			gender	: 0,
			pic		: "images/default.png"
		},
		vertretungen	: 0,
		selectedLanguage: "",
		text		: Lang.getDict()
	};
	$scope.updateSelectedLanguage = function(langKey) {
		if(!langKey) langKey = Lang.getCurrentLanguage();
		var l = Lang.getLanguages();
		$scope.app.selectedLanguage = l[langKey];
	};
	$scope.changeLang = function(langKey) {
		console.log("App.changeLang:", langKey);
		Lang.selectLanguage(langKey);
		$scope.app.text = Lang.getDict();
		$scope.updateSelectedLanguage(langKey);
	};
	$scope.goBack = function() {
		console.log("back button click");
		Navigation.goBack();
	};
	$scope.init = function() {
		Auth.load();
		$scope.app.lang = Lang.getLanguages();
		$scope.app.loggedIn = Auth.loggedIn();
		$scope.updateSelectedLanguage();
		console.log('AppCtrl:', $scope.app);
		if ($scope.app.loggedIn) {
			$scope.app.vertretungen = Auth.anzahl_vertretungen;
			if(!Core.realResumeHandler()) Navigation.goCurrent();
			Teilnehmer.getProfile(function(data) {
				$scope.app.user.name = data.teilnehmer.vorname + " " + data.teilnehmer.name;
				$scope.app.user.gender = data.teilnehmer.geschlecht_id;
				if(data.teilnehmer.bild_id == "") {
					if(data.teilnehmer.geschlecht_id == 1) {
						$scope.app.user.pic = "images/schoolgirl.png";
					} else {
						$scope.app.user.pic = "images/schoolboy.png";
					}
				} else {
					$scope.app.user.pic = _URL + '/img/cache/customer' + Core.getCustomerId() + '/' + data.teilnehmer.bild_id + '.jpg?v=' + Math.floor((Math.random()*10)+1) + '&sk=' + Auth.sessionKey;
				}
				return data;
			});
		} else {
			Navigation.go("login");
		}
	};
	$scope.$watch(function() {return Auth.loggedIn();}, function(newValue) {
		console.log("Auth.loggedIn:", newValue);
		$scope.app.loggedIn = Auth.loggedIn();
		$scope.app.vertretungen = Auth.anzahl_vertretungen;
	});
	$scope.$watch(function() {return Auth.getVertretungen();}, function(newValue) {
		console.log("Auth.getVertretungen:", newValue);
		$scope.app.vertretungen = Auth.anzahl_vertretungen;
	});
	$scope.init();
}]);
