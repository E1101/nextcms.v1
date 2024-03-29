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
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-attr",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dijit/PopupMenuItem",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoArray, dojoDeclare, dojoDomAttr) {
	return dojoDeclare("media.js.views.PhotoContextMenu", null, {
		// _contextMenu: dijit.Menu
		//		The context menu for each photo item
		_contextMenu: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _selectedAlbumItemView: media.js.views.AlbumItemView
		//		The selected album item view. It is used to set the label of some menu items base on the selected album.
		_selectedAlbumItemView: null,
		
		// _activateMenuItem: dijit.MenuItem
		_activateMenuItem: null,
		
		// _setCoverMenuItem: dijit.MenuItem
		_setCoverMenuItem: null,
		
		// _removeFromAlbumMenuItem: dijit.MenuItem
		_removeFromAlbumMenuItem: null,
		
		// _editorPopupMenuItem: dijit.PopupMenuItem
		_editorPopupMenuItem: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
		},
		
		show: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		Shows menu context for selected photo item
			// photoItemView:
			//		The selected photo item
			var that = this;
			
			// Create menu
			this._contextMenu = new dijit.Menu({
				targetNodeIds: [ dojoDomAttr.get(photoItemView.getDomNode(), "id") ]
			});
			var photo = photoItemView.getPhoto();
			
			// "Activate" menu item
			this._activateMenuItem = new dijit.MenuItem({
				label: ("activated" == photo.status) ? this._i18n.global._share.deactivateAction : this._i18n.global._share.activateAction,
				iconClass: "app-icon " + ("activated" == photo.status ? "app-icon-deactivate" : "app-icon-activate"),
				disabled: !core.js.base.controllers.ActionProvider.get("media_photo_activate").isAllowed,
				onClick: function() {
					that.onActivatePhoto(photoItemView);
				}
			});
			this._contextMenu.addChild(this._activateMenuItem);
			
			// Update information item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.editAction,
				disabled: !core.js.base.controllers.ActionProvider.get("media_photo_update").isAllowed,
				onClick: function() {
					that.onUpdatePhoto(photoItemView);
				}
			}));
			
			// Delete item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("media_photo_delete").isAllowed,
				onClick: function() {
					that.onDeletePhoto(photoItemView);
				}
			}));
			
			// Rename item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.renameAction,
				iconClass: "app-icon app-icon-rename",
				disabled: !core.js.base.controllers.ActionProvider.get("media_photo_rename").isAllowed,
				onClick: function() {
					that.onRenamePhoto(photoItemView);
				}
			}));
			
			// Replace item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.replaceAction,
				disabled: !core.js.base.controllers.ActionProvider.get("media_photo_replace").isAllowed,
				onClick: function() {
					that.onReplacePhoto(photoItemView);
				}
			}));
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// Set cover item
			this._setCoverMenuItem = new dijit.MenuItem({
				label: this._i18n.album.cover.setCoverAction,
				disabled: !core.js.base.controllers.ActionProvider.get("media_album_cover").isAllowed,
				onClick: function() {
					that.onSetCover(photoItemView);
				}
			});
			this._contextMenu.addChild(this._setCoverMenuItem);
			
			// Remove photo from album
			this._removeFromAlbumMenuItem = new dijit.MenuItem({
				label: this._i18n.photo.remove.removeAction,
				disabled: !core.js.base.controllers.ActionProvider.get("media_photo_remove").isAllowed,
				onClick: function() {
					that.onRemoveFromAlbum(photoItemView);
				}
			});
			this._contextMenu.addChild(this._removeFromAlbumMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// Editor
			var editorPopupMenu = new dijit.Menu();
			editorPopupMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.chooseSizeAction,
				disabled: true
			}));
			editorPopupMenu.addChild(new dijit.MenuSeparator());
			dojoArray.forEach(["square", "thumbnail", "small", "crop", "medium", "large"], function(size) {
				editorPopupMenu.addChild(new dijit.MenuItem({
					label: that._i18n.global._share[size + "Size"],
					onClick: function() {
						that.onEditPhoto(photoItemView, size);
					}
				}));
			});
			
			this._editorPopupMenuItem = new dijit.PopupMenuItem({
				label: this._i18n.photo.edit.imageEditor,
				iconClass: "app-icon module-media-icon-edit",
				popup: editorPopupMenu,
				disabled: !core.js.base.controllers.ActionProvider.get("media_photo_edit").isAllowed
			});
			this._contextMenu.addChild(this._editorPopupMenuItem);
			
			// Download
			var downloadPopupMenu = new dijit.Menu();
			downloadPopupMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.chooseSizeAction,
				disabled: true
			}));
			downloadPopupMenu.addChild(new dijit.MenuSeparator());
			dojoArray.forEach(["square", "thumbnail", "small", "crop", "medium", "large", "original"], function(size) {
				downloadPopupMenu.addChild(new dijit.MenuItem({
					label: that._i18n.global._share[size + "Size"],
					onClick: function() {
						that.onDownloadPhoto(photoItemView, size);
					}
				}));
			});
			
			this._contextMenu.addChild(new dijit.PopupMenuItem({
				label: this._i18n.global._share.downloadAction,
				iconClass: "app-icon app-icon-download",
				popup: downloadPopupMenu
			}));
			
			this._contextMenu.startup();
			
			// Extension point
			this.onContextMenu(photoItemView);
		},
		
		/* ========== CONTROL ITEM STATE ==================================== */
		
		allowToEdit: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to edit a photo
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("media_photo_edit").isAllowed;
			this._editorPopupMenuItem.set("disabled", !isAllowed);
			return this;	// media.js.views.PhotoContextMenu
		},
		
		allowToRemove: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to remove a photo from an album
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("media_photo_remove").isAllowed;
			this._removeFromAlbumMenuItem.set("disabled", !isAllowed);
			return this;	// media.js.views.PhotoContextMenu
		},
		
		allowToSetCover: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to set a photo as cover of an album
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("media_album_cover").isAllowed;
			this._setCoverMenuItem.set("disabled", !isAllowed);
			return this;	// media.js.views.PhotoContextMenu
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onActivatePhoto: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		Activates the photo
			// photoItemView:
			//		The selected photo item
			// tags:
			//		callback
		},
		
		onContextMenu: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		Called when user right-click a photo item
			// photoItemView:
			//		The selected photo item
			// tags:
			//		callback
		},
		
		onDeletePhoto: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		This method is called when the delete menu item is clicked
			// photoItemView:
			//		The selected photo item
			// tags:
			//		callback
		},
		
		onDownloadPhoto: function(/*media.js.views.PhotoItemView*/ photoItemView, /*String*/ size) {
			// summary:
			//		Download the photo thumbnail
			// photoItemView:
			//		The selected photo item
			// size:
			//		The thumbnail size, can be: square, thumbnail, small, crop, medium, large, original
			// tags:
			//		callback
		},
		
		onEditPhoto: function(/*media.js.views.PhotoItemView*/ photoItemView, /*String*/ size) {
			// summary:
			//		Load the photo editor for given size of thumbnail
			// photoItemView:
			//		The selected photo item
			// size:
			//		The thumbnail size, can be: square, thumbnail, small, crop, medium, large
			// tags:
			//		callback
		},
		
		onRemoveFromAlbum: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		This method is called when the remove menu item is clicked
			// photoItemView:
			//		The selected photo item
			// tags:
			//		callback
		},
		
		onRenamePhoto: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		This method is called when the rename menu item is clicked
			// photoItemView:
			//		The selected photo item
			// tags:
			//		callback
		},
		
		onReplacePhoto: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		Replaces photo with other one
			// photoItemView:
			//		The selected photo item
			// tags:
			//		callback
		},
		
		onSetCover: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		This method is called when the set cover menu item is clicked
			// photoItemView:
			//		The selected photo item
			// tags:
			//		callback
		},
		
		onUpdatePhoto: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		This method is called when the update menu item is clicked
			// photoItemView:
			//		The selected photo item
			// tags:
			//		callback
		}
	});
});
