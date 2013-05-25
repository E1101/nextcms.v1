/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		comment
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-03
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
	"dojo/data/ItemFileReadStore",
	"dojox/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/Menu",
	"dojox/grid/enhanced/plugins/NestedSorting",
	"dojox/widget/PlaceholderMenuItem",
	"core/js/base/I18N"
], function(dojoDeclare, dojoDomStyle, dojoOn, dijitRegistry) {
	return dojoDeclare("comment.js.views.CommentGrid", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _grid: dojox.grid.EnhancedGrid
		_grid: null,
		
		// _viewThreadMenuItem: dijit.MenuItem
		_viewThreadMenuItem: null,
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("comment/languages");
			this._i18n = core.js.base.I18N.getLocalization("comment/languages");
			
			this._createGrid();
		},
		
		_createGrid: function() {
			// summary:
			//		Creates the grid
			var that = this;
			
			// Columns
			var layout = [{
				field: "title",
				width: "300px",
				name: this._i18n.comment._share.title
			}, {
				field: "short_content",
				width: "300px",
				name: this._i18n.comment._share.content
			}, {
				field: "created_date",
				width: "150px",
				name: this._i18n.comment._share.createdDate
			}, {
				field: "full_name",
				width: "150px",
				name: this._i18n.comment._share.fullName
			}, {
				field: "email",
				width: "200px",
				name: this._i18n.comment._share.email
			}, {
				field: "comment_id",
				width: "200px",
				name: this._i18n.comment._share.id
			}];
			
			// Header menu
			var headerMenu = new dijit.Menu();
			headerMenu.addChild(new dijit.MenuItem({
				label: this._i18n.comment.list.showColumns,
				disabled: true
			}));
			headerMenu.addChild(new dijit.MenuSeparator());
			headerMenu.addChild(new dojox.widget.PlaceholderMenuItem({
				label: "GridColumns"
			}));
			headerMenu.startup();
			
			// Cell context menu
			var cellMenu = new dijit.Menu();
			
			// "View thread" menu item
			this._viewThreadMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.viewThreadAction,
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_view").isAllowed,
				onClick: function(e) {
					var rowIndex = that._grid.selection.selectedIndex;
					var item = that._grid.getItem(rowIndex);
					if (item) {
						that.onViewThread(item);
					}
				}
			});
			cellMenu.addChild(this._viewThreadMenuItem);
			
			// Create grid
			this._grid = new dojox.grid.EnhancedGrid({
				clientSort: false,
				rowSelector: "20px",
				style: "visibility: hidden",
				structure: layout,
				plugins: {
					menus: {
						cellMenu: cellMenu,
						headerMenu: headerMenu
					},
					nestedSorting: true
				},
				loadingMessage: "<span class='dojoxGridLoading'>" + this._i18n.global._share.loadingAction  + "</span>",
				errorMessage: "<span class='dojoxGridError'>" + this._i18n.comment.list.error + "</span>",
				noDataMessage: "<span class='dojoxGridNoData'>" + this._i18n.comment.list.notFound + "</span>"
				// rowsPerPage: 40
			});
			this._grid.placeAt(this._id);
			this._grid.startup();
			dijitRegistry.byId(this._id).resize();
			
			dojoOn(this._grid, "rowcontextmenu", function(e) {
				var item = this.getItem(e.rowIndex);
				if (item) {
					that.onRowContextMenu(item);
				}
			});
		},
		
		showComments: function(/*Object*/ comments) {
			// summary:
			//		Shows the list of comments
			// menus:
			//		Array of comments, formatted as dojo.data.ItemFileReadStore data structure
			var store = new dojo.data.ItemFileReadStore({
				data: comments
			});
			dojoDomStyle.set(this._grid.domNode, "visibility", "visible");
			this._grid.setStore(store);
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onViewThread: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Shows comments in the same thread
			// tags:
			//		callback
		},
		
		onRowContextMenu: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Called when right-click on the comment item
			// tags:
			//		callback
		}
	});
});
