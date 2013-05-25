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
	"dojo/dom-attr",
	"dojo/dom-style",
	"dojo/on",
	"dojo/query",
	"core/js/base/Encoder"
], function(dojoDeclare, dojoDomAttr, dojoDomStyle, dojoOn) {
	return dojoDeclare("file.js.views.BookmarkItemView", null, {
		// _domNode: DomNode
		_domNode: null,
		
		// _bookmark: Object
		_bookmark: null,
		
		// _bookmarkListView: file.js.views.BookmarkListView
		_bookmarkListView: null,
		
		constructor: function(/*DomNode*/ domNode, /*file.js.views.BookmarkListView*/ bookmarkListView) {
			this._domNode		   = domNode;
			this._bookmarkListView = bookmarkListView;
			this._bookmark		   = dojocore.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props")); 
			this._init();
		},
		
		_init: function() {
			// summary:
			//		Initializes node
			var that = this;
			dojoOn(this.getBookmarkNameNode(), "click", function(e) {
				that._bookmarkListView.onClickBookmark(that);
			});
			
			var renameIconNode = dojo.query(".fileBookmarkRenameIcon", this._domNode)[0];
			// Show/hide the renaming icon when moving the mouse over/out the bookmark item
			dojoOn(this._domNode, "mouseover", function(e) {
				dojoDomStyle.set(renameIconNode, "display", "block");
			});
			dojoOn(this._domNode, "mouseout", function(e) {
				dojoDomStyle.set(renameIconNode, "display", "none");
			});
			dojoOn(renameIconNode, "click", function(e) {
				that._bookmarkListView.onRenameBookmark(that);
			});
			
			var iconNode = dojo.query(".fileBookmarkUnbookmarkIcon", this._domNode)[0];
			dojoOn(iconNode, "click", function(e) {
				that._bookmarkListView.onUnbookmarkDirectory(that);
			});
		},
		
		getDomNode: function() {
			return this._domNode;	// DomNode
		},
		
		getBookmark: function() {
			// summary:
			//		Gets bookmark's properties
			return this._bookmark;	// Object
		},
		
		getBookmarkNameNode: function() {
			return dojo.query(".fileBookmarkName", this._domNode)[0];	// DomNode
		}
	});
});
