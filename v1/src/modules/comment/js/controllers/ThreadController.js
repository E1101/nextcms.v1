/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		comment
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-03
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/io-query",
	"dojo/request/xhr",
	"dojo/topic",
	"comment/js/controllers/ThreadMediator",
	"core/js/base/controllers/Subscriber",
	"core/js/base/I18N"
], function(dojoDeclare, dojoLang, dojoAspect, dojoIoQuery, dojoRequestXhr, dojoTopic) {
	return dojoDeclare("comment.js.controllers.ThreadController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _toolbar: comment.js.views.ThreadToolbar
		_toolbar: null,
		
		// _commentListView: comment.js.views.CommentListView
		_commentListView: null,
		
		// _commentContextMenu: comment.js.views.CommentContextMenu
		_commentContextMenu: null,
		
		// _mediator: comment.js.controllers.ThreadMediator
		_mediator: new comment.js.controllers.ThreadMediator(),
		
		// _defaultCriteria: Object
		_defaultCriteria: {
			keyword: null,
			page: 1
		},
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/comment/js/controllers/ThreadController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("comment/languages");
			this._i18n = core.js.base.I18N.getLocalization("comment/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setThreadToolbar: function(/*comment.js.views.ThreadToolbar*/ toolbar) {
			// summary:
			//		Sets the thread toolbar
			this._toolbar = toolbar;
			
			var that = this;
			// Close handler
			dojoAspect.after(toolbar, "onClose", function() {
				dojoTopic.publish("/app/comment/comment/view/onClose");
			});
			
			// Refresh handler
			dojoAspect.after(toolbar, "onRefresh", dojoLang.hitch(this, "searchComments"));
			
			// Search handler
			dojoAspect.after(toolbar, "onSearchComments", function(keyword) {
				that.searchComments({
					keyword: keyword,
					page: 1
				});
			}, true);
			
			return this;	// comment.js.controllers.ThreadController
		},
		
		setCommentListView: function(/*comment.js.views.CommentListView*/ commentListView) {
			// summary:
			//		Sets the comments list view
			this._commentListView = commentListView;
			
			var that = this;
			// Show the context menu
			dojoAspect.after(commentListView, "onMouseDown", function(commentItemView) {
				if (that._commentContextMenu) {
					that._commentContextMenu.show(commentItemView);
				}
			}, true);
			
			return this;	// comment.js.controllers.ThreadController
		},
		
		setCommentContextMenu: function(/*comment.js.views.CommentContextMenu*/ commentContextMenu) {
			// summary:
			//		Sets the comment's context menu
			this._commentContextMenu = commentContextMenu;
			this._mediator.setCommentContextMenu(commentContextMenu);
			
			// Activate handler
			dojoAspect.after(commentContextMenu, "onActivateComment", dojoLang.hitch(this, "activateComment"), true);
			
			// Edit handler
			dojoAspect.after(commentContextMenu, "onEditComment", dojoLang.hitch(this, "editComment"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/comment/comment/edit/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/comment/comment/edit/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/comment/comment/edit/onComplete", this, function(data) {
				this._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.comment.edit[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchComments();
				}
			});
			
			// Delete handler
			dojoAspect.after(commentContextMenu, "onDeleteComment", dojoLang.hitch(this, "deleteComment"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/comment/comment/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/comment/comment/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.comment["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchComments();
				}
			});
			
			// Report spam handler
			dojoAspect.after(commentContextMenu, "onReportSpam", dojoLang.hitch(this, "reportSpam"), true);
			
			// Reply handler
			dojoAspect.after(commentContextMenu, "onReplyComment", dojoLang.hitch(this, "replyComment"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/comment/comment/reply/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/comment/comment/reply/onComplete", this, function(data) {
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.comment.reply[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchComments();
				}
			});
			
			return this;	// comment.js.controllers.ThreadController
		},
		
		activateComment: function(/*comment.js.views.CommentItemView*/ commentItemView) {
			// summary:
			//		Activates or deactivates comment
			var commentId = commentItemView.getComment().comment_id;
			var status	  = commentItemView.getComment().status;
			var that	  = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("comment_comment_activate").url, {
				data: {
					comment_id: commentId
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				var message = ("APP_RESULT_OK" == data.result) 
						    ? ("activated" == status ? "deactivateSuccess" : "activateSuccess") 
						    : ("activated" == status ? "deactivateError" : "activateError");
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.comment.activate[message],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					var newStatus = ("activated" == status) ? "not_activated" : "activated";
					commentItemView.setStatus(newStatus);
					
					dojoTopic.publish("/app/comment/comment/activate/onSuccess", {
						oldStatus: status,
						newStatus: newStatus
					});
				}
			});
		},
		
		deleteComment: function(/*comment.js.views.CommentItemView*/ commentItemView) {
			// summary:
			//		Deletes a comment
			var params = {
				comment_id: commentItemView.getComment().comment_id
			};
			var url = core.js.base.controllers.ActionProvider.get("comment_comment_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "commentCommentDeleteDialog",
				title: this._i18n.comment["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		editComment: function(/*content.js.views.CommentItemView*/ commentItemView) {
			// summary:
			//		Edits given comment
			var params = {
				comment_id: commentItemView.getComment().comment_id
			};
			var url = core.js.base.controllers.ActionProvider.get("comment_comment_edit").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				region: "bottom",
				style: "height: 50%"
			});
		},
		
		replyComment: function(/*comment.js.views.CommentItemView*/ commentItemView, /*Boolean*/ withQuote) {
			// summary:
			//		Replies to given comment
			var params = {
				comment_id: commentItemView.getComment().comment_id,
				quote: withQuote
			};
			var url = core.js.base.controllers.ActionProvider.get("comment_comment_reply").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				region: "bottom",
				style: "height: 50%"
			});
		},
		
		reportSpam: function(/*content.js.views.CommentItemView*/ commentItemView) {
			// summary:
			//		Reports given comment as a spam
			var commentId = commentItemView.getComment().comment_id;
			var status	  = commentItemView.getComment().status;
			var that	  = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("comment_comment_spam").url, {
				data: {
					comment_id: commentId
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.comment.spam[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					commentItemView.setStatus("spam");
					dojoTopic.publish("/app/comment/comment/spam/onSuccess", {
						oldStatus: status,
						newStatus: "spam"
					});
				}
			});
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits the controls with given criteria
			dojoLang.mixin(this._defaultCriteria, criteria);
			return this;	// comment.js.controllers.ThreadController
		},
		
		searchComments: function(/*Object*/ criteria) {
			// summary:
			//		Searches for comments in the thread
			dojoLang.mixin(this._defaultCriteria, criteria);
			var q    = core.js.base.Encoder.encode(this._defaultCriteria);
			var url  = core.js.base.controllers.ActionProvider.get("comment_comment_view").url;
			var that = this;
			this._helper.showStandby();
			dojoRequestXhr(url, {
				data: {
					q: q,
					format: "html"
				},
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				that._commentListView.setContent(data);
			});
		}
	});
});
