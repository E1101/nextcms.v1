/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		tag
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-24
 */

define([
	"dojo/_base/declare",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare) {
	return dojoDeclare("tag.js.views.TagContextMenu", null, {
		// _contextMenu: dijit.Menu
		_contextMenu: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _editMenuItem: dijit.MenuItem
		_editMenuItem: null,
		
		// _deleteMenuItem: dijit.MenuItem
		_deleteMenuItem: null,
		
		// _tagItemView: tag.js.views.TagItemView
		_tagItemView: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("tag/languages");
			this._i18n = core.js.base.I18N.getLocalization("tag/languages");
			this._createMenu();
		},
		
		setTagItemView: function(/*tag.js.views.TagItemView*/ tagItemView) {
			this._tagItemView = tagItemView;
			return this;	// tag.js.views.TagContextMenu 
		},
		
		show: function() {
			// summary:
			//		Shows a context menu for each selected tag item
			if (!this._tagItemView) {
				return;
			}
			this._contextMenu.bindDomNode(this._tagItemView.getDomNode());
			this.onContextMenu(this._tagItemView);
		},
		
		_createMenu: function() {
			// Create menu
			this._contextMenu = new dijit.Menu({
				id: "tag.js.views.TagContextMenu"
			});
			
			var that = this;
			// "Edit" menu item
			this._editMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.editAction,
				disabled: !core.js.base.controllers.ActionProvider.get("tag_tag_edit").isAllowed,
				onClick: function() {
					that.onEditTag(that._tagItemView);
				}
			});
			this._contextMenu.addChild(this._editMenuItem);
			
			// "Delete" menu item
			this._deleteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("tag_tag_delete").isAllowed,
				onClick: function() {
					that.onDeleteTag(that._tagItemView);
				}
			});
			this._contextMenu.addChild(this._deleteMenuItem);
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onContextMenu: function(/*tag.js.views.TagItemView*/ tagItemView) {
			// tags:
			//		callback
		},
		
		onDeleteTag: function(/*tag.js.views.TagItemView*/ tagItemView) {
			// summary:
			//		Deletes given tag item
			// tags:
			//		callback
		},
		
		onEditTag: function(/*tag.js.views.TagItemView*/ tagItemView) {
			// summary:
			//		Edits given tag item
			// tags:
			//		callback
		}
	});
});
