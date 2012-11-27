/**
 * DropDown component v2.1 (2012-08-25)
 * @author Tom
 *
 * sample usage:
 * var dd1 = new DropDown({ target: 'myInputId' });
 * var dd2 = new DropDown({ target: $('.selector'), defaultText: 'Please select', items: [1,2,3], value: 3 });
 *
 */

var DropDown = Class.extend({

	init : function (conf) {
		if (typeof conf.target === 'string') {
			var oldDD = $('#' + conf.target);
			if (oldDD.is('.dropdown')) oldDD.data('dropdown').destroy();
		}
		else if (typeof conf.target === 'object' && conf.target.hasClass('dropdown')) {
			conf.target.data('dropdown').destroy();
		}

		var defaults = {
				id: null,																										// id for the dropdown div
				name: '',																										// input[text] name
				fieldName: 'name',																								// this can be a string (fieldName); a pattern (eg. '{name}, {id}') or a function (eg. fieldName: function () { return this.name+'123'; }
				fieldId: 'id',
				defaultText: '',																								// this is a 1st element (e.g. "Please select") of for multiple - it becomes "All {defaultText}", e.g. "All Items", etc.
				emptyText: '',																									// this is a default label for the dropdown when nothing is selected
				menuAlign: 'left',																								// if menu is longer than button - this can make it align to the right
				cls: '',																										// additional class for the dropdown (without menu)
				menuCls: '',																									// additional class for the menu (menu is rendered to the body)
				iconCls: '',																									// if present - an icon will be added to the dropdown button
				action: function (v, rec, el) {},
				scope: null,
				value: null,
				defaultValue: null,
				items: [],
				isStatic: false,																								// if true - don't change the button label (name)
				disabled: false																									// init as disabled
			};
		this.conf = $.extend(true, {}, defaults, conf);
		this.isTouch = navigator.userAgent.match(/iPhone|iPod|iPad/ig);
		this.initComponent();
		this.initEvents();
		this.el.data('dropdown', this);
	},

	/**
	 * Initialize DropDown components
	 */
	initComponent : function () {
		if (typeof this.conf.target === 'string') this.conf.target = '#' + this.conf.target;
		this.el = $(this.conf.target);
		this.originalEl = this.el.clone();																						// store for destroy()
		if (this.el.is('input')) {
			var inp = this.el[0];
			this.conf.name = inp.name;
			if (!this.conf.id && inp.id) this.conf.id = inp.id;
			if (!this.conf.value && this.el.val()) this.conf.value = this.el.val();
			this.el = $('<div>').replaceAll(this.el);
		}
		this.el.addClass('dropdown ' + this.conf.cls).html(this.getHtml(this.conf));
		this.button = this.el.find('.button');
		this.menu = this.el.find('.menu').appendTo('body');																		// move menu to body, so it does show on top of everything
		this.label = this.el.find('.text');
		this.input = this.el.find('input[type=hidden]').val('');																// empty the value auto added from cache
		this.items = this.conf.items;

		this.sidebarCls = (this.conf.showSidebar ? ' has-sidebar' : '');

		if (this.conf.id) this.el.attr('id', this.conf.id);
		if (this.conf.menuCls) this.menu.addClass(this.conf.menuCls);
		if (this.conf.disabled) this.disable();
		if (this.conf.defaultText && this.conf.defaultText.length && !this.conf.isStatic) this.label.html(this.conf.defaultText);
		if (this.conf.items && this.conf.items.length) this.replaceList(this.conf.items);										// use the data store provided in the config
		if (this.conf.defaultValue) this.setValue(this.conf.defaultValue);
		if (this.conf.value !== undefined && this.conf.value !== null) {
			var c = this.conf, v = c.value, fid = v[c.fieldId], fin = v[c.fieldName];
			if ($.type(v) === 'object' && fid && fin) this.setValue(fid, fin);													// set single value, e.g. {id:1, name:'item1'}
			else this.setValue(v);																								// set mixed value (single, multiple)
		}
		else {
			if (this.conf.url || !this.conf.items) this.reset();																// if no list - put correct label
		}
	},

	/**
	 * Initialize DropDown events
	 */
	initEvents : function () {																									/*jshint white: false */
		var self = this;
		this.el.on({
				mousedown: function (e) { self.toggle.call(self, e); },
				click: function (e) { e.stopPropagation(); e.preventDefault(); return false; },									// don't hash the addressbar
				focus: function (e) { self.button.addClass('focused'); },
				blur: function (e) { self.button.removeClass('focused'); },
				keydown: function (e) {																							// launch action on enter
					switch (e.keyCode) {
						case 32 :																								// space
						case 13 : self.action.call(self, e); break;																// enter
						case 27 : self.collapse.call(self, e); break;															// esc
						case  9 : self.collapse.call(self, e); break;															// tab
						case 38 : e.preventDefault(); self.highlightItem.call(self, -1); break;									// down arrow
						case 40 : e.preventDefault(); self.highlightItem.call(self, 1); break;									// down arrow
						case 33 : e.preventDefault(); self.highlightItem.call(self, -10); break;								// page up
						case 34 : e.preventDefault(); self.highlightItem.call(self, 10); break;									// page down
					}
				}
			}, '.button');


		this.menu
			.on({
				mousedown: function (e) { return false; },																		// allow scrolling with mousedown
				mouseup: function (e) { self.action.call(self, e); return false; },
				click: function (e) { if (self.isTouch) setTimeout(function () { $(window).scrollTop(200); }, 0); }
			}, 'ul')

			.on('focus', '.menu-filter-text', function (e) {																	// menu filter
				self.focused = null;
				self.menu.find('.focused').removeClass('focused');
			})
			.on('keydown', '.menu-filter-text', function (e) {																	// if down key - select first item on list
				if (e.keyCode === 27) if (!this.value.length) self.collapse.call(self);											// if Esc and value is empty - close menu
				if (e.keyCode === 40) { e.preventDefault(); self.highlightItem.call(self); }									// down arrow
				if (e.keyCode === 34) { e.preventDefault(); self.highlightItem.call(self); }									// page down

			})
			.on('keyup', '.menu-filter-text', function (e) {																	// menu filter
				if (e.keyCode === 27 && this.value.length) this.value = '';														// first Esc - clears the filter
				self.filter.call(self, this.value);
			})
			.on('click', '.menu-filter .search-icon', $.proxy(this.clearFilter, this))											// menu filter clear-icon

			.on('mouseover', 'li', function (e) {
				self.menu.find('.focused').removeClass('focused');
				self.focused = $(this).addClass('focused');
			});

		this.el.one('destroyed', $.proxy(this.destroy, this));
	},

	/**
	 * Clean up - remove menu when the dropdown is removed from the DOM
	 * requires jquery plugin "destroyed" for this function to be called automatically
	 */
	destroy : function (e) {
		if (!this.el || !this.el.length) return;
		this.collapse();
		if (this.menu && this.menu.length) this.menu.remove();
		if (this.originalEl && this.originalEl.length) {
			if (!this.conf.isStatic && this.originalEl.is('input')) this.originalEl.val(this.getIdValue());
			this.originalEl.insertAfter(this.el);
		}
		this.el.remove();
	},



	/**
	 * Hides/shows the menu
	 * @param {Object} e		click event object
	 */
	toggle : function (e) { if (this.isExpanded) this.collapse(e); else this.expand(e); },

	expand : function (e) {
		if (this.conf.disabled) return;
		if (this.isExpanded) return;
		this.collapseAll();
		var self = this, ul = this.menu.find('.menu-items'), lis = ul.find('.menu-item');
		this.menu.css('min-width', this.el.width());																			// min menu width is the dropdown width
		if (!ul.length || !lis.length) {																						// load list
			this.menu.html('<ul><li class="loading">Loading...</li></ul>');
			if (this.conf.items && this.conf.items.length) this.replaceList(this.conf.items);									// use the data store provided in the config
			else if (this.conf.url && this.conf.url.length) this.loadList();													// load data from the given url
			else this.noItems();
		}

		this.menu.show();																										// show the menu
		this.el.addClass('expanded');
		this.isExpanded = true;
		this.adjustPosition();
		setTimeout(function () {
			$(document).on('mousedown touchstart keyup', $.proxy(self.documentClick, self));
			$(window).one('resize', $.proxy(self.documentClick, self));
			if (!this.isTouch) self.menu.find('.menu-filter-text').focus();
		}, 10);
		if (!this.isTouch) this.menu.find('.menu-filter-text').focus();
	},

	adjustPosition : function () {
		if (!this.isExpanded) return;
		this.adjustSidebar();																									// adjust sidebar width first
		this.menu.height('auto');
		this.menu.find('.menu-items').height('auto');
		var off = this.el.offset(),
			elH = this.el.height(), elW = this.el.width(),
			menuH = this.menu.height(), menuW = this.menu.outerWidth(),
			winH = $(window).innerHeight(), mx = off.left, my = off.top + elH, menuMinH = 100,
			mnItems = this.menu.find('.menu-items');

		if (this.conf.menuAlign === 'right')  mx -= menuW - elW;

		if (menuH > menuMinH && my + menuH + 20 > winH) {																		// if menu higher than screen - shorten it
			menuH = winH - my - 20;
			menuH = menuH > menuMinH ? menuH : menuMinH;
			this.menu.height(menuH);
		}

		if (my + menuH > winH) {																								// move menu above the target
			this.menu.addClass('menu-top');
			this.menu.height('auto');
			this.menu.find('.menu-items').height('auto');
			menuH = this.menu.height();
			if (menuH > winH - elH - 20) { menuH = winH - elH - 20; this.menu.height(menuH); }
			if (menuH + 20 > off.top) {
				menuH = off.top - 20;
				menuH = menuH > menuMinH ? menuH : menuMinH;
				this.menu.height(menuH);
			}
			my = off.top - menuH - 2;
		}
		else this.menu.removeClass('menu-top');

		this.menu.css({ left: mx, top: my });

		menuH -= parseInt(mnItems.css('paddingTop'), 10) + parseInt(mnItems.css('paddingBottom'), 10);							// subtract ul top+bottom padding
		if (this.menu.find('.menu-filter').length) menuH -=  this.menu.find('.menu-filter').outerHeight();
		this.menu.find('.menu-items').height(menuH);
		delete this.highlightObj;
	},

	adjustSidebar : function () {
		var mn = this.menu.find('.has-sidebar'), items, maxW = 20, i = 0, item = null, padL = 20;
		if (!mn.length) return;
		items = mn.find('.menu-item-aside').width('auto');
		for (; item = items[i++] ;) maxW = Math.max(maxW, $(item).outerWidth());
		padL = parseInt(items.closest('.menu-item').css('padding-left'), 10);
		this.menu.find('.has-sidebar').css('padding-left', maxW);
		items.outerWidth(maxW).css('margin-left', -(maxW + padL));																// include all asides
	},

	collapse : function (e) {
		if (!this.isExpanded) return;
		if (e) e.stopPropagation();
		this.menu.hide();
		this.el.removeClass('expanded');
		this.isExpanded = false;
		this.clearFilter();																										// if menu has a filter - clear it
		this.button.focus();
		$(document).off('mousedown DOMMouseScroll mousewheel keyup', this.documentClick);
		$(window).off('resize', this.documentClick);
	},

	/**
	 * STATIC. Collapses all opened dropdown menus.
	 */
	collapseAll : function () {
		$('.dropdown.expanded').each(function (idx, el) {$(el).data('dropdown').collapse(); });
		try { App.ProjectMenu.hide(); } catch (e) {}
	},


	/**
	 * Highlights a menu item
	 *
	 * off {int}		[-10 | -1 | 0 | 1 | 10] highlight item that is +-x to the current one (0 = first; -1 = prev, 1=next, etc)
	 */
	highlightItem : function (off) {
		if (!this.isExpanded) return this.expand();

		if (!this.highlightObj)
			this.highlightObj = {																								// cache some elements
				items : this.menu.find('.menu-item:visible'),
				mn : this.menu.find('.menu-items')[0]
			};
		var items = this.highlightObj.items, mn = this.highlightObj.mn, oT = null;

		off = off || 0;
		if (!items || !items.length) return;																					// no menu items
		if (!this.focused || !this.focused.length) this.focused = items.first().addClass('focused');

		var cItem = this.focused, cIdx = items.index(cItem[0]), nIdx = cIdx + off, nItem = items.eq(nIdx);						// // current item, new item

		if (off < 0) {
			if (cIdx === 0) nItem = null;																						// current item is first = focus filter
			else {
				if (nIdx < 0) nItem = items.first();																			// index is negative - highlight first item
				oT = nItem[0].offsetTop;
				if (mn.scrollTop <= oT) oT = null;
			}
		}
		else if (off > 0) {
			if (!nItem || !nItem.length) nItem = items.last();																	// out of index -> highlight last item
			oT = nItem[0].offsetTop + nItem[0].offsetHeight - mn.offsetHeight;
			if (mn.scrollTop >= oT) oT = null;
		}


		if (nItem && nItem.length) {
			this.button.focus();																								// focus dropdown button
			if (oT !== null) mn.scrollTop = oT;																					// scroll element into view
			cItem.removeClass('focused');
			this.focused = nItem.addClass('focused');
		}
		else {
			mn.scrollTop = 0;
			this.menu.find('.menu-filter-text').focus();																		// focus filter input
		}
	},


	/**
	 * Sets the value to 0 & defaultText
	 */
	reset : function () {
		if (this.conf.defaultValue) this.setValue(this.conf.defaultValue);
		else if (this.conf.defaultText && this.conf.defaultText.length) this.setValue('', this.conf.defaultText);
		else if (this.conf.emptyText && this.conf.emptyText.length && !this.conf.isStatic) this.setValue('', this.conf.emptyText);
		else this.select(0);
	},

	/**
	 * Sets the dropdown value and label
	 * @param id		id of the item on the dropdown list
	 * @param name		label for a dropdown button
	 */
	setValue : function (id, name) {																							/*jshint eqeqeq: false */
		if (id === undefined) id = '';
		this.input.val(id);																										// set input value
		this.selectedItem = this.focused = null;
		this.menu.find('.selected').removeClass('selected focused');
		if (id !== '' && this.items && this.items.length) {																		// list available -> select item on list
			this.focused = this.menu.find('.menu-item-id-' + id);
			if (this.focused.length) {
				if (!this.conf.isStatic) this.focused.addClass('selected focused');												// select item
				for (var i = 0, item; item = this.items[i++] ;)
					if (id == (typeof item === 'object' ? item[this.conf.fieldId] : item)) {
						this.selectedItem = item;
						break;
					}
			}
			if (!name && this.selectedItem) name = this.mapName(this.conf.fieldName, this.selectedItem);
			else if (!name) name = id;
			if (!this.conf.isStatic) {
				name = ('' + name).replace(/&/g, '&amp;');																		// encode all & to &amp; for IE
				this.label.html(name);
			}
		}
		else {
			name = name || (id === '' ? this.conf.defaultText || '' : id);														// if no name, set to id (if id not null) or to defaultText or to ''
			if (!this.conf.isStatic) {																							// no list -> set value "in blind"
				name = ('' + name).replace(/&/g, '&amp;');																		// encode all & to &amp; for IE
				this.label.html(name);
			}
		}
		return this;
	},


	/**
	 * Sets the dropdown value and label by list item index
	 * @param idx		index of the item on the dropdown list
	 */
	select : function (idx) {
		var item = this.menu.find('.menu-item').eq(idx || 0);
		if (item.length) this.setValue(item.attr('data-idval'), item.attr('data-val'));
	},


	/**
	 * Returns the selected (text) value
	 */
	getValue : function () { return this.label.text(); },

	/**
	 * Returns the selected option "id"
	 */
	getIdValue : function () { return this.input.val(); },



	/**
	 * Load list from the server
	 */
	loadList : function () {
		if (!this.conf.url) return;
		$.ajax({ url: this.conf.url, type: 'post', context: this, dataType: 'json', data: this.conf.params })
		.fail(function (xhr, status, err) { this.loadingError(); })
		.done(function (items, status, xhr) {
			if (!items || items.result === 'error') this.loadingError();
			else this.populate(items);
//			var val = this.getIdValue();
//			if (val !== undefined) this.setValue(val);
		});
	},

	replaceList : function (items) {
		var val = this.getIdValue();
		if (!items) this.loadingError();
		else this.populate(items);
//		if (this.conf.defaultValue) this.setValue(this.conf.defaultValue);
//		else if (val !== undefined && val !== '') this.setValue(val);
//		else if (this.conf.emptyText && this.conf.emptyText.length && !this.conf.isStatic) this.label.html(this.conf.emptyText);
	},

	clearList : function () { this.menu.find('ul').remove(); },

	filter : function (key) {
		var filter = this.menu.find('.menu-filter'),
			inp = filter.find('.menu-filter-text'),
			ul = this.menu.find('.menu-items'),
			items = ul.find('.menu-item'),
			i = 0, item, itemStr;

		this.menu.find('.no-results').remove();
		if (!filter.length) return;

		if (typeof key !== 'string') key = inp.val();
		inp.val(key);
		filter.toggleClass('menu-filter-dirty', !!key.length);
		for (; item = items[i++] ;) {
			item = $(item);
			itemStr = item.attr('data-group') + item.attr('data-val');
			if (this.filterMatch(itemStr, key)) item.show();
			else item.hide();
		}

		items.not('.menu-header').filter(':visible').each(function () { $(this).prevAll('.menu-header:first').show(); });		// show headers for all visible items

		if (this.isExpanded && !items.filter(':visible').length) ul.append('<li class="no-results">No items found!</li>');

		inp.focus();
		this.adjustPosition();
		delete this.highlightObj;
	},

	/**
	 * Returns true if all words in "keyword" are found within the "itemStr" string
	 */
	filterMatch : function (itemStr, keyword) {
		var words = keyword.split(' '), i = 0, w, reg;
		for (; w = words[i++] ;) {
			reg = new RegExp(w, 'ig');
			if (reg.test(itemStr) === false) return false;
			itemStr = itemStr.replace(reg, '');
		}
		return true;
	},


	clearFilter : function () { this.filter(''); },


	/**
	 * Populates the dropdown with a given list
	 * @param items			array of items
	 * @param id			name of the "ID" field in array
	 * @param name			name or template of the "name" field in array (template should be something like this: "{fieldName}, {fieldCode} ({anotherField})"
	 * @param emptyString	empty string to display when nothing is selected
	 */
	populate : function (items) {
		this.menu.html('');
		if (!items || !items.length) this.noItems();
		else {
			var i, item, ar = [], fName = this.conf.fieldName, fId = this.conf.fieldId;
			if (items.length > 10) this.menu.append(this.filterHtml());															// add filter to long lists
			if (this.conf.defaultText && this.conf.defaultText.length) ar.push(this.getItemHtml('', this.conf.defaultText));	// add empty text as a 1st option
			if (typeof fName === 'function' || (typeof fName === 'string' && fName.indexOf('{') > -1))							// name is a function or a template
				for (i = 0; item = items[i++];) ar.push(this.getItemHtml(item[fId], this.mapName(fName, item), item));
			else if (typeof items[0] !== 'object') for (i = 0; item = items[i++];) ar.push(this.getItemHtml(item, item, item));	// using 1D array
			else for (i = 0; item = items[i++];) ar.push(this.getItemHtml(item[fId], item[fName], item));						// name is a string

			if (ar.length) this.menu.append('<ul class="menu-items' + this.sidebarCls + '">' + ar.join('') + '</ul>');			// replace the list

			this.items = items || [];																							// store items
		}
		this.adjustPosition();

		var val = this.getIdValue();
		if (this.conf.defaultValue) this.setValue(this.conf.defaultValue);
		else if (val !== undefined && val !== '') this.setValue(val);
		else if (this.conf.emptyText && this.conf.emptyText.length && !this.conf.isStatic) this.label.html(this.conf.emptyText);
		else this.select(0);
		if (!this.isTouch) this.menu.find('.menu-filter-text').focus();
		delete this.highlightObj;
	},

	noItems : function (items) { this.menu.html('<span class="loading-error">No items</span>'); },
	loadingError : function (items) { this.menu.html('<span class="loading-error">Loading error</span>'); },

	filterHtml : function () {
		var _html = '<div class="menu-filter' + this.sidebarCls + '"><div class="menu-filter-inner">';
		if (this.conf.showSidebar) _html += '<span class="menu-item-aside">Search</span>';
		_html += '<span class="search-icon"></span>';
		_html += '<input type="text" class="menu-filter-text"/>';
		_html += '</div></div>';
		return _html;
	},

	getHtml : function (conf) {
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
	getItemHtml : function (id, name, item) {
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
		cls.push(name === this.conf.defaultText ? 'menu-item-empty-text' : 'menu-item-id-' + id);

		_html += '<li class="menu-item ' + cls.join(' ') + '" data-idval="' + id + '" data-val="' + name + '" data-group="' + group + '">';
		_html += sidebar;
		_html += '<span class="menu-item-name">' + name + '</span>';
		_html += '</li>';
		return _html;
	},

	mapName : function (name, rec) {
		if (typeof name === 'function') name = name.call(rec);																	// use defined function to "render" name
		else {
			var match = /\{(\w+)\}/i.exec(name);																				// match template pattern, e.g. {fieldName}
			if (match && match.length) {
				while (match && match.length > 1) {																				// loop through all patterns
					name = name.replace(match[0], rec[match[1]] || '');															// replace all {fieldName} with item['fieldName']
					match = /\{(\w+)\}/i.exec(name);
				}
			}
			else if ($.type(rec) === 'array') name = rec[0];
			else if ($.type(rec) === 'object') name = rec[name];
			else name = rec;
		}
		return this.decodeEntities(name);
	},

	decodeEntities : function (str) {
		if (!str) return '';
		if (('' + str).indexOf('&') === -1) return str;
		var d = document.createElement('div');
		d.innerHTML = str;
		return d.innerText || d.textContent;
	},


	/**
	 * On menu item click - action
	 * @param {Object} e		click event
	 */
	action : function (e) {
		if (this.conf.disabled) return;
		var actionId, actionName, target;
		if (e.type === 'keydown') target = this.focused;
		else target = $(e.target);
		if (!target) return;
		if (target.parent('.menu-item').length) target = target.parent('.menu-item');
		actionId = target.attr('data-idval');
		actionName = target.attr('data-val');
		if (actionId === undefined) return;
		this.collapse(e);
		this.setValue(actionId, actionName);
		if (this.conf.action) this.conf.action.call(this.conf.scope || this.conf.action, actionId, this.selectedItem, this);
	},


	show : function (reset) { if (reset) this.setValue(); this.el.show(); },
	hide : function (reset) { if (reset) this.setValue(); this.el.hide(); },

	disable : function (reset) {
		if (reset) this.setValue();
		this.el.addClass('dropdown-disabled');
		this.conf.disabled = true;
	},

	enable : function (reset) {
		if (reset) this.setValue();
		this.el.removeClass('dropdown-disabled');
		this.conf.disabled = false;
	},


	/**
	 * Document click handler - expand function adds it, collapse - removes; It hides the menu when clicked elsewhere
	 */
	documentClick : function (e) {
		if (e.type === 'keyup') { if (!e.keyCode || e.keyCode !== 27) return; }
		var tar = $(e.target);
		if (tar.parents('.menu').length || tar.hasClass('menu')) return;
		this.collapse();
	}

});
