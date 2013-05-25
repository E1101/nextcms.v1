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
 * @version		2012-08-24
 */

define([
	"dojo/_base/declare",
	"dojo/dom-attr",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare, dojoDomAttr) {
	return dojoDeclare("message.js.views.FolderContextMenu", null, {
		// _contextMenu: dijit.Menu
		_contextMenu: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _deleteMenuItem: dijit.MenuItem
		_deleteMenuItem: null,
		
		// _renameMenuItem: dijit.MenuItem
		_renameMenuItem: null,
		
		// folderItemView: message.js.views.FolderItemView
		_folderItemView: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("message/languages");
			this._i18n = core.js.base.I18N.getLocalization("message/languages");
			
			this._createMenu();
		},
		
		setFolderItemView: function(/*message.js.views.FolderItemView*/ folderItemView) {
			this._folderItemView = folderItemView;
			return this;	// message.js.views.FolderContextMenu
		},

		show: function() {
			// summary:
			//		Show menu context for selected folder item
			if (!this._folderItemView) {
				return;
			}
			this._contextMenu.bindDomNode(this._folderItemView.getDomNode());
			
			// Extension point
			this.onContextMenu(this._folderItemView);
		},
		
		_createMenu: function() {
			// summary:
			//		Creates the menu
			var that = this;
			
			// Create menu
			this._contextMenu = new dijit.Menu({
				id: "message.js.views.FolderContextMenu"
			});
			
			// "Delete" menu item
			this._deleteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("message_folder_delete").isAllowed,
				onClick: function() {
					that.onDeleteFolder(that._folderItemView);
				}
			});
			this._contextMenu.addChild(this._deleteMenuItem);
			
			// "Rename" item
			this._renameMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.renameAction,
				iconClass: "app-icon app-icon-rename",
				disabled: !core.js.base.controllers.ActionProvider.get("message_folder_rename").isAllowed,
				onClick: function() {
					that.onRenameFolder(that._folderItemView);
				}
			});
			this._contextMenu.addChild(this._renameMenuItem);
		},
		
		/* ========== CONTROL STATE OF MENU ITEMS =========================== */
		
		allowToDelete: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the message folder
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("message_folder_delete").isAllowed;
			this._deleteMenuItem.set("disabled", !isAllowed);
			return this;	// message.js.views.FolderContextMenu
		},
		
		allowToRename: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to rename the message folder
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("message_folder_rename").isAllowed;
			this._renameMenuItem.set("disabled", !isAllowed);
			return this;	// message.js.views.FolderContextMenu
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onContextMenu: function(/*message.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Called after showing the context menu
			// tags:
			//		callback
		},
		
		onDeleteFolder: function(/*message.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Deletes folder
			// tags:
			//		callback
		},
		
		onRenameFolder: function(/*message.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Renames folder
			// tags:
			//		callback
		}
	});
});
