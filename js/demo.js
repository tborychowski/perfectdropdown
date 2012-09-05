(function($){
	var dd = [],


	initWidgets = function(){
		dd[1] = new DropDown({ target: 'dropdown1', defaultText: 'Not selected', action: ddAction });
		dd[2] = new DropDown({ target: 'dropdown2', action: ddAction, defaultValue: 1,
			items: [{ id: 0, name: 'All items' }, { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]
		});
		dd[3] = new DropDown({ target: 'dropdown3', isStatic: true, items: [ 'Option 1', 'Option 2' ], emptyText: 'User Menu', action: ddAction, isExpanded: true });
		dd[4] = new MultiSelect({ target: 'dropdown4', defaultText: 'Items', emptyText: 'All Items', action: ddAction });
	},

	destroyWidgets = function(){ for (var i = dd.length; --i ;) dd[i].destroy(); dd[i] = null; },


	//select = function(d){ d.select(_$.rand(0, d.items.length+1)); },

	replaceList = function(dd){
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
		if (dd) dd.replaceList(list);
	},


	ddAction = function(actionId, selectedItem, dd){
		var idx = dd.conf.name.substr(-1);
		App.Publish('log', ['Dropdown ' + idx + ' <b>' + actionId + '</b> was selected' ]);
	},

	btnAction = function(){
		var btn = $(this), msg = '',
			action = btn.data('action'),
			idx = btn.closest('tr').data('idx');
		if (!dd[idx]) return;
		switch(action){
			case 'getValue': msg = 'value: <b>' + dd[idx].getValue() + '</b>'; break;
			case 'getIdValue': msg = 'ID value: <b>' + dd[idx].getIdValue() + '</b>'; break;
			case 'reset': msg = 'reset'; dd[idx].reset(); break;
			case 'replaceList': msg = 'list replaced'; replaceList(dd[idx]); break;
		}

		App.Publish('log', ['Dropdown '+idx+': ' + msg ]);
	},

	initDemo = function(){
		$('.btn').on('click', btnAction);																						// Init button click events

		$('#btnInit').on('click', initWidgets);
		$('#btnDestroy').on('click', destroyWidgets);

		initWidgets();
	};



	App.Subscribe('app/ready', initDemo);


	return {};

}(jQuery));