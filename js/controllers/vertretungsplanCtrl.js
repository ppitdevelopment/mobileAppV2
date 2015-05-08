'use strict';
/**
 * Created by AlexiuS on 06.02.2015.
 */
var VertretungsplanCtrl = ppitControllers.controller('VertretungsplanCtrl', ['$scope', '$routeParams', 'Auth', 'Navigation', 'Vertretungsplan', function($scope, $routeParams, Auth, Navigation, Vertretungsplan) {
	console.log('VertretungsplanCtrl', $routeParams);
	$scope.parse = function(item) {
		var vertretungObject = {
			"statusClass"	: "",
			"statusImg"		: "",
			"statusTitle"	: (item.vertretungsart.length > 10) ? item.vertretungsart.slice(0,6) + "..." : item.vertretungsart
		};
		switch(item.vertretungsart_id) {
			case 2:
				vertretungObject.statusImg = 'images/ribbon3-o.png';
				vertretungObject.statusClass = 'orange';
				break;
			case 3:
				vertretungObject.statusImg = 'images/ribbon3-g.png';
				vertretungObject.statusClass = 'green';
				break;
			case 1:
				vertretungObject.statusImg = 'images/ribbon3-r.png';
				vertretungObject.statusClass = 'red';
				break;
			default:
				vertretungObject.statusImg = 'images/ribbon3-r.png';
				vertretungObject.statusClass = 'red';
				break;
		}
		angular.extend(vertretungObject, item);
		vertretungObject.datum = Utils.parseFullDate(item.datum_uhrzeit);
		//console.log("datum:", d);
		return vertretungObject;
	};
	$scope.init = function() {
		// Vertretung id - id not implemented in vertretungsplan list yet
		var vId = $routeParams.vId;
		$scope.isLoaded = false;
		$scope.vertretungen = [];
		Auth.load();
		if (Auth.loggedIn()) {
			Vertretungsplan.getPlan(function(data) {
				console.log("ctrl success", angular.copy($scope.vertretungen), angular.copy(data));
				var parsedData = [];
				angular.forEach(data.vertretungen, function(item) {
					parsedData.push($scope.parse(item));
				});
				$scope.vertretungen = parsedData;
				Auth.setVertretungen(parsedData.length);
				$scope.isLoaded = true;
				console.log("ctrl success 2", angular.copy($scope.vertretungen));
				return data;
			}, function(data) {
				$scope.isLoaded = true;
				return data;
			});
			Navigation.setCurrent({"page" : "vertretungsplan"});
		} else {
			Vertretungsplan.refresh();
			Navigation.go('login');
		}
	};
	$scope.init();
}]);

