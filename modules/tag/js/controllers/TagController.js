/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		tag
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-24
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/hash",
	"dojo/io-query",
	"dojo/request/xhr",
	"dojo/topic",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/base/views/Helper"
], function(dojoDeclare, dojoLang, dojoAspect, dojoHash, dojoIoQuery, dojoRequestXhr, dojoTopic) {
	return dojoDeclare("tag.js.controllers.TagController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _toolbar: tag.js.views.TagToolbar
		_toolbar: null,
		
		// _tagListView: tag.js.views.TagListView
		_tagListView: null,
		
		// _tagContextMenu: tag.js.views.TagContextMenu
		_tagContextMenu: null,
		
		// _defaultCriteria: Object
		_defaultCriteria: {
			keyword: null,
			language: null,
			page: 1,
			per_page: 200
		},
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/tag/js/controllers/TagController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("tag/languages");
			this._i18n = core.js.base.I18N.getLocalization("tag/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setTagToolbar: function(/*tag.js.views.TagToolbar*/ toolbar) {
			// summary:
			//		Sets the tag toolbar
			this._toolbar = toolbar;
			
			var that = this;
			// Add tag handler
			dojoAspect.after(toolbar, "onAddTag", dojoLang.hitch(this, "addTag"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/tag/tag/add/onCancel", this._helper, "closeDialog");
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/tag/tag/add/onComplete", this, function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.tag.add[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchTags();
				}
			});
			
			// Refresh handler
			dojoAspect.after(toolbar, "onRefresh", dojoLang.hitch(this, "searchTags"));
			
			// Search tag handler
			dojoAspect.after(toolbar, "onSearchTags", function(keyword) {
				that.searchTags({
					keyword: keyword,
					page: 1
				});
			}, true);
			
			// Switch to other language handler
			dojoAspect.after(toolbar, "onSwitchToLanguage", function(language) {
				that.searchTags({
					language: language,
					page: 1
				});
			}, true);
			
			// Update page size handler
			dojoAspect.after(toolbar, "onUpdatePageSize", function(perPage) {
				that.searchTags({
					page: 1,
					per_page: perPage
				});
			}, true);
			
			return this;	// tag.js.controllers.TagController 
		},
		
		setTagListView: function(/*tag.js.views.TagListView*/ tagListView) {
			// summary:
			//		Sets the tag list view
			this._tagListView = tagListView;
			
			var that = this;
			// Show the context menu
			dojoAspect.after(tagListView, "onMouseDown", function(tagItemView) {
				if (that._tagContextMenu) {
					that._tagContextMenu.setTagItemView(tagItemView)
										.show();
				}
			}, true);
			
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/tag/tag/list/onGotoPage", this, function(page) {
				this.searchTags({
					page: page
				});
			});
			
			return this;	// tag.js.controllers.TagController
		},
		
		setTagContextMenu: function(/*tag.js.views.TagContextMenu*/ tagContextMenu) {
			// summary:
			//		Sets the context menu
			this._tagContextMenu = tagContextMenu;
			
			// Edit tag handler
			dojoAspect.after(tagContextMenu, "onEditTag", dojoLang.hitch(this, "editTag"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/tag/tag/edit/onCancel", this._helper, "closeDialog");
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/tag/tag/edit/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.tag.edit[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchTags();
				}
			});
			
			// Delete tag handler
			dojoAspect.after(tagContextMenu, "onDeleteTag", dojoLang.hitch(this, "deleteTag"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/tag/tag/delete/onCancel", this._helper, "closeDialog");
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/tag/tag/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.tag["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchTags();
				}
			});
			
			return this;	// tag.js.controllers.TagController
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits the controls with given criteria
			dojoLang.mixin(this._defaultCriteria, criteria);
			this._toolbar.initSearchCriteria(criteria);
			
			return this;	// tag.js.controllers.TagController
		},
		
		addTag: function() {
			// summary:
			//		Adds new tag
			var url = core.js.base.controllers.ActionProvider.get("tag_tag_add").url;
			this._helper.showDialog(url, {
				id: "tagTagAddDialog",
				title: this._i18n.tag.add.title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		deleteTag: function(/*tag.js.views.TagItemView*/ tagItemView) {
			// summary:
			//		Deletes a tag
			var params = {
				tag_id: tagItemView.getTag().tag_id
			};
			var url = core.js.base.controllers.ActionProvider.get("tag_tag_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "tagTagDeleteDialog",
				title: this._i18n.tag["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		editTag: function(/*tag.js.views.TagItemView*/ tagItemView) {
			// summary:
			//		Edits a tag
			var params = {
				tag_id: tagItemView.getTag().tag_id
			};
			var url = core.js.base.controllers.ActionProvider.get("tag_tag_edit").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "tagTagEditDialog",
				title: this._i18n.tag.edit.title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		searchTags: function(/*Object*/ criteria) {
			// summary:
			//		Searches for tags
			dojoLang.mixin(this._defaultCriteria, criteria);
			var q   = core.js.base.Encoder.encode(this._defaultCriteria);
			var url = core.js.base.controllers.ActionProvider.get("tag_tag_list").url;
			dojoHash("u=" + url + "/?q=" + q);
			
			var that = this;
			this._helper.showStandby();
			dojoRequestXhr(url, {
				data: {
					q: q,
					format: "html"
				},
				method: "POST"
			}).then(function(data) {
				that._tagListView.setContent(data);
				that._helper.hideStandby();
			});
		}
	});
});
