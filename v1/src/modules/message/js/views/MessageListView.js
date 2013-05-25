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
	"dijit/registry",
	"dojo/query",
	"message/js/views/MessageItemView"
], function(dojoDeclare, dojoDom, dijitRegistry) {
	return dojoDeclare("message.js.views.MessageListView", null, {
		// _id: String
		_id: null,
		
		// _domNode: DomNode
		_domNode: null,
		
		// _messageItemMap: Object
		//		Map message's Id with message item view
		_messageItemMap: {},	
		
		constructor: function(/*String*/ id) {
			this._id	  = id;
			this._domNode = dojoDom.byId(id);
			this._init();
		},
		
		_init: function() {
			var that = this;
			this._messageItemMap = {};
			dojo.query(".module-message-item", this._id).forEach(function(node, index, arr) {
				var messageItemView = new message.js.views.MessageItemView(node, that);
				that._messageItemMap[messageItemView.getMessage().message_id] = messageItemView;
			});
		},
		
		setContent: function(/*String*/ html) {
			// summary:
			//		Reloads the entire list by HTML content
			// html:
			//		Entire HTML to show the list of private messages
			dijitRegistry.byId(this._id).set("content", html);
			
			// Re-init
			this._init();
		},
		
		getMessageItemView: function(/*String*/ messageId) {
			// summary:
			//		Gets the message item by given message's Id
			if (!this._messageItemMap[messageId + ""]) {
				return null;	// null
			}
			return this._messageItemMap[messageId + ""];	// message.js.views.MessageItemView
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onMouseDown: function(/*message.js.views.MessageItemView*/ messageItemView) {
			// summary:
			//		Called when user right-click a message item
			// messageItemView:
			//		The selected message item
			// tags:
			//		callback
		}
	});
});
