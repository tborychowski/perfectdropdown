(function($, window){
	/*global App: false */

	var dd = [],


	initWidgets = function(){
		dd[1] = new window.XDropDown({ target: 'dropdown1', defaultText: 'Not selected', action: ddAction });
		dd[2] = new window.XDropDown({ target: 'dropdown2', action: ddAction, defaultValue: 1,
			items: [{ id: 0, name: 'All items' }, { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]
		});
		//dd[3] = new window.MultiSelect({ target: 'dropdown3', defaultText: 'Items',
		//	emptyText: 'All Items', action: ddAction, showSidebar: true, menuAlign: 'right' });
		dd[4] = new window.XDropDown({ target: 'dropdown4', isStatic: true, emptyText: 'User Menu', action: ddAction,
			items: [ { id: 1, name: 'Option 1' }, { id: 2, name: 'Option 2' } ]
		});

		dd[5] = new window.XDropDown({ target: 'dropdown5', isStatic: true, emptyText: 'Custom Menu',
			action: ddAction, showSidebar: true,
			items: [
				{ id: 10, name: 'Option 10', group: 'Group 10', isHeader: true },
				{ id: 11, name: 'Option 11', group: 'Group 10' },
				{ id: 12, name: 'Option 12', group: 'Group 10' },
				{ id: 13, name: 'Option 13', group: 'Group 10' },
				{ id: 14, name: 'Option 14', group: 'Group 10' },
				{ id: 15, name: 'Option 15', group: 'Group 10' },

				{ id: 20, name: 'Option 20', group: 'Group 20', isHeader: true },
				{ id: 21, name: 'Option 21', group: 'Group 20' },
				{ id: 22, name: 'Option 22', group: 'Group 20' },
				{ id: 23, name: 'Option 23', group: 'Group 20' },
				{ id: 24, name: 'Option 24', group: 'Group 20' },
				{ id: 25, name: 'Option 25', group: 'Group 20' }
			]
		});

		App.Publish('log', ['Widgets initialised' ]);
	},

	destroyWidgets = function(){
		for (var i = dd.length; --i ;) {
			dd[i].destroy();
			dd[i] = null;
		}
		App.Publish('log', ['Widgets destroyed' ]);
	},


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
		if (dd) dd.items = list;
	},


	ddAction = function(actionId, selectedItem, dd){
		var idx = dd.config.name.substr(-1);
		App.Publish('log', ['Dropdown ' + idx + ' <b>' + actionId + '</b> was selected' ]);
	},

	btnAction = function(){
		/*jshint white: false */
		var btn = $(this), msg = '',
			action = btn.data('action'),
			idx = btn.closest('tr').index();

		if (!dd[idx]) return;
		switch (action) {
			case 'getValue': msg = 'value: <b>' + dd[idx].value + '</b>'; break;
			case 'getIdValue': msg = 'ID value: <b>' + dd[idx].idValue + '</b>'; break;
			case 'getTextValue': msg = 'Text value: <b>' + dd[idx].getTextValue() + '</b>'; break;
			case 'reset': msg = 'reset'; dd[idx].reset(); break;
			case 'replaceList': msg = 'list replaced'; replaceList(dd[idx]); break;
		}

		App.Publish('log', ['Dropdown '+idx+': ' + msg ]);
	},

	initDemo = function(){
		$('.btn').on('click', btnAction);

		$('#btnInit').on('click', initWidgets);
		$('#btnDestroy').on('click', destroyWidgets);

		initWidgets();
	};



	App.Subscribe('app/ready', initDemo);


	return {};

}(jQuery, this));