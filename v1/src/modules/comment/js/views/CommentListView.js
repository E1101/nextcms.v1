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
	"dojo/dom",
	"dijit/registry",
	"dojo/query",
	"comment/js/views/CommentItemView"
], function(dojoDeclare, dojoDom, dijitRegistry) {
	return dojoDeclare("comment.js.views.CommentListView", null, {
		// _id: String
		_id: null,
		
		// _domNode: DomNode
		_domNode: null,
		
		constructor: function(/*String*/ id) {
			this._id	  = id;
			this._domNode = dojoDom.byId(id);
			this._init();
		},
		
		_init: function() {
			var that = this;
			dojo.query(".module-comment-item", this._id).forEach(function(node, index, arr) {
				var commentItemView = new comment.js.views.CommentItemView(node, that);
			});
		},
		
		setContent: function(/*String*/ html) {
			// summary:
			//		Reloads the entire list by HTML content
			// html:
			//		Entire HTML to show the list of comments
			dijitRegistry.byId(this._id).set("content", html);
			
			// Re-init
			this._init();
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onMouseDown: function(/*comment.js.views.CommentItemView*/ commentItemView) {
			// summary:
			//		Called when user right-click a comment item
			// commentItemView:
			//		The selected comment item
			// tags:
			//		callback
		}
	});
});
