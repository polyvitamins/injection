"use strict";

var scopesregex = /({[^{}}]*[\n\r]*})/g,
funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i),
getFunctionArguments = function(code) {
	if (funcarguments.test(code)) {
		let match = funcarguments.exec(code);
		return match[1].replace(/[\s\n\r\t]*/g,'').split(',');
	}
	return [];
};

export default function inject(callback, args, context) {
	let locals = [], requiredArguments;
	if (callback instanceof Array) {
		requiredArguments = callback.slice(0, callback.length-1);
		callback = callback[callback.length-1];
	} else {
		requiredArguments = getFunctionArguments(callback.toString());
	}

	for (let i = 0;i<requiredArguments.length;++i) {
		if (args instanceof Array) {
			for (let j = 0;j<args.length;++j) {
				var inspect = ("function"===typeof args[j]) ? args[j].apply(context||this) : args[j];
				if (inspect.hasOwnProperty(requiredArguments[i])) {
					locals[i] = inspect[requiredArguments[i]];
				}
			}
		}
		else if (args.hasOwnProperty(requiredArguments[i])) {
			locals[i] = args[requiredArguments[i]];
		}
	}
	
	var injected;
	injected = function() {
		return callback.apply(context||this, locals.concat(Array.prototype.slice.call(arguments)));
	}
	injected.$$injected = true;
	return injected;
};