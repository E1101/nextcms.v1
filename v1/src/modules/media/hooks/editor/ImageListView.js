/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		media
 * @subpackage	hooks
 * @since		1.0
 * @version		2012-08-30
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/json",
	"dojo/dnd/AutoSource",
	"dojo/query",
	"core/js/Constant",
	"media/hooks/editor/ImageContextMenu"	
], function(dojoDeclare, dojoLang, dojoAspect, dojoDomAttr, dojoDomClass, dojoDomConstruct, dojoJson) {
	return dojoDeclare("media.hooks.editor.ImageListView", null, {
		// _id: String
		_id: null,
		
		// _contextMenu: media.hooks.editor.ImageContextMenu
		_contextMenu: null,
		
		// _selectedImage: DomNode
		_selectedImage: null,
		
		constructor: function(/*String*/ id) {
			this._id = id;
			new dojo.dnd.AutoSource(id, {
				accept: ["appDndImage"],
				selfAccept: false,
				selfCopy: false
			});
			
			this._contextMenu = new media.hooks.editor.ImageContextMenu(id);
			dojoAspect.after(this._contextMenu, "onContextMenu", dojoLang.hitch(this, "onContextMenu"), true);
			dojoAspect.after(this._contextMenu, "onEditSize", dojoLang.hitch(this, "editImage"), true);
		},
		
		addImageItem: function(/*Object*/ thumbnails) {
			var img = dojoDomConstruct.create("img", {
				className: "dojoDndItem hook-media-editor-image", 
				dndtype: "appDndImage",
				src: core.js.Constant.ROOT_URL + thumbnails.original.url,
				title: thumbnails.original.name
			}, this._id);
			
			var urls = {};
			for (var size in thumbnails) {
				urls[size] = thumbnails[size].url;
			}
			
			dojoDomAttr.set(img, {
				"appImagePath": thumbnails.original.url,
				"data-app-dndimage": dojoJson.stringify({
					url: thumbnails.original.url,
					title: thumbnails.original.name
				}),
				"data-app-dndthumbnails": dojoJson.stringify(urls)
			});
		},
		
		editImage: function(/*String*/ size) {
			if (!this._selectedImage) {
				return;
			}
			var thumbnails = dojoJson.parse(dojoDomAttr.get(this._selectedImage, "data-app-dndthumbnails"));
			this.onEditSize(thumbnails[size]);
		},
		
		onContextMenu: function(/*DomNode*/ target) {
			switch (true) {
				case (dojoDomAttr.get(target, "id") == this._id):
					this._contextMenu.allowToEdit(null, false);
					this._selectedImage = null;
					break;
				case dojoDomClass.contains(target, "hook-media-editor-image"):
					// Get the available thumbnails
					var thumbnails = dojoJson.parse(dojoDomAttr.get(target, "data-app-dndthumbnails"));
					this._contextMenu.allowToEdit(null, false);
					
					// Enable the menu item that the associating thumbnail is available
					for (var thumb in thumbnails) {
						this._contextMenu.allowToEdit(thumb, true);
					}
					this._selectedImage = target;
					break;
				default:
					break;
			}
		},
		
		updateImage: function(/*String*/ size, /*String*/ path) {
			// summary:
			//		Updates image. It should be called after saving the image
			var images = dojo.query("img[appImagePath='" + path + "']", this._id);
			if (0 == images.length) {
				return;
			}
			var image = images[0];
			
			// Update attributes of the image
			var path = path + "?" + new Date().getTime();
			dojoDomAttr.set(image, "src", core.js.Constant.ROOT_URL + path);
			var thumbnails	 = dojoJson.parse(dojoDomAttr.get(image, "data-app-dndthumbnails"));
			thumbnails[size] = path;
			dojoDomAttr.set(image, "data-app-dndthumbnails", dojoJson.stringify(thumbnails));
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onEditSize: function(/*String*/ path) {
			// tags:
			//		callback
		}
	});
});
