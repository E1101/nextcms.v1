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
	"dojo/dom-class",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/form/HorizontalSlider",
	"dijit/form/Select",
	"dijit/form/TextBox",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoArray, dojoDeclare, dojoDomClass) {
	return dojoDeclare("media.js.views.VideoToolbar", null, {
		// _toolbar: dijit.Toolbar
		_toolbar: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _saveOrderButton: dijit.form.Button
		_saveOrderButton: null,
		
		// _searchTextBox: dijit.form.TextBox
		_searchTextBox: null,
		
		// _searchButton: dijit.form.Button
		_searchButton: null,
		
		// _sizeSlider: dijit.form.HorizontalSlider
		_sizeSlider: null,
		
		// _sizeSliderValueHash: Object
		_sizeSliderValueHash: {
			"0": "square",
			"10": "thumbnail",
			"20": "small",
			"30": "crop",
			"40": "medium"
		},
		
		// _sizeSliderLabelHash: Object
		_sizeSliderLabelHash: {
			"square": "0",
			"thumbnail": "10",
			"small": "20",
			"crop": "30",
			"medium": "40"
		},
		
		// _perPageSelect: dijit.form.Select
		_perPageSelect: null,
		
		// _numVideosPerPage: Array
		_numVideosPerPage: [ 20, 40, 60, 80, 100 ],
		
		constructor: function(/*String*/ id) {
			this._toolbar = new dijit.Toolbar({}, id);
			
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
			
			// Add toolbar items
			var that = this;
			
			// "Add new video" button
			this._toolbar.addChild(new dijit.form.Button({
				label: this._i18n.video.list.addVideoAction,
				showLabel: false,
				iconClass: "app-icon app-icon-add",
				disabled: !core.js.base.controllers.ActionProvider.get("media_video_add").isAllowed,
				onClick: function(e) {
					that.onAddVideo();
				}
			}));
			
			// Refresh button
			this._toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				disabled: !core.js.base.controllers.ActionProvider.get("media_video_list").isAllowed,
				onClick: function(e) {
					that.onRefresh();
				}
			}));
			
			this._toolbar.addChild(new dijit.ToolbarSeparator());
			
			// Save orders button
			this._saveOrderButton = new dijit.form.Button({
				label: this._i18n.global._share.saveOrderAction,
				showLabel: true,
				iconClass: "app-icon app-icon-save",
				disabled: !core.js.base.controllers.ActionProvider.get("media_video_order").isAllowed,
				onClick: function(e) {
					that.onSaveOrder();
				}
			});
			this._toolbar.addChild(this._saveOrderButton);
			this._toolbar.addChild(new dijit.ToolbarSeparator());
			
			// Search control
			this._searchTextBox = new dijit.form.TextBox({
				style: "width: 150px",
				placeHolder: this._i18n.video.list.searchHelp
			});
			this._searchButton = new dijit.form.Button({
				label: this._i18n.global._share.searchAction,
				showLabel: false,
				iconClass: "app-icon app-icon-search",
				disabled: !core.js.base.controllers.ActionProvider.get("media_video_list").isAllowed,
				onClick: function(e) {
					var title = that._searchTextBox.get("value");
					that.onSearchVideos(title);
				}
			});
			this._toolbar.addChild(this._searchTextBox);
			this._toolbar.addChild(this._searchButton);
			
			// View the thumbnails in various size
			this._sizeSlider = new dijit.form.HorizontalSlider({
				value: 10,
				minimum: 0,
				maximum: 40,
				discreteValues: 5,
				intermediateChanges: true,
				style: "width: 200px;",
				showButtons: true,
				onChange: function(value) {
					that.onViewSize(that._sizeSliderValueHash[value + ""]);
				}
			});
			
			// Put the slider at the right side
			dojoDomClass.add(this._sizeSlider.domNode, "app-right");
			this._toolbar.addChild(this._sizeSlider);
			
			var separator = new dijit.ToolbarSeparator();
			dojoDomClass.add(separator.domNode, "app-right");
			this._toolbar.addChild(separator);
			
			// Select the number of videos per page
			var options = [];
			dojoArray.forEach(this._numVideosPerPage, function(value, index) {
				options.push({
					label: value,
					value: value + ""
				});
			});
			this._perPageSelect = new dijit.form.Select({ 
				options: options, 
				style: "height: 20px",
				disabled: !core.js.base.controllers.ActionProvider.get("media_video_list").isAllowed,
				onChange: function(value) {
					that.onUpdatePageSize(parseInt(value));
				}
			});
			dojoDomClass.add(this._perPageSelect.domNode, "app-right");
			this._toolbar.addChild(this._perPageSelect);
		},
		
		/* ========== ENABLE/DISABLE CONTROLS =============================== */
		
		allowToViewSize: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to change the view size
			this._sizeSlider.set("disabled", !isAllowed);
			return this;	// media.js.views.VideoToolbar
		},
		
		allowToSearch: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to search for videos
			this._searchTextBox.set("disabled", !isAllowed || !core.js.base.controllers.ActionProvider.get("media_video_list").isAllowed);
			this._searchButton.set("disabled", !isAllowed || !core.js.base.controllers.ActionProvider.get("media_video_list").isAllowed);
			return this;	// media.js.views.VideoToolbar
		},
		
		allowToSaveOrder: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to save order of videos in playlist
			this._saveOrderButton.set("disabled", !isAllowed || !core.js.base.controllers.ActionProvider.get("media_video_order").isAllowed);
			return this;	// media.js.views.VideoToolbar
		},
		
		allowToChangePageSize: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to change the number of videos per page
			this._perPageSelect.set("disabled", !isAllowed || !core.js.base.controllers.ActionProvider.get("media_video_list").isAllowed);
			return this;	// media.js.views.VideoToolbar
		},
		
		setPerPageValue: function(/*Number*/ perPage) {
			var index = dojo.indexOf(this._numVideosPerPage, perPage);
			if (index != -1) {
				this._perPageSelect.set("value", perPage + "");
			}
			return this;	// media.js.views.VideoToolbar
		},
		
		setKeyword: function(/*String*/ keyword) {
			if (keyword) {
				this._searchTextBox.set("value", keyword);
			}
			return this;	// media.js.views.VideoToolbar
		},
		
		setViewSize: function(/*String*/ viewSize) {
			this._sizeSlider.set("value", this._sizeSliderLabelHash[viewSize]);
			return this;	// media.js.views.VideoToolbar
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onAddVideo: function() {
			// summary:
			//		Adds new video
			// tags:
			//		callback
		},
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of videos
			// tags:
			//		callback
		},
		
		onSaveOrder: function() {
			// summary:
			//		Saves order of videos in playlist
			// tags:
			//		callback
		},
		
		onSearchVideos: function(/*String*/ title) {
			// summary:
			//		Searches for videos by title
			// tags:
			//		callback
		},
		
		onUpdatePageSize: function(/*Integer*/ perPage) {
			// summary:
			//		This method is called when the page size select changes its value
			// perPage:
			//		The number of photos per page
			// tags:
			//		callback
		},
		
		onViewSize: function(/*String*/ size) {
			// summary:
			//		Updates the view size
			// tags:
			//		callback
		}
	});
});
