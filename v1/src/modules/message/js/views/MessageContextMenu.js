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
	"dojo/_base/array",        
	"dojo/_base/declare",
	"dojo/request/xhr",
	"dijit/registry",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dijit/PopupMenuItem",
	"core/js/base/Config",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoArray, dojoDeclare, dojoRequestXhr, dijitRegistry) {
	return dojoDeclare("message.js.views.MessageContextMenu", null, {
		// _contextMenu: dijit.Menu
		_contextMenu: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _replyMenuItem: dijit.MenuItem
		_replyMenuItem: null,
		
		// _replyAllMenuItem: dijit.MenuItem
		_replyAllMenuItem: null,
		
		// _markReadMenuItem: dijit.MenuItem
		_markReadMenuItem: null,
		
		// _starMenuItem: dijit.MenuItem
		_starMenuItem: null,
		
		// _deleteMenuItem: dijit.MenuItem
		_deleteMenuItem: null,
		
		// _moveToFolderMenuItems: Object
		_moveToFolderMenuItems: {},
		
		// _messageItemView: message.js.views.MessageItemView
		//		Current selected message item
		_messageItemView: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("message/languages");
			this._i18n = core.js.base.I18N.getLocalization("message/languages");
			
			this._createMenu();
		},
		
		setMessageItemView: function(/*message.js.views.MessageItemView*/ messageItemView) {
			this._messageItemView = messageItemView;
			return this;	// message.js.views.MessageContextMenu
		},
		
		show: function() {
			// summary:
			//		Shows the context menu for each message item in the thread
			if (!this._messageItemView) {
				return;
			}
			
			this._contextMenu.bindDomNode(this._messageItemView.getDomNode());
			
			// Get message data
			var message = this._messageItemView.getMessage();
			
			// Update the label of menu based on current status of message
			this._markReadMenuItem.set("label", (message.unread + "" == "1") ? this._i18n.global._share.markAsReadAction : this._i18n.global._share.markAsUnreadAction);
			this._markReadMenuItem.set("iconClass", "app-icon " + ((message.unread + "" == "1") ? "module-message-icon-read" : "module-message-icon-unread"));
			
			this._starMenuItem.set("label", (message.starred + "" == "1") ? this._i18n.global._share.unstarAction : this._i18n.global._share.starAction);
			this._starMenuItem.set("iconClass", "app-icon " + ((message.starred + "" == "1") ? "app-icon-unstar" : "app-icon-star"));
			
			this._deleteMenuItem.set("label", (message.deleted + "" == "1") ? this._i18n.global._share.deleteForeverAction : this._i18n.global._share.deleteAction);	

			// Extension point
			this.onContextMenu(this._messageItemView);
		},
		
		_createMenu: function() {
			// summary:
			//		Creates the menu
			var that = this;
			
			if (dijitRegistry.byId("message.js.views.MessageContextMenu")) {
				dijitRegistry.byId("message.js.views.MessageContextMenu").destroy();
			}
			
			// Create the menu
			this._contextMenu = new dijit.Menu({
				id: "message.js.views.MessageContextMenu"
			});
			
			// "Reply" menu item
			this._replyMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.replyAction,
				iconClass: "app-icon module-message-icon-reply",
				disabled: !core.js.base.controllers.ActionProvider.get("message_message_send").isAllowed,
				onClick: function() {
					that.onReplyMessage(that._messageItemView, false);
				}
			});
			this._contextMenu.addChild(this._replyMenuItem);
			
			// "Reply all" menu item
			this._replyMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.replyAllAction,
				iconClass: "app-icon module-message-icon-replyall",
				disabled: !core.js.base.controllers.ActionProvider.get("message_message_send").isAllowed,
				onClick: function() {
					that.onReplyMessage(that._messageItemView, true);
				}
			});
			this._contextMenu.addChild(this._replyMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// "Mark as read" menu item
			this._markReadMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.markAsReadAction,
				iconClass: "app-icon module-message-icon-read",
				disabled: !core.js.base.controllers.ActionProvider.get("message_message_mark").isAllowed,
				onClick: function() {
					that.onMarkRead(that._messageItemView);
				}
			});
			this._contextMenu.addChild(this._markReadMenuItem);
			
			// "Star" menu item
			this._starMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.starAction,
				iconClass: "app-icon app-icon-star",
				disabled: !core.js.base.controllers.ActionProvider.get("message_message_star").isAllowed,
				onClick: function() {
					that.onStar(that._messageItemView);
				}
			});
			this._contextMenu.addChild(this._starMenuItem);
			
			// "Delete" menu item
			this._deleteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("message_message_delete").isAllowed,
				onClick: function() {
					that.onDeleteMessage(that._messageItemView);
				}
			});
			this._contextMenu.addChild(this._deleteMenuItem);
			
			// Get the list of folders
			var folders = core.js.base.Config.get("core", "message_folders");
			if (folders == null) {
				// Get the list of folders from the server
				dojoRequestXhr(core.js.base.controllers.ActionProvider.get("message_folder_list").url, {
					data: {
						format: "json"
					},
					handleAs: "json",
					method: "POST"
				}).then(function(data) {
					folders = {};
					dojoArray.forEach(data, function(folder) {
						folders[folder.folder_id + ""] = folder;
					});
					
					// Cache the list of folders
					core.js.base.Config.set("core", "message_folders", folders);
					that._createMoveToFolderMenu(that._messageItemView);
				});
			} else {
				this._createMoveToFolderMenu(that._messageItemView);
			}
		},
		
		_createMoveToFolderMenu: function(/*message.js.views.MessageItemView*/ messageItemView) {
			// summary:
			//		Creates a popup menu which allows to move message to other folders
			var that			= this;
			var moveToPopupMenu = new dijit.Menu();
			var folders			= core.js.base.Config.get("core", "message_folders");
			
			// Add a menu item that allows to move message to "Inbox"
			var moveToInboxMenuItem = new dijit.MenuItem({
				label: this._i18n.folder._share.inboxFolder,
				onClick: function(e) {
					that.onMoveToFolder(messageItemView, {
						folder_id: "inbox"
					});
				}
			});
			moveToPopupMenu.addChild(moveToInboxMenuItem);
			this._moveToFolderMenuItems["inbox"] = moveToInboxMenuItem;
			
			for (var folderId in folders) {
				var menuItem = new dijit.MenuItem({
					appFolderId: folderId,
					label: folders[folderId].name,
					onClick: function(e) {
						that.onMoveToFolder(messageItemView, folders[this.appFolderId]);
					}
				});
				moveToPopupMenu.addChild(menuItem);
				
				this._moveToFolderMenuItems[folderId] = menuItem;
			}
			
			this._contextMenu.addChild(new dijit.PopupMenuItem({
				label: this._i18n.message._share.moveToFolderAction,
				popup: moveToPopupMenu
			}));
		},
		
		/* ========== CONTROL STATE OF MENU ITEMS =========================== */
		
		allowToMove: function(/*String*/ folderId) {
			// summary:
			//		Allows/disallows to move the message to folder
			// folderId:
			//		Id of folder
			if (this._moveToFolderMenuItems[folderId]) {
				this._moveToFolderMenuItems[folderId].set("disabled", !core.js.base.controllers.ActionProvider.get("message_message_move").isAllowed);
			}
			return this;	// message.js.views.MessageContextMenu
		},
		
		allowToMoveExceptOne: function(/*String*/ folderId) {
			// summary:
			//		Allows/disallows to move the message to all folders, except the given folder
			// folderId:
			//		Id of folder
			var isAllowed = core.js.base.controllers.ActionProvider.get("message_message_move").isAllowed;
			for (var id in this._moveToFolderMenuItems) {
				this._moveToFolderMenuItems[id].set("disabled", (id == folderId) || !isAllowed);
			}
			return this;	// message.js.views.MessageContextMenu
		},
		
		allowToStar: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to star the message
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("message_message_star").isAllowed;
			this._starMenuItem.set("disabled", !isAllowed);
			return this;	// message.js.views.MessageContextMenu
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onContextMenu: function(/*message.js.views.MessageItemView*/ messageItemView) {
			// summary:
			//		Called when right-click on given message item
			// tags:
			//		callback
		},
		
		onDeleteMessage: function(/*message.js.views.MessageItemView*/ messageItemView) {
			// summary:
			//		Deletes given message item
			// tags:
			//		callback
		},
		
		onMarkRead: function(/*message.js.views.MessageItemView*/ messageItemView) {
			// summary:
			//		Marks given message as read one
			// tags:
			//		callback
		},
		
		onMoveToFolder: function(/*message.js.views.MessageItemView*/ messageItemView, /*Object*/ folder) {
			// summary:
			//		Moves given message to other folder
			// tags:
			//		callback
		},
		
		onReplyMessage: function(/*message.js.views.MessageItemView*/ messageItemView, /*Boolean*/ replyAll) {
			// summary:
			//		Replies to given message
			// replyAll:
			//		Indicates replying a message to all recipients or not
			// tags:
			//		callback
		},
		
		onStar: function(/*message.js.views.MessageItemView*/ messageItemView) {
			// summary:
			//		Stars/Unstars the given message item
			// tags:
			//		callback
		}
	});
});
