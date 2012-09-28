var UTILS = {

	isTouch : navigator.userAgent.match(/iPhone|iPod|iPad/ig),

	IEversion : /*@cc_on(@_jscript_version*10-50)||@*/0,

	isIE : /*@cc_on!@*/0,

	isIE8 : (this.isIE && this.IEversion <= 8),


	/* better typeof */
	getType : function (obj) { if (obj) return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase(); },


	/**
	 * Return how many milisec elapsed from the given time
	 * @param time
	 */
	getElapsed : function  (time) { if (typeof time === 'object') time = +time; return +new Date() - time; },


	/**
	 *  Converts flat objects, e.g.: { a: 1, b:2, c:[1,2,3] }  to  "a=1&b=2&c=1,2,3"
	 */
	objToUrl : function (obj) {
		if (this.getType(obj) !== 'object') return '';
		var a = null, str = [];
		//for (a in obj) { if (obj.hasOwnProperty(a)) str.push(encodeURIComponent(a) + '=' + encodeURIComponent(obj[a])); }
		for (a in obj) { if (obj.hasOwnProperty(a)) str.push(escape(a) + '=' + escape(obj[a])); }
		return str.join('&');
	},

	/**
	 * Converts: "?a=1&b=2&c=3"  to  { a:'1', b:'2', c:'3' }
	 * @param url {string}			url string to convert
	 * @param convert {boolean}		true to convert vars to real types (e.g. '1' to 1, 'true' to true)
	 */
	urlToObj : function (url, convert) {
		if (!url || !url.length) return {};
		var params = {}, vars = url.ltrim('\\?').split('&'), pair = null, i = 0, vr = null, n = null, v = null;
		for (; vr = vars[i++] ;) {
			pair = vr.split('=');
			//n = decodeURIComponent(pair[0]); v = decodeURIComponent(pair[1]);
			n = unescape(pair[0]);
			v = unescape(pair[1]);

			if (v.indexOf(',') > -1) v = v.split(',');																			// if commas in value - split to array
			if (convert) v = this.varToRealType(v);
			if (params[n] === undefined) params[n] = v;																			// if first entry with this name
			else if (typeof params[n] === 'string') params[n] = [ params[n], v ];												// if second entry with this name
			else params[n].push(v);																								// if third or more with this name
		}
		return params;
	},

	/**
	 * Convert string variable to its real type, e.g. '1' to 1
	 * @param v		string var
	 * @return		typed var
	 */
	varToRealType : function (v) {
		if (this.isNumber(v)) v = parseFloat(v);
		else if (v === 'true') v = true;
		else if (v === 'false') v = false;
		if (v === '') v = undefined;
		if (this.getType(v) === 'array') for (var i = 0, il = v.length; i < il; i++) v[i] = this.varToRealType(v[i]);
		return v;
	},


	/**
	 * Compares 2 objects
	 * @param x	object 1
	 * @param y	object 2
	 * @returns	true if they are identical, false if they are different
	 */
	areObjectsEqual : function (x, y) {
		if (x === y) return true;																								// if both x and y are null or undefined and exactly the same
		if (!(x instanceof Object) || !(y instanceof Object)) return false;														// if they are not strictly equal, they both need to be Objects
		if (x.constructor !== y.constructor) return false;																		// they must have the exact same prototype chain, the closest we can do is test there constructor.
		for (var p in x) {
			if (!x.hasOwnProperty(p)) continue;																					// other properties were tested using x.constructor === y.constructor
			if (!y.hasOwnProperty(p)) return false;																				// allows to compare x[ p ] and y[ p ] when set to undefined
			if (x[p] === y[p]) continue;																						// if they have the same strict value or identity then they are equal
			if (typeof(x[p]) !== 'object') return false;																		// Numbers, Strings, Functions, Booleans must be strictly equal
			if (!Object.equals(x[p], y[p])) return false;																		// Objects and Arrays must be tested recursively
		}
		for (p in y) if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;												// allows x[ p ] to be set to undefined
		return true;
	},

	/**
	 * Checks if object is empty (has no own properties)
	 * @param x	object
	 * @returns	true if object is empty, false if it has any own properties
	 */
	isObjectEmpty : function (x) { for (var a in x) if (x.hasOwnProperty(a)) return false; return true; },


	/**
	 * Cleans empty or null properties from an object
	 * @param [required] 1			first parameter is an object to clean
	 * @param [optional] 2,3,...	names of properties to remove from the object
	 * @returns						clean object
	 */
	clearProperties : function () {
		if (arguments.length < 1) return {};
		var obj = arguments[0], newO = {}, name = '', val, props = [];
		if (arguments.length > 1) props = Array.prototype.slice.call(arguments, 1);
		for (name in obj) {
			if (!obj.hasOwnProperty(name)) continue;
			val = obj[name];
			//if (val === undefined || val == null || val == -1) continue;														// if null or undefined
			if (val === undefined || val === null) continue;																	// if null or undefined
			if (this.getType(val) === 'array' && !val.length) continue;															// if empty array
			if (typeof val === 'string' && !val.length) continue;																// if empty string
			if (this.inArray(props, name) > -1) continue;																		// if name is in disabled properties list
			newO[name] = val;
		}
		return newO;
	},


	/**
	 * Formats numbers (or string numbers)
	 * @param number	int or int-parsable string
	 * @param prec		decimal precision
	 * @returns			formatted number as string
	 */
	numberFormat : function (number, prec) {
		if (number === null || number === undefined) return 0;
		var num = 0, sNum = '', rgx = /(\d+)(\d{3})/;
		prec = prec || 0;
		try { num = number.toFixed(prec); sNum = num.toString(); } catch (e) { sNum = number; }									// number to string
		sNum = sNum + '';
		var nArr = sNum.split('.'), name = nArr[0], ext = nArr[1];
		if (prec) for (var i = prec; i > 0; i--) ext += '0';																	// add "0" to the end
		ext = ext.substr(0, prec);																								// crop to the prec length
		while (rgx.test(name)) name = name.replace(rgx, '$1' + ',' + '$2');														// put commas
		return name + (ext ? '.' + ext : '');
	},


	/**
	 * Normalised rand function
	 */
	rand : function (max, min) {min = min || 0; return Math.floor(Math.random() * (max - min) + min); },

	/**
	 * Check whether a string might be a number
	 * @param v {string}	a stringified number
	 * @returns	{int}		parsed number
	 */
	isNumber : function (v) {
		if (typeof v === 'number') return v;
		if (typeof v !== 'string') return false;
		return v.match(/^[\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?$/);
	},


	/**
	 * Returns the parameter value from address bar
	 * @param param		parameter name
	 * @param url		url string can be given
	 * @returns			parameter value
	 */
	getParam : function (param, url) {
		var paramStr = (url || location.search).substr(1), paramAr = paramStr.split('&'), i = 0, il = paramAr.length, par;
		for (; i < il; i++) {par = paramAr[i].split('='); if (par[0] === param) return par[1]; }
		return false;
	},


	inArray : function (a, v) {
		if (this.getType(a) !== 'array') return false;
		for (var i = 0, e; e = a[i++] ;) if (e === v) return i - 1;
		return -1;
	},

	uniqueArray : function (a) {
		var b = [], l = a.length, i = 0, j;
		for (; i < l; i++) {
			for (j = i + 1; j < l; j++) if (a[i] === a[j]) j = ++i;
			b.push(a[i]);
		}
		return b;
	},

	stripTags : function (str) { return str.replace(/<\/?\w+(\s*[^>])*>/g, ''); }
};
UTILS.toString = function () {return 'XWERX JS Helper Library   '; };


/**
 * Manage storage (session or local)
 */
UTILS.Storage = {
	/**
	 * Save value to the browser storage
	 * @param name		- name of the parameter to save
	 * @param val		- value (objects will be serialized) to assign to the name
	 * @param storage	- type of the storage: [ session | local ], default: 'session'
	 */
	set : function (name, val, storage) {
		storage = (storage || 'session') + 'Storage';
		if (!window[storage]) return log('Browser does not support ' + storage + '!');
		window[storage][name] = UTILS.objToUrl(val);
	},

	/**
	 * Retrieve value from the browser storage
	 * @param name		- name of the parameter to get
	 * @param val		- value (objects will be serialized) assigned to the name
	 * @param storage	- type of the storage: [ session | local ], default: 'session'
	 */
	get : function (name, storage) {
		storage = (storage || 'session') + 'Storage';
		if (!window[storage]) return log('Browser does not support ' + storage + '!');
		return UTILS.urlToObj(window[storage][name], true);
	},

	/**
	 * Same as set but uses JSON stringify
	 */
	setJson : function (name, val, storage) {
		storage = (storage || 'session') + 'Storage';
		if (!window[storage]) return log('Browser does not support ' + storage + '!');
		window[storage][name] = JSON.stringify(val);
	},

	/**
	 * Same as get but uses JSON parse
	 */
	getJson : function (name, storage) {
		storage = (storage || 'session') + 'Storage';
		if (!window[storage]) return log('Browser does not support ' + storage + '!');
		var json = window[storage][name];
		if (json) return JSON.parse(json);
	},

	del : function (name, storage) {
		storage = (storage || 'session') + 'Storage';
		if (!window[storage]) return log('Browser does not support ' + storage + '!');
		if (window[storage][name]) delete window[storage][name];
	}
};





/*** JS OVERRIDES **********************************************************************************************************************************/
String.prototype.trim = function (str) {return this.ltrim(str).rtrim(str); };
String.prototype.ltrim = function (str) { if (str) return this.replace(new RegExp('^' + str + '+'), ''); return this.replace(/^\s+/, ''); };
String.prototype.rtrim = function (str) { if (str) return this.replace(new RegExp(str + '+$'), ''); return this.replace(/\s+$/, ''); };
String.prototype.ucfirst = function () { return this.toLowerCase().replace(/\b([a-z])/gi, function (c) { return c.toUpperCase(); }); };

// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
	Object.keys = (function  () {
		var hasOwnProp = Object.prototype.hasOwnProperty, hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
			dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
			dontEnumsLength = dontEnums.length;
		return function  (obj) {
			if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');
			var result = [], i = 0;
			for (var prop in obj) if (hasOwnProp.call(obj, prop)) result.push(prop);
			if (hasDontEnumBug) for (; i < dontEnumsLength; i++) if (hasOwnProp.call(obj, dontEnums[i])) result.push(dontEnums[i]);
			return result;
		};
	})();
}

// firebug short-cuts
window.log = (window.console && window.console.log && window.console.log.bind) ? console.log.bind(console) : function (e) {alert(JSON.stringify(e)); };
window.dir = (window.console && window.console.dir && window.console.dir.bind) ? console.dir.bind(console) : function (e) {alert(JSON.stringify(e)); };
/*** JS OVERRIDES **********************************************************************************************************************************/
