/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		message
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-26
 */

define([
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/json",
	"dojo/on",
	"dijit/registry",
	"dojo/data/ItemFileReadStore",
	"dojo/NodeList-dom",
	"dojo/parser",
	"dojo/query",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dojox/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/Menu",
	"dojox/widget/PlaceholderMenuItem",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare, dojoDom, dojoDomClass, dojoDomConstruct, dojoDomStyle, dojoJson, dojoOn, dijitRegistry) {
	return dojoDeclare("message.js.views.MessageGrid", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _messageGrid: dojox.grid.EnhancedGrid
		_messageGrid: null,
		
		// _viewMenuItem: dijit.MenuItem
		_viewMenuItem: null,
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("message/languages");
			this._i18n = core.js.base.I18N.getLocalization("message/languages");
			
			this._createGrid();
		},
		
		_createGrid: function() {
			// summary:
			//		Creates the grid
			var that = this;
			
			// Columns of the grid
			var layout = [{
				field: "subject",
				width: "300px",
				name: this._i18n.message._share.subject,
				formatter: function(subject) {
					var s = dojoJson.parse(subject);
					return "<span>" + s.subject + " <span class='app-counter'>" + s.num_messages + "</span></span>";
				}
			}, {
				field: "short_content",
				width: "300px",
				name: this._i18n.message._share.content
			}, {
				field: "from_user_name",
				width: "100px",
				name: this._i18n.message._share.fromAddress
			}, {
				field: "sent_date",
				width: "150px",
				name: this._i18n.message._share.sentDate
			}];
			
			// Header menu
			var headerMenu = new dijit.Menu();
			headerMenu.addChild(new dijit.MenuItem({
				label: this._i18n.message.list.showColumns,
				disabled: true
			}));
			headerMenu.addChild(new dijit.MenuSeparator());
			headerMenu.addChild(new dojox.widget.PlaceholderMenuItem({
				label: "GridColumns"
			}));
			
			// Cell context menu
			var cellMenu = new dijit.Menu();
			
			// "View" menu item
			this._viewMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.viewAction,
				disabled: !core.js.base.controllers.ActionProvider.get("message_message_view").isAllowed,
				onClick: function(e) {
					var rowIndex = that._messageGrid.selection.selectedIndex;
					var item = that._messageGrid.getItem(rowIndex);
					if (item) {
						that.onViewMessage(item);
					}
				}
			});
			cellMenu.addChild(this._viewMenuItem);
			
			// Create grid
			this._messageGrid = new dojox.grid.EnhancedGrid({
				clientSort: false,
				rowSelector: "20px",
				style: "visibility: hidden",
				structure: layout,
				plugins: {
					menus: {
						rowMenu: cellMenu,
						headerMenu: headerMenu
					}
				},
				loadingMessage: "<span class='dojoxGridLoading'>" + this._i18n.global._share.loadingAction  + "</span>",
				errorMessage: "<span class='dojoxGridError'>" + this._i18n.message.list.error + "</span>",
				noDataMessage: "<span class='dojoxGridNoData'>" + this._i18n.message.list.notFound + "</span>"
			});
			this._messageGrid.placeAt(this._id);
			this._messageGrid.startup();
			
			dojoOn(this._messageGrid, "rowcontextmenu", function(e) {
				var item = this.getItem(e.rowIndex);
				if (item) {
					that.onRowContextMenu(item);
				}
			});
			
			// Show an icon if the private message has attachments
			dojoOn(this._messageGrid, "styleRow", function(row) {
				var item = this.getItem(row.index);
				if (item) {
					// Find the cell showing the message's subject
					var subjectNode = dojo.query('.dojoxGridCell[idx="0"] span', row.node);
					if (item.has_attachments[0] == true) {
						dojoDomClass.add(subjectNode, "module-message-attachment");
					}
					
					// Style row to indicate unread message
					if (item.unread[0] + "" == "1") {
						dojo.query(".dojoxGridRowTable", row.node).addClass("module-message-row-unread");
						// row.customStyles += "font-weight: bold;";
					}
				}
			});
		},
		
		showMessages: function(/*Object*/ messages) {
			// summary:
			//		Shows the list of messages
			var store = new dojo.data.ItemFileReadStore({
				data: messages
			});
			dojoDomStyle.set(this._messageGrid.domNode, "visibility", "visible");
			this._messageGrid.setStore(store);
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onRowContextMenu: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Called when right-click on the message item
			// tags:
			//		callback
		},
		
		onViewMessage: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Views given message item
			// tags:
			//		callback
		}
	});
});
