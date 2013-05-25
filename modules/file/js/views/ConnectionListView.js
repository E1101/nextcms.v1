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
 * @version		2012-09-11
 */

define([
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/dom-class",
	"dijit/registry",
	"dojo/NodeList-dom",
	"dojo/query",
	"file/js/views/ConnectionItemView"
], function(dojoDeclare, dojoDom, dojoDomClass, dijitRegistry) {
	return dojoDeclare("file.js.views.ConnectionListView", null, {
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
			dojo.query(".fileConnectionItem", this._id).forEach(function(node, index, arr) {
				var connectionItemView = new file.js.views.ConnectionItemView(node, that);
			});
		},
		
		setContent: function(/*String*/ html) {
			// summary:
			//		Populates the list view
			dijitRegistry.byId(this._id).set("content", html);
			this._init();
		},
		
		setSelectedConnection: function(/*file.js.views.ConnectionItemView|null*/ connectionItemView) {
			dojo.query(".fileConnectionItemSelected", this._domNode).removeClass("fileConnectionItemSelected");
			
			if (connectionItemView) {
				dojoDomClass.add(connectionItemView.getDomNode(), "fileConnectionItemSelected");
			}
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onMouseDown: function(/*file.js.views.ConnectionItemView*/ connectionItemView) {
			// summary:
			//		Called when user right-click a connection item
			// connectionItemView:
			//		The selected connection item
			// tags:
			//		callback
		}
	});
});
