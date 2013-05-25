/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		media
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-30
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
	return dojoDeclare("media.js.views.AlbumContextMenu", null, {
		// _contextMenu: dijit.Menu
		//		The context menu for each album item
		_contextMenu: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _activateMenuItem: dijit.MenuItem
		_activateMenuItem: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
		},

		show: function(/*media.js.views.AlbumItemView*/ albumItemView) {
			// summary:
			//		Shows menu context for selected album item
			var that = this;
			
			// Create menu
			this._contextMenu = new dijit.Menu({
				targetNodeIds: [ dojoDomAttr.get(albumItemView.getDomNode(), "id") ]
			});
			
			var album = albumItemView.getAlbum();
			
			// "Activate" menu item
			this._activateMenuItem = new dijit.MenuItem({
				label: ("activated" == album.status) ? this._i18n.global._share.deactivateAction : this._i18n.global._share.activateAction,
				iconClass: "app-icon " + ("activated" == album.status ? "app-icon-deactivate" : "app-icon-activate"),
				disabled: !core.js.base.controllers.ActionProvider.get("media_album_activate").isAllowed,
				onClick: function() {
					that.onActivateAlbum(albumItemView);
				}
			});
			this._contextMenu.addChild(this._activateMenuItem);
			
			// Delete item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("media_album_delete").isAllowed,
				onClick: function() {
					that.onDeleteAlbum(albumItemView);
				}
			}));
			
			// Rename item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.renameAction,
				iconClass: "app-icon app-icon-rename",
				disabled: !core.js.base.controllers.ActionProvider.get("media_album_rename").isAllowed,
				onClick: function() {
					that.onRenameAlbum(albumItemView);
				}
			}));
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// Upload item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.uploadAction,
				iconClass: "app-icon app-icon-upload",
				disabled: !core.js.base.controllers.ActionProvider.get("media_photo_upload").isAllowed,
				onClick: function() {
					that.onUploadToAlbum(albumItemView);
				}
			}));
			
			this._contextMenu.startup();
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onActivateAlbum: function(/*media.js.views.AlbumItemView*/ albumItemView) {
			// summary:
			//		Activates/deactivates album
			// albumItemView:
			//		The selected album item
			// tags:
			//		callback
		},
		
		onDeleteAlbum: function(/*media.js.views.AlbumItemView*/ albumItemView) {
			// summary:
			//		This method is called when the delete item is clicked
			// albumItemView:
			//		The selected album item
			// tags:
			//		callback
		},
		
		onRenameAlbum: function(/*media.js.views.AlbumItemView*/ albumItemView) {
			// summary:
			//		This method is called when the rename item is clicked
			// albumItemView:
			//		The selected album item
			// tags:
			//		callback
		},
		
		onUploadToAlbum: function(/*media.js.views.AlbumItemView*/ albumItemView) {
			// summary:
			//		This method is called when the upload item is clicked
			// albumItemView:
			//		The selected album item
			// tags:
			//		callback
		}
	});
});
