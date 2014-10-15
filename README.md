# Perfect Dropdown
[![NPM version](https://badge.fury.io/js/perfectdropdown.png)](http://badge.fury.io/js/perfectdropdown) [![Build Status](https://secure.travis-ci.org/tborychowski/perfectdropdown.png?branch=master)](https://travis-ci.org/tborychowski/perfectdropdown) [![Build Status](https://drone.io/github.com/tborychowski/perfectdropdown/status.png)](https://drone.io/github.com/tborychowski/perfectdropdown/latest) [![devDependency Status](https://david-dm.org/tborychowski/perfectdropdown/dev-status.png)](https://david-dm.org/tborychowski/perfectdropdown#info=devDependencies)


This is the Perfect Dropdown - a jQuery based, extensible component

[DEMO](http://htmlpreview.github.io/?https://raw.githubusercontent.com/tborychowski/perfectdropdown/master/index.html)

### Installation
    bower install perfect-dropdown

### Basic usage

```javascript
$(function(){
	new Dropdown({ target: 'myInputId' });
	new Dropdown({ target: $('#myInput'), items: [1,2,3], emptyText: 'Please select' });
});
```

### Advanced usage

```javascript
$(function(){
	var myDD = new Dropdown({ target: $('#myInput'), url: 'data.json', fieldName: '{itemName} [{itemId}]', fieldId: 'itemId' });
	myDD.setValue(231, 'Item 23');
	
	var myMulti = new Dropdown({ multiselect: true, target: $('#myInput'), url: 'data.json', value: [2,3,4], defaultText: 'Items' });
	var values = myMulti.getValue();
});
```

Demo page available soon (download and open index.html (server required for less compilation))
