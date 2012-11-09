/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * http://ejohn.org/blog/simple-javascript-inheritance/
 * MIT Licensed.
 */
/*jslint noarg: false, loopfunc: true, expr: true*/
(function () {
	var initializing = false, fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;
	this.Class = function () {};																								// The base Class implementation (does nothing)
	Class.extend = function (prop) {																							// Create a new Class that inherits from this class
		var _super = this.prototype;
		initializing = true;																									// Instantiate a base class (but only create the instance, don't run the init constructor)
		var prototype = new this();
		initializing = false;
		for (var name in prop) {																								// Copy the properties over onto the new prototype
			prototype[name] = typeof prop[name] === 'function' && typeof _super[name] === 'function' && fnTest.test(prop[name]) ?// Check if we're overwriting an existing function
			(function (name, fn) {
				return function () {
					var tmp = this._super;
					this._super = _super[name];																					// Add a new ._super() method that is the same method but on the super-class
					var ret = fn.apply(this, arguments);																		// The method only need to be bound temporarily, so we remove it when we're done executing
					this._super = tmp;
					return ret;
				};
			})(name, prop[name]) : prop[name];
		}

		// The dummy class constructor
		function Class() { if (!initializing && this.init) this.init.apply(this, arguments); }									// All construction is actually done in the init method
		Class.prototype = prototype;																							// Populate our constructed prototype object
		Class.prototype.constructor = Class;																					// Enforce the constructor to be what we expect
		Class.extend = arguments.callee;																						// And make this class extendable
		return Class;
	};
}());