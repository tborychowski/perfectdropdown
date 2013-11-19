(function ($, App) {
	'use strict';

	var con = $('<div id="console"/>'), subHandle = null, ready = false,

	_cls = function () {
		con.text('');
		_log('Ready...');
	},

	_log = function (txt, overwrite) {
		if (overwrite) con.html(txt + '<br>');
		else con.append(txt + '<br>');
		con.scrollTop(999999);
	},

	_init = function () {
		if (ready) return;
		$('body').append(con);
		//_log('<b>Console started</b>, '+(new Date()),1);
		subHandle = App.Subscribe('log', _log);
		ready = true;
	},

	_destroy = function () {
		if (subHandle) App.Unsubscribe(subHandle);
		con.remove();
		ready = false;
	};

	_init();

	return {
		init: _init,
		destroy: _destroy,
		cls: _cls,
		log: _log
	};
}(jQuery, App, this));