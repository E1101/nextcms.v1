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
	"dojo/dom-attr",
	"dojo/mouse",
	"dojo/on",
	"dojo/dnd/Target",
	"dojo/query",
	"core/js/base/Encoder",
	"core/js/Constant"	
], function(dojoDeclare, dojoDomAttr, dojoMouse, dojoOn) {
	return dojoDeclare("category.js.views.FolderItemView", null, {
		// _domNode: DomNode
		//		The DomNode of folder item 
		_domNode: null,
		
		// _folder: Object
		//		Contains the folder properties
		_folder: null,
		
		// _folderListView: category.js.views.FolderListView
		//		The list view that the folder item belong to
		_folderListView: null,
		
		constructor: function(/*DomNode*/ domNode, /*category.js.views.FolderListView?*/ folderListView) {
			this._domNode		 = domNode;
			this._folderListView = folderListView;
			
			this._folder = core.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props"));
			this._init();
		},

		getDomNode: function() {
			return this._domNode;	// DomNode
		},
		
		getFolderNameNode: function() {
			return dojo.query(".categoryFolderName", this._domNode)[0];	// DomNode
		},
		
		getFolder: function() {
			// summary:
			//		Gets the folder object
			return this._folder;	// Object
		},
		
		_init: function() {
			// summary:
			//		Initializes node
			var that		= this;
			var entityClass = this._folder.entity_class;
			
			dojoOn(this._domNode, "contextmenu", function(e) {
				e.preventDefault();
			});
			dojoOn(this._domNode, "mousedown", function(e) {
				if (dojoMouse.isRight(e)) {
					e.preventDefault();
					that._folderListView.onMouseDown(that);
				}
			});
			
			dojoOn(this.getFolderNameNode(), "click", function() {
				that._folderListView.setSelectedFolderItemView(that);
				that._folderListView.onClickFolder(that);
			});
			
			// Allow to drag multiple items to folder
			new dojo.dnd.Target(this._domNode, {
				accept: ["categoryFolderItemDnd"],
				onDropExternal: function(source, nodes, copy) {
					that._folderListView.onDropExternal(that, nodes);
				}
			});
		}
	});
});
