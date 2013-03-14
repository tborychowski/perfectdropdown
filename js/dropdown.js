/**
 * DropDown component v3.0 (2013-03-13)
 * @author Tom
 *
 * sample usage:
 * var dd1 = new DropDown({ target: 'myInputId' });
 * var dd2 = new DropDown({ target: $('.selector'), defaultText: 'Please select', items: [1,2,3], value: 3 });
 *
 */

window.XDropDown = function (conf) {
	'use strict';

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
		action: function (v, rec) {},
		value: null,
		defaultValue: null,
		items: [],
		isStatic: false,							// if true - don't change the button label (name)
		disabled: false								// init as disabled
	},






	/*** HELPERS ****************************************************************************************************************/
	_adjustPosition = function () {
		if (!_isExpanded) return;

		// first: adjust sidebar width
		_adjustSidebar();
		_menu.height('auto');
		_menu.find('.menu-items').height('auto');
		var off = _el.offset(),
			elH = _el.height(), elW = _el.width(),
			menuH = _menu.height(), menuW = _menu.outerWidth(),
			winH = $(window).innerHeight(), mx = off.left, my = off.top + elH, menuMinH = 100,
			mnItems = _menu.find('.menu-items');

		if (_conf.menuAlign === 'right')  mx -= menuW - elW;

		// if menu higher than screen - shorten it
		if (menuH > menuMinH && my + menuH + 20 > winH) {
			menuH = winH - my - 20;
			menuH = menuH > menuMinH ? menuH : menuMinH;
			_menu.height(menuH);
		}

		// move menu above the target
		if (my + menuH > winH) {
			_menu.addClass('menu-top');
			_menu.height('auto');
			_menu.find('.menu-items').height('auto');
			menuH = _menu.height();
			if (menuH > winH - elH - 20) { menuH = winH - elH - 20; _menu.height(menuH); }
			if (menuH + 20 > off.top) {
				menuH = off.top - 20;
				menuH = menuH > menuMinH ? menuH : menuMinH;
				_menu.height(menuH);
			}
			my = off.top - menuH - 2;
		}
		else _menu.removeClass('menu-top');

		_menu.css({ left: mx, top: my });

		// subtract ul top+bottom padding
		menuH -= parseInt(mnItems.css('paddingTop'), 10) + parseInt(mnItems.css('paddingBottom'), 10);
		if (_menu.find('.menu-filter').length) menuH -=  _menu.find('.menu-filter').outerHeight();
		_menu.find('.menu-items').height(menuH);
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
		//jshint onevar: false
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
		return _decodeEntities(name);
	},


	_decodeEntities = function (str) {
		if (!str) return '';
		if (('' + str).indexOf('&') === -1) return str;
		var d = document.createElement('div');
		d.innerHTML = str;
		return d.innerText || d.textContent;
	},


	/**
	 * Returns true if all words in "keyword" are found within the "itemStr" string
	 */
	_filterMatch = function (itemStr, keyword) {
		var words = keyword.split(' '), i = 0, w, reg;
		for (; w = words[i++] ;) {
			reg = new RegExp(w, 'ig');
			if (reg.test(itemStr) === false) return false;
			itemStr = itemStr.replace(reg, '');
		}
		return true;
	},
	/*** HELPERS ****************************************************************************************************************/






	/*** HANDLERS ***************************************************************************************************************/
	/**
	 * On menu item click - action
	 * @param {Object} e		click event
	 */
	_action = function (e) {
		if (_conf.disabled) return;
		var actionId, actionName, target;
		if (e.type === 'keydown') target = _focused;
		else target = $(e.target);
		if (!target) return;
		if (target.parent('.menu-item').length) target = target.parent('.menu-item');
		actionId = target.attr('data-idval');
		actionName = target.attr('data-val');
		if (actionId === undefined) return;
		_collapse(e);
		_setValue(actionId, actionName);
		if (_conf.action) _conf.action.call(_this, actionId, _selectedItem);
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
	/*** HANDLERS ***************************************************************************************************************/






	/*** EXPAND/COLLAPSE ********************************************************************************************************/
	/**
	 * Hides/shows the menu
	 * @param {Object} e		click event object
	 */
	_toggle = function (e) { if (_isExpanded) _collapse(e); else _expand(); },


	_expand = function () {
		if (_conf.disabled) return;
		if (_isExpanded) return;
		_collapseAll();
		var self = this, ul = _menu.find('.menu-items'), lis = ul.find('.menu-item');

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

		// show the menu
		_menu.show();
		_el.addClass('expanded');
		_isExpanded = true;
		_adjustPosition();
		setTimeout(function () {
			$(document).on('mousedown touchstart keyup', $.proxy(_documentClick, self));
			$(window).one('resize', $.proxy(_documentClick, self));
			if (!_isTouch) _menu.find('.menu-filter-text').focus();
		}, 10);
		if (!_isTouch) _menu.find('.menu-filter-text').focus();
	},



	_collapse = function (e) {
		if (!_isExpanded) return;
		if (e) e.stopPropagation();
		_menu.hide();
		_el.removeClass('expanded');
		_isExpanded = false;

		_clearFilter();
		_button.focus();
		$(document).off('mousedown DOMMouseScroll mousewheel keyup', _documentClick);
		$(window).off('resize', _documentClick);
	},


	/**
	 * STATIC. Collapses all opened dropdown menus.
	 */
	_collapseAll = function () { $('.dropdown.expanded').each(function (idx, el) {$(el).data('dropdown').collapse(); }); },
	/*** EXPAND/COLLAPSE ********************************************************************************************************/





	/*** VALUE ******************************************************************************************************************/
	/**
	 * Sets the value to 0 & defaultText
	 */
	_reset = function () {
		_selectedItem = _focused = null;
		_menu.find('.selected,.focused').removeClass('selected focused');
		if (_conf.defaultValue) _setValue(_conf.defaultValue);
		else if (_conf.defaultText && _conf.defaultText.length) _setValue('', _conf.defaultText);
		else if (_conf.emptyText && _conf.emptyText.length && !_conf.isStatic) _setValue('', _conf.emptyText);
		else _select(0);
	},


	/**
	 * Sets the dropdown value and label
	 * @param id		id of the item on the dropdown list
	 * @param name		label for a dropdown button
	 */
	_setValue = function (id, name) {
		//jshint eqeqeq: false
		if (id === undefined) id = '';

		// set input value
		_input.val(id);
		_selectedItem = _focused = null;
		_menu.find('.selected,.focused').removeClass('selected focused');
		if (id !== '' && _conf.items && _conf.items.length) {									// list available -> select item
			_focused = _menu.find('.menu-item-id-' + id);
			if (_focused.length) {
				if (!_conf.isStatic) _focused.addClass('selected focused');			// select item
				for (var i = 0, item; item = _conf.items[i++] ;)
					if (id == (typeof item === 'object' ? item[_conf.fieldId] : item)) {
						_selectedItem = item;
						break;
					}
			}
			if (!name && _selectedItem) name = _mapName(_conf.fieldName, _selectedItem);
			else if (!name) name = id;
			if (!_conf.isStatic) {
				name = ('' + name).replace(/&/g, '&amp;');									// encode all & to &amp; for IE
				_label.html(name);
			}
		}
		else {
			// if no name, set to id (if id not null) or to defaultText or to ''
			name = name || (id === '' ? _conf.defaultText || '' : id);
			if (!_conf.isStatic) {														// no list -> set value "in blind"
				name = ('' + name).replace(/&/g, '&amp;');									// encode all & to &amp; for IE
				_label.html(name);
			}
		}
		return this;
	},



	/**
	 * Sets the dropdown value and label by list item index
	 * @param idx		index of the item on the dropdown list
	 */
	_select = function (idx) {
		var item = _menu.find('.menu-item').eq(idx || 0);
		if (item.length) _setValue(item.attr('data-idval'), item.attr('data-val'));
	},


	/**
	 * Returns the selected (text) value
	 */
	_getValue = function () { return _label.text(); },

	/**
	 * Returns the selected option "id"
	 */
	_getIdValue = function () { return _input.val(); },
	/*** VALUE ******************************************************************************************************************/







	/*** DATA *******************************************************************************************************************/
	/**
	 * Load list from the server
	 */
	_loadList = function () {
		//jshint unused: false
		if (!_conf.url) return;
		$.ajax({ url: _conf.url, type: 'post', context: this, dataType: 'json', data: _conf.params })
		.fail(function (xhr, status, err) { _loadingError(); })
		.done(function (items, status, xhr) {
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
			itemStr = item.attr('data-group') + item.attr('data-val');
			if (_filterMatch(itemStr, key)) item.show();
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
		//jshint onevar: false
		_menu.html('');
		if (!items || !items.length) _noItems();
		else {
			var i, item, ar = [], fName = _conf.fieldName, fId = _conf.fieldId,
				sidebarCls = (_conf.showSidebar ? ' has-sidebar' : '');
			// add filter to long lists
			if (items.length > 10) _menu.append(_filterHtml());
			// add empty text as a 1st option
			if (_conf.defaultText && _conf.defaultText.length) ar.push(_getItemHtml('', _conf.defaultText));

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
		_adjustPosition();

		var val = _getIdValue();
		if (_conf.defaultValue) _setValue(_conf.defaultValue);
		else if (val !== undefined && val !== '') _setValue(val);
		else if (_conf.emptyText && _conf.emptyText.length && !_conf.isStatic) _label.html(_conf.emptyText);
		else _select(0);
		if (!_isTouch) _menu.find('.menu-filter-text').focus();
		_highlightObj = null;
	},
	/*** DATA *******************************************************************************************************************/







	/*** HTML *******************************************************************************************************************/
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
		cls.push(name === _conf.defaultText ? 'menu-item-empty-text' : 'menu-item-id-' + id);

		_html += '<li class="menu-item ' + cls.join(' ') + '" ' +
			'data-idval="' + id + '" data-val="' + name + '" data-group="' + group + '">';
		_html += sidebar;
		_html += '<span class="menu-item-name">' + name + '</span>';
		_html += '</li>';
		return _html;
	},
	/*** HTML *******************************************************************************************************************/









	/*** INIT *******************************************************************************************************************/
	/**
	 * Initialize DropDown components
	 */
	_initComponent = function () {
		//jshint onevar: false

		if (typeof _conf.target === 'string') _conf.target = '#' + _conf.target;
		_el = $(_conf.target);

		// store for destroy()
		_originalEl = _el.clone();

		if (_el.is('input')) {
			var inp = _el[0];
			_conf.name = inp.name;
			if (!_conf.id && inp.id) _conf.id = inp.id;
			if (!_conf.value && _el.val()) _conf.value = _el.val();
			_el = $('<div>').replaceAll(_el);
		}
		_el.addClass('dropdown ' + _conf.cls).html(_getHtml(_conf));

		_button = _el.find('.button');
		_menu = _el.find('.menu').appendTo('body');			// move menu to body, so it's on top of everything
		_label = _el.find('.text');
		_input = _el.find('input[type=hidden]').val('');	// empty the value auto added from cache


		if (typeof _conf.id !== 'undefined') _el.attr('id', _conf.id);
		if (_conf.menuCls) _menu.addClass(_conf.menuCls);
		if (_conf.disabled) _disable();
		if (_conf.defaultText && _conf.defaultText.length && !_conf.isStatic) _label.html(_conf.defaultText);

		// use the data store provided in the config
		if (_conf.items.length) _populate(_conf.items);
		if (_conf.defaultValue) _setValue(_conf.defaultValue);
		if (_conf.value !== undefined && _conf.value !== null) {
			var c = _conf,
				v = c.value,
				fid = v[c.fieldId],
				fin = v[c.fieldName];

			// set single value, e.g. {id:1, name:'item1'}
			if ($.type(v) === 'object' && fid && fin) _setValue(fid, fin);
			// set mixed value (single, multiple)
			else _setValue(v);
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
		//jshint white: false

		_el.on({
			mousedown: function (e) { _toggle(e); },
			// don't hash the addressbar
			click: function () { return false; },
			focus: function () { _button.addClass('focused'); },
			blur: function () { _button.removeClass('focused'); },
			keydown: function (e) {																// launch action on enter
				switch (e.keyCode) {
					case 32 :																	// space
					case 13 : _action(e); break;												// enter

					case 27 : 																	// esc
					case  9 : _collapse(e); break;												// tab

					case 38 : e.preventDefault(); _highlightItem(-1); break;					// down arrow
					case 40 : e.preventDefault(); _highlightItem(1); break;						// down arrow
					case 33 : e.preventDefault(); _highlightItem(-10); break;					// page up
					case 34 : e.preventDefault(); _highlightItem(10); break;					// page down
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
			.on('keyup', '.menu-filter-text', function (e) {									// menu filter
				if (e.keyCode === 27 && this.value.length) this.value = '';						// first Esc - clears filter
				_filter(this.value);
			})
			.on('click', '.menu-filter .search-icon', $.proxy(_clearFilter, this))				// menu filter clear-icon

			.on('mouseover', 'li', function () {
				_menu.find('.focused').removeClass('focused');
				_focused = $(this).addClass('focused');
			});

		_el.one('destroyed', $.proxy(_destroy, this));
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
			if (!_conf.isStatic && _originalEl.is('input')) _originalEl.val(_getIdValue());
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
	/*** INIT *******************************************************************************************************************/




	Object.defineProperties(_this, {
		el: {
			enumerable: true,
			get: function () { return _el; }
		},
		items: { enumerable: true,
			get: function () { return _conf.items; },
			set: _populate
		},
		config: { enumerable: true,
			get: function () { return _conf; },
			set: function (cfg) { $.extend(_conf, cfg || {}); }
		},
		value: { enumerable: true,
			get: _getValue,
			set: _setValue
		},
		idValue: { enumerable: true,
			get: _getIdValue,
			set: _setValue
		},
		select: { enumerable: true, value: _select },

		reset: { enumerable: true, value: _reset },

		hidden: { enumerable: true,
			get: function () { return _el.is(':visible'); },
			set: function (v) { if (v === true) _el.hide(); else _el.show(); }
		},
		show: { enumerable: true, value: function () { _el.show(); }},
		hide: { enumerable: true, value: function () { _el.hide(); }},

		enabled: {
			enumerable: true,
			get: function () { return _el.hasClass('dropdown-disabled'); },
			set: function (v) {
				v = (v === true);
				_el.toggleClass('dropdown-disabled', v);
				_el.find('input').prop('disabled', !v);
				_conf.disabled = !v;
			}
		},

		destroy: { enumerable: true, value: _destroy }
	});

	return _init(conf);
};
