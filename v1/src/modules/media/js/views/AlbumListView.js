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
	"media/js/views/AlbumItemView"
], function(dojoDeclare, dojoDom, dojoDomClass, dijitRegistry) {
	return dojoDeclare("media.js.views.AlbumListView", null, {
		// _id: String
		//		Id of the DomNode
		_id: null,
		
		// _domNode: DomNode
		//		The DomNode of album list
		_domNode: null,
		
		// _albumIdViewHash: Object
		//		Maps the album's Id with associated album item. It will be used to retrive the album item based on album's Id
		_albumIdViewHash: {},
		
		// _selectedAlbumItemView: media.js.views.AlbumItemView
		_selectedAlbumItemView: null,
		
		constructor: function(/*String*/ id) {
			this._id      = id;
			this._domNode = dojoDom.byId(id);
			
			this._init();
		},
		
		getId: function() {
			return this._id;	// String
		},
		
		getDomNode: function() {
			return this._domNode; 	// DomNode
		},
		
		_init: function() {
			var that = this;
			this._albumIdViewHash = {};
			dojo.query(".module-media-album", this._id).forEach(function(node, index, arr) {
				var albumItemView = new media.js.views.AlbumItemView(node, that);
				
				that._albumIdViewHash[albumItemView.getAlbum().album_id + ""] = albumItemView;
				
				if (dojoDomClass.contains(node, "module-media-album-active")) {
					that._selectedAlbumItemView = albumItemView;
				}
				
				if (core.js.base.controllers.ActionProvider.get("media_album_cover").isAllowed) {
					var coverNode = albumItemView.getCoverNode();
					new dojo.dnd.Target(coverNode, {
						accept: ["appDndImage"],
						onDropExternal: function(source, nodes, copy) {
							var thumbnails = core.js.base.dnd.TargetManager.getThumbnails(nodes[0]);
							if (thumbnails != false) {
								that.onUpdateCover(albumItemView, thumbnails);
							}
						}
					});
				}
			});
		},
		
		setContent: function(/*String*/ html) {
			// summary:
			//		Set the content of list view container
			// description:
			//		This method should be called when adding, removing an album item, etc, and I want to 
			//		reload the entire list
			dijitRegistry.byId(this._id).set("content", html);
			
			// Re-init
			this._init();
		},
		
		getAlbumItemView: function(/*String*/ albumId) {
			// summary:
			//		Returns the album item view by given album's Id
			if (!this._albumIdViewHash[albumId + ""]) {
				return null;
			}
			return this._albumIdViewHash[albumId + ""];		// media.js.views.AlbumItemView 
		},
		
		setSelectedAlbumItemView: function(/*media.js.views.AlbumItemView*/ albumItemView) {
			if (albumItemView) {
				dojo.query(".module-media-album-active", this._domNode).removeClass("module-media-album-active");
				dojo.query(albumItemView.getDomNode()).addClass("module-media-album-active");
			}
			
			this._selectedAlbumItemView = albumItemView;
		},
		
		getSelectedAlbumItemView: function() {
			return this._selectedAlbumItemView;		// media.js.views.AlbumItemView
		},
		
		setViewType: function(/*String*/ viewType) {
			// summary:
			//		Show the list of albums in a given type of view
			// viewType:
			//		Can be "list" or "grid"
			for (var albumId in this._albumIdViewHash) {
				this._albumIdViewHash[albumId + ""].setViewType(viewType);
			}
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onClickAlbum: function(/*media.js.views.AlbumItemView*/ albumItemView) {
			// summary:
			//		Called when user click an album item
			// albumItemView:
			//		The selected album item
			// tags:
			//		callback
		},
		
		onDropPhotos: function(/*media.js.views.AlbumItemView*/ albumItemView, /*DomNode[]*/ photoNodes) {
			// summary:
			//		Called when user drop photo items to the selected album
			// tags:
			//		callback
		},
		
		onMouseDown: function(/*media.js.views.AlbumItemView*/ albumItemView) {
			// summary:
			//		Called when user right-click an album item
			// albumItemView:
			//		The selected album item
			// tags:
			//		callback
		},
		
		onUpdateCover: function(/*media.js.views.AlbumItemView*/ albumItemView, /*Object*/ thumbnails) {
			// summary:
			//		Updates the album's cover
			// tags:
			//		callback
		}
	});
});
