/*global module: false, test: false, notEqual: false, equal: false, deepEqual: false */
var multiDefautlValue = [],
	multiDefaultCaption = 'No items',
	multipleItems = 'Multiple items',
	d = null, v = null,
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
	setup: function () {
		d = new window.XMultiSelect({ target: 'ddtarget', defaultValue: multiDefautlValue, defaultText: 'items' });
	},
	teardown: function () { d.destroy(); }
});


test('Init', function () {
	notEqual(d, null, 'Should not be null');
});


test('Default value', function () {
	deepEqual(d.getValue(), multiDefautlValue, 'Should have a default value');
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
	d.select(3);
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
	d.select(3);
	deepEqual(d.getValue(), v, 'Value shoud be ' + v);
	equal(d.getCaption(), objectList[2].name, 'Name shoud be "' + objectList[2].name + '"');
});




module('DropDown - Complex', {
	setup: function () {
		d = new window.XMultiSelect({
			target: 'ddtarget',
			defaultValue: multiDefautlValue,
			items: complexObjectList,
			defaultText: 'items',
			fieldId: 'itemId',
			fieldName: '{itemName} ({itemId} - {itemCode})'
		});
	},
	teardown: function () { d.destroy(); }
});


test('Set/Get/Reset value (list is an array of objects)', function () {
	var eV = '';

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
	d.select(3);
	deepEqual(d.getValue(), [v.itemId], 'Value shoud be ' + [v.itemId]);

	eV = v.itemName + ' (' + v.itemId + ' - ' + v.itemCode + ')';
	equal(d.getCaption(), eV, 'Name shoud be "' + eV + '"');
});