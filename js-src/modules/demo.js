(function ($, App, window) {
	'use strict';

	var dd = [],

	initWidgets = function () {
		dd = [];

		dd[0] = window.DropDown({ target: 'dropdown1', defaultText: 'Not selected', action: ddAction });

		dd[1] = window.DropDown({ target: 'dropdown2', defaultValue: 1, action: ddAction,
			items: [{ id: 0, name: 'All items' }, { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]
		});

		dd[2] = window.DropDown({ target: 'dropdown3', defaultText: 'Items', multiselect: true, action: ddAction,
			showSidebar: true, menuAlign: 'right', emptyText: 'All Items' });

		dd[3] = window.DropDown({ target: 'dropdown4', defaultText: 'Items', multiselect: true });
		replaceList(dd[3]);

		dd[4] = window.DropDown({ target: 'dropdown5', isStatic: true, emptyText: 'User Menu', action: ddAction,
			items: [ { id: 1, name: 'Option 1' }, { id: 2, name: 'Option 2' } ]
		});

		dd[5] = window.DropDown({ target: 'dropdown6', isStatic: true, emptyText: 'Custom Menu',
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

		dd[6] = window.DropDown({ target: 'dropdown7', emptyText: 'Please select' });

		App.Publish('log', ['Widgets initialised' ]);
		return dd;
	},

	destroyWidgets = function () {
		for (var i = dd.length; --i >= 0;) {
			dd[i].destroy();
			dd[i] = null;
		}
		App.Publish('log', ['Widgets destroyed' ]);
	},


	//select = function (d){ d.select(_$.rand(0, d.items.length+1)); },

	replaceList = function (dd) {
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
		if (dd) dd.setItems(list);
	},


	ddAction = function (actionId, selectedItem, dd) {
		var idx = dd.getConfig().name.substr(-1);
		App.Publish('log', ['Dropdown ' + idx + ' <b>' + actionId + '</b> was selected' ]);
	},

	btnAction = function () {
		var btn = $(this), msg = '',
			action = btn.data('action'),
			idx = btn.closest('tr').index() - 1,
			d = dd[idx], v;

		if (!d) return;
		switch (action) {
		case 'getValue':
			v = d.getValue();
			if ($.type(v) === 'array' && !v.length) v = '[]';
			msg = 'value: <b>' + v + '</b>';
			break;
		case 'getIdValue':
			msg = 'ID value: <b>' + d.getIdValue() + '</b>';
			break;
		case 'getTextValue':
			msg = 'Text value: <b>' + d.getCaption() + '</b>';
			break;
		case 'reset':
			msg = 'reset';
			d.reset();
			break;
		case 'replaceList':
			msg = 'list replaced';
			replaceList(d);
			break;
		}

		App.Publish('log', ['Dropdown ' + idx + ': ' + msg ]);
	},

	initDemo = function () {
		$('.btn').on('click', btnAction);
		$('#btnInit').on('click', initWidgets);
		$('#btnDestroy').on('click', destroyWidgets);
		window.dd = initWidgets();
	};


	App.Subscribe('app/ready', initDemo);

}(jQuery, window.App || {}, this));