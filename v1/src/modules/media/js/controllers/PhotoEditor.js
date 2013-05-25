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
	"dojo/_base/lang",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-style",
	"dojo/on",
	"dojo/request/xhr",
	"dojo/query",
	"dojo/dnd/move",
	"dojox/layout/ResizeHandle",
	"dojox/widget/Standby",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare, dojoLang, dojoDom, dojoDomAttr, dojoDomConstruct, dojoDomGeometry, dojoDomStyle, dojoOn, dojoRequestXhr) {
	return dojoDeclare("media.js.controllers.PhotoEditor", null, {
		// _domNode: DomNode
		//		The parent node of image container
		_domNode: null,
		
		// _imageNode: DomNode
		//		The image node
		_imageNode: null,
		
		// _currentImage: Object
		//		Contains the information of current image:
		//		- path: The path in the file system
		//		- url: The full URL
		_currentImage: {
			path: null,
			url: null
		},
		
		// _originalPath: String
		//		Path of the original image
		_originalPath: null,
		
		// _editUrl: String
		_editUrl: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _standBy: dojox.widget.Standby
		_standBy: null,
		
		// _topics: Object
		_topics: {
			onSaved: "/app/media/photo/edit/onSaved",
			onCleaned: "/app/media/photo/edit/onCleaned"
		},
		
		/* ========== FOR CROPPING ========================================== */
		
		// draggerContainer: DomNode
		_draggerContainer: null,
		
		// _draggerNode: DomNode
		_draggerNode: null,
		
		// _resizeHandle: dojox.layout.ResizeHandle
		_resizeHandle: null,

		/* ========== FOR RESIZING ========================================== */
		
		// _resizeBy: String
		//		Can be "percentage" or "pixels"
		_resizeBy: "percentage",
		
		// _width: Integer
		//		Width of current image in pixels
		_width: null,
		
		// _height: Integer
		//		Height of current image in pixels
		_height: null,
		
		// _resizeWidth: Integer
		//		Width of resized image in pixels
		_resizeWidth: null,
		
		// _resizeHeight: Integer
		//		Height of resized image in pixels
		_resizeHeight: null,
		
		// _maintainRatio: Boolean
		//		Maintain aspect ratio when resizing or not
		_maintainRatio: true,
		
		/* ========== FOR UNDO, REDO ======================================== */
		
		// _editorMediator: media.js.controllers.PhotoEditorMediator
		//		It is used to manage the state of controls
		_editorMediator: null,
		
		constructor: function(/*String*/ id) {
			var that	  = this;
			this._domNode = dojoDom.byId(id);
			
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
			
			// Init the Standby widget
			this._standBy = new dojox.widget.Standby({
				target: id,
				imageText: this._i18n.global._share.processingAction
			});
			document.body.appendChild(this._standBy.domNode);
			this._standBy.startup();
			
			// Create a div containing the crop container
			this._draggerContainer = dojoDomConstruct.create("div", {}, this._domNode);
			dojoDomStyle.set(this._draggerContainer, {
				position: "absolute",
				top: 0,
				left: 0
			});
			
			// Try to find and set the image node
			var imgNodes = dojo.query("img", this._domNode);
			if (imgNodes.length > 0) {
				this.setImageNode(imgNodes[0]);
			}
		},
		
		setOriginalImage: function(/*String*/ path, /*String*/ url) {
			// summary:
			//		Sets current image being edited
			this._originalPath = path;
			this._currentImage = {
				path: path,
				url: url
			};
			return this;	// media.js.controllers.PhotoEditor
		},
		
		setEditUrl: function(/*String*/ url) {
			// summary:
			//		Sets the back-end URL processing the image
			this._editUrl = url;
			return this;	// media.js.controllers.PhotoEditor
		},
		
		setImageNode: function(/*DomNode*/ imgNode) {
			// summary:
			//		Sets the node containing the image
			this._imageNode = imgNode;
			dojoOn(this._imageNode, "load", dojoLang.hitch(this, "_onImageLoaded"));
			return this;	// media.js.controllers.PhotoEditor
		},
		
		setEditorMediator: function(/*media.js.controllers.PhotoEditorMediator*/ editorMediator) {
			// summary:
			//		Sets the mediator which controls the state of controls
			this._editorMediator = editorMediator;
			this._editorMediator.addUndoableState({
				previous: this._currentImage,
				current: this._currentImage
			});
		},
		
		setTopics: function(/*Object*/ topics) {
			// summary:
			//		Sets name of topics that will be published after doing the associated actions
			// topics:
			//		Contains two members:
			//		- onSaved
			//		- onCleaned
			this._topics = topics;
			return this;	// media.js.controllers.PhotoEditor
		},
		
		/* ========== SHOW RESIZEABLE AREA TO CROP ========================== */
		
		_onImageLoaded: function() {
			// summary:
			//		This method is called when the image is fully loaded
			var that	 = this;
			this._width  = this._imageNode.width;
			this._height = this._imageNode.height;
			
			dojoDomStyle.set(this._draggerContainer, { 
				"width": this._width + "px",
				"height": this._height + "px"
			});
			var draggeNodeId	  = dojoDomAttr.get(this._domNode, "id") + "Dragger", 
			    draggerNodeHeight = Math.min(75, this._height),
			    draggerNodeWidth  = Math.min(75, this._width);
			this._draggerNode	  = dojoDomConstruct.create("div", {
				id: draggeNodeId
			}, this._draggerContainer);
			dojoDomStyle.set(this._draggerNode, {
				display: "none",
				background: "#FFF",
				opacity: "0.3",
				cursor: "move",
				position: "relative",		// This is required by ResizeHandle
				height: draggerNodeHeight + "px",
				width: draggerNodeWidth + "px",
				zIndex: 999
			});
			dojoDomConstruct.create("div", { 
				className: "module-media-photo-cropped-label", 
				style: "position: 'absolute', top: 0, left: 0",
				innerHTML: draggerNodeWidth + "x" + draggerNodeHeight
			}, this._draggerNode);
			
			// Double click to generate cropped image
			dojoOn(this._draggerNode, "dblclick", function() {
				that.crop();
			});
			
			this._resizeHandle = new dojox.layout.ResizeHandle({
				targetId: draggeNodeId,
				constrainMax: true,
				maxHeight: that._height,
				maxWidth: that._width,
				activeResize: true,
				onResize: function(e) {
					that._onCroppedResize();
				}
			});
			this._resizeHandle.placeAt(this._draggerNode);
			
			var moveable = new dojo.dnd.move.parentConstrainedMoveable(draggeNodeId, { area: "border", within: true });
			moveable.onMoved = function(mover, leftTop) {
				// Set the maxWidth and maxHeight for resize handle object to ensure that user cannot
				// resize outside the area of the image.
				
				// I have to re-create the ResizeHandle, because it is not possible to set maxHeight and maxWidth as follow:
				//		that._resizeHandle.maxHeight = that._height - leftTop.t;
				//		that._resizeHandle.maxWidth  = that._width - leftTop.l;
				that._resizeHandle.destroy();
				that._resizeHandle = new dojox.layout.ResizeHandle({
					targetId: draggeNodeId,
					constrainMax: true,
					maxHeight: that._height - leftTop.t,
					maxWidth: that._width - leftTop.l,
					activeResize: true,
					onResize: function(e) {
						that._onCroppedResize();
					}
				});
				that._resizeHandle.placeAt(that._draggerNode);
			};
		},
		
		_onCroppedResize: function() {
			// summary:
			// 		Handle onSize() event of the resize handle
			// Show the size of the selected area
			var width  = parseInt(dojo.style(this._draggerNode, "width")),
			    height = parseInt(dojo.style(this._draggerNode, "height"));
			dojo.query(".module-media-photo-cropped-label", this._draggerNode)[0].innerHTML = width + "x" + height;
		},
		
		/* ========== PROCESSING METHODS ==================================== */
		
		rotate: function(/*Number*/ angle) {
			// summary:
			//		Rotates the image
			var that = this;
			this._standBy.show();
			dojoRequestXhr(this._editUrl, {
				data: {
					act: "rotate",
					original: this._originalPath,
					path: this._currentImage.path,
					angle: angle
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._standBy.hide();
				that._editorMediator.addUndoableState({
					previous: that._currentImage,
					current: data
				});
				that._updateImage(data);
			});
		},
		
		flip: function(/*String*/ direction) {
			// summary:
			//		Flips or flops the image
			// direction:
			//		Can be horizontal or vertical
			var that = this;
			this._standBy.show();
			dojoRequestXhr(this._editUrl, {
				data: {
					act: "flip",
					original: this._originalPath,
					path: this._currentImage.path,
					direction: direction
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._standBy.hide();
				that._editorMediator.addUndoableState({
					previous: that._currentImage,
					current: data
				});
				that._updateImage(data);
			});
		},
		
		save: function() {
			// summary:
			//		Saves the image
			var that = this;
			this._standBy.show();
			dojoRequestXhr(this._editUrl, {
				data: {
					act: "save",
					original: this._originalPath,
					path: this._currentImage.path
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._standBy.hide();
				dojoTopic.publish(that._topics.onSaved, data);
			});
		},
		
		clean: function() {
			// summary:
			//		Cleans the temp files that are generated when processing the image
			var that = this;
			this._standBy.show();
			dojoRequestXhr(this._editUrl, {
				data: {
					act: "clean"
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._standBy.hide();
				dojoTopic.publish(that._topics.onCleaned);
			});
		},
		
		toggleCropper: function() {
			// summary:
			//		Toggles the cropper area
			var isHidden = "none" == dojoDomStyle.get(this._draggerNode, "display");
			dojoDomStyle.set(this._draggerNode, "display", isHidden ? "block" : "none");
			
			// Show a notification to help user how to crop the image
			if (isHidden) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.photo.edit.cropHelp,
					duration: 500
				});
			}
		},
		
		crop: function() {
			// summary:
			//		Crops the image. This method is called when user make a double-click on the selected area
			// Get the position and size of the selected area
			var that   = this, 
				params = dojoDomGeometry.getMarginBox(this._draggerNode);		// Contains the members: w, h, t, l
			this._standBy.show();
			params.act		= "crop";
			params.original = this._originalPath; 
			params.path		= this._currentImage.path;
			
			dojoRequestXhr(this._editUrl, {
				data: params,
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._standBy.hide();
				that._editorMediator.addUndoableState({
					previous: that._currentImage,
					current: data
				});
				that._updateImage(data);
			});
		},
		
		zoom: function(/*Number*/ numOfPercents) {
			// summary:
			//		Zooms the image
			dojoDomStyle.set(this._imageNode, {
				width: parseInt((this._width / 100) * numOfPercents) + "px"
			});
			// FIXME: Other methods do not work after zooming the image
		},
		
		/* ========== HANDLE RESIZE ========================================= */
		
		setResizeBy: function(/*String*/ resizeBy) {
			this._resizeBy = resizeBy;
		},
		
		getResizeBy: function() {
			return this._resizeBy;		// String
		},
		
		setResizeWidth: function(/*Number*/ width) {
			// summary:
			//		Set the width of resized image
			// width:
			//		Can be a number of percents or number of pixels
			switch (this._resizeBy) {
				case "pixels":
					this._resizeWidth = width;
					break;
				case "percentage":
				default:
					this._resizeWidth = (this._width / 100) * width;
					break;
			}
			
			if (this._maintainRatio) {
				this._resizeHeight = this._height * this._resizeWidth / this._width;
			}
		},
		
		getResizeWidth: function() {
			// summary:
			//		Returns the width of resized image in pixels
			return (this._resizeWidth) ? this._resizeWidth : this._width;	// Number
		},
		
		setResizeHeight: function(/*Number*/ height) {
			switch (this._resizeBy) {
				case "pixels":
					this._resizeHeight = height;
					break;
				case "percentage":
				default:
					this._resizeHeight = (this._height / 100) * height;
					break;
			}
			
			if (this._maintainRatio) {
				this._resizeWidth = (this._width * this._resizeHeight / this._height);
			}
		},
		
		getResizeHeight: function() {
			return (this._resizeHeight) ? this._resizeHeight : this._height;	// Number
		},
		
		setMaintainRatio: function(/*Boolean*/ maintain) {
			this._maintainRatio = maintain;
		},
		
		isMaintainRatio: function() {
			return this._maintainRatio;		// Boolean
		},
		
		resize: function() {
			// summary:
			//		Resizes image
			var newWidth  = this.getResizeWidth(),
				newHeight = this.getResizeHeight();
			if (newWidth >= this._width || newHeight >= this._height) {
				return;
			}
			newWidth  = parseInt(newWidth);
			newHeight = parseInt(newHeight);
			
			var that = this;
			this._standBy.show();
			dojoRequestXhr(this._editUrl, {
				data: {
					act: "resize",
					original: this._originalPath,
					path: this._currentImage.path,
					w: newWidth,
					h: newHeight
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._standBy.hide();
				that._editorMediator.addUndoableState({
					previous: that._currentImage,
					current: data
				});
				that._updateImage(data);
			});
		},
		
		/* ========== UNDO/REDO ============================================= */
		
		undo: function() {
			var data = this._editorMediator.undo();
			if (data) {
				this._updateImage(data.previous);
			}
		},
		
		redo: function() {
			var data = this._editorMediator.redo();
			if (data) {
				this._updateImage(data.current);
			}
		},
		
		_updateImage: function(/*Object*/ data) {
			// summary:
			//		Loads the new image after processing
			// data:
			//		Contains two members:
			//		- url: The full URL of new image
			//		- path: The path of new image on the file system
			// Remove the dragger container
			if (this._draggerNode) {
				dojoDomConstruct.destroy(this._draggerNode);
			};
			
			this._currentImage = data;
			dojoDomAttr.set(this._imageNode, "src", data.url);
		}
	});
});
