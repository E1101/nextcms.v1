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
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/io-query",
	"dojo/json",
	"dojo/on",
	"dojo/request/xhr",
	"dojo/topic",
	"dijit/registry",
	"dojo/NodeList-dom",
	"dojo/query",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"media/js/controllers/FlickrMediator"
], function(dojoArray, dojoDeclare, dojoLang, dojoAspect, dojoDomAttr, dojoDomClass, dojoDomConstruct, dojoIoQuery, dojoJson, dojoOn, dojoRequestXhr, dojoTopic, dijitRegistry) {
	return dojoDeclare("media.js.controllers.FlickrController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _setToolbar: media.js.views.FlickrSetToolbar
		_setToolbar: null,
		
		// _setsContainer: String
		_setsContainer: null,
		
		// _photoToolbar: media.js.views.FlickrPhotoToolbar
		_photoToolbar: null,
		
		// _photosContainer: String
		_photosContainer: null,
		
		// _importedContainer: String
		_importedContainer: null,
		
		// _toolbar: media.js.views.FlickrToolbar
		_toolbar: null,
		
		// _photos: Array
		//		Array of imported photos
		_photos: {},
		
		// _photoIds: Array
		//		Array of imported photo Ids
		_photoIds: [],
		
		// _currentSetId: String
		//		Current selected set Id
		_currentSetId: null,
		
		// _mediator: media.js.controllers.FlickrMediator
		_mediator: new media.js.controllers.FlickrMediator(),
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/media/js/controllers/FlickrController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setSetToolbar: function(/*media.js.views.FlickrSetToolbar*/ setToolbar) {
			// summary:
			//		Sets the set toolbar
			this._setToolbar = setToolbar;
			
			// Reload sets handler
			dojoAspect.after(setToolbar, "onRefresh", dojoLang.hitch(this, "searchSets"));
			
			return this;	// media.js.controllers.FlickrController
		},
		
		setSetsContainer: function(/*String*/ container) {
			// summary:
			//		Sets the container listing Flickr sets
			this._setsContainer = container;
			
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/js/controllers/FlickrController/onSelectSet", this, function(setId) {
				dojo.query(".module-media-flickr-set").removeClass("module-media-flickr-set-active");
				dojo.query(".module-media-flickr-set[data-app-set='" + setId + "']").addClass("module-media-flickr-set-active");
			});
			
			return this;	// media.js.controllers.FlickrController
		},
		
		setPhotoToolbar: function(/*media.js.views.FlickrPhotoToolbar*/ photoToolbar) {
			// summary:
			//		Sets the photo toolbar
			this._photoToolbar = photoToolbar;
			this._mediator.setPhotoToolbar(photoToolbar);
			
			var that = this;
			// Reload photos handler
			dojoAspect.after(photoToolbar, "onRefresh", function() {
				if (that._currentSetId) {
					that.searchPhotos(this._currentSetId);
				}
			});
			
			return this;	// media.js.controllers.FlickrController
		},
		
		setPhotosContainer: function(/*String*/ container) {
			// summary:
			//		Sets the container listing Flickr photos
			this._photosContainer = container;
			return this;	// media.js.controllers.FlickrController
		},
		
		setToolbar: function(/*media.js.views.FlickrToolbar*/ toolbar) {
			// summary:
			//		Sets the main toolbar
			this._toolbar = toolbar;
			this._mediator.setToolbar(toolbar);
			
			// Import handler
			dojoAspect.after(toolbar, "onImport", dojoLang.hitch(this, "import"));
			
			return this;	// media.js.controllers.FlickrController
		},
		
		setImportedContainer: function(/*String*/ container) {
			// summary:
			//		Sets the container containing the imported photos
			this._importedContainer = container;
			return this;	// media.js.controllers.FlickrController
		},
		
		import: function() {
			// summary:
			//		Imports photos
			var that = this;
			this._helper.showStandby();
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_flickr_import").url, {
				data: {
					format: "json",
					photos: dojoJson.stringify(this._photos)
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.flickr.import[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					dojoTopic.publish("/app/media/flickr/import/onSuccess", data);
					
					that._photos = {};
					
					// Add the id of imported photos to the array
					for (var id in that._photos) {
						that._photoIds.push(id);
					}
					// Remove all the minus (-) icons in the imported container
					dojo.query(".module-media-flickr-icon-remove", that._importedContainer).orphan();
				}
			});
		},
		
		searchPhotos: function(/*String*/ setId) {
			// summary:
			//		Searches for photos of given set
			var that = this;
			dojoOn(dijitRegistry.byId(this._photosContainer), "downloadend", function() {
				dojo.query(".module-media-flickr-photo", that._photosContainer).forEach(function(node) {
					var photo = core.js.base.Encoder.decode(dojoDomAttr.get(node, "data-app-entity-props"));
					if (dojoArray.indexOf(that._photoIds, photo.id) == -1 && !that._photos[photo.id]) {
						dojo.query(".module-media-flickr-icon-remove", node).orphan();
						
						// Show a plus icon for adding the photo to list of imported photos
						var icon = dojoDomConstruct.create("span", {}, node);
						dojoDomClass.add(icon, ["app-icon", "app-icon-add", "module-media-flickr-icon-remove"]);
						dojoOn(icon, "click", function() {
							that._addPhoto(node, photo);
						});
					} else {
						dojo.query(node).orphan();
					}
				});
			});
			
			var params = {
				set_id: setId
			};
			dijitRegistry.byId(this._photosContainer)
						 .set("href", core.js.base.controllers.ActionProvider.get("media_flickr_photo").url + "?" + dojoIoQuery.objectToQuery(params));
		},
		
		searchSets: function() {
			// summary:
			//		Searches for sets
			var that = this;
			dojoOn(dijitRegistry.byId(this._setsContainer), "downloadend", function() {
				dojo.query(".module-media-flickr-set", that._setsContainer).forEach(function(node) {
					var setId = dojoDomAttr.get(node, "data-app-set");
					var img   = dojo.query("img", node)[0];
					dojoOn(img, "click", function() {
						that._currentSetId = setId;
						
						dojoTopic.publish("/app/js/controllers/FlickrController/onSelectSet", setId);
						
						// Load the photos of selected set
						that.searchPhotos(setId);
					});
				});
			});
			
			dijitRegistry.byId(this._setsContainer)
						 .set("href", core.js.base.controllers.ActionProvider.get("media_flickr_set").url);
		},
		
		_addPhoto: function(/*DomNode*/ photoNode, /*Object*/ photo) {
			// summary:
			//		Adds photo to list of imported photos
			var that = this;
			if (this._photos[photo.id]) {
				// The photo is already added
				return;
			}
			this._mediator.addPhoto(photo);
			
			this._photos[photo.id] = photo;
			
			// Clone node
			var node = dojoLang.clone(photoNode);
			dojoDomConstruct.place(node, this._importedContainer);

			dojo.query(photoNode).orphan();
			
			// Turn the plus icon (+) to the minus (-) icon
			var icon = dojo.query(".module-media-flickr-icon-remove", node)[0];
			dojoDomClass.remove(icon, "app-icon-add");
			dojoDomClass.add(icon, "app-icon-delete");
			dojoOn(icon, "click", function() {
				that._removePhoto(node, photo);
			});
		},
		
		_removePhoto: function(/*DomNode*/ photoNode, /*Object*/ photo) {
			// summary:
			//		Removes photo from the list of imported photos
			var that = this;
			if (!this._photos[photo.id]) {
				return;
			}
			delete this._photos[photo.id];
			this._mediator.removePhoto(photo);
			
			var node = dojoLang.clone(photoNode);
			dojoDomConstruct.place(node, this._photosContainer);
			
			dojo.query(photoNode).orphan();
			
			// Turn the minus icon (-) to the plus (+) icon
			var icon = dojo.query(".module-media-flickr-icon-remove", node)[0];
			dojoDomClass.remove(icon, "app-icon-delete");
			dojoDomClass.add(icon, "app-icon-add");
			dojoOn(icon, "click", function() {
				that._addPhoto(node, photo);
			});
		}
	});
});
