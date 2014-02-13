/*global module: false, test: false, notEqual: false, equal: false, deepEqual: false, strictEqual: false */
var DD = window.DropDown,
	multiDefautlValue = [],
	multiDefaultCaption = 'All items',
	multipleItems = 'Multiple items',
	d = null, v = null,
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
	PgUp = function () { var ev = jQuery.Event('keydown'); ev.keyCode = 33; return ev; },
	PgDown = function () { var ev = jQuery.Event('keydown'); ev.keyCode = 34; return ev; },
	Esc = function () { var ev = jQuery.Event('keydown'); ev.keyCode = 27; return ev; },
	Enter = function () { var ev = jQuery.Event('keydown'); ev.keyCode = 13; return ev; };



module('MultiSelect - Simple', {
	setup: function () {
		d = new DD({ multiselect: true, target: 'ddtarget', defaultValue: multiDefautlValue, defaultText: 'items' });
	},
	teardown: function () { d.destroy(); }
});


test('Init', function () {
	notEqual(d, null, 'Should not be null');
});


test('Default value', function () {
	deepEqual(d.getValue(), multiDefautlValue, 'Should have a default value');
	equal(d.getCaption(), multiDefaultCaption, 'Name shoud be "' + multiDefaultCaption + '"');
});


test('Set/Get/Reset value (no list)', function () {
	deepEqual(d.getItems(), [], 'List should be empty');
	equal(d.getItems().length, 0, 'List length should be 0');

	v = [1, 2, 3];
	d.setValue(v);
	deepEqual(d.getValue(), v, 'Value should be ' + v);

	v = [1, 4, 6];
	d.setValue(v);
	deepEqual(d.getValue(), v, 'Value should be ' + v);

	d.reset();
	deepEqual(d.getValue(), multiDefautlValue, 'Value shoud be ' + multiDefautlValue);
	equal(d.getCaption(), multiDefaultCaption, 'Name shoud be "' + multiDefaultCaption + '"');

	d.select(3);
	deepEqual(d.getValue(), multiDefautlValue, 'Value shoud be ' + multiDefautlValue);
	equal(d.getCaption(), multiDefaultCaption, 'Name shoud be "' + multiDefaultCaption + '"');
});



test('Set/Get/Reset value (list is a simple array)', function () {
	d.setItems(simpleList);

	deepEqual(d.getItems(), simpleList, 'Replace list with [1,2,3,4,5]');
	equal(d.getItems().length, simpleList.length, 'List length should be ' + simpleList.length);

	v = [1, 2, 3];
	d.setValue(v);
	deepEqual(d.getValue(), v, 'Value shoud be ' + v);
	equal(d.getCaption(), multipleItems, 'ID value shoud be ' + multipleItems);

	v = [1, 4, 6];
	d.setValue(v);
	deepEqual(d.getValue(), v, 'Value shoud be ' + v);
	equal(d.getCaption(), multipleItems, 'ID value shoud be ' + multipleItems);

	d.reset();
	deepEqual(d.getValue(), multiDefautlValue, 'Value shoud be ' + multiDefautlValue);
	equal(d.getCaption(), multiDefaultCaption, 'Name shoud be "' + multiDefaultCaption + '"');

	v = [ simpleList[2] ];
	d.select(2);
	deepEqual(d.getValue(), v, 'Value shoud be ' + v);
	equal(d.getCaption(), simpleList[2], 'Name shoud be "' + simpleList[2] + '"');
});


test('Set/Get/Reset value (list is an array of objects)', function () {
	d.setItems(objectList);

	deepEqual(d.getItems(), objectList, 'Replace list with array of objects');
	equal(d.getItems().length, objectList.length, 'List length should be ' + objectList.length);

	v = objectList[2];
	d.setValue([v.id]);
	deepEqual(d.getValue(), [v.id], 'Value shoud be ' + [v.id]);
	equal(d.getCaption(), v.name, 'Name shoud be "' + v.name + '"');

	v = objectList[4];
	d.setValue([v.id]);
	deepEqual(d.getValue(), [v.id], 'Value shoud be ' + [v.id]);
	equal(d.getCaption(), v.name, 'Name shoud be "' + v.name + '"');


	d.reset();
	deepEqual(d.getValue(), multiDefautlValue, 'Value shoud be ' + multiDefautlValue);
	equal(d.getCaption(), multiDefaultCaption, 'Name shoud be "' + multiDefaultCaption + '"');

	v = [ objectList[2].id ];
	d.select(2);
	deepEqual(d.getValue(), v, 'Value shoud be ' + v);
	equal(d.getCaption(), objectList[2].name, 'Name shoud be "' + objectList[2].name + '"');
});




module('MultiSelect - Complex', {
	setup: function () {
		d = new DD({
			multiselect: true,
			target: 'ddtarget',
			defaultValue: multiDefautlValue,
			items: complexObjectList,
			defaultText: 'items',
			fieldId: 'itemId',
			fieldName: '{itemName} ({itemId} - {itemCode})',
			showSidebar: true,
			additionalOptions: [
				{ id: 'option1', name: 'Additional Option One', checked: true },
				{ id: 'option2', name: 'Additional Option Two', checked: false }
			]
		});
	},
	teardown: function () { d.destroy(); }
});


test('Set/Get/Reset value (list is an array of objects)', function () {
	var eV = '';

	d.expand();

	deepEqual(d.getItems(), complexObjectList, 'Replace list with array of objects');
	equal(d.getItems().length, complexObjectList.length, 'List length should be ' + complexObjectList.length);

	v = complexObjectList[2];
	d.setValue(v.itemId);
	deepEqual(d.getValue(), [v.itemId], 'Value shoud be ' + [v.itemId]);

	eV = v.itemName + ' (' + v.itemId + ' - ' + v.itemCode + ')';
	equal(d.getCaption(), eV, 'Name shoud be "' + eV + '"');

	v = complexObjectList[4];
	d.setValue(v.itemId);
	deepEqual(d.getValue(), [v.itemId], 'Value shoud be ' + [v.itemId]);

	eV = v.itemName + ' (' + v.itemId + ' - ' + v.itemCode + ')';
	equal(d.getCaption(), eV, 'Name shoud be "' + eV + '"');


	d.reset();
	deepEqual(d.getValue(), multiDefautlValue, 'Value shoud be ' + multiDefautlValue);
	equal(d.getCaption(), multiDefaultCaption, 'Name shoud be "' + multiDefaultCaption + '"');


	v = complexObjectList[2];
	d.select(2);
	deepEqual(d.getValue(), [v.itemId], 'Value shoud be ' + [v.itemId]);

	eV = v.itemName + ' (' + v.itemId + ' - ' + v.itemCode + ')';
	equal(d.getCaption(), eV, 'Name shoud be "' + eV + '"');

	d.button().trigger(Esc());
});


test('Additional Options', function () {
	strictEqual(d.getAdditionalOptions().option1, true, 'Option 1');
	strictEqual(d.getAdditionalOptions().option2, false, 'Option 2');

});




module('DropDown - UI', {
	setup: function () {
		d = new DD({
			multiselect: true,
			target: 'ddtarget',
			items: objectList,
			defaultValue: multiDefautlValue,
			defaultText: 'items',
			action: function () {}
		});
	},
	teardown: function () { d.destroy(); }
});

test('Action', function () {
	var mn = d.menu();//, items = mn.find('.menu-items .menu-item');

	d.expand();

	d.button().trigger(Down()).trigger(Enter());
	strictEqual(mn.hasClass('multiple-items-selected'), true, 'Unselect/Multiple');

	strictEqual(mn.find('.menu-apply').length, 1, 'Has "apply" button');


	d.button().trigger(Enter());
	strictEqual(mn.hasClass('all-items-selected'), true, 'Re-select all');


	d.button().trigger(Up()).trigger(Enter());
	strictEqual(mn.hasClass('no-items-selected'), true, 'None selected');

	d.button().trigger(Down()).trigger(Enter());
	strictEqual(mn.hasClass('multiple-items-selected'), true, 'Multiple (one) selected');
	strictEqual(mn.find('.menu-items .menu-item-checked').length, 1, 'One selected');

	d.button().trigger(Enter());
	strictEqual(mn.hasClass('no-items-selected'), true, 'None selected again');


	d.button().trigger(Up()).trigger(Enter());
	strictEqual(mn.hasClass('all-items-selected'), true, 'All selected');


	strictEqual(mn.find('.menu-apply').length, 1, 'Has "apply" button');
	d.button().trigger(PgUp()).trigger(PgDown()).trigger(PgDown()).trigger(PgDown()).trigger(Enter());
	strictEqual(d.isExpanded(), false, 'Is collapsed');
});
