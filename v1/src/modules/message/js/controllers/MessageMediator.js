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
 * @version		2012-08-21
 */

define([
	"dojo/_base/declare",
	"dojo/aspect",
	"core/js/base/controllers/Subscriber"
], function(dojoDeclare, dojoAspect) {
	return dojoDeclare("message.js.controllers.MessageMediator", null, {
		// _folderContextMenu: message.js.views.FolderContextMenu
		_folderContextMenu: null,
		
		// _folderListView: message.js.views.FolderListView
		_folderListView: null,
		
		// _messageToolbar: message.js.views.MessageToolbar
		_messageToolbar: null,
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/message/js/controllers/MessageMediator",
		
		constructor: function() {
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setFolderContextMenu: function(/*message.js.views.FolderContextMenu*/ folderContextMenu) {
			// summary:
			//		Sets the folder's context menu
			this._folderContextMenu = folderContextMenu;
			
			dojoAspect.after(folderContextMenu, "onContextMenu", function(/*message.js.views.FolderItemView*/ folderItemView) {
				var isSystemFolder = folderItemView.getFolder().system_folder;
				folderContextMenu.allowToDelete(isSystemFolder == false)
								 .allowToRename(isSystemFolder == false);
			}, true);
		},
		
		setFolderListView: function(/*message.js.views.FolderListView*/ folderListView) {
			// summary:
			//		Sets the view showing the list of folders
			this._folderListView = folderListView;
			
			var that = this;
			dojoAspect.after(folderListView, "onClickFolder", function(folderItemView) {
				if (that._messageToolbar) {
					var folderId = folderItemView.getFolder().folder_id;
					// Only allow to empty the trash if the user is viewing the trash
					that._messageToolbar.allowToEmptyTrash("trash" == folderId);
				}
			}, true);
		},
		
		setMessageToolbar: function(/*message.js.views.MessageToolbar*/ messageToolbar) {
			// summary:
			//		Sets the message toolbar
			this._messageToolbar = messageToolbar;
			
			// Update the trash icon after the trash is emptied
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/message/message/empty/onSuccess", this, function() {
				this._messageToolbar.setTrashEmpty();
			});
		}
	});
});
