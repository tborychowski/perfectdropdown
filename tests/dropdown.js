/*global module: false, test: false, notEqual: false, equal: false, deepEqual: false */
var defV = 'Select', d = null, v = null,
	simpleList = [1, 2, 3, 4, 5],
	objectList = [
		{ id: 1, name: 'item 1'},
		{ id: 2, name: 'item 2'},
		{ id: 3, name: 'item 3'},
		{ id: 4, name: 'item 4'},
		{ id: 5, name: 'item 5'}
	],
	complexObjectList = [
		{ itemId: 1, itemName: 'item 1', itemCode: 'IT01' },
		{ itemId: 2, itemName: 'item 2', itemCode: 'IT01' },
		{ itemId: 3, itemName: 'item 3', itemCode: 'IT01' },
		{ itemId: 4, itemName: 'item 4', itemCode: 'IT01' },
		{ itemId: 5, itemName: 'item 5', itemCode: 'IT01' }
	];


module('DropDown - Simple', {
	setup: function () { d = new window.XDropDown({ target: 'ddtarget', defaultValue: defV }); },
	teardown: function () { d.destroy(); }
});


test('Init', function () { notEqual(d, null, 'Should not be null'); });

test('Default value', function () { equal(d.value, defV, 'Should have a default value'); });

test('Set/Get/Reset value (no list)', function () {
	deepEqual(d.items, [], 'List should be empty');
	equal(d.items.length, 0, 'List length should be 0');

	d.value = 1;
	equal(d.value, 1, 'Value should be 1');

	d.value = 10;
	equal(d.value, 10, 'Value should be 10');

	d.reset();
	equal(d.idValue, defV, 'Value shoud be ' + defV);
	equal(d.value, defV, 'Name shoud be "' + defV + '"');

	d.select(3);
	equal(d.idValue, defV, 'Value shoud be ' + defV);
	equal(d.value, defV, 'Name shoud be "' + defV + '"');
});

test('Set/Get/Reset value (list is a simple array)', function () {
	d.items = simpleList;

	deepEqual(d.items, simpleList, 'Replace list with [1,2,3,4,5]');
	equal(d.items.length, simpleList.length, 'List length should be ' + simpleList.length);

	d.value = v = 1;
	equal(d.value, v, 'Value shoud be ' + v);
	equal(d.idValue, v, 'ID value shoud be ' + v);

	d.value = v = 10;
	equal(d.value, v, 'Value shoud be ' + v);
	equal(d.idValue, v, 'ID value shoud be ' + v);

	d.reset();
	equal(d.idValue, defV, 'Value shoud be ' + defV);
	equal(d.value, defV, 'Name shoud be "' + defV + '"');

	v = simpleList[3];
	d.select(3);
	equal(d.idValue, v, 'Value shoud be ' + v);
	equal(d.value, v, 'Name shoud be "' + v + '"');
});

test('Set/Get/Reset value (list is an array of objects)', function () {
	d.items = objectList;

	deepEqual(d.items, objectList, 'Replace list with array of objects');
	equal(d.items.length, objectList.length, 'List length should be ' + objectList.length);

	v = objectList[2];
	d.value = v.id;
	equal(d.idValue, v.id, 'Value shoud be ' + v.id);
	equal(d.value, v.name, 'Name shoud be "' + v.name + '"');

	v = objectList[4];
	d.value = v.id;
	equal(d.idValue, v.id, 'Value shoud be ' + v.id);
	equal(d.value, v.name, 'Name shoud be "' + v.name + '"');


	d.reset();
	equal(d.idValue, defV, 'Value shoud be ' + defV);
	equal(d.value, defV, 'Name shoud be "' + defV + '"');

	v = objectList[3];
	d.select(3);
	equal(d.idValue, v.id, 'Value shoud be ' + v.id);
	equal(d.value, v.name, 'Name shoud be "' + v.name + '"');
});






module('DropDown - Complex', {
	setup: function () {
		d = new window.XDropDown({
			target: 'ddtarget',
			defaultValue: defV,
			items: complexObjectList,
			fieldId: 'itemId',
			fieldName: '{itemName} ({itemId} - {itemCode})'
		});
	},
	teardown: function () { d.destroy(); }
});


test('Set/Get/Reset value (list is an array of objects)', function () {
	var eV = '';

	deepEqual(d.items, complexObjectList, 'Replace list with array of objects');
	equal(d.items.length, complexObjectList.length, 'List length should be ' + complexObjectList.length);

	v = complexObjectList[2];
	d.value = v.itemId;
	equal(d.idValue, v.itemId, 'Value shoud be ' + v.itemId);
	eV = v.itemName + ' (' + v.itemId + ' - ' + v.itemCode + ')';
	equal(d.value, eV, 'Name shoud be "' + eV + '"');

	v = complexObjectList[4];
	d.value = v.itemId;
	equal(d.idValue, v.itemId, 'Value shoud be ' + v.itemId);
	eV = v.itemName + ' (' + v.itemId + ' - ' + v.itemCode + ')';
	equal(d.value, eV, 'Name shoud be "' + eV + '"');


	d.reset();
	equal(d.idValue, defV, 'Value shoud be ' + defV);
	equal(d.value, defV, 'Name shoud be "' + defV + '"');


	v = complexObjectList[3];
	d.select(3);
	equal(d.idValue, v.itemId, 'Value shoud be ' + v.itemId);
	eV = v.itemName + ' (' + v.itemId + ' - ' + v.itemCode + ')';
	equal(d.value, eV, 'Name shoud be "' + eV + '"');
});
