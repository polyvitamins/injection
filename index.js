var scopesregex = /({[^{}}]*[\n\r]*})/g,
funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i),
getFunctionArguments = function(code) {
	if (funcarguments.test(code)) {
		var match = funcarguments.exec(code);
		return match[1].replace(/[\s\n\r\t]*/g,'').split(',');
	}
	return [];
};

module.exports = function(callback, args, context) {
	var prefixedArguments = [],
	requiredArguments = getFunctionArguments(callback.toString());

	for (var i = 0;i<requiredArguments.length;++i) {
		if (args instanceof Array) {
			for (var j = 0;j<args.length;++j) {
				if (args[j].hasOwnProperty(requiredArguments[i])
					&&("object"===typeof args[j][requiredArguments[i]]||"function"===typeof args[j][requiredArguments[i]])) {
					prefixedArguments[i] = args[j][requiredArguments[i]];
				}
			}
		}
		else if (args.hasOwnProperty(requiredArguments[i])
			&& ("object"===typeof args[requiredArguments[i]] || "function"===typeof args[requiredArguments[i]])) {

			prefixedArguments[i] = args[requiredArguments[i]];
		}
	}
	
	var injected = function() {
		return callback.apply(context||this, prefixedArguments.concat(Array.prototype.slice.call(arguments)));
	}
	injected.$$injected = true;
	return injected;
}