/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		file
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-05
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/hash",
	"dojo/io-query",
	"dojo/request/xhr",
	"dojo/topic",
	"dijit/registry",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/base/views/Helper"
], function(dojoDeclare, dojoLang, dojoAspect, dojoHash, dojoIoQuery, dojoRequestXhr, dojoTopic, dijitRegistry) {
	return dojoDeclare("file.js.controllers.AttachmentController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _attachmentToolbar: file.js.views.AttachmentToolbar
		_attachmentToolbar: null,
		
		// _attachmentGrid: file.js.views.AttachmentGrid
		_attachmentGrid: null,
		
		// _paginatorContainer: String
		_paginatorContainer: null,
		
		// _defaultCriteria: Object
		_defaultCriteria: {
			keyword: null,
			page: 1,
			per_page: 20,
			language: null
		},
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/file/js/controllers/AttachmentController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("file/languages");
			this._i18n = core.js.base.I18N.getLocalization("file/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setAttachmentToolbar: function(/*file.js.views.AttachmentToolbar*/ attachmentToolbar) {
			// summary:
			//		Sets the attachment toolbar
			this._attachmentToolbar = attachmentToolbar;
			
			var that = this;
			// Add new attachment handler
			dojoAspect.after(attachmentToolbar, "onUploadAttachment", dojoLang.hitch(this, "uploadAttachment"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/attachment/add/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/attachment/add/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/attachment/add/onComplete", this, function(data) {
				this._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.attachment.add[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchAttachments();
				}
			});
			
			// Refresh handler
			dojoAspect.after(attachmentToolbar, "onRefresh", dojoLang.hitch(this, "searchAttachments"));
			
			// Search handler
			dojoAspect.after(attachmentToolbar, "onSearchAttachments", function(criteria) {
				criteria.page = 1;
				that.searchAttachments(criteria);
			}, true);
			dojoAspect.after(attachmentToolbar, "onUpdatePageSize", function(perPage) {
				that.searchAttachments({
					page: 1,
					per_page: perPage
				});
			}, true);
			
			// Switch to other language handler
			dojoAspect.after(attachmentToolbar, "onSwitchToLanguage", function(language) {
				that.searchAttachments({
					language: language,
					page: 1
				});
			}, true);
			
			return this;	// file.js.controllers.AttachmentController
		},
		
		setAttachmentGrid: function(/*file.js.views.AttachmentGrid*/ attachmentGrid) {
			// summary:
			//		Sets the attachments grid
			this._attachmentGrid = attachmentGrid;
			
			// Edit attachment handler
			dojoAspect.after(attachmentGrid, "onEditAttachment", dojoLang.hitch(this, "editAttachment"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/attachment/edit/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/attachment/edit/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/attachment/edit/onComplete", this, function(data) {
				this._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.attachment.edit[("APP_RESULT_OK" == data.result) ? "error" : "success"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchAttachments();
				}
			});
			
			// Delete attachment handler
			dojoAspect.after(attachmentGrid, "onDeleteAttachment", dojoLang.hitch(this, "deleteAttachment"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/attachment/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/attachment/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.attachment["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchAttachments();
				}
			});
			
			// Create a copy of the attachment in other language handler
			dojoAspect.after(attachmentGrid, "onTranslateAttachment", dojoLang.hitch(this, "translateAttachment"), true);
			
			return this;	// file.js.controllers.AttachmentController
		},
		
		setAttachmentPaginator: function(/*String*/ paginatorContainer) {
			// summary:
			//		Sets the container of paginator
			this._paginatorContainer = paginatorContainer;
			
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/attachment/list/onGotoPage", this, function(page) {
				this.searchAttachments({
					page: page
				});
			});
			
			return this;	// file.js.controllers.AttachmentController
		},
		
		deleteAttachment: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Deletes given attachment
			var params = {
				attachment_id: item.attachment_id[0]
			};
			var url = core.js.base.controllers.ActionProvider.get("file_attachment_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "fileAttachmentDeleteDialog",
				title: this._i18n.attachment["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		editAttachment: function(/*dojo.data.Item|String*/ item) {
			// summary:
			//		Edits given attachment
			var params = {
				attachment_id: dojoLang.isObject(item) ? item.attachment_id[0] : item
			};
			var url = core.js.base.controllers.ActionProvider.get("file_attachment_edit").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		},
		
		uploadAttachment: function() {
			// summary:
			//		Uploads new attachment
			var params = {
				language: this._defaultCriteria.language
			};
			var url = core.js.base.controllers.ActionProvider.get("file_attachment_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits the controls with given criteria
			dojoLang.mixin(this._defaultCriteria, criteria);
			this._attachmentToolbar.initSearchCriteria(criteria);
			
			return this;	// file.js.controllers.AttachmentController
		},
		
		searchAttachments: function(/*Object*/ criteria) {
			// summary:
			//		Searches for attachments
			dojoLang.mixin(this._defaultCriteria, criteria);
			var q   = core.js.base.Encoder.encode(this._defaultCriteria);
			var url = core.js.base.controllers.ActionProvider.get("file_attachment_list").url;
			dojoHash("u=" + url + "/?q=" + q);
			
			var that = this;
			this._helper.showStandby();
			dojoRequestXhr(url, {
				data: {
					q: q,
					format: "json"
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				that._attachmentGrid.showAttachments(data.data);
				
				// Update the paginator
				dijitRegistry.byId(that._paginatorContainer).set("content", data.paginator);
			});
		},
		
		translateAttachment: function(/*dojo.data.Item*/ item, /*String*/ language) {
			// summary:
			//		Translates given attachment item to other language
			var params = {
				source_id: item.attachment_id[0],
				language: language
			};
			var url = core.js.base.controllers.ActionProvider.get("file_attachment_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		}
	});
});
