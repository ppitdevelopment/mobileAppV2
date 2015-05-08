'use strict';
/**
 * Created by AlexiuS on 08.05.2015.
 */
var ErrorCtrl = ppitControllers.controller('ErrorCtrl', ['$scope', 'Auth', 'Navigation', 'Messages', function($scope, Auth, Navigation, Messages) {
	console.log('ErrorCtrl');
	alert("error ctrl");
	$scope.action = function() {
		Messages.messages = [];
		Navigation.goBack();
	};
	$scope.restart = function() {
		Messages.messages = [];
		Auth.clear();
		Navigation.go("login");
	};
	$scope.init = function() {
		$scope.messages = {
			messages	: Messages.messages,
			actions		: undefined
		};
		$scope.title = (angular.isDefined(Messages.messages) && Messages.messages.length > 0)? Messages.messages[0].title : $scope.app.text.errorTitle;
		$scope.actionType = Messages.actionType;
	};
	$scope.init();
}]);