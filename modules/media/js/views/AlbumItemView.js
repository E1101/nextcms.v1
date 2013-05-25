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
	return dojoDeclare("media.js.views.AlbumItemView", null, {
		// _domNode: DomNode
		//		The DomNode of album item 
		_domNode: null,
		
		// _album: Object
		//		Contains the album properties
		_album: null,
		
		// _albumListView: media.js.views.AlbumListView
		//		The list view that the album item belong to
		_albumListView: null,
		
		constructor: function(/*DomNode*/ domNode, /*media.js.views.AlbumListView*/ albumListView) {
			this._domNode		= domNode;
			this._albumListView = albumListView;
			
			// See album/add.ajax.phtml to see the HTML template of album item
			var data = core.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props"));
			this._album = data;
			
			this._init();
			this.setViewType(data.view_type);
		},

		getDomNode: function() {
			return this._domNode;	// DomNode
		},
		
		getAlbumTitleNode: function() {
			return dojo.query(".module-media-album-title", this._domNode)[0];	// DomNode
		},
		
		getCoverNode: function() {
			// summary:
			//		Gets the node that shows the album's cover
			return dojo.query(".module-media-album-cover", this._domNode)[0];	// DomNode
		},
		
		getAlbum: function() {
			// summary:
			//		Gets the album object
			return this._album;	// Object
		},
		
		_init: function() {
			// summary:
			//		Initializes node
			var that = this;
			
			dojoOn(this._domNode, "contextmenu", function(e) {
				e.preventDefault();
			});
			dojoOn(this._domNode, "mousedown", function(e) {
				if (dojoMouse.isRight(e)) {
					e.preventDefault();
					that._albumListView.onMouseDown(that);
				}
			});
			
			dojoOn(this.getAlbumTitleNode(), "click", function() {
				that._albumListView.onClickAlbum(that);
			});
			
			// Allow to drag multiple photos to album
			new dojo.dnd.Target(this._domNode, {
				accept: ["mediaPhotoItemDnd"],
				onDropExternal: function(source, nodes, copy) {
					that._albumListView.onDropPhotos(that, nodes);
				}
			});
		},
		
		increasePhotoCounter: function(/*Integer*/ increasingNumber) {
			// summary:
			//		Increases (or descreases) the number of photos in the album
			// increasingNumber:
			//		The number of photos that will be added to or removed from the album
			var nodes =  dojo.query(".app-counter", this._domNode);
			if (nodes.length > 0) {
				var numPhotos	   = parseInt(nodes[0].innerHTML);
				nodes[0].innerHTML = numPhotos + increasingNumber;
			}
		},
		
		setViewType: function(/*String*/ viewType) {
			// summary:
			//		Sets the view type
			// viewType:
			//		Can be "list" or "grid"
			var currentClass = ("list" == viewType) ? "module-media-album-grid" : "module-media-album-list";
			var newClass	 = ("list" == viewType) ? "module-media-album-list" : "module-media-album-grid";
			
			dojoDomClass.remove(this._domNode, currentClass);
			dojoDomClass.add(this._domNode, newClass);
		},
		
		updateCover: function(/*Object*/ thumbnails) {
			// summary:
			//		Updates the cover image
			// thumbnails:
			//		Contains the following members:
			//		- photo_id: Id of cover photo
			//		- "square", "thumbnail", "small", "crop", "medium", "large", "original": 
			//		Value of these members are the full URL associating with the size
			var cover = this.getCoverNode();
			dojoDomAttr.set(cover, "src", core.js.Constant.normalizeUrl(thumbnails.square));
			
			// Update album data
			this._album.cover = thumbnails.photo_id;
		}
	});
});
