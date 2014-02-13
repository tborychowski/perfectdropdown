/**
 * DropDown v4.5 (2014-02-11)
 * @author Tom
 *
 * sample usage:
 * var dd1 = new DropDown({ target: 'myInputId' });
 * var dd2 = new DropDown({ target: $('.selector'), defaultText: 'Please select', items: [1,2,3], value: 3 });
 * var dd2 = new DropDown({
 *    target: $('.selector'),
 *    defaultText: 'Please select',
 *    items: [1,2,3],
 *    value: [1, 3],
 *    multiselect: true
 * });
 *
 */

window.DropDown = function (conf) {
	'use strict';

	// if user accidentally omits the new keyword, this will silently correct the problem
	if (!(this instanceof window.DropDown)) return new window.DropDown(conf);

	var

	_this = {},

	_el = {},										// dropdown wrapper
	_button = null,
	_label = null,
	_input = null,
	_menu = null,
	_originalEl = null,

	_focused = null,
	_selectedItem = null,
	_selectedItems = null,
	_highlightObj = null,

	_isExpanded = false,

	_isTouch = navigator.userAgent.match(/iPhone|iPod|iPad/ig),
	_conf = {
		id: null,									// id for the dropdown div
		name: '',									// input[text] name
		fieldName: 'name',							// this can be a string (fieldName); a pattern (eg. '{name}, {id}')
													// or a function (eg. fieldName: function () { return _name+'123'; }
		fieldId: 'id',
		defaultText: '',							// this is a 1st element (e.g. "Please select") of for multiple -
													// it becomes "All {defaultText}", e.g. "All Items", etc.
		emptyText: '',								// this is a default label for the dropdown when nothing is selected
		menuAlign: 'left',							// if menu is longer than button - this can make it align to the right
		cls: '',									// additional class for the dropdown (without menu)
		menuCls: '',								// additional class for the menu (menu is rendered to the body)
		iconCls: '',								// if present - an icon will be added to the dropdown button

		showSidebar: false,							// show menu sidebar
		multiselect: false,							// if true - render checkboxes, apply, etc
		action: null,								// e.g. action: function (v, rec) {},
													// if present - will show "Apply" button when selection changes

		value: null,								// pre-selected value
		defaultValue: null,							// default value - will be set after reset

		additionalOptions: null,					// array of additional checkboxes to show on the list

		items: [],
		url: null,									// if passed - items will be retrieved via ajax request
		params: {},									// ajax parameters
		isStatic: false,							// if true - don't change the button label (name)
		disabled: false								// init as disabled
	},






	/*** HELPERS ******************************************************************************************************/
	_adjustPosition = function () {
		if (!_isExpanded) return;

		// first: adjust sidebar width
		_adjustSidebar();

		var mnItems = _menu.find('.menu-items'),
			btnOff = _el.offset(),
			btn = { left: btnOff.left, top: btnOff.top, width: _el.width(), height: _el.height() },
			win = { height: $(window).innerHeight(), scrollTop: $(window).scrollTop() },
			menu = { left : btn.left, top : btn.top + btn.height, width : _menu.outerWidth(), minHeight: 100, margin: 20 };

		_menu.height('auto').removeClass('menu-top');
		mnItems.height('auto');
		menu.height = menu.autoHeight = _menu.height();

		if (_conf.menuAlign === 'right')  menu.left -= menu.width - btn.width;

		// if menu higher than screen - shorten it
		if (menu.top + menu.height + menu.margin > win.height + win.scrollTop) {
			menu.height = win.height - menu.top - menu.margin + win.scrollTop;
			if (menu.height < menu.minHeight) menu.height = menu.minHeight;
		}

		// move menu above the target
		if (menu.top + menu.height + menu.margin > win.height + win.scrollTop) {
			_menu.addClass('menu-top');
			menu.height = menu.autoHeight;

			// if menu higher than screen - shorten it
			if (menu.height > btn.top - win.scrollTop - menu.margin) {
				menu.height = btn.top - win.scrollTop - menu.margin;
				if (menu.height < menu.minHeight) menu.height = menu.minHeight;
			}
			menu.top = btn.top - menu.height - 2;
		}

		_menu.css({ left: menu.left, top: menu.top, height: menu.height });

		// subtract ul top+bottom padding
		menu.height -= parseInt(mnItems.css('paddingTop'), 10) + parseInt(mnItems.css('paddingBottom'), 10);
		if (_menu.find('.menu-filter').length) menu.height -=  _menu.find('.menu-filter').outerHeight();
		if (_menu.find('.menu-select').length) menu.height -= _menu.find('.menu-select').outerHeight();
		if (_menu.find('.menu-apply').length)  menu.height -= _menu.find('.menu-apply').outerHeight();

		mnItems.height(menu.height);
		_highlightObj = null;
	},


	_adjustSidebar = function () {
		var mn = _menu.find('.has-sidebar'), items, maxW = 20, i = 0, item = null, padL = 20;
		if (!mn.length) return;
		items = mn.find('.menu-item-aside').width('auto');
		for (; item = items[i++] ;) maxW = Math.max(maxW, $(item).outerWidth());
		padL = parseInt(items.closest('.menu-item').css('padding-left'), 10);
		_menu.find('.has-sidebar').css('padding-left', maxW);

		// include all asides
		items.outerWidth(maxW).css('margin-left', -(maxW + padL));
	},



	/**
	 * Highlights a menu item
	 *
	 * off {int}		[-10 | -1 | 0 | 1 | 10] highlight item that is +-x to the current one (0 = first; -1 = prev, 1=next, etc)
	 */
	_highlightItem = function (off) {
		/*jshint onevar: false */
		if (!_isExpanded) return _expand();

		if (!_highlightObj)
			// cache elements
			_highlightObj = {
				items : _menu.find('.menu-item:visible'),
				mn : _menu.find('.menu-items')[0]
			};
		var items = _highlightObj.items, mn = _highlightObj.mn, oT = null;

		off = off || 0;

		// no menu items
		if (!items || !items.length) return;
		if (!_focused || !_focused.length) _focused = items.first().addClass('focused');

		// current item, new item
		var cItem = _focused, cIdx = items.index(cItem[0]), nIdx = cIdx + off, nItem = items.eq(nIdx);

		if (off < 0) {
			// current item is first = focus filter
			if (cIdx === 0) nItem = null;
			else {
				// index is negative - highlight first item
				if (nIdx < 0) nItem = items.first();
				oT = nItem[0].offsetTop;
				if (mn.scrollTop <= oT) oT = null;
			}
		}
		else if (off > 0) {
			// out of index -> highlight last item
			if (!nItem || !nItem.length) nItem = items.last();
			oT = nItem[0].offsetTop + nItem[0].offsetHeight - mn.offsetHeight;
			if (mn.scrollTop >= oT) oT = null;
		}


		if (nItem && nItem.length) {
			// focus dropdown button
			_button.focus();
			// scroll element into view
			if (oT !== null) mn.scrollTop = oT;
			cItem.removeClass('focused');
			_focused = nItem.addClass('focused');
		}
		else {
			mn.scrollTop = 0;
			// focus filter input
			_menu.find('.menu-filter-text').focus();
		}
	},


	_mapName = function (name, rec) {
		// use defined function to "render" name
		if (typeof name === 'function') name = name.call(rec);
		else {
			// match template pattern, e.g. {fieldName}
			var match = /\{(\w+)\}/i.exec(name);
			if (match && match.length) {
				// loop through all patterns
				while (match && match.length > 1) {
					// replace all {fieldName} with item['fieldName']
					name = name.replace(match[0], rec[match[1]] || '');
					match = /\{(\w+)\}/i.exec(name);
				}
			}
			else if ($.type(rec) === 'array') name = rec[0];
			else if ($.type(rec) === 'object') name = rec[name];
			else name = rec;
		}
		return name;
	},



	/**
	 * Fuzzy search, e.g.:
	 * @param  {string} s  string to search, e.g.
	 *                     _fuzzy('a haystack with a needle', 'hay sucks');    // false
	 *                     _fuzzy('a haystack with a needle', 'sack hand');    // true
	 * @return {boolean}   true if found
	 */
	_fuzzy = function (str, s) {
		var hay = str.toLowerCase(), i = 0, n = -1, l;
		s = s.toLowerCase();
		for (; l = s[i++] ;) if (!~(n = hay.indexOf(l, n + 1))) return false;
		return true;
	},
	/*** HELPERS ******************************************************************************************************/






	/*** HANDLERS *****************************************************************************************************/
	/**
	 * On menu item click - action
	 * @param {Object} e		click event
	 */
	_action = function (e) {
		/*jshint onevar: false */

		if (_conf.disabled) return;
		if (_el.hasClass('dropdown-disabled')) return;

		var actionId, actionName, target;
		if (e.type === 'keydown') target = _focused;
		else target = $(e.target);
		if (!target) return;

		if (target.closest('.menu-item').length) target = target.closest('.menu-item');
		actionId = target.data('id');
		if (actionId === undefined) return;


		/*** SINGLE SELECT ACTION ***/

		if (_conf.multiselect !== true) {
			actionName = target.data('name');
			_collapse(e);
			_setValue(actionId, actionName);
			if (_conf.action) _conf.action.call(_conf.scope || _conf.action, actionId, _selectedItem, _this);
			return;
		}



		/*** MULTI SELECT ACTION ***/

		e.preventDefault();
		var noItemsSelected, checked, check = target.hasClass('menu-item-checked');


		if (actionId === '#apply') {
			// disable "Apply" when no items selected
			if (target.closest('.no-items-selected').length) return;
			_applySelected();
			_collapse(e);
			if (_conf.action) _conf.action.call(_conf.scope || _conf.action, _getValue(), _selectedItems, _this);
			return;
		}

		if (actionId === '#select-all') {								// if "select all" clicked
			noItemsSelected = check;									// no items selected - don't show "Apply" menu
			if (check) _selectNone();									// select none
			else _selectAll();											// or all
		}
		else {
			if (target.closest('.menu-select').length) {			// additional options
				target.toggleClass('menu-item-checked', !check);
			}

			else if (_menu.hasClass('all-items-selected')) {			// if "all items" is selected
				_unselectAll();											// unselect "all items" and "select" all items
				target.removeClass('menu-item-checked');				// except target
				checked = _menu.find('.menu-items .menu-item-checked');
				if (checked.length === 0) {
					_label.html('No ' + _conf.defaultText);
					_menu
						.removeClass('all-items-selected multiple-items-selected')
						.addClass('no-items-selected');
				}

				// no items selected - don't show "Apply" menu
				noItemsSelected = (checked.length === 0);
			}
			else {
				_menu.removeClass('all-items-selected no-items-selected').addClass('multiple-items-selected');
				target.toggleClass('menu-item-checked', !check);

				checked = _menu.find('.menu-items .menu-item-checked');
				if (checked.length === 1) _label.html(checked.data('name') || checked.data('id'));
				else if (checked.length === 0) {
					_label.html('No ' + _conf.defaultText);
					_menu.removeClass('all-items-selected multiple-items-selected').addClass('no-items-selected');
				}
				else _label.html('Multiple ' + _conf.defaultText);

				// no items selected - don't show "Apply" menu
				noItemsSelected = (checked.length === 0);
			}
		}

		// add "apply" menu
		if (!_menu.find('.menu-apply').length && !noItemsSelected && _conf.action) {
			_menu.append(_getApplyHtml());
			_adjustPosition();
			// scroll item into view
			var mn = target.closest('.menu-items'),
				mh = mn.innerHeight(),
				it = target.position().top,
				ih = target.outerHeight(true) + it;

			if (it <= 0) mn.scrollTop(-it);
			if (ih > mh) mn.scrollTop(ih - mh);
		}
		else if (!_conf.action) _applySelected();

		// if checked items == all items - select all
		if (_menu.find('.menu-items .menu-item').length === _menu.find('.menu-items .menu-item-checked').length) {
			_selectAll();
		}

	},


	_enable = function () {
		_el.removeClass('dropdown-disabled');
		_el.find('input').prop('disabled', false);
		_conf.disabled = false;
	},

	_disable = function () {
		_el.addClass('dropdown-disabled');
		_el.find('input').prop('disabled', true);
		_conf.disabled = true;
	},

	/**
	 * Document click handler - expand function adds it, collapse - removes; It hides the menu when clicked elsewhere
	 */
	_documentClick = function (e) {
		if (e.type === 'keyup') { if (!e.keyCode || e.keyCode !== 27) return; }
		var tar = $(e.target);
		if (tar.parents('.menu').length || tar.hasClass('menu')) return;
		_collapse();
	},
	/*** HANDLERS *****************************************************************************************************/






	/*** MULTISELECT **************************************************************************************************/
	/**
	 * Fake selects all items, selects "All items" and turns the whole menu into "all items selected" look
	 */
	_selectAll = function () {
		_menu.find('.menu-items .menu-item-checked,.menu-item-all.menu-item-checked').removeClass('menu-item-checked');
		_menu.find('.menu-item-all').addClass('menu-item-checked');
		_menu.removeClass('multiple-items-selected no-items-selected').addClass('all-items-selected');
		_label.html('All ' + _conf.defaultText);
	},

	/**
	 * Unselects "All items" and turns the whole menu into normal "multiple items selected" look
	 */
	_unselectAll = function () {
		_menu.find('.menu-item-all').removeClass('menu-item-checked');
		_menu.find('.menu-items .menu-item').addClass('menu-item-checked');
		_menu.removeClass('all-items-selected no-items-selected').addClass('multiple-items-selected');
		_label.html('Multiple ' + _conf.defaultText);
	},

	/**
	 * Unselect everything (except the just-checked element)
	 */
	_selectNone = function () {
		_menu.find('.menu-items .menu-item,.menu-item-all').removeClass('menu-item-checked');
		_menu.removeClass('all-items-selected multiple-items-selected').addClass('no-items-selected');
		_label.html('No ' + _conf.defaultText);
	},
	/*** MULTISELECT **************************************************************************************************/





	/*** EXPAND/COLLAPSE **********************************************************************************************/
	/**
	 * Hides/shows the menu
	 * @param {Object} e		click event object
	 */
	_toggle = function (e) { if (_isExpanded) _collapse(e); else _expand(); },


	_expand = function () {
		if (_conf.disabled) return;
		if (_isExpanded) return;
		_collapseAll();
		var ul = _menu.find('.menu-items'), lis = ul.find('.menu-item');

		// min menu width is the dropdown width
		_menu.css('min-width', _el.width());

		// load list
		if (!ul.length || !lis.length) {
			_menu.html('<ul><li class="loading">Please wait...</li></ul>');
			// use the data store provided in the config
			if (_conf.items && _conf.items.length) _populate(_conf.items);

			// load data from the given url
			else if (_conf.url && _conf.url.length) _loadList();
			else _noItems();
		}

		_el.addClass('expanded');
		_isExpanded = true;
		// show the menu
		_menu.show();
		_adjustPosition();
		setTimeout(function () {
			$(document).on('mousedown touchstart keyup', _documentClick);
			$(window).one('resize', _documentClick);
			if (!_isTouch) _menu.find('.menu-filter-text').focus();
		}, 10);
		if (!_isTouch) _menu.find('.menu-filter-text').focus();
		return _this;
	},



	_collapse = function (e) {
		if (!_isExpanded) return _this;
		if (e) e.stopPropagation();
		_menu.hide();
		_menu.find('.menu-apply').remove();
		// if (_conf.value) _setValue(_conf.value);
		_el.removeClass('expanded');
		_isExpanded = false;

		_clearFilter();
		_button.focus();
		$(document).off('mousedown DOMMouseScroll mousewheel keyup', _documentClick);
		$(window).off('resize', _documentClick);
		return _this;
	},


	/**
	 * STATIC. Collapses all opened dropdown menus.
	 */
	_collapseAll = function () {
		$('.dropdown.expanded').each(function (idx, el) {
			el = $(el).data('dropdown');
			if (el && el.collapse) el.collapse();
		});
	},
	/*** EXPAND/COLLAPSE **********************************************************************************************/





	/*** VALUE ********************************************************************************************************/
	/**
	 * Sets the value to 0 & defaultText
	 */
	_reset = function () {
		_selectedItem = _focused = null;
		_menu.find('.selected,.focused').removeClass('selected focused');
		if (_conf.defaultValue) _setValue(_conf.defaultValue);
		else if (_conf.multiselect === true) _setValue([], 'All ' + (_conf.defaultText || 'items'));
		else if (_conf.defaultText && _conf.defaultText.length) _setValue('', _conf.defaultText);
		else if (_conf.emptyText && _conf.emptyText.length && !_conf.isStatic) _setValue('', _conf.emptyText);
		else _setValue();
		//else _select(0);
		return _this;
	},

	_clearList = function () {
		_conf.items = [];
		_menu.find('.menu-items .menu-item').remove();
		return _this;
	},


	/**
	 * Sets the dropdown value and label
	 * @param id		id of the item on the dropdown list
	 * @param name		label for a dropdown button
	 */
	_setValue = function (id, name) {
		/*jshint eqeqeq: false */

		if (_conf.multiselect === true) return _setMultiSelectValue(id, name);

		_conf.value = id;
		if (id === undefined || id === null) id = '';

		_input.val(id);	// set input value

		_selectedItem = _focused = null;
		_menu.find('.selected,.focused').removeClass('selected focused');
		if (id !== '' && _conf.items && _conf.items.length) {							// list available -> select item
			_focused = _menu.find('.menu-item-id-' + _clrStr(id));
			if (_focused.length) {
				if (!_conf.isStatic) _focused.addClass('selected focused');				// select item
				for (var i = 0, item; item = _conf.items[i++] ;)
					if (id == (typeof item === 'object' ? item[_conf.fieldId] : item)) {
						_selectedItem = item;
						break;
					}
			}
			if (!name && _selectedItem) name = _mapName(_conf.fieldName, _selectedItem);
			else if (!name) name = id;
			if (!_conf.isStatic) _label.html(name);
		}
		else {
			// if no name, set to id (if id not null) or to defaultText or to ''
			name = name || (id === '' ? _conf.defaultText || '' : id);
			if (!_conf.isStatic) _label.html(name);										// no list -> set value "in blind"
		}
		return _this;
	},


	_setMultiSelectValue = function (ids, name) {
		/*jshint eqeqeq:false */

		if (ids === undefined || ids === null || ids === '') return;

		if ($.type(ids) !== 'array') ids = [ids];
		_conf.value = ids;

		if (!ids.length) _selectAll();
		else {
			var items = _menu.find('.menu-items .menu-item'), i = 0, il = ids.length, checked;

			if (il === 0) _selectNone();
			else {
				_label.html('Multiple ' + _conf.defaultText);
				_menu.removeClass('all-items-selected no-items-selected').addClass('multiple-items-selected');

				if (items.length) {
					// if checked items == all items -> select all
					if (items.length === il) _selectAll();
					else {
						_selectNone();
						for (; i < il; i++) items.filter('.menu-item-id-' + _clrStr(ids[i])).addClass('menu-item-checked');

						checked = items.filter('.menu-item-checked');
						if (checked.length === 1) _label.html(checked.data('name'));
						else if (checked.length === 0) _selectNone();
						else {
							_label.html('Multiple ' + _conf.defaultText);
							_menu.removeClass('all-items-selected no-items-selected').addClass('multiple-items-selected');
						}
					}
				}
				else {
					if (name && name.length) _label.html(name);
					else _label.html('Multiple ' + _conf.defaultText);
					_menu.removeClass('all-items-selected no-items-selected').addClass('multiple-items-selected');
				}
			}
		}
		return _this;
	},





	/**
	 * Sets the dropdown value and label by list item index
	 * @param idx		index of the item on the dropdown list
	 */
	_select = function (idx) {
		var item = _menu.find('.menu-items .menu-item').eq(idx || 0);
		if (item.length) _setValue(item.data('id'), item.data('name'));
		return _this;
	},


	/**
	 * Returns the selected (text) value
	 */
	_getValue = function () { return _conf.value; },

	/**
	 * Returns the selected option "id"
	 */
	_getIdValue = function () { return _input.val(); },

	_getCaption = function () { return _label.text(); },


	_getAdditionalOptions = function () {
		var vals = {}, items = _menu.find('.menu-select .menu-item-additional-option');
		items.each(function (i, item) {
			item = items.eq(i);
			vals[item.data('id')] = item.hasClass('menu-item-checked');
		});
		return vals;
	},

	/**
	 * Applies the selected elements as new value (array) for the field
	 */
	_applySelected = function () {
		var all = _menu.hasClass('all-items-selected'),
			items = _menu.find('.menu-items .menu-item-checked'),
			vals = [], i = 0, item;

		if (!all) for (; item = items[i++] ;) vals.push($(item).data('id'));
		_conf.value = vals;
	},
	/*** VALUE ********************************************************************************************************/







	/*** DATA *********************************************************************************************************/
	/**
	 * Load list from the server
	 */
	_loadList = function () {
		/*jshint unused: false */
		if (!_conf.url) return;
		$.ajax({ url: _conf.url, type: 'get', dataType: 'json', data: _conf.params })
		.fail(function () { _loadingError(); })
		.done(function (items) {
			if (!items || items.result === 'error') _loadingError();
			else _populate(items);
		});
	},


	_filter = function (key) {
		var filter = _menu.find('.menu-filter'),
			inp = filter.find('.menu-filter-text'),
			ul = _menu.find('.menu-items'),
			items = ul.find('.menu-item'),
			i = 0, item, itemStr;

		_menu.find('.no-results').remove();
		if (!filter.length) return;

		if (typeof key !== 'string') key = inp.val();
		inp.val(key);
		filter.toggleClass('menu-filter-dirty', !!key.length);
		for (; item = items[i++] ;) {
			item = $(item);
			itemStr = item.data('group') + item.data('name');
			if (_fuzzy(itemStr, key)) item.show();
			else item.hide();
		}

		// show headers for all visible items
		items.not('.menu-header').filter(':visible').each(function () { $(this).prevAll('.menu-header:first').show(); });

		if (_isExpanded && !items.filter(':visible').length) ul.append('<li class="no-results">No items found!</li>');

		inp.focus();
		_adjustPosition();
		_highlightObj = null;
	},


	_clearFilter = function () { _filter(''); },


	/**
	 * Populates the dropdown with a given list
	 * @param items			array of items
	 * @param id			name of the "ID" field in array
	 * @param name			name or template of the "name" field in array
	 *                      (template should be something like this: "{fieldName}, {fieldCode} ({anotherField})"
	 * @param emptyString	empty string to display when nothing is selected
	 */
	_populate = function (items) {
		/*jshint onevar: false */
		_menu.html('');
		if (!items || !items.length) _noItems();
		else {
			var i, item, ar = [],
				fName = _conf.fieldName,
				fId = _conf.fieldId,
				sidebarCls = (_conf.showSidebar ? ' has-sidebar' : '');

			// add filter to long lists
			if (items.length > 10) _menu.append(_filterHtml());

			if (_conf.multiselect === true) {
				// add "Select All" and additional options
				_menu.append('<ul class="menu-select' + sidebarCls + '">' +
					_getItemHtml(null, 'Select All') +
					_getAdditionalOptionsHtml() +
					'</ul>');
			}
			else {
				// add empty text as a 1st option
				if (_conf.defaultText && _conf.defaultText.length) ar.push(_getItemHtml('', _conf.defaultText));
			}


			// name is a function or a template
			if (typeof fName === 'function' || (typeof fName === 'string' && fName.indexOf('{') > -1)) {
				for (i = 0; item = items[i++];) ar.push(_getItemHtml(item[fId], _mapName(fName, item), item));
			}

			// using 1D array
			else if (typeof items[0] !== 'object') for (i = 0; item = items[i++];) ar.push(_getItemHtml(item, item, item));

			// name is a string
			else for (i = 0; item = items[i++];) ar.push(_getItemHtml(item[fId], item[fName], item));

			// replace the list
			if (ar.length) _menu.append('<ul class="menu-items' + sidebarCls + '">' + ar.join('') + '</ul>');

			// store items
			_conf.items = items || [];
		}
		if (!_conf.items || !_conf.items.length) return _this;

		var val = _getIdValue() || _getValue();
		if (typeof val !== 'undefined' && val !== null  && val !== '' && val !== []) _setValue(val);
		else if (_conf.defaultValue) _setValue(_conf.defaultValue);
		else if (_conf.emptyText && _conf.emptyText.length && !_conf.isStatic) _label.html(_conf.emptyText);
		else _reset();

		_adjustPosition();

		if (!_isTouch) _menu.find('.menu-filter-text').focus();
		_highlightObj = null;
		return _this;
	},
	/*** DATA *********************************************************************************************************/







	/*** HTML *********************************************************************************************************/
	_noItems = function () { _menu.html('<span class="loading-error">No items</span>'); },
	_loadingError = function () { _menu.html('<span class="loading-error">Loading error</span>'); },

	_filterHtml = function () {
		var sidebarCls = (_conf.showSidebar ? ' has-sidebar' : ''),
			_html = '<div class="menu-filter' + sidebarCls + '"><div class="menu-filter-inner">';
		if (_conf.showSidebar) _html += '<span class="menu-item-aside">Search</span>';
		_html += '<span class="search-icon"></span>';
		_html += '<input type="text" class="menu-filter-text"/>';
		_html += '</div></div>';
		return _html;
	},

	/**
	 * HTML for the dropdown
	 */
	_getHtml = function (conf) {
		var hasIcon = (conf.iconCls && conf.iconCls.length), _html = '';
		_html = '<a class="button' + (hasIcon ? ' icon-button' : '') + '" href="#">';
		_html += '<span class="expander"></span>';
		if (hasIcon) _html += '<span class="icon ' + conf.iconCls + '"></span>';
		_html += '<input type="hidden" name="' + conf.name + '" />';
		_html += '<span class="text">' + (conf.emptyText.length ? conf.emptyText : '') + '</span>';
		_html += '</a>';
		if (conf.showSidebar === true) _html += '<div class="menu menu-with-sidebar"></div>';
		else _html += '<div class="menu"></div>';

		return _html;
	},


	/**
	 * Returns a HTML for a single item
	 * @param  {int/string} id	item ID
	 * @param  {string} name	item name (can be "generated" from function or template)
	 * @param  {object} item	item object
	 * @return {string}			HTML markup
	 */
	_getItemHtml = function (id, name, item) {
		var _html = '', sidebar = '', cls = [], group = '';

		if (typeof item === 'object') {
			if (item.cls && item.cls.length) cls.push(item.cls);
			if (item.isHeader === true) cls.push('menu-header');
			if (item.group) {
				group = item.group;
				item.sidebarText = group;
			}
			if (item.sidebarText || item.sidebarCls) {
				sidebar = '<span class="menu-item-aside ' + (item.sidebarCls || '') + '">' + (item.sidebarText || '') + '</span>';
			}
		}
		else item = {};

		cls.push(name === _conf.defaultText ? 'menu-item-empty-text' : 'menu-item-id-' + _clrStr(id));

		if ((_conf.multiselect === true && item.checked !== false) || item.checked === true) cls.push('menu-item-checked');

		if (_conf.multiselect === true && id === null) { cls.push('menu-item-all'); id = '#select-all'; }
		_html += '<li class="menu-item ' + cls.join(' ') + '" data-id="' + id + '" data-name="' + name + '" ' +
				'data-group="' + group + '">';

		_html += sidebar;
		if (_conf.multiselect === true) _html += '<span class="menu-item-tick"></span>';
		_html += '<span class="menu-item-name">' + name + '</span>';
		_html += '</li>';
		return _html;
	},


	_getAdditionalOptionsHtml = function () {
		if (!_conf.additionalOptions || !_conf.additionalOptions.length) return '';
		var i = 0, item, html = [];
		for (; item = _conf.additionalOptions[i++] ;) {
			item.cls = 'menu-item-additional-option';
			html.push(_getItemHtml(item.id, item.name, item));
		}
		return html.join('');
	},

	_getApplyHtml = function () {
		return '<ul class="menu-apply' + (_conf.showSidebar ? ' has-sidebar' : '') + '">' +
			'<li class="menu-item" data-id="#apply"><span class="menu-item-tick"></span>' +
			'<span class="menu-item-name">Apply</span></li></ul>';
	},

	/**
	 * Make string css-class usable, i.e. remove spaces, etc.
	 * @param  {String} str  String to clear
	 * @return {String}      cleared string
	 */
	_clrStr = function (str) { return ('' + str).replace(/[^\w\d\-]/g, ''); },
	/*** HTML *********************************************************************************************************/









	/*** INIT *********************************************************************************************************/
	/**
	 * Initialize DropDown components
	 */
	_initComponent = function () {
		/*jshint onevar: false */

		if (typeof _conf.target === 'string') _conf.target = '#' + _conf.target;
		_el = $(_conf.target);

		// store for destroy()
		_originalEl = _el.clone();
		var inp, opts = [];

		if (_el.is('input')) {
			inp = _el[0];
			_conf.name = inp.name;
			if (!_conf.id && inp.id) _conf.id = inp.id;
			if (!_conf.value && _el.val()) _conf.value = _el.val();
			_el = $('<div>').replaceAll(_el);
		}
		else if (_el.is('select')) {
			inp = _el[0];
			_conf.name = inp.name;
			_conf.value = inp.value || null;
			if (!_conf.id && inp.id) _conf.id = inp.id;
			opts = [];
			_el.find('option').each(function () { opts.push({ id: this.value, name: this.innerHTML }); });
			_conf.items = opts;
			_el = $('<div>').replaceAll(_el);
		}
		_el.addClass('dropdown ' + _conf.cls).html(_getHtml(_conf));

		_button = _el.find('.button');
		_menu = _el.find('.menu').appendTo('body');			// move menu to body, so it's on top of everything
		_label = _el.find('.text');
		_input = _el.find('input[type=hidden]').val('');	// empty the value auto added from cache


		if (_conf.multiselect === true) {
			_conf.isStatic = true;
			_el.addClass('static');
			_menu.addClass('multiselect');
			if (_conf.value && _conf.value.length && typeof _conf.value === 'string') {
				var arr = _conf.value.split(',');
				if (arr.length) _setValue(arr);
			}
		}


		if (typeof _conf.id !== 'undefined') _el.attr('id', _conf.id);
		if (_conf.menuCls) _menu.addClass(_conf.menuCls);
		if (_conf.disabled) _disable();

		// use the data store provided in the config
		if (_conf.items && _conf.items.length) _populate(_conf.items);
		if (_conf.defaultText && _conf.defaultText.length && !_conf.isStatic) _label.html(_conf.defaultText);
		if (_conf.emptyText && _conf.emptyText.length) _label.html(_conf.emptyText);

        if (_conf.defaultValue) _setValue(_conf.defaultValue);

		if (_conf.value !== undefined && _conf.value !== null) {
			var fid = _conf.value[_conf.fieldId], fin = _conf.value[_conf.fieldName];
			// set single value, e.g. {id:1, name:'item1'}
			if ($.type(_conf.value) === 'object' && fid && fin) _setValue(fid, fin);
			// set mixed value (single, multiple)
			else _setValue(_conf.value);
		}
		else {
			// if no list - put correct label
			if (_conf.url || !_conf.items) _reset();
		}
	},


	/**
	 * Initialize DropDown events
	 */
	_initEvents = function () {
		_el.on({
			mousedown: function (e) { _toggle(e); },
			// don't hash the addressbar
			click: function () { return false; },
			focus: function () { _button.addClass('focused'); },
			blur: function () { _button.removeClass('focused'); },
			keydown: function (e) {
				switch (e.keyCode) {
				case 32 : // space
				case 13 : // enter
					_action(e);
					break;

				case  9 : // tab
					_collapse();
					break;

				case 27 : // esc
					_collapse(e);
					break;

				case 38 : // up arrow
					e.preventDefault();
					_highlightItem(-1);
					break;

				case 40 : // down arrow
					e.preventDefault();
					_highlightItem(1);
					break;

				case 33 : // page up
					e.preventDefault();
					_highlightItem(-10);
					break;

				case 34 : // page down
					e.preventDefault();
					_highlightItem(10);
					break;
				}
			}
		}, '.button');


		_menu
			.on({
				// allow scrolling with mousedown
				mousedown: function () { return false; },
				mouseup: function (e) { _action(e); return false; },
				click: function () { if (_isTouch) setTimeout(function () { $(window).scrollTop(200); }, 0); }
			}, 'ul')

			// menu filter
			.on('focus', '.menu-filter-text', function () {
				_focused = null;
				_menu.find('.focused').removeClass('focused');
			})

			// if down key - select first item on list
			.on('keydown', '.menu-filter-text', function (e) {
				// if Esc and value empty - close menu
				if (e.keyCode === 27 && !this.value.length) _collapse();

				// down arrow or page down
				else if (e.keyCode === 40 || e.keyCode === 34) {
					e.preventDefault();
					_highlightItem();
				}
			})
			.on('keyup change', '.menu-filter-text', function (e) {								// menu filter
				if (e.keyCode === 27 && this.value.length) this.value = '';						// first Esc - clears filter
				_filter(this.value);
			})
			.on('click', '.menu-filter .search-icon', _clearFilter)								// menu filter clear-icon

			.on('mouseover', 'li', function () {
				_menu.find('.focused').removeClass('focused');
				_focused = $(this).addClass('focused');
			});

		_el.one('destroyed', _destroy);
	},



	/**
	 * Clean up - remove menu when the dropdown is removed from the DOM
	 * requires jquery plugin "destroyed" for this function to be called automatically
	 */
	_destroy = function () {
		if (!_el || !_el.length) return;
		_collapse();
		if (_menu && _menu.length) _menu.remove();
		if (_originalEl && _originalEl.length) {
			if (!_conf.isStatic && (_originalEl.is('input') || _originalEl.is('select'))) _originalEl.val(_getIdValue());
			_originalEl.insertAfter(_el);
		}
		_el.remove();
	},


	_init = function (conf) {
		var oldDD;
		if (typeof conf.target === 'string') {
			oldDD = $('#' + conf.target);
			if (oldDD.is('.dropdown')) oldDD.data('dropdown').destroy();
		}
		else if (typeof conf.target === 'object' && conf.target.hasClass('dropdown')) {
			conf.target.data('dropdown').destroy();
		}

		_conf = $.extend(true, {}, _conf, conf);
		_initComponent();
		_initEvents();
		_el.data('dropdown', _this);

		return _this;
	};
	/*** INIT *********************************************************************************************************/

	_this = {
		getEl: function () { return _el; },
		label: function () { return _label; },
		button: function () { return _button; },
		menu: function () { return _menu; },

		getItems: function () { return _conf.items; },
		setItems: _populate,
		getSelectedItem: function () { return _selectedItem; },

		/**
		 * @deprecated (for backwards compatibility)
		 */
		replaceList: _populate,

		getConfig: function () { return _conf; },
		setConfig: function (cfg) { $.extend(_conf, cfg || {}); return _this; },

		getValue: _getValue,
		setValue: _setValue,

		getIdValue: _getIdValue,
		getCaption: _getCaption,

		getAdditionalOptions: _getAdditionalOptions,

		select: _select,
		reset: _reset,
		clearList: _clearList,

		show: function () { _el.show(); return _this; },
		hide: function () { _el.hide(); return _this; },

		isEnabled: function () { return !_el.hasClass('dropdown-disabled'); },
		enable: _enable,
		disable: _disable,

		isExpanded: function () { return _isExpanded; },
		expand: _expand,
		collapse: _collapse,

		destroy: _destroy
	};

	return _init(conf);
};
