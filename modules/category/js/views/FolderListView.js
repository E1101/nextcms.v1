/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		category
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-26
 */

define([
	"dojo/_base/declare",
	"dojo/dom",
	"dijit/registry",
	"dojo/NodeList-dom",
	"dojo/query",
	"category/js/views/FolderItemView"
], function(dojoDeclare, dojoDom, dijitRegistry) {
	return dojoDeclare("category.js.views.FolderListView", null, {
		// _id: String
		//		Id of the DomNode
		_id: null,
		
		// _domNode: DomNode
		//		The DomNode of folders list
		_domNode: null,
		
		// _selectedFolderItemView: category.js.views.FolderItemView
		_selectedFolderItemView: null,

		constructor: function(/*String*/ id) {
			this._id      = id;
			this._domNode = dojoDom.byId(id);
			
			this._init();
		},
		
		getId: function() {
			return this._id;	// String
		},
		
		getDomNode: function() {
			return this._domNode; 	// DomNode
		},
		
		_init: function() {
			var that = this;
			dojo.query(".categoryFolderItem", this._id).forEach(function(node, index, arr) {
				var folderItemView = new category.js.views.FolderItemView(node, that);
			});
		},
		
		setContent: function(/*String*/ html) {
			// summary:
			//		Populates the list view by given HTML content
			dijitRegistry.byId(this._id).set("content", html);
			this._init();
		},
		
		setSelectedFolderItemView: function(/*category.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Sets the selected folder item
			this._selectedFolderItemView = folderItemView;
			dojo.query(".categoryFolderItemSelected", this._domNode).removeClass("categoryFolderItemSelected");
			if (folderItemView) {
				dojo.query(folderItemView.getDomNode()).addClass("categoryFolderItemSelected");
			}
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onClickFolder: function(/*category.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Called when user click a folder name
			// folderItemView:
			//		The selected folder item
			// tags:
			//		callback
		},
		
		onDropExternal: function(/*category.js.views.FolderItemView*/ folderItemView, /*DomNode[]*/ nodes) {
			// summary:
			//		Called when user drop external nodes to a folder item
			// folderItemView:
			//		The folder item
			// nodes:
			//		The array of external nodes
			// tags:
			//		callback
		},
		
		onMouseDown: function(/*category.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Called when user right-click a folder item
			// folderItemView:
			//		The selected folder item
			// tags:
			//		callback
		}
	});
});
