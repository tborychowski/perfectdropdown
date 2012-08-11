
/*** JS OVERRIDES **********************************************************************************************************************************/
String.prototype.trim=function(str){return this.ltrim(str).rtrim(str);};
String.prototype.ltrim=function(str){if(str)return this.replace(eval("/^"+str+"+/"),""); return this.replace(/^\s+/,"");};
String.prototype.rtrim=function(str){if(str)return this.replace(eval("/"+str+"+$/"),""); return this.replace(/\s+$/,"");};
String.prototype.clean=function(str){if(str)return this.replace(eval("/"+str+"+/g"),""); return this.replace(/\s+/,"");};
String.prototype.stripTags=function(){return this.replace(/<\/?\w+(\s*[^>])*>/g,'');};
String.prototype.ucfirst=function(){return this.toLowerCase().replace(/\b([a-z])/gi,function(c){return c.toUpperCase();});};
String.prototype.decodeEntities=function(){try{var tmp=document.createElement("pre");tmp.innerHTML=this;return tmp.firstChild.nodeValue;}catch(e){return this.replace(/&amp;/g,'&');}};

Array.prototype.in_array=function(v){for(var i=0,l=this.length;i<l;i++)if(this[i]===v)return i;return -1;};
Array.prototype.remove=function(v){var nA=new Array();for(var i=0,l=this.length;i<l;i++)if(this[i]!=v)nA.push(this[i]);return nA;};
Array.prototype.removeIdx=function(idx){var nA=new Array();for(var i=0,l=this.length;i<l;i++)if(i!=idx)nA.push(this[i]);return nA;};
Array.prototype.max=function(){return Math.max.apply(null,this);};
Array.prototype.min=function(){return Math.min.apply(null,this);};
Array.prototype.unique=function(){var a=[],l=this.length,i=0,j;for(;i<l;i++){ for(j=i+1;j<l;j++)if(this[i]===this[j])j=++i;a.push(this[i]);}return a;};

String.prototype.toDate=function(){var a=this.split('-');return new Date(a[0],a[1]-1,a[2]);};				// parse string date: 2011-01-31

//object keys for old browsers
if(!Object.keys)Object.keys=function(o){if(o!==Object(o))throw new TypeError('Object.keys called on non-object');var ret=[],p=null;for(p in o)if(Object.prototype.hasOwnProperty.call(o,p))ret.push(p);return ret;};

window.log=function(){try{console.log.apply(console,arguments);}catch(e){}};
window.dir=function(){try{console.dir.apply(console,arguments);}catch(e){}};
window.error=function(){try{console.error.apply(console,arguments);}catch(e){};return false;};
window.die=function(){try{console.warn.apply(console,arguments);}catch(e){};return false;};
/*** JS OVERRIDES **********************************************************************************************************************************/





/*** JS EXTENDER ***********************************************************************************************************************************/
var _$ = window._$||{};		// name space
_$.toString=function(){return 'XWERX JS Helper Library   ';};


/**
 * Queues ajax functions and runs them consecutively. e.g.: Loader.push(a); Loader.push(b); Loader.run();
 * Loader.run(); must be added in the ajax callback for each
 */
_$.Loader = { queue: []
	,init: function(){ this.queue=[]; }
	,add: function(fn,scope,params){ this.queue.push(function(){ fn.apply(scope,params); _$.Loader.run.call(_$.Loader); }); }
	,push: function(fn,scope,params){ this.queue.push(function(){ if(typeof params=='undefined')fn.call(scope); else fn.apply(scope, params);}); }
	,run: function(){ if(this.queue.length) this.queue.shift().call(); }
};


/* some general functions */
_$.isTouch = navigator.userAgent.match(/iPhone|iPod|iPad/ig);
_$.IEversion = /*@cc_on(@_jscript_version*10-50)||@*/0;
_$.isIE = /*@cc_on!@*/0;
_$.isIE8 = (_$.isIE&&(_$.IEversion<=8));


/* better typeof */
_$.getType=function(obj){if(obj)return Object.prototype.toString.call(obj).slice(8,-1);};


/**
 * Return how many milisec elapsed from the given time
 * @param time
 */
_$.getElapsed = function (time){ if(typeof time=='object')time=+time; return +new Date()-time;};


/**
 * Compares 2 objects
 * @param x 	object 1
 * @param y 	object 2
 * @returns 	true if they are identical, false if they are different
 */
_$.compareObjects = function(x, y){
	for (var p in x){
		if(typeof(x[p]) !== typeof(y[p])) return false;
		if((x[p]===null) !== (y[p]===null)) return false;
		switch (typeof(x[p])) {
			case 'undefined': if (typeof(y[p]) != 'undefined') return false; break;
			case 'function': if (p != 'equals' && x[p].toString() != y[p].toString()) return false; break;
			case 'object': if(x[p]!==null && y[p]!==null && (x[p].constructor.toString() !== y[p].constructor.toString() || !_$.compareObjects(x[p], y[p]))) return false; break;
			default: if (x[p] !== y[p]) return false;
		}
	}
	var t = x; x = y; y = t;				// reverse objects and try again (in case y has some properties that x doesn't
	for (var p in x){
		if(typeof(x[p]) !== typeof(y[p])) return false;
		if((x[p]===null) !== (y[p]===null)) return false;
		switch (typeof(x[p])) {
			case 'undefined': if (typeof(y[p]) != 'undefined') return false; break;
			case 'function': if (p != 'equals' && x[p].toString() != y[p].toString()) return false; break;
			case 'object': if(x[p]!==null && y[p]!==null && (x[p].constructor.toString() !== y[p].constructor.toString() || !_$.compareObjects(x[p], y[p]))) return false; break;
			default: if (x[p] !== y[p]) return false;
		}
	}
	return true;
};

/**
 * Cleans empty or null properties from an object
 * @param [required] 1			first parameter is an object to clean
 * @param [optional] 2,3,...	names of properties to remove from the object
 * @returns						clean object
 */
_$.clearProperties = function(){
	if (arguments.length<1) return {};
	var obj = arguments[0], newO = {}, name='', val, props = [];
	if (arguments.length>1) props = Array.prototype.slice.call(arguments,1);
	for (name in obj){
		val = obj[name];
		if (typeof val == 'undefined' || val == null || val == -1) continue;		// if null or undefined
		if (typeof val == 'string' && !val.length) continue;						// if empty string
		if (props.in_array(name)>-1) continue;										// if name is in disabled properties list
		newO[name] = val;
	}
	return newO;
};


/**
 * Formats numbers (or string numbers)
 * @param number	int or int-parsable string
 * @param prec		decimal precision
 * @returns			formatted number as string
 */
_$.numberFormat = function(number,prec){ // integer, float or string as input
	if (number == null || number == 'undefined') return 0;
	var num=0, sNum='', rgx = /(\d+)(\d{3})/;
	prec=prec||0;
	try{ num=number.toFixed(prec); sNum=num.toString(); } catch(e){ sNum=number; } // number to string
	sNum = sNum+'';
	var nArr=sNum.split('.'), name=nArr[0], ext=nArr[1];
	while (rgx.test(name)) name = name.replace(rgx, '$1'+','+'$2');
	return name+(ext?'.'+ext:'');
};


/**
 * Normalised rand function
 */
_$.rand = function(max,min){min=min||0;return Math.floor(Math.random()*(max-min)+min);};


/**
 * Returns the parameter value from address bar
 * @param param		parameter name
 * @param url		url string can be given
 * @returns			parameter value
 */
_$.getParam = function(param, url){
	var paramStr=(url || location.search).substr(1), paramAr=paramStr.split('&'), i=0, il=paramAr.length, par;
	for (; i<il; i++){par=paramAr[i].split('='); if(par[0]==param)return par[1];}
	return false;
};
/*** JS EXTENDER ***********************************************************************************************************************************/