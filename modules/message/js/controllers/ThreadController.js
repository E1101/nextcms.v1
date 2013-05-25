/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		message
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-24
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/io-query",
	"dojo/request/xhr",
	"dojo/topic",
	"dojox/string/sprintf",
	"core/js/base/controllers/Subscriber",
	"core/js/base/I18N",
	"message/js/controllers/ThreadMediator"	
], function(dojoDeclare, dojoLang, dojoAspect, dojoIoQuery, dojoRequestXhr, dojoTopic) {
	return dojoDeclare("message.js.controllers.ThreadController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _toolbar: message.js.views.ThreadToolbar
		_toolbar: null,
		
		// _messageListView: message.js.views.MessageListView
		_messageListView: null,
		
		// _messageContextMenu: message.js.views.MessageContextMenu
		_messageContextMenu: null,
		
		// _mediator: message.js.controllers.ThreadMediator
		_mediator: new message.js.controllers.ThreadMediator(),
		
		// _defaultCriteria: Object
		_defaultCriteria: {
			keyword: null,
			page: 1
		},
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/message/js/controllers/ThreadController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("message/languages");
			this._i18n = core.js.base.I18N.getLocalization("message/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setMessageThreadToolbar: function(/*message.js.views.ThreadToolbar*/ toolbar) {
			// summary:
			//		Sets the message thread toolbar
			var that = this;
			this._toolbar = toolbar;
			
			// Close handler
			dojoAspect.after(toolbar, "onClose", function() {
				dojoTopic.publish("/app/message/message/view/onClose");
			});
			
			// Refresh handler
			dojoAspect.after(toolbar, "onRefresh", dojoLang.hitch(this, "searchMessages"));
			
			// Search handler
			dojoAspect.after(toolbar, "onSearchComments", function(keyword) {
				that.searchMessages({
					keyword: keyword,
					page: 1
				});
			}, true);
			
			return this;	// message.js.controllers.ThreadController
		},
		
		setMessageListView: function(/*message.js.views.MessageListView*/ messageListView) {
			// summary:
			//		Sets the messages list view
			var that = this;
			this._messageListView = messageListView;
			
			// Show the context menu
			dojoAspect.after(messageListView, "onMouseDown", function(messageItemView) {
				if (that._messageContextMenu) {
					that._messageContextMenu.setMessageItemView(messageItemView)
											.show();
				}
			}, true);
			
			return this;	// message.js.controllers.ThreadController
		},
		
		setMessageContextMenu: function(/*message.js.views.MessageContextMenu*/ messageContextMenu) {
			// summary:
			//		Sets the message's context menu
			this._messageContextMenu = messageContextMenu;
			this._mediator.setMessageContextMenu(messageContextMenu);

			var that = this;
			// Reply message handler
			dojoAspect.after(messageContextMenu, "onReplyMessage", dojoLang.hitch(this, "replyMessage"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/send/onCancel", this, function(id) {
				if (id == this._id) {
					this._helper.removePane();
				}
			});
			
			// Mark as read/unread handler
			dojoAspect.after(messageContextMenu, "onMarkRead", dojoLang.hitch(this, "markRead"), true);
			
			// Star handler
			dojoAspect.after(messageContextMenu, "onStar", dojoLang.hitch(this, "star"), true);
			
			// Delete message handler
			dojoAspect.after(messageContextMenu, "onDeleteMessage", dojoLang.hitch(this, "deleteMessage"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.message["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					var message = this._messageListView.getMessageItemView(data.message_id).getMessage();
					message.deleted = data.deleted;
					dojoTopic.publish("/app/message/message/delete/onSuccess", message);
					this.searchMessages();
				}
			});
			
			// Move to folder handler
			dojoAspect.after(messageContextMenu, "onMoveToFolder", dojoLang.hitch(this, "moveToFolder"), true);
			
			return this;	// message.js.controllers.ThreadController
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits the controls with given criteria
			dojoLang.mixin(this._defaultCriteria, criteria);
			return this;	// message.js.controllers.ThreadController
		},
		
		deleteMessage: function(/*message.js.views.MessageItemView*/ messageItemView) {
			// summary:
			//		Deletes given message item
			var params = {
				message_id: messageItemView.getMessage().message_id,
				deleted: messageItemView.getMessage().deleted
			};
			var url = core.js.base.controllers.ActionProvider.get("message_message_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				title: this._i18n.message["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		markRead: function(/*message.js.views.MessageItemView*/ messageItemView) {
			// summary:
			//		Marks given message as read one
			var message = messageItemView.getMessage();
			var status  = message.unread + "";
			var that    = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("message_message_mark").url, {
				data: {
					folder_id: message.folder_id,
					message_id: message.message_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				var notification = ("APP_RESULT_OK" == data.result) 
								 ? ("1" == status ? "markReadSuccess" : "markUnreadSuccess") 
								 : ("1" == status ? "markReadError" : "markUnreadError");
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.message.mark[notification],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					// Update read property
					var newStatus  = ("1" == status) ? "0" : "1";
					var message    = messageItemView.getMessage();
					message.unread = newStatus;
					dojoTopic.publish("/app/message/message/mark/onSuccess", message);
				}
			});
		},
		
		moveToFolder: function(/*message.js.views.MessageItemView*/ messageItemView, /*Object*/ folder) {
			// summary:
			//		Moves given message to other folder
			var that = this;
			this._helper.showStandby();
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("message_message_move").url, {
				data: {
					message_id: messageItemView.getMessage().message_id,
					folder_id: folder.folder_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: dojox.string.sprintf(that._i18n.message.move[("APP_RESULT_OK" == data.result) ? "success" : "error"], folder.name),
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					var message = messageItemView.getMessage();
					dojoTopic.publish("/app/message/message/move/onSuccess", {
						message: message,
						from_folder_id: message.folder_id,
						to_folder_id: data.folder_id
					});
					message.folder_id = data.folder_id;
					message.deleted   = "0";
				}
			});
		},
		
		replyMessage: function(/*message.js.views.MessageItemView*/ messageItemView, /*Boolean*/ replyAll) {
			// summary:
			//		Replies to given message
			var params = {
				container_id: this._id,
				message_id: messageItemView.getMessage().message_id,
				reply_all: replyAll
			};
			var url = core.js.base.controllers.ActionProvider.get("message_message_send").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				region: "bottom",
				style: "height: 60%"
			});
		},
		
		star: function(/*message.js.views.MessageItemView*/ messageItemView) {
			// summary:
			//		Stars given message
			var message = messageItemView.getMessage();
			var status  = message.starred + "";
			var that   = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("message_message_star").url, {
				data: {
					message_id: message.message_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				var message = ("APP_RESULT_OK" == data.result) 
							? ("1" == status ? "unstarSuccess" : "starSuccess") 
							: ("1" == status ? "unstarError" : "starError");
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.message.star[message],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					// Update starred property
					var newStatus = ("1" == status) ? "0" : "1";
					messageItemView.getMessage().starred = newStatus;
					dojoTopic.publish("/app/message/message/star/onSuccess", {
						message_id: messageItemView.getMessage().message_id,
						starred: newStatus
					});
				}
			});
		},
		
		searchMessages: function(/*Object*/ criteria) {
			// summary:
			//		Searches for messages in the thread
			dojoLang.mixin(this._defaultCriteria, criteria);
			var q    = core.js.base.Encoder.encode(this._defaultCriteria);
			var url  = core.js.base.controllers.ActionProvider.get("message_message_view").url;
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
				that._messageListView.setContent(data);
			});
		}
	});
});
