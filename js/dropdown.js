/**
 * DropDown component v2.1 (2012-08-25)
 * @author Tom
 *
 * sample usage:
 * var dd1 = new DropDown({ target: 'myInputId' });
 * var dd2 = new DropDown({ target: $('.selector'), defaultText: 'Please select', items: [1,2,3], value: 3 });
 *
 * //TODO: improve documentation
 * //TODO: isExpanded = remove?
 *
 */

var DropDown = Class.extend({
	init : function(conf){

		if (typeof conf.target == 'string'){
			var oldDD = $('#' + conf.target);
			if (oldDD.is('.dropdown')) oldDD.data('dropdown').destroy();
		}

		var defaults = {
				id: null,																										// id for the dropdown div
				name: '',																										// input[text] name
				fieldName: 'name',																								// this can be a string (fieldName); a pattern (eg. '{name}, {id}') or a function (eg. fieldName: function(){ return this.name+'123'; }
				fieldId: 'id',
				defaultText: '', 																								// this is a 1st element (e.g. "Please select") of for multiple - it becomes "All {defaultText}", e.g. "All Items", etc.
				emptyText: '',																									// this is a default label for the dropdown when nothing is selected
				menuAlign: 'left',																								// if menu is longer than button - this can make it align to the right
				cls: '',																										// additional class for the dropdown (without menu)
				menuCls: '',																									// additional class for the menu (menu is rendered to the body)
				action: function(v,rec,el){},
				scope: window,
				value: null,
				defaultValue: null,
				items: null,
				isStatic: false,																								// if true - don't change the button label (name)
				disabled: false																									// init as disabled
			};
		this.conf = $.extend({}, defaults, conf);
		this.isTouch=navigator.userAgent.match(/iPhone|iPod|iPad/ig);
		this.initComponent();
		this.initEvents();
		this.el.data('dropdown', this);
	}

	/**
	 * Initialize DropDown components
	 */
	,initComponent : function(){
		if (typeof this.conf.target == 'string') this.conf.target = '#' + this.conf.target;
		this.el = $(this.conf.target);
		if (this.el.is('input')) {
			var inp = this.el[0];
			this.conf.name = inp.name;
			if (!this.conf.id && inp.id) this.conf.id = inp.id;
			if (!this.conf.value && this.el.val()) this.conf.value = this.el.val();
			this.originalInput = this.el.clone();																				// store for destroy()
			this.el = $('<div>').replaceAll(this.el);
		}
		this.el.addClass('dropdown '+this.conf.cls).html(this.getHtml(this.conf));
		this.button = this.el.find('.button');
		this.menu = this.el.find('.menu').appendTo('body');																		// move menu to body, so it does show on top of everything
		this.label = this.el.find('.text');
		this.input = this.el.find('input[type=hidden]').val('');																// empty the value auto added from cache

		this.sidebarCls = (this.conf.showSidebar ? ' has-sidebar' : '');

		if (this.conf.id) this.el.attr('id', this.conf.id);
		if (this.conf.menuCls) this.menu.addClass(this.conf.menuCls);
		if (this.conf.disabled) this.disable();
		if (this.conf.defaultText && this.conf.defaultText.length && !this.conf.isStatic) this.label.html(this.conf.defaultText);
		if (this.conf.value !== undefined && this.conf.value !== null){
			var c = this.conf, v = c.value, fid = v[c.fieldId], fin = v[c.fieldName];
			if ($.type(v) === 'object' && fid && fin) this.setValue(fid, fin);													// set single value, e.g. {id:1, name:'item1'}
			else this.setValue(v);																								// set mixed value (single, multiple)
		}
		else {
			if (this.conf.url || !this.conf.items) this.reset();																// if no list - put correct label
		}
		if (this.conf.items && this.conf.items.length) this.replaceList(this.conf.items);										// use the data store provided in the config
	}

	/**
	 * Initialize DropDown events
	 */
	,initEvents : function(){
		var self = this;
		this.el.on({
				mousedown: function(e){ self.toggle.call(self, e); },
				click: function(e){ e.stopPropagation(); e.preventDefault(); return false; },									// don't hash the addressbar
				focus: function(e){ self.button.addClass('focused'); },
				blur: function(e){ self.button.removeClass('focused'); },
				keydown: function(e){																							// launch action on enter
					switch(e.keyCode){
						case 32 : 																								// space
						case 13 : self.action.call(self,e); break;																// enter
						case 27 : self.collapse.call(self, e); break;															// esc
						case  9 : self.collapse.call(self, e); break;															// tab
						case 38 : 																								// up arrow
							if (!self.isExpanded){ self.expand.call(self); break; }
							if (!self.focused || !self.focused.length){
								self.focused = self.menu.find('.menu-item:visible').first().addClass('focused');
							}
							else {
								var its = self.menu.find('.menu-item:visible'),
									f = its.filter('.focused'),
									idx = its.index(f[0])-1,
									p = its.eq(idx);
								if (idx>=0){
									f.removeClass('focused');
									self.focused = p.addClass('focused');
									if (p.position().top <= 0){
										p.parent('.menu-items').animate({ scrollTop: '-='+p.outerHeight(true) }, 0);			// scroll element to the view
									}
								}
								else self.menu.find('.menu-filter-text').focus();
							}
							break;
						case 40 : 																								// down arrow
							if (!self.isExpanded){ self.expand.call(self); break; }
							if (!self.focused || !self.focused.length){
								self.focused = self.menu.find('.menu-item:visible').first().addClass('focused');
							}
							else {
								var its = self.menu.find('.menu-item:visible'),
									f = its.filter('.focused'),
									idx = its.index(f[0])+1,
									n = its.eq(idx);
								if (n.length){
									f.removeClass('focused');
									self.focused = n.addClass('focused');
									if (n.position().top >= n.parent('.menu-items').height()) {
										n.parent('.menu-items').animate({ scrollTop: '+='+n.outerHeight(true) }, 0);			// scroll element to the view
									}
								}
							}
							break;
						default : ; //log(e.keyCode);
					}
				}
			}, '.button');


		if (this.label.is('input')) this.el.on({
			focus: function(e){ self.expand(e); return false; },
			click: function(e){ self.expand(e); return false; },
			change: function(e){ if (!e.target.value) self.input.val(''); return false; }										// if text input empty - clear the value
		}, '.text');

		this.menu
			.on({
				mousedown: function(e){ return false; },																		// allow scrolling with mousedown
				mouseup: function(e){ self.action.call(self,e); return false; },
				click: function(e){
					if (self.isTouch) setTimeout(function(){ $(window).scrollTop(200);},0);
					//return false;																								// don't hash the addressbar
				}
			}, 'ul')

			.on('focus', '.menu-filter-text', function(e){																		// menu filter
				self.focused = null;
				self.menu.find('.focused').removeClass('focused');
			})
			.on('keydown', '.menu-filter-text', function(e){																	// if down key - select first item on list
				if (e.keyCode == 27) {
					if (!this.value.length) self.collapse.call(self);															// if Esc and value is empty - close menu
				}
				if (e.keyCode == 40){
					var n = self.menu.find('.menu-item').filter(':visible').first();
					if (n.length){
						self.button.focus();
						self.focused = n.addClass('focused');
					}
				}
			})
			.on('keyup', '.menu-filter-text', function(e){																		// menu filter
				if (e.keyCode == 27 && this.value.length) this.value = '';														// first Esc - clears the filter
				self.filter.call(self, this.value);
			})
			.on('click', '.menu-filter .search-icon', $.proxy(this.clearFilter, this))											// menu filter clear-icon
			.on('mousemove', function(e){
				self.focused = null;
				self.menu.find('.focused').removeClass('focused');
			});

		this.el.on('destroyed', $.proxy(this.destroy, this) );
	}

	/**
	 * Clean up - remove menu when the dropdown is removed from the DOM
	 * requires jquery plugin "destroyed" for this function to be called automatically
	 */
	,destroy : function(e){
		this.collapse();
		if (this.menu && this.menu.length) this.menu.remove();
		if (this.originalInput && this.originalInput.length) {
			if (!this.conf.isStatic) this.originalInput.val(this.getIdValue());
			this.originalInput.insertAfter(this.el);
		}
		else if (this.input && this.input.length){
			this.input.attr('id', this.conf.id)[0].type='text';
			this.input.insertAfter(this.el);
		}
		this.el.remove();
	}



	/**
	 * Hides/shows the menu
	 * @param {Object} e		click event object
	 */
	,toggle : function(e){ if (this.isExpanded) this.collapse(e); else this.expand(e); }

	,expand : function(e){
		if (this.conf.disabled) return;
		if (this.isExpanded) return;
		this.collapseAll();
		var self = this, ul = this.menu.find('ul'), lis = this.menu.find('ul li');
		this.menu.css('min-width', this.el.width());																			// min menu width is the dropdown width
		if (!ul.length || !lis.length){																							// load list
			this.menu.html('<ul><li class="loading">Loading...</li></ul>');
			if (this.conf.items && this.conf.items.length) this.replaceList(this.conf.items);									// use the data store provided in the config
			else if (this.conf.url && this.conf.url.length) this.loadList();													// load data from the given url
			else this.noItems();
		}
		this.el.addClass('expanded');
		this.menu.show();																										// show the menu
		this.isExpanded=true;
		this.adjustPosition();
		setTimeout(function(){																									// add document.onclick action with delay so it doesn't hide the menu before showing it
			$(document).on('mousedown touchstart DOMMouseScroll mousewheel',$.proxy(self.documentClick, self));
			$(document).on('keyup', $.proxy(self.documentClick, self));
			$(window).one('resize',$.proxy(self.documentClick, self));
			if (!this.isTouch) self.menu.find('.menu-filter-text').focus();
		},100);
		if (!this.isTouch) this.menu.find('.menu-filter-text').focus();
	}

	,adjustPosition : function(){
		if (!this.isExpanded) return;
		this.menu.height('auto');
		this.menu.find('ul').height('auto');
		var off = this.el.offset(),
			elH = this.el.height(), elW = this.el.width(),
			menuH = this.menu.height(), menuW = this.menu.outerWidth(),
			winH = $(window).innerHeight(), mx = off.left, my = off.top + elH, menuMinH = 100,
			mnItems = this.menu.find('.menu-items');

		if (this.conf.menuAlign === 'right')  mx -= menuW - elW;

		if (menuH > menuMinH && my + menuH + 20 > winH){																		// if menu higher than screen - shorten it
			menuH = winH - my - 20;
			menuH = menuH > menuMinH ? menuH : menuMinH;
			this.menu.height(menuH);
		}

		if (my + menuH > winH) {																								// move menu above the target
			this.menu.addClass('menu-top');
			this.menu.height('auto');
			this.menu.find('.menu-items').height('auto');
			menuH = this.menu.height();
			if (menuH > winH-elH-20){ menuH = winH - elH - 20; this.menu.height(menuH); }
			if (menuH+20 > off.top){
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
		this.adjustSidebar();
	}

	,adjustSidebar : function(){
		var mn = this.menu.find('.has-sidebar'), items, maxW = 0, i = 0, item = null, padL = 0;
		if (!mn.length) return;
		items = mn.find('.menu-item-aside').width('auto');
		for (; item = items[i++] ;) maxW = Math.max(maxW, $(item).outerWidth());
		padL = parseInt(items.css('padding-left'), 10);
		this.menu.find('.has-sidebar').css('padding-left', maxW)
		items.outerWidth(maxW).css('margin-left', -(maxW + padL));																// include all asides
	}

	,collapse : function(e){
		if (!this.isExpanded) return;
		if (e) e.stopPropagation();
		this.menu.hide();
		this.clearFilter();																										// if menu has a filter - clear it
		this.el.removeClass('expanded');
		this.isExpanded=false;
		this.button.focus();
		$(document).off('mousedown DOMMouseScroll mousewheel keyup', this.documentClick);
		$(window).off('resize', this.documentClick);
	}

	/**
	 * STATIC. Collapses all opened dropdowns' menus.
	 */
	,collapseAll : function(){
		$('.dropdown.expanded').each(function(idx, el){$(el).data('dropdown').collapse();});
		try{ App.ProjectMenu.hide(); }catch(e){}
	}


	/**
	 * Sets the value to 0 & defaultText
	 */
	,reset : function(){
		if (this.conf.defaultValue) this.setValue(this.conf.defaultValue);
		else if (this.conf.defaultText && this.conf.defaultText.length) this.setValue('', this.conf.defaultText);
		else if (this.conf.emptyText && this.conf.emptyText.length && !this.conf.isStatic) this.setValue('', this.conf.emptyText);
		else this.select(0);
	}

	/**
	 * Sets the dropdown value and label
	 * @param id		id of the item on the dropdown list
	 * @param name		label for a dropdown button
	 */
	,setValue : function(id, name){
		if (id === undefined) id = '';
		this.input.val(id);																										// set input value
		this.selectedItem = this.focused = null;
		this.menu.find('.selected').removeClass('selected focused');
		if (id != '' && this.items && this.items.length){																		// list available -> select item on list
			this.focused = this.menu.find('.menu-item-id-'+id);
			if (!this.conf.isStatic) this.focused.addClass('selected focused');													// selec item
			for (var i=0, item; item = this.items[i++] ;)
				if (id == (typeof item =='object' ? item[this.conf.fieldId] : item)){
					this.selectedItem = item;
					break;
				}
			if (!name && this.selectedItem) name = this.mapName(this.conf.fieldName, this.selectedItem);
			if (!this.conf.isStatic) {
				name = (''+name).replace(/&amp;/g, '&').replace(/&/g, '&amp;');													// encode all & to &amp; for IE
				this.label.html(name);																							// set caption to item name
			}
		}
		else {
			name = name || (id == '' ? this.conf.defaultText || '' : id);														// if no name, set to id (if id not null) or to defaultText or to ''
			if (!this.conf.isStatic) {																							// no list -> set value "in blind"
				name = (''+name).replace(/&amp;/g, '&').replace(/&/g, '&amp;');													// encode all & to &amp; for IE
				this.label.html(name);
			}
		}
		return this;
	}


	/**
	 * Sets the dropdown value and label by list item index
	 * @param idx		index of the item on the dropdown list
	 */
	,select : function(idx){
		var item = this.menu.find('.menu-item').eq(idx || 0);
		if (item.length) this.setValue(item.attr('data-idval'), item.attr('data-val'));
	}


	/**
	 * Returns the selected (text) value
	 */
	,getValue : function(){ return this.label.text(); }

	/**
	 * Returns the selected option "id"
	 */
	,getIdValue : function(){ return this.input.val(); }



	/**
	 * Load list from the server
	 */
	,loadList : function(){
		if (!this.conf.url) return ;
		$.ajax({ url: this.conf.url, type: 'post', context: this, dataType: 'json', data: this.conf.params
			,error: function(xhr, status, err){ this.loadingError(); }
			,success: function(items, status, xhr){
				if(!items || items.result == 'error') this.loadingError();
				else this.populate(items);
				var val = this.getIdValue();
				if (val !== undefined) this.setValue(val);
			}
		});
	}

	,replaceList : function(items){
		var val = this.getIdValue();
		if (!items) this.loadingError();
		else this.populate(items);
		if (this.conf.defaultValue) this.setValue(this.conf.defaultValue);
		else if (val !== undefined && val != '') this.setValue(val);
		else if (this.conf.emptyText && this.conf.emptyText.length && !this.conf.isStatic) this.label.html(this.conf.emptyText);
	}

	,clearList : function(){ this.menu.find('ul').remove(); }

	,filter : function(key){
		var filter = this.menu.find('.menu-filter'),
			inp = filter.find('.menu-filter-text'),
			items = this.menu.find('.menu-items .menu-item'),
			i=0, item, reg;

		if (typeof key !== 'string') key = inp.val();
		inp.val(key);
		reg = new RegExp(key, 'i');
		filter.toggleClass('menu-filter-dirty', !!key.length);
		for(; item = items[i++] ;){
			item = $(item);
			if (reg.test(item.attr('data-val')) === true || item.hasClass('ignore-filter')) item.show();
			else item.hide();
		}
		inp.focus();
		this.adjustPosition();
	}
	,clearFilter : function(){ this.filter(''); }

	/**
	 * Populates the dropdown with a given list
	 * @param items			array of items
	 * @param id			name of the "ID" field in array
	 * @param name			name or template of the "name" field in array (template should be something like this: "{fieldName}, {fieldCode} ({anotherField})"
	 * @param emptyString	empty string to display when nothing is selected
	 */
	,populate : function(items){
		this.menu.html('');
		if (!items || !items.length) this.noItems();
		else {
			var i, item, ar = [], fName = this.conf.fieldName, fId = this.conf.fieldId;
			if (items.length > 10) this.menu.append(this.filterHtml());															// add filter to long lists
			if (this.conf.defaultText && this.conf.defaultText.length) ar.push(this.getItemHtml('', this.conf.defaultText));	// add empty text as a 1st option
			if (typeof fName === 'function' || (typeof fName === 'string' && fName.indexOf('{')>-1)) 							// name is a function or a template
				for(i=0; item = items[i++];) ar.push(this.getItemHtml(item[fId], this.mapName(fName, item), item));
			else if (typeof items[0] !== 'object') for(i=0; item = items[i++];) ar.push(this.getItemHtml(item, item, item));	// using 1D array
			else for(i=0; item = items[i++];) ar.push(this.getItemHtml(item[fId], item[fName], item));							// name is a string

			if (ar.length)
				this.menu.append('<ul class="menu-items' + this.sidebarCls + '">'+ar.join('')+'</ul>');			// replace the list

			this.items = items;																									// store items
		}
		this.adjustPosition();

		var val = this.getIdValue();
		if (this.conf.defaultValue) this.setValue(this.conf.defaultValue);
		else if (val !== undefined && val != '') this.setValue(val);
		else if (this.conf.emptyText && this.conf.emptyText.length && !this.conf.isStatic) this.label.html(this.conf.emptyText);
		else this.select(0);
		if (!this.isTouch) this.menu.find('.menu-filter-text').focus();
	}

	,noItems : function(items){ this.menu.html('<span class="loading-error">No items</span>'); }
	,loadingError : function(items){ this.menu.html('<span class="loading-error">Loading error</span>'); }

	,filterHtml : function(){
		var _html = '<div class="menu-filter' + this.sidebarCls + '"><div class="menu-filter-inner">';
			if (this.conf.showSidebar) _html += '<span class="menu-item-aside">Search</span>';
			_html += '<span class="search-icon"></span>';
			_html += '<input type="text" class="menu-filter-text"/>';
		_html += '</div></div>';
		return _html;
	}

	,getHtml : function(conf){
		var _html = '<a class="button" href="#">';
			_html += '<span class="expander"></span>';
			_html += '<input type="hidden" name="' + conf.name + '" />';
			_html += '<span class="text">'+ (conf.emptyText.length ? conf.emptyText : '' ) + '</span>';
		_html += '</a>';
		if (conf.showSidebar === true) _html += '<div class="menu menu-with-sidebar"></div>';
		else _html += '<div class="menu"></div>';

		return _html;
	}

	/**
	 * Returns a HTML for a single item
	 * @param  {int/string} id	item ID
	 * @param  {string} name	item name (can be "generated" from function or template)
	 * @param  {object} item	item object
	 * @return {string}			HTML markup
	 */
	,getItemHtml : function(id, name, item){
		var _html = '', sidebar = '', cls = [];

		if (typeof item === 'object'){
			if (item.cls && item.cls.length) cls.push(item.cls);
			if (item.ignoreFilter === true) cls.push('ignore-filter');
			if (item.sidebarText || item.sidebarCls){
				sidebar = '<span class="menu-item-aside '+(item.sidebarCls || '')+'">'+(item.sidebarText || '')+'</span>';
			}
		}
		cls.push(name == this.conf.defaultText ? 'menu-item-empty-text' : 'menu-item-id-'+id);

		_html += '<li class="menu-item '+cls.join(' ')+'" data-idval="'+id+'" data-val="'+name+'">';
			_html += sidebar;
			_html += '<span class="menu-item-name">'+name+'</span>';
		_html += '</li>';
		return _html;
	}

	,mapName : function(name, rec){
		if (typeof name === 'function') name = name.call(rec);																	// use defined function to "render" name
		else {
			var match = /{(\w+)}/i.exec(name);																					// match template pattern, e.g. {fieldName}
			if (match && match.length){
				while(match && match.length > 1){																				// loop through all patterns
					name = name.replace(match[0], rec[match[1]] || '');															// replace all {fieldName} with item['fieldName']
					match = /{(\w+)}/i.exec(name);
				}
			}
			else if ($.type(rec) == 'array') name=rec[0];
			else if ($.type(rec) == 'object') name=rec[name];
			else name = rec;
		}
		return name;
	}


	/**
	 * On menu item click - action
	 * @param {Object} e		click event
	 */
	,action : function(e){
		if (this.conf.disabled) return;
		var actionId, actionName, target;
		if (e.type == 'keydown') target = this.focused;
		else target = $(e.target);
		if (!target) return;
		if (target.parent('.menu-item').length) target = target.parent('.menu-item');
		actionId = target.attr('data-idval');
		actionName = target.attr('data-val');
		if (actionId === undefined) return;
		this.collapse(e);
		if (this.conf.isStatic !== true) this.setValue(actionId, actionName);
		if (this.conf.action) this.conf.action.call(this.conf.scope, actionId, this.selectedItem, this);
	}


	,show : function(reset){ if (reset) this.setValue(); this.el.show(); }
	,hide : function(reset){ if (reset) this.setValue(); this.el.hide(); }

	,disable : function(reset){
		if (reset) this.setValue();
		this.el.addClass('dropdown-disabled');
		this.conf.disabled = true;
	}

	,enable : function(reset){
		if (reset) this.setValue();
		this.el.removeClass('dropdown-disabled');
		this.conf.disabled = false;
	}



	/**
	 * Document click handler - expand function adds it, collapse - removes; It hides the menu when clicked elsewhere
	 */
	,documentClick : function(e){
		if (e.type == 'keyup'){ if (!e.keyCode || e.keyCode != 27) return; }
		var tar = $(e.target);
		if (tar.parents('.menu').length || tar.hasClass('menu')) return;
		this.collapse();
	}

});
