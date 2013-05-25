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
	"dojo/dom",
	"dojo/dom-class",
	"dijit/registry",
	"dojo/dnd/Target",
	"dojo/NodeList-dom",
	"dojo/query",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/dnd/TargetManager",
	"media/js/views/PlaylistItemView"
], function(dojoDeclare, dojoDom, dojoDomClass, dijitRegistry) {
	return dojoDeclare("media.js.views.PlaylistListView", null, {
		// _id: String
		//		Id of the DomNode
		_id: null,
		
		// _domNode: DomNode
		_domNode: null,
		
		// _playlistIdViewHash: Object
		//		Maps the playlist's Id with associated playlist item
		_playlistIdViewHash: {},
		
		// _selectedPlaylistItemView: media.js.views.PlaylistItemView
		_selectedPlaylistItemView: null,
		
		constructor: function(/*String*/ id) {
			this._id      = id;
			this._domNode = dojoDom.byId(id);
			
			this._init();
		},
		
		_init: function() {
			var that = this;
			this._playlistIdViewHash = {};
			dojo.query(".module-media-playlist", this._id).forEach(function(node, index, arr) {
				var playlistItemView = new media.js.views.PlaylistItemView(node, that);
				that._playlistIdViewHash[playlistItemView.getPlaylist().playlist_id + ""] = playlistItemView;
				
				if (dojoDomClass.contains(node, "module-media-playlist-active")) {
					that._selectedPlaylistItemView = playlistItemView;
				}
				
				if (core.js.base.controllers.ActionProvider.get("media_playlist_cover").isAllowed) {
					var coverNode = playlistItemView.getPosterNode();
					new dojo.dnd.Target(coverNode, {
						accept: ["appDndImage"],
						onDropExternal: function(source, nodes, copy) {
							var thumbnails = core.js.base.dnd.TargetManager.getThumbnails(nodes[0]);
							if (thumbnails != false) {
								that.onUpdatePoster(playlistItemView, thumbnails);
							}
						}
					});
				}
			});
		},
		
		getDomNode: function() {
			return this._domNode;	// Object
		},
		
		getPlaylistItemView: function(/*String*/ playlistId) {
			// summary:
			//		Gets a playlist item view by given playlist's Id
			if (!this._playlistIdViewHash[playlistId + ""]) {
				return null;
			}
			return this._playlistIdViewHash[playlistId + ""];		// media.js.views.PlaylistItemView
		},
		
		getSelectedPlaylistItemView: function() {
			// summary:
			//		Gets the selected playlist item
			return this._selectedPlaylistItemView;		// media.js.views.PlaylistItemView
		},
		
		setContent: function(/*String*/ html) {
			// summary:
			//		Sets the content of list view container
			dijitRegistry.byId(this._id).set("content", html);
			
			// Re-init
			this._init();
		},
		
		setSelectedPlaylistItemView: function(/*media.js.views.PlaylistItemView*/ playlistItemView) {
			// summary:
			//		Sets the selected playlist
			if (playlistItemView) {
				dojo.query(".module-media-playlist-active", this._domNode).removeClass("module-media-playlist-active");
				dojo.query(playlistItemView.getDomNode()).addClass("module-media-playlist-active");
			}
			
			this._selectedPlaylistItemView = playlistItemView;
		},
		
		setViewType: function(/*String*/ viewType) {
			// summary:
			//		Shows the list of playlists in a given type of view
			// viewType:
			//		Can be "list" or "grid"
			for (var playlistId in this._playlistIdViewHash) {
				this._playlistIdViewHash[playlistId + ""].setViewType(viewType);
			}
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onClickPlaylist: function(/*media.js.views.PlaylistItemView*/ playlistItemView) {
			// summary:
			//		Called when user click a playlist item
			// playlistItemView:
			//		The selected playlist item
			// tags:
			//		callback
		},
		
		onDropVideos: function(/*media.js.views.PlaylistItemView*/ playlistItemView, /*DomNode[]*/ videoNodes) {
			// summary:
			//		Called when user drop video items to the selected playlist
			// tags:
			//		callback
		},
		
		onMouseDown: function(/*media.js.views.PlaylistItemView*/ playlistItemView) {
			// summary:
			//		Called when user right-click a playlist item
			// playlistItemView:
			//		The selected playlist item
			// tags:
			//		callback
		},
		
		onUpdatePoster: function(/*media.js.views.PlaylistItemView*/ playlistItemView, /*Object*/ thumbnails) {
			// summary:
			//		Updates the playlist's poster
			// tags:
			//		callback
		}
	});
});
