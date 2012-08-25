Perfect Dropdown
================

This is the Perfect Dropdown - a jQuery based, extensible component

### Basic usages
    $(function(){
        new Dropdown({ target: 'myInputId' });
        new Dropdown({ target: $('#myInput'), items: [1,2,3], emptyText: 'Please select' });
    });

### Advanced usages
    $(function(){
        var myDD = new Dropdown({ target: $('#myInput'), url: 'data.json', fieldName: '{itemName} [{itemId}]', fieldId: 'itemId' });
		myDD.setValue(231, 'Item 23');
		
		var myMulti = new Multiselect({ target: $('#myInput'), url: 'data.json', value: [2,3,4], defaultText: 'Items' });
		var values = myMulti.getValue();
    });

Demo page available soon (download and open index.html (server required for less compilation))
