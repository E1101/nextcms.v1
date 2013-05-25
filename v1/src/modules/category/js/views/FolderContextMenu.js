/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		category
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-26
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
	return dojoDeclare("category.js.views.FolderContextMenu", null, {
		// _contextMenu: dijit.Menu
		_contextMenu: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _deleteMenuItem: dijit.MenuItem
		_deleteMenuItem: null,
		
		// _renameMenuItem: dijit.MenuItem
		_renameMenuItem: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("category/languages");
			this._i18n = core.js.base.I18N.getLocalization("category/languages");
		},

		show: function(/*category.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Shows menu context for selected folder item
			var that = this;
			
			// Create menu
			this._contextMenu = new dijit.Menu({
				targetNodeIds: [ dojoDomAttr.get(folderItemView.getDomNode(), "id") ]
			});
			
			var folder = folderItemView.getFolder();
			
			// "Delete" menu item
			this._deleteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("category_folder_delete").isAllowed,
				onClick: function() {
					that.onDeleteFolder(folderItemView);
				}
			});
			this._contextMenu.addChild(this._deleteMenuItem);
			
			// Rename item
			this._renameMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.renameAction,
				iconClass: "app-icon app-icon-rename",
				disabled: !core.js.base.controllers.ActionProvider.get("category_folder_rename").isAllowed,
				onClick: function() {
					that.onRenameFolder(folderItemView);
				}
			});
			this._contextMenu.addChild(this._renameMenuItem);
			
			this._contextMenu.startup();
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onDeleteFolder: function(/*category.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Called when the delete item is clicked
			// folderItemView:
			//		The selected folder item
			// tags:
			//		callback
		},
		
		onRenameFolder: function(/*category.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Called when the rename item is clicked
			// folderItemView:
			//		The selected folder item
			// tags:
			//		callback
		}
	});
});
