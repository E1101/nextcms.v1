/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		menu
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-27
 */

define([
	"dojo/_base/declare",
	"dojo/dom-style",
	"dojo/on",
	"dijit/registry",
	"dojo/data/ItemFileReadStore",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dojox/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/DnD",
	"dojox/grid/enhanced/plugins/Menu",
	"dojox/grid/enhanced/plugins/NestedSorting",
	"dojox/widget/PlaceholderMenuItem",
	"core/js/base/Config",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"	
], function(dojoDeclare, dojoDomStyle, dojoOn, dijitRegistry) {
	return dojoDeclare("menu.js.views.MenuGrid", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _menuGrid: dojox.grid.EnhancedGrid
		_menuGrid: null,
		
		// _editMenuItem: dijit.MenuItem
		_editMenuItem: null,
		
		// _deleteMenuItem: dijit.MenuItem
		_deleteMenuItem: null,
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("menu/languages");
			this._i18n = core.js.base.I18N.getLocalization("menu/languages");
			
			this._createGrid();
		},
		
		_createGrid: function() {
			// summary:
			//		Creates the grid
			var that = this;
			var languages = core.js.base.Config.get("core", "localization_languages");
			
			// Columns
			var layout = [{
				field: "title",
				width: "300px",
				name: this._i18n.menu._share.title
			}, {
				field: "created_date",
				width: "150px",
				name: this._i18n.menu._share.createdDate
			}, {
				field: "language",
				width: "150px",
				name: this._i18n.menu._share.language,
				formatter: function(language) {
					return languages ? language + " (" + languages[language] + ")" : language;
				}
			}];
			
			// Header menu
			var headerMenu = new dijit.Menu();
			headerMenu.addChild(new dijit.MenuItem({
				label: this._i18n.menu.list.showColumns,
				disabled: true
			}));
			headerMenu.addChild(new dijit.MenuSeparator());
			headerMenu.addChild(new dojox.widget.PlaceholderMenuItem({
				label: "GridColumns"
			}));
			headerMenu.startup();
			
			// Cell context menu
			var cellMenu = new dijit.Menu();
			
			// "Edit" menu item
			this._editMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.editAction,
				disabled: !core.js.base.controllers.ActionProvider.get("menu_menu_edit").isAllowed,
				onClick: function(e) {
					var rowIndex = that._menuGrid.selection.selectedIndex;
					var item = that._menuGrid.getItem(rowIndex);
					if (item) {
						that.onEditMenu(item);
					}
				}
			});
			cellMenu.addChild(this._editMenuItem);
			
			// "Delete" menu item
			this._deleteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("menu_menu_delete").isAllowed,
				onClick: function(e) {
					var rowIndex = that._menuGrid.selection.selectedIndex;
					var item = that._menuGrid.getItem(rowIndex);
					if (item) {
						that.onDeleteMenu(item);
					}
				}
			});
			cellMenu.addChild(this._deleteMenuItem);
			
			// "Localize" menu item
			if (languages) {
				var localizePopupMenu = new dijit.Menu();
				for (var locale in languages) {
					localizePopupMenu.addChild(new dijit.MenuItem({
						appLocale: locale,
						label: languages[locale],
						iconClass: "app-icon app-flag-" + locale,
						onClick: function(e) {
							var rowIndex = that._menuGrid.selection.selectedIndex;
							var item = that._menuGrid.getItem(rowIndex);
							if (item) {
								var translations = dojo.fromJson(item.translations[0]);
								if (translations[this.appLocale]) {
									that.onEditMenu(translations[this.appLocale]);
								} else {
									that.onTranslateMenu(item, this.appLocale);
								}
							}
						}
					}));
				}
				
				cellMenu.addChild(new dijit.MenuSeparator());
				cellMenu.addChild(new dijit.PopupMenuItem({
					label: this._i18n.global._share.localizeAction,
					popup: localizePopupMenu
				}));
			}
			
			// Create grid
			this._menuGrid = new dojox.grid.EnhancedGrid({
				clientSort: false,
				rowSelector: "20px",
				style: "visibility: hidden",
				structure: layout,
				plugins: {
					dnd: true,
					menus: {
						cellMenu: cellMenu,
						headerMenu: headerMenu
					},
					nestedSorting: true
				},
				loadingMessage: "<span class='dojoxGridLoading'>" + this._i18n.global._share.loadingAction  + "</span>",
				errorMessage: "<span class='dojoxGridError'>" + this._i18n.menu.list.error + "</span>",
				noDataMessage: "<span class='dojoxGridNoData'>" + this._i18n.menu.list.notFound + "</span>"
				// rowsPerPage: 40
			});
			this._menuGrid.placeAt(this._id);
			this._menuGrid.startup();
			dijitRegistry.byId(this._id).resize();
			
			dojoOn(this._menuGrid, "rowcontextmenu", function(e) {
				var item = this.getItem(e.rowIndex);
				if (item) {
					that.onRowContextMenu(item);
				}
			});
		},
		
		showMenus: function(/*Object*/ menus) {
			// summary:
			//		Shows the list of menus
			// menus:
			//		Array of menus, formatted as dojo.data.ItemFileReadStore data structure
			var store = new dojo.data.ItemFileReadStore({
				data: menus
			});
			dojoDomStyle.set(this._menuGrid.domNode, "visibility", "visible");
			this._menuGrid.setStore(store);
		},
		
		/* ========== UPDATE STATE OF CONTROLS ============================== */
		
		allowToDelete: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the menu
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("menu_menu_delete").isAllowed;
			this._deleteMenuItem.set("disabled", !isAllowed);
			return this;	// menu.js.views.MenuGrid
		},
		
		allowToEdit: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to edit the menu
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("menu_menu_edit").isAllowed;
			this._editMenuItem.set("disabled", !isAllowed);
			return this;	// menu.js.views.MenuGrid
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onDeleteMenu: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Deletes given menu
			// tags:
			//		callback
		},
		
		onEditMenu: function(/*dojo.data.Item|String*/ item) {
			// summary:
			//		Edits given menu
			// tags:
			//		callback
		},
		
		onRowContextMenu: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Called when right-click on menu row
			// tags:
			//		callback
		},
		
		onTranslateMenu: function(/*dojo.data.Item*/ item, /*String*/ language) {
			// summary:
			//		Translates given menu to other language
			// tags:
			//		callback
		}
	});
});
