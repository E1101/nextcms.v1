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
 * @version		2012-09-11
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/dom-attr",
	"dojo/hash",
	"dojo/io-query",
	"dojo/json",
	"dojo/request/iframe",
	"dojo/request/xhr",
	"dojo/topic",
	"dojo/NodeList-dom",
	"dojo/parser",
	"dojo/query",
	"dijit/form/Textarea",
	"dijit/form/TextBox",
	"dijit/InlineEditBox",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/I18N",
	"core/js/base/Encoder",
	"core/js/base/views/Helper",
	"media/js/controllers/PhotoMediator"
], function(dojoDeclare, dojoLang, dojoAspect, dojoDomAttr, dojoHash, dojoIoQuery, dojoJson, dojoRequestIframe, dojoRequestXhr, dojoTopic) {
	return dojoDeclare("media.js.controllers.PhotoController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _photoMediator: media.js.controllers.PhotoMediator
		_photoMediator: new media.js.controllers.PhotoMediator(),
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/media/js/controllers/PhotoController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},

		/* ========== MANAGE ALBUMS ========================================= */
		
		//_albumToolbar: media.js.views.AlbumToolbar
		_albumToolbar: null,
		
		// _albumListView: media.js.views.AlbumListView
		_albumListView: null,
		
		// _albumContextMenu: media.js.views.AlbumContextMenu
		_albumContextMenu: null,
		
		// _albumSearchCriteria: Object
		// 		Can contain the following members:
		//		- status
		//		- user_id
		//		- title
		//		- page: The page index
		//		- active_album_id: The id of current active album
		//		- view_type: Can be "list" or "grid"
		_albumSearchCriteria: {
			status: null,
			title: null,
			page: 1,
			active_album_id: null,
			view_type: "list",
			language: null
		},
		
		setAlbumToolbar: function(/*media.js.views.AlbumToolbar*/ albumToolbar) {
			// summary:
			//		Sets the album toolbar
			this._albumToolbar = albumToolbar;
			this._photoMediator.setAlbumToolbar(albumToolbar);
			
			var that = this;
			// Adding album handler
			dojoAspect.after(albumToolbar, "onAddAlbum", dojoLang.hitch(this, "addAlbum"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/album/add/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/album/add/onSuccess", this, function() {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.album.add.success
				});
				this.searchAlbums();
			});
			
			// Refresh handler
			dojoAspect.after(albumToolbar, "onRefresh", dojoLang.hitch(this, "searchAlbums"));
			
			// Search handler
			dojoAspect.after(albumToolbar, "onSearchAlbums", function(title) {
				that.searchAlbums({
					title: title,
					page: 1
				});
			}, true);
			
			// Switch to other language handler
			dojoAspect.after(albumToolbar, "onSwitchToLanguage", function(language) {
				that.searchAlbums({
					active_album_id: null,
					title: null,
					page: 1,
					language: language
				});
				that.searchPhotos({
					title: null,
					album_id: null,
					page: 1,
					language: language
				});
			}, true);
			
			// Change view type handler
			dojoAspect.after(albumToolbar, "onChangeViewType", function(viewType) {
				that._albumSearchCriteria.view_type = viewType;
				if (that._albumListView) {
					that._albumListView.setViewType(viewType);
				}
			}, true);
			
			return this;	// media.js.controllers.PhotoController
		},
		
		setAlbumListView: function(/*media.js.views.AlbumListView*/ albumListView) {
			// summary:
			//		Sets the albums list view
			this._albumListView = albumListView;
			this._photoMediator.setAlbumListView(albumListView);
			
			var that = this;
			// Show the context menu
			dojoAspect.after(albumListView, "onMouseDown", function(albumItemView) {
				if (that._albumContextMenu) {
					that._albumContextMenu.show(albumItemView);
				}
			}, true);
			
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/album/list/onGotoPage", this, function(page) {
				this.searchAlbums({
					page: page
				});
			});
			
			// View all
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/album/list/onViewAll", this, function(viewAllNode) {
				this._albumListView.setSelectedAlbumItemView(null);
				
				dojo.query(".module-media-album-active", this._albumListView.getDomNode()).removeClass("module-media-album-active");
				dojo.query(viewAllNode).addClass("module-media-album-active");
				this._albumSearchCriteria.active_album_id = null;
				this.searchPhotos({
					page: 1,
					album_id: null
				});
			});
			
			// Loads the list of photos in the selected album when selecting an album
			dojoAspect.after(albumListView, "onClickAlbum", function(albumItemView) {
				that._albumListView.setSelectedAlbumItemView(albumItemView);
				
				var albumId = albumItemView.getAlbum().album_id;
				that._albumSearchCriteria.active_album_id = albumId;
				that.searchPhotos({
					page: 1,
					album_id: albumId
				});
			}, true);
			
			dojoAspect.after(albumListView, "onDropPhotos", dojoLang.hitch(this, "dropPhotos"), true);
			
			// Update cover handler
			dojoAspect.after(albumListView, "onUpdateCover", dojoLang.hitch(this, "updateCover"), true);
			
			return this;	// media.js.controllers.PhotoController
		},
		
		setAlbumContextMenu: function(/*media.js.views.AlbumContextMenu*/ albumContextMenu) {
			// summary:
			//		Sets the album's context menu
			this._albumContextMenu = albumContextMenu;
			
			var that = this;
			// Activate handler
			dojoAspect.after(albumContextMenu, "onActivateAlbum", dojoLang.hitch(this, "activateAlbum"), true);
			
			// Delete album handler
			dojoAspect.after(albumContextMenu, "onDeleteAlbum", dojoLang.hitch(this, "deleteAlbum"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/album/delete/onSuccess", this, function() {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.album["delete"].success
				});
				this.searchAlbums();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/album/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			
			dojoAspect.after(albumContextMenu, "onRenameAlbum", dojoLang.hitch(this, "renameAlbum"), true);
			dojoAspect.after(albumContextMenu, "onUploadToAlbum", function(albumItemView) {
				that.uploadPhotos(albumItemView.getAlbum().album_id);
			}, true);
			
			return this;	// media.js.controllers.PhotoController
		},
		
		activateAlbum: function(/*media.js.views.AlbumItemView*/ albumItemView) {
			// summary:
			//		Activates/deactivates given album item
			var status = albumItemView.getAlbum().status;
			var that   = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_album_activate").url, {
				data: {
					album_id: albumItemView.getAlbum().album_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				var message = ("APP_RESULT_OK" == data.result) 
							? ("activated" == status ? "deactivateSuccess" : "activateSuccess") 
							: ("activated" == status ? "deactivateError" : "activateError");
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.album.activate[message],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					albumItemView.getAlbum().status = ("activated" == status) ? "not_activated" : "activated";
				}
			});
		},
		
		addAlbum: function() {
			// summary:
			// 		This method is called when user click on Add New Album button. It shows a dialog for adding new album
			var params = {
				language: this._albumSearchCriteria.language
			};
			var url = core.js.base.controllers.ActionProvider.get("media_album_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "mediaAlbumAddDialog",
				title: this._i18n.album.add.title,
				style: "width: 400px",
				refreshOnShow: true
			});
		},
		
		deleteAlbum: function(/*media.js.views.AlbumItemView*/ albumItemView) {
			// summary:
			//		Deletes given album item
			var params = {
				album_id: albumItemView.getAlbum().album_id	
			};
			var url = core.js.base.controllers.ActionProvider.get("media_album_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "mediaAlbumDeleteDialog",
				title: this._i18n.album["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		renameAlbum: function(/*media.js.views.AlbumItemView*/ albumItemView) {
			// summary:
			//		Renames given album
			var that   = this;
			var albumId = albumItemView.getAlbum().album_id;

			// Create InlineEditBox element
			// DOJO LESSON: There is an issue said that the widget is already registered if I try to rename an album at the second time.
			// There are two solutions to solve this issue:
			// - First, generate an unique Id for the widget as follow:
			//		var inlineEditBox = new dijit.InlineEditBox({
			//			id: "media.js.views.AlbumItemView_InlineEditBox_" + albumId + "_" + new Date().getTime(),
			//			...
			//		}, albumItemView.getAlbumTitleNode());
			// - Second one, unregistry the widget:
			//		var inlineEditBox = new dijit.InlineEditBox({
			//			onChange: function(value) {
			//				dijitRegistry.remove(this.id);
			//				...
			//			onCancel: function() {
			//				dijitRegistry.remove(this.id);
			//				...
			//			}
			//		}, albumItemView.getAlbumTitleNode());
			// In both of solutions, Dojo generates new widgets without removing the old one.
			// So, my final soltuion is attach an InlineEditBox instance to the albumItemView and it is possible 
			// to get it in the next time.
			if (!albumItemView.titleEditBox) {
				albumItemView.titleEditBox = new dijit.InlineEditBox({
					editor: "dijit.form.TextBox", 
					autoSave: true, 
					disabled: false,
					editorParams: {
						required: true
					},
					onChange: function(newTitle) {
						this.set("disabled", true);
						if (newTitle != "") {
							dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_album_rename").url, {
								data: {
									album_id: albumId,
									title: newTitle
								},
								handleAs: "json",
								method: "POST"
							}).then(function(data) {
								if ("APP_RESULT_OK" == data.result) {
									albumItemView.getAlbum().title 		 = data.title;
									albumItemView.getAlbum().short_title = data.short_title;
									// Push a notification
									dojoTopic.publish("/app/global/notification", {
										message: that._i18n.album.rename.success
									});
								}
							});
						}
					}, 
					onCancel: function() {
						this.set("disabled", true);
					}
				}, albumItemView.getAlbumTitleNode());
			}
			albumItemView.titleEditBox.set("disabled", false);
			albumItemView.titleEditBox.startup();
			albumItemView.titleEditBox.edit();
		},
		
		searchAlbums: function(/*Object*/ criteria) {
			// summary:
			//		This method is called when user search for albums
			this._helper.closeDialog();
			
			var that = this;
			dojoLang.mixin(this._albumSearchCriteria, criteria);
			var q = core.js.base.Encoder.encode(this._albumSearchCriteria);
			
			var url = core.js.base.controllers.ActionProvider.get("media_album_list").url;
			// There are two ways to update the content of album list view.
			// 1) Because _albumListView is Dojo ContentPane, I can set the href attribute:
			//		dijitRegistry.byId(this._albumListView.getId()).set("href", url + "?q=" + q);
			//		this._albumListView.init();
			// Becareful with this, because it will not work when the DomNode of album list view 
			// is not loaded (for example, when I call this searchAlbums() method in setAlbumListView())
			//		console.log(dijitRegistry.byId(this._albumListView.getId()));	// undefined
			//
			// 2) Make an Ajax request to the page of listing albums as usual:
			dojoRequestXhr(url, {
				data: {
					q: q
				},
				method: "POST"
			}).then(function(data) {
				that._albumListView.setContent(data);
			});
		},
		
		updateCover: function(/*media.js.views.AlbumItemView*/ albumItemView, /*Object*/ thumbnails) {
			// summary:
			//		Updates the album's cover. Called after dropping an image from 
			// 		the Image Editor toolbox
			// tags:
			//		callback
			this._helper.showStandby();
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_album_cover").url, {
				data: {
					album_id: albumItemView.getAlbum().album_id,
					thumbnails: dojoJson.stringify(thumbnails)
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				if ("APP_RESULT_OK" == data.result) {
					dojoTopic.publish("/app/global/notification", {
						message: that._i18n.album.cover.success
					});
					albumItemView.updateCover(data.thumbnails);
				}
			});
		},
		
		/* ========== MANAGE PHOTOS ========================================= */
		
		// _photoToolbar: media.js.views.PhotoToolbar
		_photoToolbar: null,
		
		// _photoListView: media.js.views.PhotoListView
		_photoListView: null,
		
		// _photoContextMenu: media.js.views.PhotoContextMenu
		_photoContextMenu: null,
		
		// _photoSearchCriteria: Object
		_photoSearchCriteria: {
			album_id: null,
			status: null,
			page: 1,
			view_size: "thumbnail",
			per_page: 20,
			language: null
		},
		
		setPhotoToolbar: function(/*media.js.views.PhotoToolbar*/ photoToolbar) {
			// summary:
			//		Sets the photo toolbar
			this._photoToolbar = photoToolbar;
			this._photoMediator.setPhotoToolbar(photoToolbar);
			
			var that = this;
			// Upload handler
			dojoAspect.after(photoToolbar, "onUploadPhotos", dojoLang.hitch(this, "uploadPhotos"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/photo/upload/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/photo/upload/onSuccess", this, function(data) {
				this._helper.removePane();
				
				// Activate the album
				var albumItemView = this._albumListView.getAlbumItemView(data.album_id);
				if (albumItemView) {
					this._albumListView.setSelectedAlbumItemView(albumItemView);
					
					// Update the number of photos in the album
					albumItemView.increasePhotoCounter(data.num_photos);
				}
				
				// Load the photos in the albums
				this.searchPhotos({
					page: 1,
					album_id: data.album_id
				});
			});
			
			// Refresh handler
			dojoAspect.after(photoToolbar, "onRefresh", dojoLang.hitch(this, "searchPhotos"));
			
			// Show slide
			dojoAspect.after(photoToolbar, "onShowSlide", function() {
				if (that._photoListView) {
					that._photoListView.showSlide();
				}
			});
			
			// Save order of photos in album
			dojoAspect.after(photoToolbar, "onSaveOrder", dojoLang.hitch(this, "savePhotoOrder"), true);
			
			// Search by title
			dojoAspect.after(photoToolbar, "onSearchPhotos", function(title) {
				that.searchPhotos({
					title: title,
					page: 1
				});
			}, true);
			
			// Update page size
			dojoAspect.after(photoToolbar, "onUpdatePageSize", function(perPage) {
				if (that._photoSearchCriteria.per_page != perPage) {
					that.searchPhotos({
						page: 1,
						per_page: perPage
					});
				}
			}, true);
			
			// View in various size
			dojoAspect.after(photoToolbar, "onViewSize", function(size) {
				that._photoSearchCriteria.view_size = size;
				if (that._photoListView) {
					that._photoListView.setViewSize(size);
				}
			}, true);
			
			return this;	// media.js.controllers.PhotoController
		},
		
		setPhotoListView: function(/*media.js.views.PhotoListView*/ photoListView) {
			// summary:
			//		Sets the photos list view
			this._photoListView = photoListView;
			this._photoMediator.setPhotoListView(photoListView);
			
			var that = this;
			// Show the context menu
			dojoAspect.after(photoListView, "onMouseDown", function(photoItemView) {
				if (that._photoContextMenu) {
					that._photoContextMenu.show(photoItemView);
				}
			}, true);
			
			// Pager handler
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/photo/list/onGotoPage", this, function(page) {
				this.searchPhotos({
					page: page
				});
			});
			
			return this;	// media.js.controllers.PhotoController
		},
		
		setPhotoContextMenu: function(/*media.js.views.PhotoContextMenu*/ photoContextMenu) {
			// summary:
			//		Sets the photo's context menu
			this._photoContextMenu = photoContextMenu;
			this._photoMediator.setPhotoContextMenu(photoContextMenu);
			
			// Activate handler
			dojoAspect.after(photoContextMenu, "onActivatePhoto", dojoLang.hitch(this, "activatePhoto"), true);
			
			// Update information handler
			dojoAspect.after(photoContextMenu, "onUpdatePhoto", dojoLang.hitch(this, "updatePhoto"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/photo/update/onSuccess", this, function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.photo.update.success
				});
				this.searchPhotos();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/photo/update/onCancel", this, function() {
				this._helper.removePane();
			});
			
			// Delete handler
			dojoAspect.after(photoContextMenu, "onDeletePhoto", dojoLang.hitch(this, "deletePhoto"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/photo/delete/onSuccess", this, function() {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.photo["delete"].success
				});
				this.searchAlbums();
				this.searchPhotos();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/photo/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			
			// Rename handler
			dojoAspect.after(photoContextMenu, "onRenamePhoto", dojoLang.hitch(this, "renamePhoto"), true);
			
			// Replace handler
			dojoAspect.after(photoContextMenu, "onReplacePhoto", dojoLang.hitch(this, "replacePhoto"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/photo/replace/onSuccess", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.photo.replace.success,
					type: "message"
				});
				// Update the thumbnail
				var photoItemView = this._photoListView.getPhotoItemView(data[0].photo_id);
				if (photoItemView) {
					for (var i in data) {
						photoItemView.updateThumbnailUrl(data[i].size, data[i].path);
					}
				}
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/photo/replace/onCancel", this, function() {
				this._helper.closeDialog();
			});
			
			// Download handler
			dojoAspect.after(photoContextMenu, "onDownloadPhoto", dojoLang.hitch(this, "downloadPhoto"), true);
			
			// Set cover handler
			dojoAspect.after(photoContextMenu, "onSetCover", dojoLang.hitch(this, "setAlbumCover"), true);
			
			// Remove from album handler
			dojoAspect.after(photoContextMenu, "onRemoveFromAlbum", dojoLang.hitch(this, "removePhoto"), true);
			
			// Edit handler
			dojoAspect.after(photoContextMenu, "onEditPhoto", dojoLang.hitch(this, "editPhoto"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/photo/edit/onSaved", this, function(data) {
				// Show the new thumbnail
				var photoItemView = this._photoListView.getPhotoItemView(data.photo_id);
				if (photoItemView) {
					photoItemView.updateThumbnailUrl(data.size, data.url);
				}
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/photo/edit/onCleaned", this, function() {
				this._helper.removePane();
			});
			
			return this;	// media.js.controllers.PhotoController
		},
		
		initPhotoSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits the controls with given criteria
			dojoLang.mixin(this._photoSearchCriteria, criteria);
			this._albumSearchCriteria.language        = criteria.language;
			this._albumSearchCriteria.active_album_id = criteria.album_id;
			this._photoMediator.initPhotoSearchCriteria(this._photoSearchCriteria);
		},
		
		activatePhoto: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		Activates/deactivates given photo item
			var status = photoItemView.getPhoto().status;
			var that  = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_photo_activate").url, {
				data: {
					photo_id: photoItemView.getPhoto().photo_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				var message = ("APP_RESULT_OK" == data.result) 
							? ("activated" == status ? "deactivateSuccess" : "activateSuccess") 
							: ("activated" == status ? "deactivateError" : "activateError");
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.photo.activate[message],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					photoItemView.getPhoto().status = ("activated" == status) ? "not_activated" : "activated";
				}
			});
		},
		
		deletePhoto: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			// 		Deletes given photo item
			var params = {
				photo_id: photoItemView.getPhoto().photo_id
			};
			var url = core.js.base.controllers.ActionProvider.get("media_photo_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "mediaPhotoDeleteDialog",
				title: this._i18n.photo["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		downloadPhoto: function(/*media.js.views.PhotoItemView*/ photoItemView, /*String*/ size) {
			// summary:
			//		Downloads given photo in certain size of thumbnail
			var photoId = photoItemView.getPhoto().photo_id;
			
			// DOJO LESSON: Use dojo.io.iframe to download file
			// FIXME: I don't know why the browser cannot load the blank page provided by Dojo
			// (/static/js/dojo/[APP_DOJO_VER]/dojo/resources/blank.html)
			dojoRequestIframe(core.js.base.controllers.ActionProvider.get("media_photo_download").url, {
				data: {
					photo_id: photoId,
					size: size
				},
				method: "POST"
			});
		},
		
		editPhoto: function(/*media.js.views.PhotoItemView*/ photoItemView, /*String*/ size) {
			// summary:
			//		Shows a photo editor
			var params = {
				photo_id: photoItemView.getPhoto().photo_id,
				size: size
			};
			this._helper.showPane(core.js.base.controllers.ActionProvider.get("media_photo_edit").url + "?" + dojoIoQuery.objectToQuery(params));
		},
		
		dropPhotos: function(/*media.js.views.AlbumItemView*/ albumItemView, /*DomNode[]*/ photoNodes) {
			// summary:
			//		Uses when moving collection of photos to another album
			var that	   = this;
			var newAlbumId = albumItemView.getAlbum().album_id;
			var index	   = 0;
			var move	   = function() {
				var photoNode = photoNodes[0];
				var photoId   = core.js.base.Encoder.decode(dojoDomAttr.get(photoNode, "data-app-entity-props")).photo_id;
				
				dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_photo_copy").url, {
					data: {
						photo_id: photoId,
						album_id: newAlbumId,
						index: index
					},
					handleAs: "json",
					method: "POST"
				}).then(function(data) {
					if ("APP_RESULT_OK" == data.result) {
						photoNodes.splice(0, 1);
						if (photoNodes.length > 0) {
							index++;
							move();
						} else {
							that._helper.hideStandby();
							that.searchAlbums();
						}
					} else {
						that._helper.showStandby();
						that.searchAlbums();
					}
				});
			};
			
			this._helper.showStandby();
			move();
		},
		
		removePhoto: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		Removes photo from album
			if (!this._photoSearchCriteria.album_id) {
				return;
			}
			this._helper.showStandby();
			var that    = this;
			var albumId = this._photoSearchCriteria.album_id;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_photo_remove").url, {
				data: {
					album_id: albumId,
					photo_id: photoItemView.getPhoto().photo_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				if ("APP_RESULT_OK" == data.result) {
					dojoTopic.publish("/app/global/notification", {
						message: that._i18n.photo.remove.success
					});
					
					that._photoListView.removePhotoItemView(photoItemView);
					that._photoListView.increasePhotoCounter(-1);
					var albumItemView = that._albumListView.getAlbumItemView(albumId);
					if (albumItemView) {
						albumItemView.increasePhotoCounter(-1);
					}
				}
			});
		},
		
		renamePhoto: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		Renames given photo item
			var that    = this;
			var photoId = photoItemView.getPhoto().photo_id;
			
			// Create InlineEditBox element
			if (!photoItemView.titleEditBox) {
				photoItemView.titleEditBox = new dijit.InlineEditBox({
					editor: "dijit.form.Textarea",
					autoSave: true,
					disabled: false,
					editorParams: {
						required: true
					},
					onChange: function(newTitle) {
						this.set("disabled", true);
						if (newTitle != "") {
							dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_photo_rename").url, {
								data: {
									photo_id: photoId,
									title: newTitle
								},
								handleAs: "json",
								method: "POST"
							}).then(function(data) {
								if ("APP_RESULT_OK" == data.result) {
									photoItemView.setTitle(newTitle);
									dojoTopic.publish("/app/global/notification", {
										message: that._i18n.photo.rename.success
									});
								}
							});
						}
					},
					onCancel: function() {
						this.set("disabled", true);
					}
				}, photoItemView.getPhotoTitleNode());
			}
			photoItemView.titleEditBox.set("disabled", false);
			photoItemView.titleEditBox.startup();
			photoItemView.titleEditBox.edit();
		},
		
		replacePhoto: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		Replaces given photo item
			var params = {
				photo_id: photoItemView.getPhoto().photo_id
			};
			var url = core.js.base.controllers.ActionProvider.get("media_photo_replace").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "mediaPhotoReplaceDialog",
				title: this._i18n.photo.replace.title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		savePhotoOrder: function() {
			// summary:
			//		Saves the order of photos in the selected album
			var albumItemView  = this._albumListView.getSelectedAlbumItemView();
			if (!albumItemView) {
				return;
			}
			var photoItemViews = this._photoListView.getPhotoItemViews(),
				data		   = [],
				startIndex	   = this._photoSearchCriteria.per_page * (this._photoSearchCriteria.page - 1) + 1;  
			for (var i = 0; i < photoItemViews.length; i++) {
				data.push({
					photo_id: photoItemViews[i].getPhoto().photo_id,
					album_id: albumItemView.getAlbum().album_id,
					index: startIndex + i
				});
			}
			
			this._helper.showStandby();
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_photo_order").url, {
				data: {
					data: dojoJson.stringify(data)
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				if ("APP_RESULT_OK" == data.result) {
					dojoTopic.publish("/app/global/notification", {
						message: that._i18n.photo.order.success,
						type: "message"
					});
				}
			});
		},
		
		searchPhotos: function(/*Object*/ criteria) {
			// summary:
			//		Searches for photos
			var that = this;
			this._helper.closeDialog();
			
			dojoLang.mixin(this._photoSearchCriteria, criteria);
			var q   = core.js.base.Encoder.encode(this._photoSearchCriteria);
			var url = core.js.base.controllers.ActionProvider.get("media_photo_list").url;
			dojoHash("u=" + url + "/?q=" + q);
			
			this._helper.showStandby();
			dojoRequestXhr(url, {
				data: {
					q: q,
					format: "html"
				},
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				that._photoListView.setContent(data);
			});
		},
		
		setAlbumCover: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		Updates album's cover
			if (!this._photoSearchCriteria.album_id) {
				return;
			}
			this._helper.showStandby();
			var that    = this,
				albumId = this._photoSearchCriteria.album_id;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_album_cover").url, {
				data: {
					album_id: albumId,
					photo_id: photoItemView.getPhoto().photo_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				if ("APP_RESULT_OK" == data.result) {
					dojoTopic.publish("/app/global/notification", {
						message: that._i18n.album.cover.success
					});
					var albumItemView = that._albumListView.getAlbumItemView(albumId);
					if (albumItemView) {
						albumItemView.updateCover(data.thumbnails);
					}
				}
			});
		},
		
		updatePhoto: function(/*media.js.views.PhotoItemView*/ photoItemView) {
			// summary:
			//		Updates given photo
			var params = {
				photo_id: photoItemView.getPhoto().photo_id
			};
			this._helper.showPane(core.js.base.controllers.ActionProvider.get("media_photo_update").url + "?" + dojoIoQuery.objectToQuery(params));
		},
		
		uploadPhotos: function(/*String?*/ albumId) {
			// summary:
			//		Uploads photos to given album
			// albumId:
			//		Id of album
			var params = {
				language: this._photoSearchCriteria.language
			};
			if (albumId) {
				params.album_id = albumId;
			} else if (this._photoSearchCriteria.album_id) {
				params.album_id = this._photoSearchCriteria.album_id;
			}
			var url = core.js.base.controllers.ActionProvider.get("media_photo_upload").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		}
	});
});
