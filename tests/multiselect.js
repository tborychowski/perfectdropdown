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


module('MultiSelect - Simple', {
	setup: function () { d = new window.XMultiSelect({ target: 'ddtarget', defaultValue: defV }); },
	teardown: function () { d.destroy(); }
});


test('Init', function () { notEqual(d, null, 'Should not be null'); });


test('Default value', function () {
	equal(d.getValue(), defV, 'Should have a default value');
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
	deepEqual(d.getIdValue(), defV, 'Value shoud be ' + defV);
	deepEqual(d.getValue(), defV, 'Name shoud be "' + defV + '"');

	d.select(3);
	deepEqual(d.getIdValue(), defV, 'Value shoud be ' + defV);
	deepEqual(d.getValue(), defV, 'Name shoud be "' + defV + '"');
});



test('Set/Get/Reset value (list is a simple array)', function () {
	d.setItems(simpleList);

	deepEqual(d.getItems(), simpleList, 'Replace list with [1,2,3,4,5]');
	equal(d.getItems().length, simpleList.length, 'List length should be ' + simpleList.length);

	v = [1, 2, 3];
	d.setValue(v);
	deepEqual(d.getValue(), v, 'Value shoud be ' + v);
	deepEqual(d.getIdValue(), v, 'ID value shoud be ' + v);

	v = [1, 4, 6];
	d.setValue(v);
	deepEqual(d.getValue(), v, 'Value shoud be ' + v);
	deepEqual(d.getIdValue(), v, 'ID value shoud be ' + v);

	d.reset();
	deepEqual(d.getIdValue(), defV, 'Value shoud be ' + defV);
	deepEqual(d.getValue(), defV, 'Name shoud be "' + defV + '"');

	v = simpleList[3];
	d.select(3);
	deepEqual(d.getIdValue(), v, 'Value shoud be ' + v);
	deepEqual(d.getValue(), v, 'Name shoud be "' + v + '"');
});
