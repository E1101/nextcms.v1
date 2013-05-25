/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		core
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-13
 */

define([
	"dojo/_base/declare",
	"dojo/json",
	"dojo/on",
	"dojo/data/ItemFileWriteStore",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dojox/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/DnD",
	"dojox/grid/enhanced/plugins/Menu",
	"dojox/widget/PlaceholderMenuItem",
	"core/js/base/Config",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare, dojoJson, dojoOn) {
	return dojoDeclare("core.js.views.PageGrid", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _pageGrid: dojox.grid.EnhancedGrid
		_pageGrid: null,
		
		// _editMenuItem: dijit.MenuItem
		_editMenuItem: null,
		
		// _deleteMenuItem: dijit.MenuItem
		_deleteMenuItem: null,
		
		// _removeCacheMenuItem: dijit.MenuItem
		_removeCacheMenuItem: null,
		
		// _layoutMenuItem: dijit.MenuItem
		_layoutMenuItem: null,
		
		// _copyLayoutMenuItem: dijit.MenuItem
		_copyLayoutMenuItem: null,
		
		// _pasteLayoutMenuItem: dijit.MenuItem
		_pasteLayoutMenuItem: null,
		
		// _importLayoutMenuItem: dijit.MenuItem
		_importLayoutMenuItem: null,
		
		// _exportLayoutMenuItem: dijit.MenuItem
		_exportLayoutMenuItem: null,
		
		// _layoutData: Object
		_layoutData: {
			page_id: null,
			layout: null
		},
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("core/languages");
			this._i18n = core.js.base.I18N.getLocalization("core/languages");
			
			this._createGrid();
		},
		
		_createGrid: function() {
			// summary:
			//		Creates the grid
			var that = this;
			
			// Columns
			var layout = [{
				field: "name",
				width: "200px",
				name: this._i18n.page._share.name
			}, {
				field: "title",
				width: "200px",
				name: this._i18n.page._share.title
			}, {
				field: "route",
				width: "200px",
				name: this._i18n.page._share.route
			}, {
				field: "url",
				width: "200px",
				name: this._i18n.page._share.url
			}, {
				field: "ordering",
				width: "100px",
				name: this._i18n.page._share.ordering
			}, {
				field: "template",
				width: "100px",
				name: this._i18n.page._share.template
			}, {
				field: "language",
				width: "100px",
				name: this._i18n.page._share.language
			}, {
				field: "cache_lifetime",
				width: "150px",
				editable: core.js.base.controllers.ActionProvider.get("core_cache_page").isAllowed,
				name: this._i18n.page._share.cacheLifetime
			}];
			
			// Header menu
			var headerMenu = new dijit.Menu();
			headerMenu.addChild(new dijit.MenuItem({
				label: this._i18n.page.list.showColumns,
				disabled: true
			}));
			headerMenu.addChild(new dijit.MenuSeparator());
			headerMenu.addChild(new dojox.widget.PlaceholderMenuItem({
				label: "GridColumns"
			}));
			
			// Cell context menu
			var cellMenu = new dijit.Menu();
			
			// "Edit" menu item
			this._editMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.editAction,
				disabled: !core.js.base.controllers.ActionProvider.get("core_page_edit").isAllowed,
				onClick: function(e) {
					var rowIndex = that._pageGrid.selection.selectedIndex;
					var item = that._pageGrid.getItem(rowIndex);
					if (item) {
						that.onEditPage(item);
					}
				}
			});
			cellMenu.addChild(this._editMenuItem);
			
			// "Delete" menu item
			this._deleteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("core_page_delete").isAllowed,
				onClick: function(e) {
					var rowIndex = that._pageGrid.selection.selectedIndex;
					var item = that._pageGrid.getItem(rowIndex);
					if (item) {
						that.onDeletePage(item);
					}
				}
			});
			cellMenu.addChild(this._deleteMenuItem);
			
			// "Remove cache" menu item
			this._removeCacheMenuItem = new dijit.MenuItem({
				label: this._i18n.page._share.removeCacheAction,
				disabled: !core.js.base.Config.get("core", "caching") || !core.js.base.controllers.ActionProvider.get("core_cache_remove").isAllowed,
				onClick: function(e) {
					var rowIndex = that._pageGrid.selection.selectedIndex;
					var item = that._pageGrid.getItem(rowIndex);
					if (item) {
						that.onRemoveCache(item);
					}
				}
			});
			cellMenu.addChild(this._removeCacheMenuItem);
			
			cellMenu.addChild(new dijit.MenuSeparator());
			
			// "Layout" menu item
			this._layoutMenuItem = new dijit.MenuItem({
				label: this._i18n.page.list.layoutAction,
				disabled: !core.js.base.controllers.ActionProvider.get("core_page_layout").isAllowed,
				onClick: function(e) {
					var rowIndex = that._pageGrid.selection.selectedIndex;
					var item = that._pageGrid.getItem(rowIndex);
					if (item) {
						that.onLayoutPage(item);
					}
				}
			});
			cellMenu.addChild(this._layoutMenuItem);
			
			// "Copy layout" menu item
			this._copyLayoutMenuItem = new dijit.MenuItem({
				label: this._i18n.page.list.copyLayoutAction,
				disabled: !core.js.base.controllers.ActionProvider.get("core_page_layout").isAllowed,
				onClick: function(e) {
					var rowIndex = that._pageGrid.selection.selectedIndex;
					var item = that._pageGrid.getItem(rowIndex);
					if (item) {
						that._layoutData = {
							page_id: item.page_id[0],
							layout: item.layout[0]
						};
					}
				}
			});
			cellMenu.addChild(this._copyLayoutMenuItem);
			
			// "Paste layout" menu item
			this._pasteLayoutMenuItem = new dijit.MenuItem({
				label: this._i18n.page.list.pasteLayoutAction,
				disabled: !core.js.base.controllers.ActionProvider.get("core_page_layout").isAllowed,
				onClick: function(e) {
					var rowIndex = that._pageGrid.selection.selectedIndex;
					var item = that._pageGrid.getItem(rowIndex);
					if (item && that._layoutData) {
						that.onPasteLayout(item, that._layoutData.layout);
					}
				}
			});
			cellMenu.addChild(this._pasteLayoutMenuItem);
			
			// "Import layout" menu item
			this._importLayoutMenuItem = new dijit.MenuItem({
				label: this._i18n.page._share.importLayoutAction,
				iconClass: "app-icon app-icon-import",
				disabled: !core.js.base.controllers.ActionProvider.get("core_page_import").isAllowed,
				onClick: function(e) {
					var rowIndex = that._pageGrid.selection.selectedIndex;
					var item = that._pageGrid.getItem(rowIndex);
					if (item) {
						that.onImportLayout(item);
					}
				}
			});
			cellMenu.addChild(this._importLayoutMenuItem);
			
			// "Export layout" menu item
			this._exportLayoutMenuItem = new dijit.MenuItem({
				label: this._i18n.page._share.exportLayoutAction,
				iconClass: "app-icon app-icon-export",
				disabled: !core.js.base.controllers.ActionProvider.get("core_page_export").isAllowed,
				onClick: function(e) {
					var rowIndex = that._pageGrid.selection.selectedIndex;
					var item = that._pageGrid.getItem(rowIndex);
					if (item) {
						that.onExportLayout(item);
					}
				}
			});
			cellMenu.addChild(this._exportLayoutMenuItem);
			
			// "Localize" menu item
			var languages = core.js.base.Config.get("core", "localization_languages");
			if (languages) {
				var localizePopupMenu = new dijit.Menu();
				for (var locale in languages) {
					localizePopupMenu.addChild(new dijit.MenuItem({
						appLocale: locale,
						label: languages[locale],
						iconClass: "app-icon app-flag-" + locale,
						onClick: function(e) {
							var rowIndex = that._pageGrid.selection.selectedIndex;
							var item = that._pageGrid.getItem(rowIndex);
							if (item) {
								var translations = dojoJson.parse(item.translations[0]);
								if (translations[this.appLocale]) {
									that.onEditPage(translations[this.appLocale]);
								} else {
									that.onTranslatePage(item, this.appLocale);
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
			this._pageGrid = new dojox.grid.EnhancedGrid({
				clientSort: false,
				rowSelector: "20px",
				structure: layout,
				plugins: {
					dnd: true,
					menus: {
						cellMenu: cellMenu,
						headerMenu: headerMenu
					}
				},
				loadingMessage: "<span class='dojoxGridLoading'>" + this._i18n.global._share.loadingAction + "</span>",
				errorMessage: "<span class='dojoxGridError'>" + this._i18n.page.list.error + "</span>",
				noDataMessage: "<span class='dojoxGridNoData'>" + this._i18n.page.list.notFound + "</span>"
			});
			this._pageGrid.placeAt(this._id);
			this._pageGrid.startup();
			
			dojoOn(this._pageGrid, "applycelledit", function(inValue, inRowIndex, inFieldIndex) {
				if ("cache_lifetime" == inFieldIndex && inValue) {
					inValue  = parseInt(inValue);
					var item = that._pageGrid.getItem(inRowIndex);
					that.onSetCacheLifetime(item, inValue);
				}
			});
			
			dojoOn(this._pageGrid, "rowcontextmenu", function(e) {
				var item = this.getItem(e.rowIndex);
				if (item) {
					that.onRowContextMenu(item);
				}
			});
		},
		
		showPages: function(/*Object*/ pages) {
			// summary:
			//		Shows the list of pages
			this._layoutData = {
				page_id: null,
				layout: null
			};
			var store = new dojo.data.ItemFileWriteStore({
				data: pages
			});
			this._pageGrid.setStore(store);
		},
		
		getGrid: function() {
			// summary:
			//		Gets the grid instance
			return this._pageGrid;		// dojox.grid.EnhancedGrid
		},
		
		getCurrentLayoutData: function() {
			// summary:
			//		Gets the current layout data
			return this._layoutData;	// Object
		},
		
		/* ========== CONTROL STATE ========================================= */
		
		allowToCopyLayout: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to copy the layout data
			this._copyLayoutMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.PageGrid
		},
		
		allowToExportLayout: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to export the layout
			this._exportLayoutMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.PageGrid
		},
		
		allowToPasteLayout: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to paste the layout data
			this._pasteLayoutMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.PageGrid
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onDeletePage: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Deletes given page item
			// tags:
			//		callback
		},
		
		onEditPage: function(/*dojo.data.Item|String*/ item) {
			// summary:
			//		Edits given page item
			// tags:
			//		callback
		},
		
		onExportLayout: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Exports layout of given page
			// tags:
			//		callback
		},
		
		onImportLayout: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Imports layout of given page
			// tags:
			//		callback
		},
		
		onLayoutPage: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Layouts given page item
			// tags:
			//		callback
		},
		
		onPasteLayout: function(/*dojo.data.Item*/ item, /*String*/ layoutData) {
			// summary:
			//		Pastes layout data
			// layoutData:
			//		The layout data which will be set to the selected page
			// tags:
			//		callback
		},
		
		onRemoveCache: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Removes cache of selected page
			// tags:
			//		callback
		},
		
		onRowContextMenu: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Called when right-click on the page item
			// tags:
			//		callback
		},
		
		onSetCacheLifetime: function(/*dojo.data.Item*/ item, /*Integer*/ numSeconds) {
			// summary:
			//		Sets page cache lifetime
			// numSeconds:
			//		The number of seconds
			// tags:
			//		callback
		},
		
		onTranslatePage: function(/*dojo.data.Item*/ item, /*String*/ language) {
			// summary:
			//		Translates given menu to other language
			// tags:
			//		callback
		}
	});
});
