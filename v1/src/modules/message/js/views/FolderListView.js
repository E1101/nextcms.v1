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
	"dojo/dom",
	"dojo/dom-class",
	"dijit/registry",
	"dojo/NodeList-dom",
	"dojo/query",
	"message/js/views/FolderItemView"
], function(dojoDeclare, dojoDom, dojoDomClass, dijitRegistry) {
	return dojoDeclare("message.js.views.FolderListView", null, {
		// _id: String
		_id: null,
		
		// _domNode: DomNode
		_domNode: null,
		
		// _folderItemMap: Object
		//		Map foler's Id with folder item view
		_folderItemMap: {},
		
		// _selectedFolderId: String
		_selectedFolderId: "inbox",
		
		constructor: function(/*String*/ id) {
			this._id	  = id;
			this._domNode = dojoDom.byId(id);
			this._init();
		},
		
		_init: function() {
			this._folderItemMap = {};
			
			var that = this;
			dojo.query(".module-message-folder", this._id).forEach(function(node, index, arr) {
				var folderItemView = new message.js.views.FolderItemView(node, that);
				that._folderItemMap[folderItemView.getFolder().folder_id + ""] = folderItemView;
			});
			
			this.setSelectedFolder(this._selectedFolderId);
		},
		
		getDomNode: function() {
			return this._domNode;	// DomNode
		},
		
		setContent: function(/*String*/ html) {
			// summary:
			//		Reloads the entire list by HTML content
			dijitRegistry.byId(this._id).set("content", html);
			
			// Re-init
			this._init();
		},
		
		setSelectedFolder: function(/*String*/ folderId) {
			// summary:
			//		Sets the selected folder
			if (!this._folderItemMap[folderId + ""]) {
				folderId = "inbox";
			}
			this._selectedFolderId = folderId;
			var folderItemView	   = this._folderItemMap[this._selectedFolderId + ""];
			
			dojo.query(".module-message-folder", this._domNode).removeClass("module-message-folder-active");
			dojoDomClass.add(folderItemView.getDomNode(), "module-message-folder-active");
		},
		
		increaseUnreadMessages: function(/*String*/ folderId, /*Integer*/ increasingNumber) {
			// summary:
			//		Increases or decreases the number of unread message.
			// description:
			//		It should be called after marking a message as read/unread
			// Get the node showing "inbox" folder
			if (!this._folderItemMap[folderId + ""]) {
				return;
			}
			var folderItemView = this._folderItemMap[folderId + ""];
			var nodes		   = dojo.query(".app-counter", folderItemView.getDomNode());
			if (nodes.length > 0) {
				var numUnreadMessages = parseInt(nodes[0].innerHTML);
				numUnreadMessages	 += increasingNumber;
				if (numUnreadMessages >= 0) {
					nodes[0].innerHTML = numUnreadMessages;
				}
			}
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onClickFolder: function(/*message.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Called when user click a folder item
			// folderItemView:
			//		The selected folder item
			// tags:
			//		callback
		},
		
		onMouseDown: function(/*message.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Called when user right-click a folder item
			// folderItemView:
			//		The selected folder item
			// tags:
			//		callback
		}
	});
});
