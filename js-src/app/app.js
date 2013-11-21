var App = (function ($, App) {
	'use strict';

	var cache = {};

	App.Publish = function (topic, args) {
		if (!cache[topic]) return;
		for (var i = 0, el; el = cache[topic][i++] ;) el.fn.apply(el.scope, args || []);
	};
	App.Subscribe = function (topic, callback, scope) {
		if (!cache[topic]) cache[topic] = [];
		cache[topic].push({ fn: callback, scope: scope || callback });
		return [topic, callback, scope];
	};
	App.Unsubscribe = function (handle) {
		/*jshint eqeqeq:false */
		var i = 0, el, topic = handle[0];
		if (!cache[topic]) return;
		for (; el = cache[topic][i]; i++) if (el.fn == handle[1]) cache[topic].splice(i, 1);
	};


	$(function () {
		App.Publish('app/ready');
	});

	return App;

}(jQuery, App || {}, this));
