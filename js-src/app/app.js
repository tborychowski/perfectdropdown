var App = (function ($, App) {
	'use strict';


	/**
	 * Application Init
	 */
	$(function () {
		App.Publish('app/ready');
	});


	return App;

}(jQuery, App || {}, this));
