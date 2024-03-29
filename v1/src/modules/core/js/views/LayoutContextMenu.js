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
 * @version		2012-09-14
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/on",
	"dijit/registry",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dijit/PopupMenuItem",
	"core/js/base/I18N"
], function(dojoArray, dojoDeclare, dojoLang, dojoDom, dojoDomConstruct, dojoOn, dijitRegistry) {
	return dojoDeclare("core.js.views.LayoutContextMenu", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _selectedWidget: dijit._Widget
		_selectedWidget: null,
		
		// _contextMenu: dijit.Menu
		_contextMenu: null,
		
		// _insertBorderContainerMenu: dijit.Menu
		_insertBorderContainerMenu: null,
		
		// _deleteBorderContainerMenuItem: dijit.MenuItem
		_deleteBorderContainerMenuItem: null,
		
		// _insertGridContainerMenuItem: dijit.MenuItem
		_insertGridContainerMenuItem: null,
		
		// _setGridColumnsMenu: dijit.Menu
		_setGridColumnsMenu: null,
		
		// _deleteGridContainer: dijit.MenuItem
		_deleteGridContainerMenuItem: null,
		
		// _settings: Object
		_settings: {
			minGridColumns: 1,
			maxGridColumns: 10
		},
		
		constructor: function(/*String*/ id, /*Object?*/ settings) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("core/languages");
			this._i18n = core.js.base.I18N.getLocalization("core/languages");
			
			settings = dojoLang.mixin(this._settings, settings);
			this._createContextMenu();
		},
		
		_createContextMenu: function() {
			// summary:
			//		Creates the context menu
			var contextMenuId = this._id + "_ContextMenu";
			var div = dojoDomConstruct.create("div", { id: contextMenuId }, dojoDom.byId(this._id));
			this._contextMenu = new dijit.Menu({
				targetNodeIds: [ contextMenuId ]
			});
				
			var that = this;
			
			// "Insert border container" menu items
			this._insertBorderContainerMenu = new dijit.Menu();
			
			dojoArray.forEach(["top", "left", "right", "bottom"], function(region) {
				that._insertBorderContainerMenu.addChild(new dijit.MenuItem({
					label: that._i18n.page._share[region + "Region"],
					onClick: function() {
						if (that._selectedWidget) {
							that.onAddBorderContainer(that._selectedWidget, region);
						}
					}
				}));
			});
			this._contextMenu.addChild(new dijit.PopupMenuItem({
				label: this._i18n.page._share.insertBorderContainer,
				iconClass: "app-icon module-core-layout-icon-add",
				popup: this._insertBorderContainerMenu
			}));
			
			// "Delete border container" menu item
			this._deleteBorderContainerMenuItem = new dijit.MenuItem({
				label: that._i18n.page._share.deleteBorderContainer,
				iconClass: "app-icon module-core-layout-icon-delete",
				onClick: function() {
					if (that._selectedWidget) {
						that.onDeleteBorderContainer(that._selectedWidget);
					}
				}
			});
			this._contextMenu.addChild(this._deleteBorderContainerMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// "Insert grid container" menu item
			this._insertGridContainerMenuItem = new dijit.MenuItem({
				label: that._i18n.page._share.insertGridContainer,
				onClick: function() {
					if (that._selectedWidget) {
						that.onAddGridContainer(that._selectedWidget);
					}
				}
			});
			this._contextMenu.addChild(this._insertGridContainerMenuItem);
			
			// "Set columns" menu item
			this._setGridColumnsMenu = new dijit.Menu();
			
			for (var i = this._settings.minGridColumns; i <= this._settings.maxGridColumns; i++) {
				this._setGridColumnsMenu.addChild(new dijit.MenuItem({
					label: i,
					value: i,
					onClick: function() {
						if (that._selectedWidget) {
							that.onSetGridColumns(that._selectedWidget, this.value);
						}
					}
				}));
			}
			this._contextMenu.addChild(new dijit.PopupMenuItem({
				label: this._i18n.page._share.setGridColumns,
				popup: this._setGridColumnsMenu
			}));
			
			// "Delete grid container" menu item
			this._deleteGridContainerMenuItem = new dijit.MenuItem({
				label: that._i18n.page._share.deleteGridContainer,
				iconClass: "app-icon module-core-layout-icon-delete",
				onClick: function() {
					if (that._selectedWidget) {
						that.onDeleteGridContainer(that._selectedWidget);
					}
				}
			});
			this._contextMenu.addChild(this._deleteGridContainerMenuItem);
			
			// Attach the context menu
			this.attach();
			dojoOn(this._contextMenu, "_openMyself", function(e) {
				var widget = dijitRegistry.getEnclosingWidget(e.target);
				if (widget) {
					that._selectedWidget = widget;
					that.onContextMenu(widget);
				}
			});
		},
		
		attach: function() {
			// summary:
			//		Attach the menu to node
			this._contextMenu.bindDomNode(this._id);
		},
		
		detach: function() {
			// summary:
			//		Detach the menu from node
			this._contextMenu.unBindDomNode(this._id);
		},
		
		/* ========== CONTROL STATE ========================================= */
		
		allowToDeleteBorderContainer: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the border container
			this._deleteBorderContainerMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutContextMenu
		},
		
		allowToDeleteGridContainer: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the grid container
			this._deleteGridContainerMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutContextMenu
		},
		
		allowToInsertBorderContainer: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to insert border container
			dojoArray.forEach(this._insertBorderContainerMenu.getChildren(), function(menuItem) {
				menuItem.set("disabled", !isAllowed);
			});
			return this;	// core.js.views.LayoutContextMenu
		},
		
		allowToInsertGridContainer: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to insert grid container
			this._insertGridContainerMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutContextMenu
		},
		
		allowToSetGridColumns: function(/*Boolean*/ isAllowed, /*Integer?*/ numColumns) {
			// summary:
			//		Allows/disallows to set the number of columns to grid container
			// numColumns:
			//		If this param is not specified, the methods will enable/disable all the menu items
			//		which set the number of columns to the grid container
			var children = this._setGridColumnsMenu.getChildren();
			if (numColumns && children[numColumns - 1]) {
				children[numColumns - 1].set("disabled", !isAllowed);
				return this;	// core.js.views.LayoutContextMenu
			}
			
			dojoArray.forEach(children, function(menuItem) {
				menuItem.set("disabled", !isAllowed);
			});
			return this;	// core.js.views.LayoutContextMenu
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onAddBorderContainer: function(/*dijit.layout.BorderContainer*/ container, /*String*/ region) {
			// tags:
			//		callback
		},
		
		onAddGridContainer: function(/*dijit.layout.BorderContainer*/ container) {
			// tags:
			//		callback
		},
		
		onContextMenu: function(/*dijit._Widget*/ widget) {
			// tags:
			//		callback
		},
		
		onDeleteBorderContainer: function(/*dijit.layout.BorderContainer*/ container) {
			// tags:
			//		callback
		},
		
		onDeleteGridContainer: function(/*dijit.layout.BorderContainer*/ container) {
			// tags:
			//		callback
		},
		
		onSetGridColumns: function(/*dojox.layout.GridContainer*/ container, /*Integer*/ numColumns) {
			// tags:
			//		callback
		}		
	});
});
