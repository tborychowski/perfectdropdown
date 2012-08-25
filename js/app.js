$(function(){ App.init(); });

var App = App || {};

App.init = function(){
	
	App.Publish('app/ready');
	
};



App.Publish = function(channel, args){ $.publish(channel, args); };

App.Subscribe = function(channel, callback, scope){ $.subscribe(channel, callback, scope || App); };