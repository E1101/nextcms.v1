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
	"dojo/dom-attr",
	"dojo/mouse",
	"dojo/on",
	"dojo/query",
	"core/js/base/Encoder"
], function(dojoDeclare, dojoDomAttr, dojoMouse, dojoOn) {
	return dojoDeclare("message.js.views.FolderItemView", null, {
		// _domNode: DomNode
		_domNode: null,
		
		// _folderListView: message.js.views.FolderListView
		_folderListView: null,
		
		// _folder: Object
		_folder: null,
		
		constructor: function(/*DomNode*/ domNode, /*message.js.views.FolderListView*/ folderListView) {
			this._domNode		 = domNode;
			this._folderListView = folderListView;
			
			this._folder = core.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props"));
			this._init();
		},
		
		getDomNode: function() {
			return this._domNode;	// DomNode
		},
		
		getFolder: function() {
			// summary:
			//		Gets folder's properties
			return this._folder;	// Object
		},
		
		getFolderNameNode: function() {
			// summary:
			//		Gets the node showing the folder's name
			return dojo.query(".module-message-folder-name", this._domNode)[0];	// DomNode
		},
		
		_init: function() {
			// summary:
			//		Inits folder item view
			var that = this;
			
			dojoOn(this._domNode, "contextmenu", function(e) {
				e.preventDefault();
			});
			dojoOn(this._domNode, "mousedown", function(e) {
				if (dojoMouse.isRight(e)) {
					e.preventDefault();
					that._folderListView.onMouseDown(that);
				}
			});
			
			dojoOn(this.getFolderNameNode(), "click", function(e) {
				that._folderListView.onClickFolder(that);
			});
		}
	});
});
