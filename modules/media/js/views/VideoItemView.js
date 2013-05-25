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
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/mouse",
	"dojo/on",
	"dojo/parser",
	"dojo/query",
	"dojox/widget/DialogSimple",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/Constant"
], function(dojoDeclare, dojoDom, dojoDomAttr, dojoDomConstruct, dojoDomStyle, dojoMouse, dojoOn) {
	return dojoDeclare("media.js.views.VideoItemView", null, {
		// _domNode: DomNode
		_domNode: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _videoTitleNode: DomNode
		_videoTitleNode: null,
		
		// _videoImageNode: DomNode
		_videoImageNode: null,
		
		// _videoListView: media.js.views.VideoListView
		_videoListView: null,
		
		// _video: Object
		// 		Represents video data
		_video: null,
		
		constructor: function(/*DomNode*/ domNode, /*media.js.views.VideoListView*/ videoListView) {
			this._domNode		 = domNode;
			this._videoTitleNode = dojo.query(".module-media-video-title", domNode)[0];
			this._videoImageNode = dojo.query("img.module-media-video-image", domNode)[0];
			this._videoListView  = videoListView;
			
			this._video = core.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props"));
			
			var that = this;
			this._videoImageNode.onload = function() {
				dojoDomStyle.set(that._videoTitleNode, "maxWidth", this.width + "px");
			};
			
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
			
			this._init();
		},
		
		getDomNode: function() {
			return this._domNode;			// DomNode
		},
		
		getVideoImageNode: function() {
			// summary:
			//		Returns the image node
			return this._videoImageNode;	// DomNode
		},
		
		getVideo: function() {
			return this._video;		// Object
		},
		
		_init: function() {
			// summary:
			//		Initializes node
			// Play the video when user double click on the play icon
			var that = this;
			dojoOn(dojo.query(".module-media-video-play", this._domNode)[0], "dblclick", function(e) {
				that.playVideo();
			});
			dojoOn(this._domNode, "contextmenu", function(e) {
				e.preventDefault();
			});
			dojoOn(this._domNode, "mousedown", function(e) {
				if (dojoMouse.isRight(e)) {
					e.preventDefault();
					that._videoListView.onMouseDown(that);
				}
			});
		},
		
		playVideo: function() {
			// summary:
			//		Shows a dialog to play the video
			var previewId = "media.views.VideoItemViewPreview_" + this._video.video_id;
			if (dojoDom.byId(previewId)) {
				dojoDomConstruct.destroy(previewId);
			}
			var dialog = new dojox.widget.DialogSimple({
				title: this._i18n.video._share.playAction,
				style: "height: 360px; width: 500px"
			});
			
			// FIXME: Play video with given embed code
			var jsCode = [];
			jsCode.push('swfobject.embedSWF("' + core.js.Constant.ROOT_URL + '/static/js/strobemediaplayback/StrobeMediaPlayback.swf"', 
											'"' + previewId + '"',
											'"470"',
											'"320"',
											'"10.0.1"',
											'"' + core.js.Constant.ROOT_URL + '/static/js/strobemediaplayback/expressInstall.swf"',
											'{ autoPlay: true, src: "' + core.js.Constant.normalizeUrl(this._video.url) + '" }, { allowfullscreen: true });');
			dialog.set("content", '<div id="' + previewId + '"></div><script type="text/javascript">' + "\n" + jsCode.join(",") + '</script>');
			dialog.show();
		},
		
		setViewSize: function(/*String*/ size) {
			// summary:
			//		Shows the videos in given size of thumbnail
			// size:
			//		The size of thumbnail, can be: square, thumbnail, small, crop, medium
			this._video.view_size = size;
			dojoDomAttr.set(this._videoImageNode, "src", this._video[size]);
		},
		
		updatePosterThumbnails: function(/*Object*/ thumbnails) {
			// summary:
			//		Updates thumbnails of video's poster
			for (var size in thumbnails) {
				this.updateThumbnailUrl(size, thumbnails[size]);
			}
		},
		
		updateThumbnailUrl: function(/*String*/ size, /*String*/ url) {
			// summary:
			//		Updates the new thumbnail's URL
			// size:
			//		The size of thumbnail, can be: square, thumbnail, small, crop, medium
			// url:
			//		The URL of thumbnail
			if (!url) {
				return;
			}
			url = core.js.Constant.normalizeUrl(url) + "?" + new Date().getTime();
			this._video[size] = url;
			
			if (this._video.view_size == size) {
				dojoDomAttr.set(this._videoImageNode, "src", url);
			}
		},
		
		updateTitle: function(/*String*/ title, /*String*/ shortTitle) {
			// summary:
			//		Updates video's title
			this._video.title			   = title;
			this._video.short_title		   = shortTitle;
			this._videoTitleNode.innerHTML = title;
			dojoDomAttr.set(this._videoImageNode, "title", title);
		}
	});
});
