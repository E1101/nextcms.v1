/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		file
 * @subpackage	hooks
 * @since		1.0
 * @version		2012-10-01
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/on",
	"dijit/registry",
	"file/hooks/explorer/FileItemView"
], function(dojoArray, dojoDeclare, dojoDom, dojoOn, dijitRegistry) {
	return dojoDeclare("file.hooks.explorer.FileListView", null, {
		// _id: String
		_id: null,
		
		// _domNode: DomNode
		_domNode: null,
		
		// _fileItemViews: Array
		//		Array of file item views
		_fileItemViews: [],
		
		constructor: function(/*String*/ id) {
			// summary:
			//		Creates new file list view
			// id:
			//		The ID of list view container. The DomNode has to be declared as a dojox.layout.ContentPane
			this._id 	  = id;
			this._domNode = dojoDom.byId(id);
			
			var that = this;
			dojoOn(dijitRegistry.byId(id), "downloadend",  function() {
				that._init();
			});
		},
		
		getDomNode: function() {
			return this._domNode;	// DomNode
		},
		
		_init: function() {
			var that			= this;
			this._fileItemViews = [];
			dojo.query(".hook-file-explorer-file", this._id).forEach(function(node, index, arr) {
				var fileItemView = new file.hooks.explorer.FileItemView(node, that);
				that._fileItemViews.push(fileItemView);
			});
		},
		
		setViewType: function(/*String*/ viewType) {
			// summary:
			//		Sets the view type
			// viewType:
			//		Can be "grid" or "list"
			dojoArray.forEach(this._fileItemViews, function(item) {
				item.setViewType(viewType);
			});
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onOpenDir: function(/*String*/ path) {
			// summary:
			//		Opens the given dir
			// tags:
			//		callback
		}
	});
});
