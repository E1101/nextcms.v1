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
	return dojoDeclare("media.js.views.PlaylistContextMenu", null, {
		// _contextMenu: dijit.Menu
		//		The context menu for each playlist item
		_contextMenu: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _activateMenuItem: dijit.MenuItem
		_activateMenuItem: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
		},

		show: function(/*media.js.views.PlaylistItemView*/ playlistItemView) {
			// summary:
			//		Shows menu context for selected playlist item
			var that = this;
			
			// Create menu
			this._contextMenu = new dijit.Menu({
				targetNodeIds: [ dojoDomAttr.get(playlistItemView.getDomNode(), "id") ]
			});
			
			var playlist = playlistItemView.getPlaylist();
			
			// "Activate" menu item
			this._activateMenuItem = new dijit.MenuItem({
				label: ("activated" == playlist.status) ? this._i18n.global._share.deactivateAction : this._i18n.global._share.activateAction,
				iconClass: "app-icon " + ("activated" == playlist.status ? "app-icon-deactivate" : "app-icon-activate"),
				disabled: !core.js.base.controllers.ActionProvider.get("media_playlist_activate").isAllowed,
				onClick: function() {
					that.onActivatePlaylist(playlistItemView);
				}
			});
			this._contextMenu.addChild(this._activateMenuItem);
			
			// Delete item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("media_playlist_delete").isAllowed,
				onClick: function() {
					that.onDeletePlaylist(playlistItemView);
				}
			}));
			
			// Rename item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.renameAction,
				iconClass: "app-icon app-icon-rename",
				disabled: !core.js.base.controllers.ActionProvider.get("media_playlist_rename").isAllowed,
				onClick: function() {
					that.onRenamePlaylist(playlistItemView);
				}
			}));
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// "Add new video" item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.addNewVideoAction,
				iconClass: "app-icon app-icon-add",
				disabled: !core.js.base.controllers.ActionProvider.get("media_video_add").isAllowed,
				onClick: function() {
					that.onAddVideo(playlistItemView);
				}
			}));
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onActivatePlaylist: function(/*media.js.views.PlaylistItemView*/ playlistItemView) {
			// summary:
			//		Activates/deactivates given playlist
			// playlistItemView:
			//		The playlist item
		},
		
		onAddVideo: function(/*media.js.views.PlaylistItemView*/ playlistItemView) {
			// summary:
			//		Adds video to given playlist
			// playlistItemView:
			//		The playlist item
			// tags:
			//		callback
		},
		
		onDeletePlaylist: function(/*media.js.views.PlaylistItemView*/ playlistItemView) {
			// summary:
			//		Deletes given playlist
			// playlistItemView:
			//		The playlist item
			// tags:
			//		callback
		},
		
		onRenamePlaylist: function(/*media.js.views.PlaylistItemView*/ playlistItemView) {
			// summary:
			//		Renames given playlist
			// playlistItemView:
			//		The playlist item
			// tags:
			//		callback
		}
	});
});
