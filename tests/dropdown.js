/*global module: false, test: false, notEqual: false, equal: false, strictEqual, deepEqual: false, start: false, stop: false */
var DD = window.DropDown,
	defV, d = null, v = null,
	simpleList = [1, 2, 3, 4, 5],
	objectList = [
		{ id: 1, name: 'item 1'},
		{ id: 2, name: 'item 2'},
		{ id: 3, name: 'item 3'},
		{ id: 4, name: 'item 4'},
		{ id: 5, name: 'item 5'},
		{ id: 6, name: 'item 6'},
		{ id: 7, name: 'item 7'},
		{ id: 8, name: 'item 8'},
		{ id: 9, name: 'item 9'},
		{ id: 10, name: 'item 10'},
		{ id: 11, name: 'item 11'}
	],
	complexObjectList = [
		{ itemId: 1,  itemName: 'item 1',  itemCode: 'IT01', group: 'Items 1', sidebarText: 'Items 1', isHeader: true },
		{ itemId: 2,  itemName: 'item 2',  itemCode: 'IT01', group: 'Items 1', sidebarText: 'Items 1' },
		{ itemId: 3,  itemName: 'item 3',  itemCode: 'IT01', group: 'Items 1', sidebarText: 'Items 1' },
		{ itemId: 4,  itemName: 'item 4',  itemCode: 'IT01', group: 'Items 1', sidebarText: 'Items 1' },
		{ itemId: 5,  itemName: 'item 5',  itemCode: 'IT01', group: 'Items 1', sidebarText: 'Items 1' },
		{ itemId: 6,  itemName: 'item 6',  itemCode: 'IT01', group: 'Items 2', sidebarText: 'Items 2', isHeader: true },
		{ itemId: 7,  itemName: 'item 7',  itemCode: 'IT01', group: 'Items 2', sidebarText: 'Items 2' },
		{ itemId: 8,  itemName: 'item 8',  itemCode: 'IT01', group: 'Items 2', sidebarText: 'Items 2' },
		{ itemId: 9,  itemName: 'item 9',  itemCode: 'IT01', group: 'Items 2', sidebarText: 'Items 2' },
		{ itemId: 10, itemName: 'item 10', itemCode: 'IT01', group: 'Items 2', sidebarText: 'Items 2' },
		{ itemId: 11, itemName: 'item 11', itemCode: 'IT01', group: 'Items 2', sidebarText: 'Items 2' }
	],
	Down = function () { var ev = jQuery.Event('keydown'); ev.keyCode = 40; return ev; },
	Up = function () { var ev = jQuery.Event('keydown'); ev.keyCode = 38; return ev; },
	Esc = function () { var ev = jQuery.Event('keydown'); ev.keyCode = 27; return ev; },
	Enter = function () { var ev = jQuery.Event('keydown'); ev.keyCode = 13; return ev; };



module('DropDown - Simple', {
	setup: function () { d = new DD({ target: 'ddtarget', defaultValue: defV }); },
	teardown: function () { d.destroy(); }
});


test('Init', function () { notEqual(d, null, 'Should not be null'); });


test('Default value', function () {
	equal(d.getValue(), defV, 'Should have a default value');
});


test('Set/Get/Reset value (no list)', function () {
	deepEqual(d.getItems(), [], 'List should be empty');
	equal(d.getItems().length, 0, 'List length should be 0');

	d.setItems(simpleList);
	d.clearList();

	deepEqual(d.getItems(), [], 'List should be cleared');
	equal(d.getItems().length, 0, 'List length should be 0');

	d.setValue(1);
	equal(d.getValue(), 1, 'Value should be 1');

	d.setValue(10);
	equal(d.getValue(), 10, 'Value should be 10');

	d.reset();
	equal(d.getValue(), defV, 'Value shoud be ' + defV);
	equal(d.getCaption(), '', 'Name shoud be ""');

	d.select(3);
	equal(d.getValue(), defV, 'Value shoud be ' + defV);
	equal(d.getCaption(), '', 'Name shoud be ""');
});


test('Set/Get/Reset value (list is a simple array)', function () {
	d.setItems(simpleList);

	deepEqual(d.getItems(), simpleList, 'Replace list with [1,2,3,4,5]');
	equal(d.getItems().length, simpleList.length, 'List length should be ' + simpleList.length);

	v = 1;
	d.setValue(v);
	equal(d.getValue(), v, 'Value shoud be ' + v);
	equal(d.getIdValue(), v, 'ID value shoud be ' + v);

	v = 10;
	d.setValue(v);
	equal(d.getValue(), v, 'Value shoud be ' + v);
	equal(d.getIdValue(), v, 'ID value shoud be ' + v);

	d.reset();
	equal(d.getValue(), defV, 'Value shoud be ' + defV);
	equal(d.getIdValue(), '', 'Name shoud be ""');

	v = simpleList[3];
	d.select(3);
	equal(d.getValue(), v, 'Value shoud be ' + v);
	equal(d.getIdValue(), v, 'Name shoud be "' + v + '"');
});


test('Set/Get/Reset value (list is an array of objects)', function () {
	d.setItems(objectList);

	deepEqual(d.getItems(), objectList, 'Replace list with array of objects');
	equal(d.getItems().length, objectList.length, 'List length should be ' + objectList.length);

	v = objectList[2];
	d.setValue(v.id);
	equal(d.getValue(), v.id, 'Value shoud be ' + v.id);
	equal(d.getCaption(), v.name, 'Name shoud be "' + v.name + '"');

	v = objectList[4];
	d.setValue(v.id);
	equal(d.getValue(), v.id, 'Value shoud be ' + v.id);
	equal(d.getCaption(), v.name, 'Name shoud be "' + v.name + '"');


	d.reset();
	equal(d.getValue(), defV, 'Value shoud be ' + defV);
	equal(d.getCaption(), '', 'Name shoud be ""');

	v = objectList[3];
	d.select(3);
	equal(d.getValue(), v.id, 'Value shoud be ' + v.id);
	equal(d.getCaption(), v.name, 'Name shoud be "' + v.name + '"');
});


test('Special Characters', function () {
	var list = [
			{ id: 1, name: 'simple string' },
			{ id: 2, name: '&lt;a&amp;b,&apos;c&apos;,&quot;d&quot;' },
			{ id: 3, name: 'Terms & Conditions' },
			{ id: 4, name: 'T&C' }
		],
		val = [ 'simple string', '<a&b,\'c\',"d"', 'Terms & Conditions', 'T&C' ];
	d.setItems(list);

	d.setValue(list[0].id);
	strictEqual(d.getCaption(), val[0], 'Caption should match 1');

	d.setValue(list[1].id);
	strictEqual(d.getCaption(), val[1], 'Caption should match 2');

	d.setValue(list[2].id);
	strictEqual(d.getCaption(), val[2], 'Caption should match 2');

	d.setValue(list[3].id);
	strictEqual(d.getCaption(), val[3], 'Caption should match 2');
});




module('DropDown - Complex', {
	setup: function () {
		d = new DD({
			target: 'ddtarget',
			defaultValue: defV,
			items: complexObjectList,
			showSidebar: true,
			fieldId: 'itemId',
			fieldName: '{itemName} ({itemId} - {itemCode})'
		});
	},
	teardown: function () {
		d.destroy();
	}
});


test('Set/Get/Reset value (list is an array of objects)', function () {
	var eV = '';

	deepEqual(d.getItems(), complexObjectList, 'Replace list with array of objects');
	equal(d.getItems().length, complexObjectList.length, 'List length should be ' + complexObjectList.length);

	v = complexObjectList[2];
	d.setValue(v.itemId);
	equal(d.getValue(), v.itemId, 'Value shoud be ' + v.itemId);

	eV = v.itemName + ' (' + v.itemId + ' - ' + v.itemCode + ')';
	equal(d.getCaption(), eV, 'Name shoud be "' + eV + '"');


	v = complexObjectList[4];
	d.setValue(v.itemId);
	equal(d.getIdValue(), v.itemId, 'Value shoud be ' + v.itemId);

	eV = v.itemName + ' (' + v.itemId + ' - ' + v.itemCode + ')';
	equal(d.getCaption(), eV, 'Name shoud be "' + eV + '"');


	d.reset();
	equal(d.getValue(), defV, 'Value shoud be ' + defV);
	equal(d.getCaption(), '', 'Name shoud be ""');


	v = complexObjectList[3];
	d.select(3);
	equal(d.getValue(), v.itemId, 'Value shoud be ' + v.itemId);

	eV = v.itemName + ' (' + v.itemId + ' - ' + v.itemCode + ')';
	equal(d.getCaption(), eV, 'Name shoud be "' + eV + '"');
});




module('DropDown - UI (select)', {
	setup: function () { d = new DD({ target: 'ddselect' }); },
	teardown: function () { d.destroy(); }
});


test('Enable/Disable', function () {
	strictEqual(d.isEnabled(), true, 'Is enabled');
	d.disable();
	strictEqual(d.isEnabled(), false, 'Is disabled');
	d.enable();
	strictEqual(d.isEnabled(), true, 'Is enabled');
});


test('Expand/Collapse', function () {
	strictEqual(d.isExpanded(), false, 'Is collapsed');
	d.expand();
	strictEqual(d.isExpanded(), true, 'Is expanded');
	d.collapse();
	strictEqual(d.isExpanded(), false, 'Is collapsed');

	stop();
	d.button().trigger('click').trigger('mousedown');
	setTimeout(function () {
		strictEqual(d.isExpanded(), true, 'Is expanded again');
		start();
	}, 30);

	stop();
	setTimeout(function () {
		$(document).trigger('mousedown');
		start();
	}, 60);

	stop();
	setTimeout(function () {
		strictEqual(d.isExpanded(), false, 'Is collapsed again');
		start();
	}, 90);
});


test('Show/Hide', function () {
	strictEqual(d.getEl().is(':visible'), true, 'Is visible');
	d.hide();
	strictEqual(d.getEl().is(':visible'), false, 'Is hidden');
	d.show();
	strictEqual(d.getEl().is(':visible'), true, 'Is visible');
});





module('DropDown - UI (input)', {
	setup: function () { d = new DD({ target: 'ddinput', defaultValue: defV, items: objectList }); },
	teardown: function () { d.destroy(); }
});

test('Filter', function () {
	d.expand();

	var mn = d.menu(), filter = mn.find('.menu-filter-text'), items = mn.find('.menu-items .menu-item');

	strictEqual(mn.length > 0, true, 'Has menu');

	filter.focus().val('Item 11').trigger('change');
	strictEqual(items.filter(':visible').length, 1, 'Item found');

	filter.focus().val('Item 111').trigger('change');
	strictEqual(items.filter(':visible').length, 0, 'Item not found');

	mn.find('.menu-filter .search-icon').trigger('click');
	strictEqual(items.filter(':visible').length, objectList.length, 'Filter cleared');

	filter.focus().trigger(Down());
	strictEqual(items.filter('.focused').index(), 0, 'First item selected');

	d.button().trigger(Down());
	strictEqual(items.filter('.focused').index(), 1, 'Second item selected');

	stop();
	d.button().trigger(Up()).trigger(Up());
	setTimeout(function () {
		strictEqual(items.filter('.focused').index(), -1, 'First item selected again');
		start();

		d.button().trigger(Esc());
		strictEqual(d.isExpanded(), false, 'Collapse on Esc');
	}, 50);

});

test('Action', function () {
	var mn = d.menu(), items = mn.find('.menu-items .menu-item');

	d.expand();

	mn.find('.menu-filter-text').focus().trigger(Down());
	strictEqual(items.filter('.focused').index(), 0, 'First item selected');

	d.button().trigger(Enter());
	deepEqual(d.getSelectedItem(), objectList[0], 'First item applied');
});





module('DropDown - Remote data (input)', {
	setup: function () { d = DD({ target: 'ddinput' }); },
	teardown: function () { d.destroy(); }
});

test('Load List', function () {

	d.setConfig({ url: '' }).expand();
	strictEqual(d.getItems().length, 0, 'Retrieve no list with ajax');
	d.collapse().clearList();

	stop();
	d.setConfig({ url: 'data-empty.json' }).expand();
	$.getJSON('data-empty.json', function (dat) {
		start();
		strictEqual(d.getItems().length, dat.length, 'Retrieve empty list with ajax');
		d.collapse().clearList();
	});

	stop();
	setTimeout(function () {
		d.setConfig({ url: 'data.json' }).expand();
		setTimeout(function () {
			$.getJSON('data.json', function (dat) {
				start();
				strictEqual(d.getItems().length, dat.length, 'Retrieve items list with ajax');
				d.collapse().clearList();
			});
		}, 100);
	}, 100);

});

