/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		poll
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-26
 */

define([
	"dojo/_base/declare",
	"dojo/dom-style",
	"dojo/on",
	"dijit/registry",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dijit/PopupMenuItem",
	"dojo/data/ItemFileReadStore",
	"dojox/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/DnD",
	"dojox/grid/enhanced/plugins/Menu",
	"dojox/grid/enhanced/plugins/NestedSorting",
	"dojox/widget/PlaceholderMenuItem",
	"core/js/base/Config",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare, dojoDomStyle, dojoOn, dijitRegistry) {
	return dojoDeclare("poll.js.views.PollGrid", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _pollGrid: dojox.grid.EnhancedGrid
		_pollGrid: null,
		
		// _editMenuItem: dijit.MenuItem
		_editMenuItem: null,
		
		// _deleteMenuItem: dijit.MenuItem
		_deleteMenuItem: null,
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("poll/languages");
			this._i18n = core.js.base.I18N.getLocalization("poll/languages");
			
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
				name: this._i18n.poll._share.title
			}, {
				field: "created_date",
				width: "150px",
				name: this._i18n.poll._share.createdDate
			}, {
				field: "language",
				width: "150px",
				name: this._i18n.poll._share.language,
				formatter: function(language) {
					return languages ? language + " (" + languages[language] + ")" : language;
				}
			}];
			
			// Header menu
			var headerMenu = new dijit.Menu();
			headerMenu.addChild(new dijit.MenuItem({
				label: this._i18n.poll.list.showColumns,
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
				disabled: !core.js.base.controllers.ActionProvider.get("poll_poll_edit").isAllowed,
				onClick: function(e) {
					var rowIndex = that._pollGrid.selection.selectedIndex;
					var item = that._pollGrid.getItem(rowIndex);
					if (item) {
						that.onEditPoll(item);
					}
				}
			});
			cellMenu.addChild(this._editMenuItem);
			
			// "Delete" menu item
			this._deleteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("poll_poll_delete").isAllowed,
				onClick: function(e) {
					var rowIndex = that._pollGrid.selection.selectedIndex;
					var item = that._pollGrid.getItem(rowIndex);
					if (item) {
						that.onDeletePoll(item);
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
							var rowIndex = that._pollGrid.selection.selectedIndex;
							var item = that._pollGrid.getItem(rowIndex);
							if (item) {
								var translations = dojo.fromJson(item.translations[0]);
								if (translations[this.appLocale]) {
									// Edit the item
									that.onEditPoll(translations[this.appLocale]);
								} else {
									// Create a copy in other language
									that.onTranslatePoll(item, this.appLocale);
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
			this._pollGrid = new dojox.grid.EnhancedGrid({
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
				errorMessage: "<span class='dojoxGridError'>" + this._i18n.poll.list.error + "</span>",
				noDataMessage: "<span class='dojoxGridNoData'>" + this._i18n.poll.list.notFound + "</span>"
				// rowsPerPage: 40
			});
			this._pollGrid.placeAt(this._id);
			this._pollGrid.startup();
			dijitRegistry.byId(this._id).resize();
			
			dojoOn(this._pollGrid, "rowcontextmenu", function(e) {
				var item = this.getItem(e.rowIndex);
				if (item) {
					that.onRowContextMenu(item);
				}
			});
		},
		
		showPolls: function(/*Object*/ polls) {
			// summary:
			//		Shows the list of polls
			// polls:
			//		Array of polls, formatted as dojo.data.ItemFileReadStore data structure
			var store = new dojo.data.ItemFileReadStore({
				data: polls
			});
			dojoDomStyle.set(this._pollGrid.domNode, "visibility", "visible");
			this._pollGrid.setStore(store);
		},
		
		/* ========== UPDATE STATE OF CONTROLS ============================== */
		
		allowToDelete: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the poll
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("poll_poll_delete").isAllowed;
			this._deleteMenuItem.set("disabled", !isAllowed);
			return this;	// poll.js.views.PollGrid
		},
		
		allowToEdit: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to edit the poll
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("poll_poll_edit").isAllowed;
			this._editMenuItem.set("disabled", !isAllowed);
			return this;	// poll.js.views.PollGrid
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onDeletePoll: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Delete given poll item
			// tags:
			//		callback
		},
		
		onEditPoll: function(/*dojo.data.Item|String*/ item) {
			// summary:
			//		Edits given poll item
			// tags:
			//		callback
		},
		
		onRowContextMenu: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Called when right-click on the poll item
			// tags:
			//		callback
		},
		
		onTranslatePoll: function(/*dojo.data.Item*/ item, /*String*/ language) {
			// summary:
			//		Translates given item to other language
			// tags:
			//		callback
		}
	});
});
