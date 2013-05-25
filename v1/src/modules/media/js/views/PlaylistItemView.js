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
	"dojo/dom-class",
	"dojo/mouse",
	"dojo/on",
	"dojo/dnd/Target",
	"dojo/query",
	"core/js/base/Encoder",
	"core/js/Constant"
], function(dojoDeclare, dojoDomAttr, dojoDomClass, dojoMouse, dojoOn) {
	return dojoDeclare("media.js.views.PlaylistItemView", null, {
		// _domNode: DomNode
		//		The DomNode of playlist item 
		_domNode: null,
		
		// _playlistTitleNode: DomNode
		_playlistTitleNode: null,
		
		// _playlist: Object
		//		Contains the playlist properties
		_playlist: null,
		
		// _playlistListView: media.js.views.PlaylistListView
		//		The list view that the playlist item belong to
		_playlistListView: null,
		
		constructor: function(/*DomNode*/ domNode, /*media.js.views.PlaylistListView*/ playlistListView) {
			this._domNode			= domNode;
			this._playlistTitleNode = dojo.query(".module-media-playlist-title", this._domNode)[0];
			this._playlistListView	= playlistListView;
			
			var data = core.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props"));
			this._playlist = data;
			
			this._init();
			this.setViewType(data.view_type);
		},

		getDomNode: function() {
			return this._domNode;	// DomNode
		},
		
		getPosterNode: function() {
			// summary:
			//		Gets the node that shows the playlist's poster
			return dojo.query(".module-media-playlist-poster", this._domNode)[0];	// DomNode
		},
		
		getPlaylist: function() {
			// summary:
			//		Gets the playlist object
			return this._playlist;	// Object
		},
		
		_init: function() {
			// summary:
			//		Initialize node
			var that = this;
			
			dojoOn(this._playlistTitleNode, "click", function(e) {
				that._playlistListView.onClickPlaylist(that);
			});
			dojoOn(this._domNode, "contextmenu", function(e) {
				e.preventDefault();
			});
			dojoOn(this._domNode, "mousedown", function(e) {
				if (dojoMouse.isRight(e)) {
					e.preventDefault();
					that._playlistListView.onMouseDown(that);
				}
			});
			
			// Allow to drag multiple videos to playlist
			new dojo.dnd.Target(this._domNode, {
				accept: ["mediaVideoItemDnd"],
				onDropExternal: function(source, nodes, copy) {
					that._playlistListView.onDropVideos(that, nodes);
				}
			});
		},
		
		increaseVideoCounter: function(/*Integer*/ increasingNumber) {
			// summary:
			//		Increases (or descreases) the number of videos in the playlist
			// increasingNumber:
			//		The number of videos that will be added to or removed from the playlist
			var nodes =  dojo.query(".app-counter", this._domNode);
			if (nodes.length > 0) {
				var numVideos	   = parseInt(nodes[0].innerHTML);
				nodes[0].innerHTML = numVideos + increasingNumber;
			}
		},
		
		setViewType: function(/*String*/ viewType) {
			// summary:
			//		Sets the view type
			// viewType:
			//		Can be "list" or "grid"
			var currentClass = ("list" == viewType) ? "module-media-playlist-grid" : "module-media-playlist-list";
			var newClass	 = ("list" == viewType) ? "module-media-playlist-list" : "module-media-playlist-grid";
			
			dojoDomClass.remove(this._domNode, currentClass);
			dojoDomClass.add(this._domNode, newClass);
		},
		
		updatePoster: function(/*Object*/ thumbnails) {
			// summary:
			//		Updates the poster image
			// thumbnails:
			//		Contains the following members:
			//		- video_id: Id of poster video
			//		- "square", "thumbnail", "small", "crop", "medium", "large", "original": 
			//		Value of these members are the full URL associating with the size
			var poster = this.getPosterNode();
			dojoDomAttr.set(poster, "src", core.js.Constant.normalizeUrl(thumbnails.square));
			
			// Update playlist data
			this._playlist.poster = thumbnails.video_id;
		},
		
		updateTitle: function(/*String*/ title, /*String*/ shortTitle) {
			// summary:
			//		Updates playlist's title
			this._playlist.title	   = title;
			this._playlist.short_title = shortTitle;
			this._playlistTitleNode.innerHTML = title;
		}
	});
});
