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
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/on",
	"dijit/registry",
	"dojo/query",
	"dojox/grid/enhanced/plugins/GridSource",
	"file/js/views/BookmarkItemView"
], function(dojoArray, dojoDeclare, dojoDom, dojoOn, dijitRegistry) {
	return dojoDeclare("file.js.views.BookmarkListView", null, {
		// _id: String
		_id: null,
		
		// _domNode: DomNode
		_domNode: null,
		
		// _bookmarkedPaths: Array
		_bookmarkedPaths: [],
		
		constructor: function(/*String*/ id) {
			this._id 	  = id;
			this._domNode = dojoDom.byId(id);
			
			this._init();
			this._allowToDragFromGrid();
		},
		
		_init: function() {
			var that = this;
			this._bookmarkedPaths = [];
			dojo.query(".fileBookmarkItem", this._id).forEach(function(node, index, arr) {
				var bookmarkItemView = new file.js.views.BookmarkItemView(node, that);
				that._bookmarkedPaths.push(bookmarkItemView.getBookmark().path);
			});
		},
		
		_allowToDragFromGrid: function() {
			// Allow to drag directory from the grid to the bookmark list
			var bookmarkTarget = new dojox.grid.enhanced.plugins.GridSource(dojoDom.byId(this._id), {
				isSource: false,
				insertNodesForGrid: false
			});
			dojoOn(bookmarkTarget, "dropgridrows", function(grid, rowIndexes) {
				// Determine the source items from the grid view
				var sourceItems = [];
				var that	    = this;
				
				dojoArray.forEach(rowIndexes, function(rowIndex, index) {
					var item = grid.getItem(rowIndex);
					
					if (item && item.directory && dojoArray.indexOf(that._bookmarkedPaths, item.path) == -1) {
						sourceItems.push(item);
					}
				});
				
				dojoArray.forEach(sourceItems, function(item, index) {
					that.onBookmarkDirectory(item);
				});
			});
		},
		
		setContent: function(/*String*/ html) {
			// summary:
			//		Populates the list view
			dijitRegistry.byId(this._id).set("content", html);
			this._init();
		},
		
		getBookmarkedPaths: function() {
			// summary:
			//		Gets the list of bookmarked paths
			return this._bookmarkedPaths;	// Array
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onBookmarkDirectory: function(/*dojo.data.Item*/ item) {
			// summary:
			//		This method is called when dragging the directory from the file grid and drop it to the list
			// tags:
			//		callback
		},
		
		onClickBookmark: function(/*file.js.views.BookmarkItemView*/ bookmarkItemView) {
			// summary:
			//		Called when user click a bookmark item
			// tags:
			//		callback
		},
		
		onRenameBookmark: function(/*file.js.views.BookmarkItemView*/ bookmarkItemView) {
			// summary:
			//		Called when user rename a bookmark item
			// tags:
			//		callback
		},
		
		onUnbookmarkDirectory: function(/*file.js.views.BookmarkItemView*/ bookmarkItemView) {
			// summary:
			//		Called when user remove a bookmark item
			// tags:
			//		callback
		}
	});
});
