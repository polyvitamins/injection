"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.inject = inject;
var scopesregex = /({[^{}}]*[\n\r]*})/g,
    funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i),
    getFunctionArguments = function getFunctionArguments(code) {
	if (funcarguments.test(code)) {
		var match = funcarguments.exec(code);
		return match[1].replace(/[\s\n\r\t]*/g, '').split(',');
	}
	return [];
};

function inject(callback, args, context) {
	var locals = [],
	    requiredArguments = void 0;
	if (callback instanceof Array) {
		requiredArguments = callback.slice(0, callback.length - 1);
		callback = callback[callback.length - 1];
	} else {
		requiredArguments = getFunctionArguments(callback.toString());
	}

	for (var i = 0; i < requiredArguments.length; ++i) {
		if (args instanceof Array) {
			for (var j = 0; j < args.length; ++j) {
				var inspect = "function" === typeof args[j] ? args[j].apply(context || this) : args[j];
				if (inspect.hasOwnProperty(requiredArguments[i])) {
					locals[i] = inspect[requiredArguments[i]];
				}
			}
		} else if (args.hasOwnProperty(requiredArguments[i])) {
			locals[i] = args[requiredArguments[i]];
		}
	}

	var injected;
	injected = function injected() {
		return callback.apply(context || this, locals.concat(Array.prototype.slice.call(arguments)));
	};
	injected.$$injected = true;
	return injected;
};
