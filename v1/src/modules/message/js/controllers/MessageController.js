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
 * @version		2012-09-11
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/dom-class",
	"dojo/hash",
	"dojo/io-query",
	"dojo/request/xhr",
	"dojo/topic",
	"dijit/registry",
	"dojo/NodeList-dom",
	"dojo/parser",
	"dojo/query",
	"dijit/form/TextBox",
	"dijit/InlineEditBox",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/base/views/Helper",
	"message/js/controllers/MessageMediator"
], function(dojoDeclare, dojoLang, dojoAspect, dojoDomClass, dojoHash, dojoIoQuery, dojoRequestXhr, dojoTopic, dijitRegistry) {
	return dojoDeclare("message.js.controllers.MessageController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _folderToolbar: message.js.views.FolderToolbar
		_folderToolbar: null,
		
		// _folderListView: message.js.views.FolderListView
		_folderListView: null,
		
		// _folderContextMenu: message.js.views.FolderContextMenu
		_folderContextMenu: null,
		
		// _messageToolbar: message.js.views.MessageToolbar
		_messageToolbar: null,
		
		// _messageGrid: message.js.views.MessageGrid
		_messageGrid: null,
		
		// _paginatorContainer: String
		_paginatorContainer: null,
		
		// _mediator: message.js.controllers.MessageMediator
		_mediator: new message.js.controllers.MessageMediator(),
		
		// _defaultFolderCriteria: Object
		_defaultFolderCriteria: {
			sort_dir: "ASC"
		},
		
		// _defaultCriteria: Object
		_defaultCriteria: {
			folder_id: "inbox",
			starred: null,
			deleted: 0,
			page: 1,
			per_page: 20
		},
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/message/js/controllers/MessageController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("message/languages");
			this._i18n = core.js.base.I18N.getLocalization("message/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		/* ========== MANAGE FOLDERS ======================================== */
		
		setFolderToolbar: function(/*message.js.views.FolderToolbar*/ folderToolbar) {
			// summary:
			//		Sets the folder toolbar
			this._folderToolbar = folderToolbar;
			var that = this;
			
			// Add folder handler
			dojoAspect.after(folderToolbar, "onAddFolder", dojoLang.hitch(this, "addFolder"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/folder/add/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/folder/add/onComplete", this, function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.folder.add[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchFolders();
				}
			});
			
			// Refresh folders handler
			dojoAspect.after(folderToolbar, "onRefresh", dojoLang.hitch(this, "searchFolders"));
			
			// List filters handler
			dojoAspect.after(folderToolbar, "onListFilters", dojoLang.hitch(this, "listFilters"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/filter/list/onCancel", this, function() {
				this._helper.removePane();
			});
			
			// Sort handler
			dojoAspect.after(folderToolbar, "onSortAscending", function(ascending) {
				that.searchFolders({
					sort_dir: ascending ? "ASC" : "DESC"
				});
			}, true);
			
			return this;	// message.js.controllers.MessageController
		},
		
		setFolderListView: function(/*message.js.views.FolderListView*/ folderListView) {
			// summary:
			//		Sets the view showing the list of folders
			this._folderListView = folderListView;
			this._mediator.setFolderListView(folderListView);
			
			var that = this;
			// Show the context menu
			dojoAspect.after(folderListView, "onMouseDown", function(folderItemView) {
				dojo.query(".module-message-folder", folderListView.getDomNode()).removeClass("module-message-folder-hover");
				dojoDomClass.add(folderItemView.getDomNode(), "module-message-folder-hover");
				
				if (that._folderContextMenu) {
					that._folderContextMenu.setFolderItemView(folderItemView).show();
				}
			}, true);
			
			// Load the messages in associated folder
			dojoAspect.after(folderListView, "onClickFolder", function(folderItemView) {
				var folderId = folderItemView.getFolder().folder_id;
				that._folderListView.setSelectedFolder(folderId);
				
				switch (true) {
					case ("starred" == folderId):
						that.searchMessages({
							folder_id: null,
							starred: true,
							deleted: "0"
						});
						break;
					case ("trash" == folderId):
						that.searchMessages({
							folder_id: null,
							starred: null,
							deleted: "1"
						});
						break;
					default:
						that.searchMessages({
							folder_id: folderId,
							starred: null,
							deleted: "0"
						});
						break;
				}
			}, true);
			
			// Update the number of unread messages:
			// - after marking a message as unread/read
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/mark/onSuccess", folderListView, function(data) {
				// Don't update the counter if message is deleted
				if ("0" == data.deleted) {
					folderListView.increaseUnreadMessages(data.folder_id, ("1" == data.unread) ? 1 : -1);
				}
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/move/onSuccess", folderListView, function(data) {
				if (data.message.unread + "" == "1") {
					folderListView.increaseUnreadMessages(data.from_folder_id, -1);
					folderListView.increaseUnreadMessages(data.to_folder_id, 1);
				}
			});
			
			// - after deleting unread message
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/delete/onSuccess", folderListView, function(data) {
				if ("0" == data.deleted && "1" == data.unread) {
					folderListView.increaseUnreadMessages(data.folder_id, -1);
				}
			});
			
			return this;	// message.js.controllers.MessageController
		},
		
		setFolderContextMenu: function(/*message.js.views.FolderContextMenu*/ folderContextMenu) {
			// summary:
			//		Sets the context menu for folder items
			this._folderContextMenu = folderContextMenu;
			this._mediator.setFolderContextMenu(folderContextMenu);
			
			var that = this;
			// Delete folder handler
			dojoAspect.after(folderContextMenu, "onDeleteFolder", dojoLang.hitch(this, "deleteFolder"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/folder/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/folder/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.folder["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchFolders();
					
					// If the deleted folder is currenly used to list the messages,
					// then switch to the inbox messages
					if (data.folder_id == this._defaultCriteria.folder_id) {
						this.searchMessages({
							folder_id: "inbox"
						});
					}
				}
			});
			
			// Rename folder handler
			dojoAspect.after(folderContextMenu, "onRenameFolder", dojoLang.hitch(this, "renameFolder"), true);
			
			return this;	// message.js.controllers.MessageController
		},
		
		addFolder: function() {
			// summary:
			//		Adds new folder
			var url = core.js.base.controllers.ActionProvider.get("message_folder_add").url;
			this._helper.showDialog(url, {
				title: this._i18n.folder.add.title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		deleteFolder: function(/*message.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Deletes folder
			var params = {
				folder_id: folderItemView.getFolder().folder_id
			};
			var url = core.js.base.controllers.ActionProvider.get("message_folder_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				title: this._i18n.folder["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		renameFolder: function(/*message.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Renames folder
			var that	 = this;
			var folderId = folderItemView.getFolder().folder_id;

			// Create InlineEditBox element
			if (!folderItemView.nameEditBox) {
				folderItemView.nameEditBox = new dijit.InlineEditBox({
					editor: "dijit.form.TextBox", 
					autoSave: true, 
					disabled: false, 
					editorParams: {
						required: true
					},
					onChange: function(newName) {
						this.set("disabled", true);
						if (newName != "") {
							dojoRequestXhr(core.js.base.controllers.ActionProvider.get("message_folder_rename").url, {
								data: {
									folder_id: folderId,
									name: newName
								},
								handleAs: "json",
								method: "POST"
							}).then(function(data) {
								dojoTopic.publish("/app/global/notification", {
									message: that._i18n.folder.rename[("APP_RESULT_OK" == data.result) ? "success" : "error"],
									type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
								});
								
								if ("APP_RESULT_OK" == data.result) {
									dojoTopic.publish("/app/message/folder/rename/onSuccess", data);
									dojoDomClass.remove(folderItemView.getDomNode(), "module-message-folder-hover");
								}
							}, function(err) {
								// Do nothing
							}, function(evt) {
								// Do nothing
							});
						}
					},
					onCancel: function() {
						this.set("disabled", true);
						dojoDomClass.remove(folderItemView.getDomNode(), "module-message-folder-hover");
					}
				}, folderItemView.getFolderNameNode());
			}
			folderItemView.nameEditBox.set("disabled", false);
			folderItemView.nameEditBox.startup();
			folderItemView.nameEditBox.edit();
		},
		
		searchFolders: function(/*Object*/ criteria) {
			// summary:
			//		Searches for folders
			this._helper.closeDialog();
			
			dojoLang.mixin(this._defaultFolderCriteria, criteria);
			var q = core.js.base.Encoder.encode(this._defaultFolderCriteria);
			
			this._helper.showStandby();
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("message_folder_list").url, {
				data: {
					q: q
				},
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				that._folderListView.setContent(data);
			}, function(err) {
				// Do nothing
			}, function(evt) {
				// Do nothing
			});
		},
		
		/* ========== MANAGE FILTERS ======================================== */
		
		listFilters: function() {
			// summary:
			//		Lists the message filters
			var url = core.js.base.controllers.ActionProvider.get("message_filter_list").url;
			this._helper.showPane(url);
		},
		
		/* ========== MANAGE MESSAGES ======================================= */
		
		setMessageToolbar: function(/*message.js.views.MessageToolbar*/ messageToolbar) {
			// summary:
			//		Sets the message toolbar
			this._messageToolbar = messageToolbar;
			this._mediator.setMessageToolbar(messageToolbar);
			
			var that = this;
			// Send new message handler
			dojoAspect.after(messageToolbar, "onSendMessage", dojoLang.hitch(this, "sendMessage"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/send/onCancel", this, function(id) {
				if (id == this._id) {
					this._helper.removePane();
				}
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/send/onComplete", this, function(data) {
				this._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.message.send[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result && "outbox" == this._defaultCriteria.folder_id) {
					this.searchMessages();
				}
			});
			
			// Search for messages handler
			dojoAspect.after(messageToolbar, "onRefresh", dojoLang.hitch(this, "searchMessages"));
			dojoAspect.after(messageToolbar, "onSearchMessages", function(keyword) {
				that.searchMessages({
					keyword: keyword
				});
			}, true);
			
			// Empty trash handler
			dojoAspect.after(messageToolbar, "onEmptyTrash", dojoLang.hitch(this, "emptyTrash"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/empty/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/empty/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.message.empty[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					dojoTopic.publish("/app/message/message/empty/onSuccess");
				}
			});
			
			// Update the trash icon after
			// - moving a message to other folder
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/move/onSuccess", messageToolbar, function(data) {
				messageToolbar.increaseDeletedMessages(-1);
			});
			// - deleting a message
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/delete/onSuccess", messageToolbar, function(data) {
				messageToolbar.increaseDeletedMessages((data.deleted + "" == "0") ? 1 : -1);
			});
			
			// Update the number of messages per page handler
			dojoAspect.after(messageToolbar, "onUpdatePageSize", function(perPage) {
				that.searchMessages({
					per_page: perPage
				});
			}, true);
			
			return this;	// message.js.controllers.MessageController
		},
		
		setMessageGrid: function(/*message.js.views.MessageGrid*/ messageGrid) {
			// summary:
			//		Sets the message grid
			this._messageGrid = messageGrid;
			
			// View message thread
			dojoAspect.after(messageGrid, "onViewMessage", dojoLang.hitch(this, "viewMessage"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/view/onClose", this, function() {
				this._helper.removePane();
			});
			
			// Reload the list of messages in current folder:
			// - after marking a message as read/unread
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/mark/onSuccess", this, function(data) {
				if (this._defaultCriteria.folder_id == data.folder_id || "1" == this._defaultCriteria.deleted) {
					this.searchMessages();
				}
			});
			// - after deleting a message forever
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/delete/onSuccess", this, function(data) {
				this.searchMessages();
			});
			// - after the trash is emptied
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/empty/onSuccess", this, function() {
				if ("1" == this._defaultCriteria.deleted) {
					this.searchMessages();
				}
			});
			// - after moving message
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/move/onSuccess", this, function(data) {
				if (this._defaultCriteria.folder_id == data.message.folder_id || "1" == this._defaultCriteria.deleted) {
					this.searchMessages();
				}
			});
			
			return this;	// message.js.controllers.MessageController
		},
		
		setMessagePaginator: function(/*String*/ paginatorContainer) {
			// summary:
			//		Sets the container of paginator
			this._paginatorContainer = paginatorContainer;
			
			return this;	// message.js.controllers.MessageController
		},
		
		emptyTrash: function() {
			// summary:
			//		Empties the trash
			var url = core.js.base.controllers.ActionProvider.get("message_message_empty").url;
			this._helper.showDialog(url, {
				title: this._i18n.message.empty.title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits with given criteria
			dojoLang.mixin(this._defaultCriteria, criteria);
			this._messageToolbar.initSearchCriteria(this._defaultCriteria);
			
			// Set the selected folder
			switch (true) {
				case (this._defaultCriteria.starred):
					this._folderListView.setSelectedFolder("starred");
					break;
				case ("1" == this._defaultCriteria.deleted):
					this._folderListView.setSelectedFolder("trash");
					break;
				default:
					this._folderListView.setSelectedFolder(this._defaultCriteria.folder_id);
					break;
			}
			
			return this;	// message.js.controllers.MessageController
		},
		
		searchMessages: function(/*Object*/ criteria) {
			// summary:
			//		Searches for messages
			dojoLang.mixin(this._defaultCriteria, criteria);
			
			var q   = core.js.base.Encoder.encode(this._defaultCriteria);
			var url = core.js.base.controllers.ActionProvider.get("message_message_list").url;
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
				that._messageGrid.showMessages(data.messages);
				
				// Update the paginator
				dijitRegistry.byId(that._paginatorContainer).set("content", data.paginator);
			});
			
			return this;	// message.js.controllers.MessageController
		},
		
		sendMessage: function() {
			// summary:
			//		Sends new message
			var params = {
				container_id: this._id
			};
			var url = core.js.base.controllers.ActionProvider.get("message_message_send").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		},
		
		viewMessage: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Views messages in its thread
			var q = {
				message_id: item.message_id[0],
				root_id: item.root_id[0],
				// By default, the deleted messages will not be listed in the thread
				deleted: ("1" == this._defaultCriteria.deleted) ? "1" : "0"
			};
			q = core.js.base.Encoder.encode(q);
			var url = core.js.base.controllers.ActionProvider.get("message_message_view").url + "?q=" + q;
			this._helper.showPane(url);
		}
	});
});
