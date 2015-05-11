'use strict';
/* Messages service */
var ppitMessages = ppitServices.factory('Messages', [function() {
	//console.log("Messages service");
	var M = {};
	M.messages = [];
	M.messageTypes = ["err", "wait", "info", "warnung"];
	M.baseMessages = {
			"err"	: {
				"action": "ok",
				"title"	: "Fehler",
				"text"	: "Fehler",
				"image"	: "images/warn.png"
			},
			"auth"	: {
				"action": "refresh",
				"title"	: "Fehler",
				"text"	: "Fehler",
				"image"	: "images/warn.png"
			},
			"wait"	: {
				"action": "refresh",
				"title"	: "Wartung",
				"text"	: "Derzeit aktualisieren wir für Sie unser System. Deshalb steht dieser Dienst vorübergehend nicht zur Verfügung. Wir danken für Ihr Verständnis und bitten Sie es später noch einmal zu versuchen.",
				"image"	: "images/wartung.png"
			},
			"info"	: {
				"action": "ok",
				"title"	: "Info",
				"text"	: "",
				"image"	: "images/info_big.png"
			},
			"warnung"	: {
				"action": "ok",
				"title"	: "Warnung",
				"text"	: "",
				"image"	: "images/warn.png"
			}
	};
	M.actionType = "ok"; // "ok"/"refresh"
	M.actionHandler = undefined;
	M.setAction = function(handler) {
		M.actionHandler = handler;
	};
	M.addMessage = function(type, title, text) {
		var alreadyErr = false;
		angular.forEach(M.messages, function(mItem) {
			if(mItem.type == type) alreadyErr = true;
		});
		if(!(type == 'wait' && alreadyErr)) {
			var msg = angular.copy(M.baseMessages[type]);
			msg.id = M.messages.length;
			msg.type = type;
			if(angular.isDefined(title)) msg.title = title;
			if(angular.isDefined(text)) msg.text = text;
			M.messages.push(msg);
			M.actionType = msg.action;
		}
	};
	M.clear = function() {
		M.messages = [];
		M.actionType = "ok"; // "ok"/"refresh"
	};
	return M;
}]);