/**
 * Multiselect drop-down.
 * Extends default DropDown functionality by allowing to select multiple items from the list
 * adds "apply" button at the end of the list.
 */
var MultiSelect = DropDown.extend({
	init : function (conf) {
		this._super(conf);
		if (!this.el || !this.el.length) return;
		this.el.addClass('static');
		this.menu.addClass('multiselect');
		if (this.value && this.value.length && typeof this.value === 'string') {
			var arr = this.value.split(',');
			if (arr.length) this.setValue(arr);
		}
	},

	/**
	 * Populates the dropdown with a given list
	 */
	populate : function (items) {
		this.menu.html('');
		if (!items || !items.length) this.noItems();
		else {
			var i, item, ar = [];
			if (items.length > 10) this.menu.append(this.filterHtml());															// add filter to long lists
			this.menu.append('<ul class="menu-select' + this.sidebarCls + '">' + this.getItemHtml(-1, 'Select All') + '</ul>');	// add "Select All" option
			if (typeof this.conf.fieldName === 'function' ||																	// name is a function
				(typeof this.conf.fieldName === 'string' && this.conf.fieldName.indexOf('{') > -1)								// or a template
			) {
				for (i = 0; item = items[i++];) {
					ar.push(this.getItemHtml(item[this.conf.fieldId], this.mapName(this.conf.fieldName, item)));
				}
			}
			else if (typeof items[0] !== 'object') for (i = 0; item = items[i++];) ar.push(this.getItemHtml(item, item));		// using 1D array
			else for (i = 0; item = items[i++];) ar.push(this.getItemHtml(item[this.conf.fieldId], item[this.conf.fieldName]));	// name is a string
			if (ar.length) this.menu.append('<ul class="menu-items' + this.sidebarCls + '">' + ar.join('') + '</ul>');										// replace the list
			this.items = items;																									// store items
		}
		this.adjustPosition();

		if (this.conf.defaultValue) this.setValue(this.conf.defaultValue);
		else if (this.value !== undefined) this.setValue(this.value);
		else this.reset();
		if (!this.isTouch) this.menu.find('.menu-filter-text').focus();
	},

	getItemHtml : function (id, name) {
		return  (id === -1 ?
			'<li class="menu-item menu-item-all menu-item-checked" data-id="#select-all">' :
			'<li class="menu-item menu-item-checked menu-item-' + id + '" data-id="' + id + '" data-val="' + name + '" >') +
			'<span class="menu-item-tick"></span><span class="menu-item-name">' + name + '</span></li>';
	},
	
	getApplyHtml : function () {
		return '<ul class="menu-apply' + this.sidebarCls + '"><li class="menu-item" data-id="#apply"><span class="menu-item-tick"></span><span class="menu-item-name">Apply</span></li></ul>';
	},

	/**
	 * On menu item click - action
	 * @param {Object} e		click event
	 */
	action : function (e) {
		e.preventDefault();
		if (this.el.hasClass('dropdown-disabled')) return;
		var actionName, target = $(e.target), noItemsSelected = true, checked = null;
		if (e.type == 'keydown') target = this.focused;
		else target = $(e.target);
		if (!target) return;
		if (target.parent('.menu-item').length) target = target.parent('.menu-item');
		actionName = target.data('id');

		if (actionName === undefined) return;

		if (actionName == '#apply') {
			if (target.closest('.no-items-selected').length) return;															// disable "Apply" when no items selected
			this.applySelected();
			this.collapse(e);
			this.conf.action.call(this.conf.scope, this.getValue(), this.selectedItems, this);
		}
		else {
			var check = target.hasClass('menu-item-checked');

			if (actionName == '#select-all') {																					// if "select all" clicked
				noItemsSelected = check;																						// no items selected - don't show "Apply" menu
				if (check) this.selectNone();																					// select none
				else this.selectAll();																							// or all
			}
			else {
				if (this.menu.hasClass('all-items-selected')) {																	// if "all items" is selected
					this.unselectAll();																							// unselect "all items" and "select" all items
					target.removeClass('menu-item-checked');																	// except target
					checked = this.menu.find('.menu-items .menu-item-checked');
					if (checked.length === 0) {
						this.label.html('No ' + this.conf.defaultText);
						this.menu.removeClass('all-items-selected multiple-items-selected').addClass('no-items-selected');
					}
					noItemsSelected = (checked.length === 0);																	// no items selected - don't show "Apply" menu
				}
				else {
					this.menu.removeClass('all-items-selected no-items-selected').addClass('multiple-items-selected');
					target.toggleClass('menu-item-checked', !check);

					checked = this.menu.find('.menu-items .menu-item-checked');
					if (checked.length == 1) this.label.html(checked.data('val'));
					else if (checked.length === 0) {
						this.label.html('No ' + this.conf.defaultText);
						this.menu.removeClass('all-items-selected multiple-items-selected').addClass('no-items-selected');
					}
					else this.label.html('Multiple ' + this.conf.defaultText);
					noItemsSelected = (checked.length === 0);																	// no items selected - don't show "Apply" menu
				}
			}

			if (!this.menu.find('.menu-apply').length && !noItemsSelected) {													// add "apply" menu
				this.menu.append(this.getApplyHtml());
				this.adjustPosition();

				var mn = target.closest('.menu-items'), mh = mn.innerHeight(),
					it = target.position().top, ih = target.outerHeight(true) + it;
				if (it <= 0) mn.scrollTop(-it);
				if (ih > mh) mn.scrollTop(ih - mh);
			}
			// if checked items == all items - select all
			if (this.menu.find('.menu-items .menu-item').length == this.menu.find('.menu-items .menu-item-checked').length) this.selectAll();
		}
	},


	/**
	 * Fake selects all items, selects "All items" and turns the whole menu into "all items selected" look
	 */
	selectAll : function () {
		this.menu.find('.menu-item-checked').removeClass('menu-item-checked');
		this.menu.find('.menu-item-all').addClass('menu-item-checked');
		this.menu.removeClass('multiple-items-selected no-items-selected').addClass('all-items-selected');
		this.label.html('All ' + this.conf.defaultText);
	},

	/**
	 * Unselects "All items" and turns the whole menu into normal "multiple items selected" look
	 */
	unselectAll : function () {
		this.menu.find('.menu-item-all').removeClass('menu-item-checked');
		this.menu.find('.menu-items .menu-item').addClass('menu-item-checked');
		this.menu.removeClass('all-items-selected no-items-selected').addClass('multiple-items-selected');
		this.label.html('Multiple ' + this.conf.defaultText);
	},

	/**
	 * Unselect everything (except the just-checked element)
	 */
	selectNone : function () {
		this.menu.find('.menu-item').removeClass('menu-item-checked');
		this.menu.removeClass('all-items-selected multiple-items-selected').addClass('no-items-selected');
		this.label.html('No ' + this.conf.defaultText);
	},

	reset : function () {
		if (this.conf.defaultValue) this.setValue(this.conf.defaultValue);
		else this.setValue([-1], 'All ' + this.conf.defaultText);
	},

	setValue : function (ids, name) {
		if (ids === undefined || ids === null || ids === '') return false;
		this.value = ids;
		this.selectAll();
		if ($.type(ids) !== 'array') ids = [ids];
		if (ids.length === 1 && ids[0] == -1) this.selectAll();
		else {
			var items = this.menu.find('.menu-items .menu-item'), i = 0, il = ids.length;

			if (il === 0) this.selectNone();
			else {
				this.label.html('Multiple ' + this.conf.defaultText);
				this.menu.removeClass('all-items-selected no-items-selected').addClass('multiple-items-selected');

				if (items.length) {
					if (items.length == il) this.selectAll();																	// if checked items == all items -> select all
					else {
						this.selectNone();
						for (; i < il; i++) items.filter('.menu-item-' + ids[i]).addClass('menu-item-checked');

						var checked = items.filter('.menu-item-checked');
						if (checked.length == 1) this.label.html(checked.data('val'));
						else if (checked.length === 0) this.selectNone();
						else {
							this.label.html('Multiple ' + this.conf.defaultText);
							this.menu.removeClass('all-items-selected no-items-selected').addClass('multiple-items-selected');
						}
					}
				}
				else {
					if (name && name.length) this.label.html(name);
					else this.label.html('Multiple ' + this.conf.defaultText);
					this.menu.removeClass('all-items-selected no-items-selected').addClass('multiple-items-selected');
				}
			}
		}
	},

	/**
	 * Returns the selected (text) value
	 */
	getValue : function () { return this.value; },

	/**
	 * Returns the selected option "id"
	 */
	getIdValue : function () { return this.value; },

	getTextValue : function () { return this.label.html(); },


	replaceList : function (items) {
		var val = this.getValue();
		if (!items) this.loadingError();
		else this.populate(items);
		if (this.conf.defaultValue) this.setValue(this.conf.defaultValue);
		else if (val !== undefined && val != -1) this.setValue(val);
		else if (this.conf.emptyText && this.conf.emptyText.length && !this.conf.isStatic) this.label.html(this.conf.emptyText);
	},


	/**
	 * Applies the selected elements as new "this.value" (array) for the field
	 */
	applySelected : function () {
		var vals = [], all = this.menu.hasClass('all-items-selected'), items = this.menu.find('.menu-items .menu-item-checked'), i = 0, item;
		if (all) vals.push(-1);
		else for (; item = items[i++] ;) vals.push($(item).data('id'));
		this.value = vals;
	},


	expand : function (e) {
		this._super(e);
		this.adjustPosition();
	},

	collapse : function (e) {
		this._super(e);
		this.menu.find('.menu-apply').remove();
		this.setValue(this.value);
	},

	adjustPosition : function () {
		this._super();
		var newH, mn = this.menu, mnItems = mn.find('.menu-items'),
			pdng = parseInt(mnItems.css('paddingTop'), 10) + parseInt(mnItems.css('paddingBottom'), 10);
		mnItems.height('auto');																									// reset height to default
		newH = mn.height() - pdng;																								// subtract ul top+bottom padding
		if (mn.find('.menu-filter').length) newH -= mn.find('.menu-filter').outerHeight();
		if (mn.find('.menu-select').length) newH -= mn.find('.menu-select').outerHeight();
		if (mn.find('.menu-apply').length)  newH -= mn.find('.menu-apply').outerHeight();
		mnItems.height(newH);
	}

});
