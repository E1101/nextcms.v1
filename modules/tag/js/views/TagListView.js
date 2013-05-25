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
	"dojo/dom",
	"dijit/registry",
	"dojo/query",
	"tag/js/views/TagItemView"
], function(dojoDeclare, dojoDom, dijitRegistry) {
	return dojoDeclare("tag.js.views.TagListView", null, {
		// _id: String
		_id: null,
		
		// _domNode: DomNode
		_domNode: null,
		
		constructor: function(/*String*/ id) {
			this._id	  = id;
			this._domNode = dojoDom.byId(id);
			
			this._init();
		},
		
		setContent: function(/*String*/ html) {
			// summary:
			//		Reloads the entire list by HTML content
			// html:
			//		Entire HTML to show the list of tags
			dijitRegistry.byId(this._id).set("content", html);
			this._init();
		},
		
		_init: function() {
			// summary:
			//		Loads all tag item views
			var that = this;
			dojo.query(".module-tag-item", this._domNode).forEach(function(node) {
				var tagItemView = new tag.js.views.TagItemView(node, that);
			});
		},
		
		/* ==========  CALLBACKS ============================================ */
		
		onMouseDown: function(/*tag.js.views.TagItemView*/ tagItemView) {
			// summary:
			//		Called when user right-click a tag item
			// tagItemView:
			//		The selected tag item
			// tags:
			//		callback
		}
	});
});
