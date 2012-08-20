$(function(){ App.init(); });
var App = App || {};
App.Publish = function(channel, args){ $.publish(channel, args); };
App.Subscribe = function(channel, callback, scope){ $.subscribe(channel, callback, scope || App); };
App.init = function(){

	
	App.Publish('log', ['App Ready!']);

	// Init DropDowns
	var dd1 = new DropDown({ target: 'dropdown1', defaultText: 'Items', emptyText: 'Please select' });
	var dd2 = new DropDown({ target: 'dropdown2', isStatic: true, items: [ 'all', 'none' ], emptyText: '<input type="checkbox" name="" value="" /> Select' });
	var dd3 = new MultiSelect({ target: 'dropdown3', defaultText: 'Items', emptyText: 'All Items' });
	

	// Init button click events
	$('#btn1').on('click', function(){
		App.Publish('log', ['Dropdown 1 value: ' + dd1.getValue()]);
	});
	
	
	
	function getvalue(d){ log(d.getIdValue(), d.getValue()); }
	function select(d){ d.select(_$.rand(0, d.items.length+1)); }
	function changelist(dd){ 
		var list = [1,2,3,4,5,6,7,8,9,10]; 
		dd.replaceList(list); 
	}
	function changelist2(dd){ 
		var list = [
		            {id: 1, name: 'item 1' },
		            {id: 2, name: 'item 2' },
		            {id: 3, name: 'item 3' },
		            {id: 4, name: 'item 4' },
		            {id: 5, name: 'item 5' },
		            {id: 6, name: 'item 6' },
		            {id: 7, name: 'item 7' },
		            {id: 8, name: 'item 8' },
		            {id: 9, name: 'item 9' },
		            {id: 10, name: 'item 10' },
		            {id: 11, name: 'item 11' },
		            {id: 12, name: 'item 12' }
		            ];	
		dd.replaceList(list); 
	}
};
