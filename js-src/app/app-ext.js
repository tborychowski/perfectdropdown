(function () {

	String.prototype.trim = function (str) {return this.ltrim(str).rtrim(str); };
	String.prototype.ltrim = function (str) { return this.replace(new RegExp('^' + (str ? str : '\\s') + '+'), ''); };
	String.prototype.rtrim = function (str) { return this.replace(new RegExp((str ? str : '\\s') + '+$'), ''); };
	String.prototype.ucfirst = function () {
		return this.toLowerCase().replace(/\b([a-z])/gi, function (c) { return c.toUpperCase(); });
	};


	// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys
	if (!Object.keys) {
		Object.keys = (function  () {
			var hasOwnProp = Object.prototype.hasOwnProperty,
				hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
				dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf',
					'propertyIsEnumerable', 'constructor'],
				dontEnumsLength = dontEnums.length;

			return function  (obj) {
				if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
					throw new TypeError('Object.keys called on non-object');
				}
				var result = [], i = 0, prop;
				for (prop in obj) {
					if (hasOwnProp.call(obj, prop)) result.push(prop);
				}
				if (hasDontEnumBug) {
					for (; i < dontEnumsLength; i++) {
						if (hasOwnProp.call(obj, dontEnums[i])) result.push(dontEnums[i]);
					}
				}
				return result;
			};
		})();
	}

}(this));
