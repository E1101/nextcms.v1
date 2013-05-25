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
	"dojo/dom-attr",
	"dojo/mouse",
	"dojo/on",
	"core/js/base/Encoder"
], function(dojoDeclare, dojoDomAttr, dojoMouse, dojoOn) {
	return dojoDeclare("tag.js.views.TagItemView", null, {
		// _domNode: DomNode
		_domNode: null,
		
		// _tag: Object
		// 		Represent tag's properties
		_tag: null,
		
		// _tagListView: tag.js.views.TagListView
		_tagListView: null,
		
		constructor: function(/*DomNode*/ domNode, /*tag.js.views.TagListView*/ tagListView) {
			this._domNode	  = domNode;
			this._tagListView = tagListView;
			this._tag		  = core.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props"));
			
			this._init();
		},
		
		getDomNode: function() {
			return this._domNode;		// DomNode
		},
		
		getTag: function() {
			// summary:
			//		Gets the tag's properties
			return this._tag;		// Object
		},
		
		_init: function() {
			// summary:
			//		Initializes node
			var that = this;
			
			dojoOn(this._domNode, "contextmenu", function(e) {
				e.preventDefault();
			});
			dojoOn(this._domNode, "mousedown", function(e) {
				if (dojoMouse.isRight(e)) {
					e.preventDefault();
					that._tagListView.onMouseDown(that);
				}
			});
		}
	});
});
