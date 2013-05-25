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
	"dojo/aspect",
	"dojo/dom-attr",
	"dojo/hash",
	"dojo/io-query",
	"dojo/json",
	"dojo/request/iframe",
	"dojo/request/xhr",
	"dojo/topic",
	"dojo/NodeList-dom",
	"dojo/query",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/I18N",
	"core/js/base/Encoder",
	"core/js/base/views/Helper",
	"media/js/controllers/VideoMediator"
], function(dojoDeclare, dojoLang, dojoAspect, dojoDomAttr, dojoHash, dojoIoQuery, dojoJson, dojoRequestIframe, dojoRequestXhr, dojoTopic) {
	return dojoDeclare("media.js.controllers.VideoController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _mediator: media.js.controllers.VideoMediator
		_mediator: new media.js.controllers.VideoMediator(),
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/media/js/controllers/VideoController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		/* ========== MANAGE PLAYLISTS ====================================== */
		
		// _playlistToolbar: media.js.views.PlaylistToolbar
		_playlistToolbar: null,
		
		// _playlistListView: media.js.views.PlaylistListView
		_playlistListView: null,
		
		// _playlistContextMenu: media.js.views.PlaylistContextMenu
		_playlistContextMenu: null,
		
		// _playlistSearchCriteria: Object
		_playlistSearchCriteria: {
			status: null,
			title: null,
			page: 1,
			active_playlist_id: null,
			view_type: "list",
			language: null
		},
		
		setPlaylistToolbar: function(/*media.js.views.PlaylistToolbar*/ playlistToolbar) {
			// summary:
			//		Sets playlist toolbar
			this._playlistToolbar = playlistToolbar;
			this._mediator.setPlaylistToolbar(playlistToolbar);
			
			var that = this;
			// Add playlist handler
			dojoAspect.after(playlistToolbar, "onAddPlaylist", dojoLang.hitch(this, "addPlaylist"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/playlist/add/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/playlist/add/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.playlist.add[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				this.searchPlaylists();
			});
			
			// Refresh handler
			dojoAspect.after(playlistToolbar, "onRefresh", dojoLang.hitch(this, "searchPlaylists"));
			
			// Search handler
			dojoAspect.after(playlistToolbar, "onSearchPlaylists", function(title) {
				that.searchPlaylists({
					title: title,
					page: 1
				});
			}, true);
			
			// Switch to other language handler
			dojoAspect.after(playlistToolbar, "onSwitchToLanguage", function(language) {
				that.searchPlaylists({
					active_playlist_id: null,
					title: null,
					page: 1,
					language: language
				});
				that.searchVideos({
					title: null,
					playlist_id: null,
					page: 1,
					language: language
				});
			}, true);
			
			// Change view type handler
			dojoAspect.after(playlistToolbar, "onChangeViewType", function(viewType) {
				that._playlistSearchCriteria.view_type = viewType;
				if (that._playlistListView) {
					that._playlistListView.setViewType(viewType);
				}
			}, true);
			
			return this;	// media.js.controllers.VideoController
		},
		
		setPlaylistListView: function(/*media.js.views.PlaylistListView*/ playlistListView) {
			// summary:
			//		Sets playlist list view
			this._playlistListView = playlistListView;
			this._mediator.setPlaylistListView(playlistListView);
			
			var that = this;
			// Shows the context menu
			dojoAspect.after(playlistListView, "onMouseDown", function(playlistItemView) {
				if (that._playlistContextMenu) {
					that._playlistContextMenu.show(playlistItemView);
				}
			}, true);
			
			// Load the list of videos in the selected playlist when selecting a playlist
			dojoAspect.after(playlistListView, "onClickPlaylist", function(playlistItemView) {
				that._playlistListView.setSelectedPlaylistItemView(playlistItemView);
				
				var playlistId = playlistItemView.getPlaylist().playlist_id;
				that._playlistSearchCriteria.active_playlist_id = playlistId;
				that.searchVideos({
					page: 1,
					playlist_id: playlistId
				});
			}, true);
			
			dojoAspect.after(playlistListView, "onDropVideos", dojoLang.hitch(this, "dropVideos"), true);
			
			// Update playlist's poster handler
			dojoAspect.after(playlistListView, "onUpdatePoster", dojoLang.hitch(this, "updatePlaylistPoster"), true);
			
			// Rename playlist handler
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/playlist/rename/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/playlist/rename/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.playlist.rename[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					var playlistItemView = this._playlistListView.getPlaylistItemView(data.playlist_id);
					if (playlistItemView) {
						playlistItemView.updateTitle(data.title, data.short_title);
					}
				}
			});
			
			// View all handler
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/playlist/list/onViewAll", this, function(viewAllNode) {
				this._playlistListView.setSelectedPlaylistItemView(null);
				
				dojo.query(".module-media-playlist-active", this._playlistListView.getDomNode()).removeClass("module-media-playlist-active");
				dojo.query(viewAllNode).addClass("module-media-playlist-active");
				this._playlistSearchCriteria.active_playlist_id = null;
				this.searchVideos({
					page: 1,
					playlist_id: null
				});
			});
			
			return this;	// media.js.controllers.VideoController
		},
		
		setPlaylistContextMenu: function(/*media.js.views.PlaylistContextMenu*/ playlistContextMenu) {
			// summary:
			//		Sets playlist context menu
			this._playlistContextMenu = playlistContextMenu;
			
			// Activate handler
			dojoAspect.after(playlistContextMenu, "onActivatePlaylist", dojoLang.hitch(this, "activatePlaylist"), true);
			
			// Delete playlist handler
			dojoAspect.after(playlistContextMenu, "onDeletePlaylist", dojoLang.hitch(this, "deletePlaylist"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/playlist/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/playlist/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.playlist["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				this.searchPlaylists();
			});
			
			// Rename playlist handler
			dojoAspect.after(playlistContextMenu, "onRenamePlaylist", dojoLang.hitch(this, "renamePlaylist"), true);
			
			// Add video handler
			dojoAspect.after(playlistContextMenu, "onAddVideo", function(playlistItemView) {
				var playlistId = playlistItemView.getPlaylist().playlist_id;
				that.addVideo(playlistId);
			}, true);
			
			return this;	// media.js.controllers.VideoController
		},
		
		activatePlaylist: function(/*media.js.views.PlaylistItemView*/ playlistItemView) {
			// summary:
			//		Activates/deactivates given playlist
			var status = playlistItemView.getPlaylist().status;
			var that   = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_playlist_activate").url, {
				data: {
					playlist_id: playlistItemView.getPlaylist().playlist_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				var message = ("APP_RESULT_OK" == data.result) 
						    ? ("activated" == status ? "deactivateSuccess" : "activateSuccess") 
						    : ("activated" == status ? "deactivateError" : "activateError");
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.playlist.activate[message],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					playlistItemView.getPlaylist().status = ("activated" == status) ? "not_activated" : "activated";
				}
			});
		},
		
		addPlaylist: function() {
			// summary:
			//		Adds new playlist
			var params = {
				language: this._playlistSearchCriteria.language
			};
			var url = core.js.base.controllers.ActionProvider.get("media_playlist_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				title: this._i18n.playlist.add.title,
				style: "width: 400px",
				refreshOnShow: true
			});
		},
		
		deletePlaylist: function(/*media.js.views.PlaylistItemView*/ playlistItemView) {
			// summary:
			//		Deletes given playlist
			var params = {
				playlist_id: playlistItemView.getPlaylist().playlist_id
			};
			var url = core.js.base.controllers.ActionProvider.get("media_playlist_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "mediaPlaylistDeleteDialog",
				title: this._i18n.playlist["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		renamePlaylist: function(/*media.js.views.PlaylistItemView*/ playlistItemView) {
			// summary:
			//		Renames given playlist
			var params = {
				playlist_id: playlistItemView.getPlaylist().playlist_id
			};
			var url = core.js.base.controllers.ActionProvider.get("media_playlist_rename").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "mediaPlaylistRenameDialog",
				title: this._i18n.playlist.rename.title,
				style: "width: 400px",
				refreshOnShow: true
			});
		},
		
		searchPlaylists: function(/*Object*/ criteria) {
			// summary:
			//		Searches for playlists
			this._helper.closeDialog();
			
			dojoLang.mixin(this._playlistSearchCriteria, criteria);
			var that = this;
			var q	 = core.js.base.Encoder.encode(this._playlistSearchCriteria);
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_playlist_list").url, {
				data: {
					q: q
				},
				method: "POST"
			}).then(function(data) {
				that._playlistListView.setContent(data);
			});
		},
		
		updatePlaylistPoster: function(/*media.js.views.PlaylistItemView*/ playlistItemView, /*Object*/ thumbnails) {
			// summary:
			//		Updates the playlist's poster. Called after dropping an image from 
			// 		the Image Editor toolbox
			this._helper.showStandby();
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_playlist_cover").url, {
				data: {
					playlist_id: playlistItemView.getPlaylist().playlist_id,
					thumbnails: dojoJson.stringify(thumbnails)
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				if ("APP_RESULT_OK" == data.result) {
					dojoTopic.publish("/app/global/notification", {
						message: that._i18n.playlist.cover.success
					});
					playlistItemView.updatePoster(data.thumbnails);
				}
			});
		},
		
		/* ========== MANAGE VIDEOS ========================================= */
		
		// _videoToolbar: media.js.views.VideoToolbar
		_videoToolbar: null,

		// _videoListView: media.js.views.VideoListView
		_videoListView: null,

		// _videoContextMenu: media.js.views.VideoContextMenu
		_videoContextMenu: null,
		
		// _videoSearchCriteria: Object
		_videoSearchCriteria: {
			playlist_id: null,
			status: null,
			page: 1,
			view_size: "thumbnail",
			per_page: 20,
			language: null
		},

		setVideoToolbar: function(/*media.js.views.VideoToolbar*/ videoToolbar) {
			// summary:
			//		Sets video toolbar
			this._videoToolbar = videoToolbar;
			this._mediator.setVideoToolbar(videoToolbar);
			
			var that = this;
			// Add new video handler
			dojoAspect.after(videoToolbar, "onAddVideo", dojoLang.hitch(this, "addVideo"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/video/add/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/video/add/onComplete", this, function(data) {
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.video.add[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					var playlistItemView = this._playlistListView.getPlaylistItemView(data.playlist_id);
					if (playlistItemView) {
						this._playlistListView.setSelectedPlaylistItemView(playlistItemView);
						
						// Update the number of videos in the playlist
						playlistItemView.increaseVideoCounter(1);
					}
					
					// Show the videos in the playlist
					this.searchVideos({
						page: 1,
						playlist_id: data.playlist_id
					});
				}
			});
			
			// Refresh handler
			dojoAspect.after(videoToolbar, "onRefresh", dojoLang.hitch(this, "searchVideos"));
			
			// Save order of videos in playlist
			dojoAspect.after(videoToolbar, "onSaveOrder", dojoLang.hitch(this, "saveVideoOrder"));
			
			// Search by title handler
			dojoAspect.after(videoToolbar, "onSearchVideos", function(title) {
				that.searchVideos({
					title: title,
					page: 1
				});
			}, true);
			
			// Update page size handler
			dojoAspect.after(videoToolbar, "onUpdatePageSize", function(perPage) {
				if (that._videoSearchCriteria.per_page != perPage) {
					that.searchVideos({
						page: 1,
						per_page: perPage
					});
				}
			}, true);
			
			// View in various size handler
			dojoAspect.after(videoToolbar, "onViewSize", function(size) {
				that._videoSearchCriteria.view_size = size;
				if (that._videoListView) {
					that._videoListView.setViewSize(size);
				}
			}, true);
			
			return this;	// media.js.controllers.VideoController
		},

		setVideoListView: function(/*media.js.views.VideoListView*/ videoListView) {
			// summary:
			//		Sets video list view
			this._videoListView = videoListView;
			this._mediator.setVideoListView(videoListView);
			
			var that = this;
			// Show the context menu
			dojoAspect.after(videoListView, "onMouseDown", function(videoItemView) {
				if (that._videoContextMenu) {
					that._videoContextMenu.show(videoItemView);
				}
			}, true);
			
			// Paging handler
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/video/list/onGotoPage", this, function(page) {
				this.searchVideos({
					page: page
				});
			});
			
			// Update poster handler
			dojoAspect.after(videoListView, "onUpdatePoster", dojoLang.hitch(this, "updatePoster"), true);
			
			return this;	// media.js.controllers.VideoController
		},

		setVideoContextMenu: function(/*media.js.views.VideoContextMenu*/ videoContextMenu) {
			// summary:
			//		Sets video context menu
			this._videoContextMenu = videoContextMenu;
			this._mediator.setVideoContextMenu(videoContextMenu);
			
			var that = this;
			// Activate handler
			dojoAspect.after(videoContextMenu, "onActivateVideo", dojoLang.hitch(this, "activateVideo"), true);
			
			// Edit video handler
			dojoAspect.after(videoContextMenu, "onUpdateVideo", dojoLang.hitch(this, "updateVideo"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/video/update/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/video/update/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/video/update/onComplete", this, function(data) {
				this._helper.hideStandby();
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.video.update[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					var videoItemView = this._videoListView.getVideoItemView(data.video_id);
					if (videoItemView) {
						videoItemView.getVideo().url		= data.url;
						videoItemView.getVideo().embed_code = data.embed_code;
						videoItemView.updateTitle(data.title, data.short_title);
						if (data.thumbnails) {
							videoItemView.updatePosterThumbnails(data.thumbnails);
						}
					}
				}
			});
			
			// Delete video handler
			dojoAspect.after(videoContextMenu, "onDeleteVideo", dojoLang.hitch(this, "deleteVideo"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/video/delete/onComplete", this, function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.video["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				this.searchPlaylists();
				this.searchVideos();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/video/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			
			// Rename video handler
			dojoAspect.after(videoContextMenu, "onRenameVideo", dojoLang.hitch(this, "renameVideo"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/video/rename/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/media/video/rename/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.video.rename[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					var videoItemView = this._videoListView.getVideoItemView(data.video_id);
					if (videoItemView) {
						videoItemView.updateTitle(data.title, data.short_title);
					}
				}
			});
			
			// Set poster handler
			dojoAspect.after(videoContextMenu, "onSetPoster", dojoLang.hitch(this, "setPlaylistPoster"), true);
			
			// Remove from playlist handler
			dojoAspect.after(videoContextMenu, "onRemoveFromPlaylist", dojoLang.hitch(this, "removeVideo"), true);
			
			// Download handler
			dojoAspect.after(videoContextMenu, "onDownloadVideo", dojoLang.hitch(this, "downloadVideo"), true);
			
			return this;	// media.js.controllers.VideoController
		},
		
		activateVideo: function(/*media.js.views.VideoItemView*/ videoItemView) {
			// summary:
			//		Activates/deactivates given video
			var status = videoItemView.getVideo().status;
			var that   = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_video_activate").url, {
				data: {
					video_id: videoItemView.getVideo().video_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				var message = ("APP_RESULT_OK" == data.result) 
							? ("activated" == status ? "deactivateSuccess" : "activateSuccess") 
							: ("activated" == status ? "deactivateError" : "activateError");
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.video.activate[message],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					videoItemView.getVideo().status = ("activated" == status) ? "not_activated" : "activated";
				}
			});
		},
		
		addVideo: function(/*String*/ playlistId) {
			// summary:
			//		Adds new video
			var params = {
				language: this._videoSearchCriteria.language
			};
			if (playlistId) {
				params.playlist_id = playlistId;
			} else if (this._videoSearchCriteria.playlist_id) {
				params.playlist_id = this._videoSearchCriteria.playlist_id;
			}
			var url = core.js.base.controllers.ActionProvider.get("media_video_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		},
		
		deleteVideo: function(/*media.js.views.VideoItemView*/ videoItemView) {
			// summary:
			//		Deletes video
			var params = {
				video_id: videoItemView.getVideo().video_id
			};
			var url = core.js.base.controllers.ActionProvider.get("media_video_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				title: this._i18n.video["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		downloadVideo: function(/*media.js.views.VideoItemView*/ videoItemView) {
			// summary:
			//		Downloads video
			var videoId = videoItemView.getVideo().video_id;
			dojoRequestIframe(core.js.base.controllers.ActionProvider.get("media_video_download").url, {
				data: {
					video_id: videoId
				},
				method: "GET"
			});
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits the controls with given criteria
			dojoLang.mixin(this._videoSearchCriteria, criteria);
			this._playlistSearchCriteria.language			= criteria.language;
			this._playlistSearchCriteria.active_playlist_id = criteria.playlist_id;
			this._mediator.initVideoSearchCriteria(criteria);
		},
		
		removeVideo: function(/*media.js.views.VideoItemView*/ videoItemView) {
			// summary:
			//		Removes a video from the selected playlist
			if (!this._videoSearchCriteria.playlist_id) {
				return;
			}
			this._helper.showStandby();
			var that = this, playlistId = this._videoSearchCriteria.playlist_id;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_video_remove").url, {
				data: {
					playlist_id: playlistId,
					video_id: videoItemView.getVideo().video_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.video.remove[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					that._videoListView.removeVideoItemView(videoItemView);
					that._videoListView.increaseVideoCounter(-1);
					var playlistItemView = that._playlistListView.getPlaylistItemView(playlistId);
					if (playlistItemView) {
						playlistItemView.increaseVideoCounter(-1);
					}
				}
			});
		},
		
		renameVideo: function(/*media.js.views.VideoItemView*/ videoItemView) {
			// summary:
			//		Renames given video
			var params = {
				video_id: videoItemView.getVideo().video_id
			};
			var url = core.js.base.controllers.ActionProvider.get("media_video_rename").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "mediaVideoRenameDialog",
				title: this._i18n.video.rename.title,
				style: "width: 400px",
				refreshOnShow: true
			});
		},
		
		saveVideoOrder: function() {
			// summary:
			//		Saves the order of videos in the selected playlist
			var playlistItemView  = this._playlistListView.getSelectedPlaylistItemView();
			if (!playlistItemView) {
				return;
			}
			var videoItemViews = this._videoListView.getVideoItemViews(),
				data		   = [],
				startIndex	   = this._videoSearchCriteria.per_page * (this._videoSearchCriteria.page - 1) + 1;  
			for (var i = 0; i < videoItemViews.length; i++) {
				data.push({
					video_id: videoItemViews[i].getVideo().video_id,
					playlist_id: playlistItemView.getPlaylist().playlist_id,
					index: startIndex + i
				});
			}
			
			this._helper.showStandby();
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_video_order").url, {
				data: {
					data: dojo.toJson(data)
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.video.order[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
			});
		},
		
		searchVideos: function(/*Object*/ criteria) {
			// summary:
			//		Searches for videos
			var that = this;
			this._helper.closeDialog();
			
			dojolang.mixin(this._videoSearchCriteria, criteria);
			var q   = core.js.base.Encoder.encode(this._videoSearchCriteria);
			var url = core.js.base.controllers.ActionProvider.get("media_video_list").url;
			dojoHash("u=" + url + "/?q=" + q);
			
			this._helper.showStandby();
			dojoRequestXhr(url, {
				data: {
					q: q,
					format: "html"
				},
				method: "POST"
			}).then(function(data) {
				that._videoListView.setContent(data);
				that._helper.hideStandby();
			});
		},
		
		setPlaylistPoster: function(/*media.js.views.VideoItemView*/ videoItemView) {
			// summary:
			//		Sets the playlist poster
			if (!this._videoSearchCriteria.playlist_id) {
				return;
			}
			this._helper.showStandby();
			var that = this, playlistId = this._videoSearchCriteria.playlist_id;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_playlist_cover").url, {
				data: {
					playlist_id: playlistId,
					video_id: videoItemView.getVideo().video_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.playlist.cover[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					var playlistItemView = that._playlistListView.getPlaylistItemView(playlistId);
					if (playlistItemView) {
						playlistItemView.updatePoster(data.thumbnails);
					}
				}
			});
		},
		
		updatePoster: function(/*media.js.views.VideoItemView*/ videoItemView, /*Object*/ thumbnails) {
			// summary:
			//		Updates video's poster
			var videoId = videoItemView.getVideo().video_id;
			var that	= this;
			this._helper.showStandby();
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_video_cover").url, {
				data: {
					video_id: videoId,
					thumbnails: dojoJson.stringify(thumbnails)
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.video.cover[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					videoItemView.updatePosterThumbnails(thumbnails);
				}
			});
		},
		
		updateVideo: function(/*media.js.views.VideoItemView*/ videoItemView) {
			// summary:
			//		Updates given video
			var params = {
				video_id: videoItemView.getVideo().video_id
			};
			var url = core.js.base.controllers.ActionProvider.get("media_video_update").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		},
		
		dropVideos: function(/*media.js.views.PlaylistItemView*/ playlistItemView, /*DomNode[]*/ videoNodes) {
			// summary:
			//		This callback is called when dragging the video items and dropping them on the playlist
			var newPlaylistId = playlistItemView.getPlaylist().playlist_id;
			var that		  = this;
			this._helper.showStandby();
			while (videoNodes.length > 0) {
				var videoNode = videoNodes[0];
				var video = core.js.base.Encoder.decode(dojoDomAttr.get(videoNode, "data-app-entity-props"));
				
				dojoRequestXhr(core.js.base.controllers.ActionProvider.get("media_video_copy").url, {
					data: {
						playlist_id: newPlaylistId,
						video_id: video.video_id
					},
					handleAs: "json",
					method: "POST"
				});
				
				videoNodes.splice(0, 1);
			}
			
			if (videoNodes.length == 0) {
				this._helper.hideStandby();
				// Reload the list of playlists to update the video counters
				this.searchPlaylists();
			}
		}
	});
});
