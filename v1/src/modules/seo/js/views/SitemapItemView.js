/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		seo
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-27
 */

define([
	"dojo/_base/declare",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/mouse",
	"dojo/on",
	"dojo/query",
	"core/js/base/Encoder"
], function(dojoDeclare, dojoDomAttr, dojoDomClass, dojoMouse, dojoOn) {
	return dojoDeclare("seo.js.views.SitemapItemView", null, {
		// _domNode: DomNode
		_domNode: null,
		
		// _sitemapItem: Object
		_sitemapItem: null,
		
		// _sitemapListView: seo.js.views.SitemapListView
		_sitemapListView: null,
		
		constructor: function(/*DomNode*/ domNode, /*seo.js.views.SitemapListView*/ sitemapListView) {
			this._domNode		  = domNode;
			this._sitemapListView = sitemapListView;
			this._sitemapItem	  = core.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props"));
			
			this._init();
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
					that._sitemapListView.onMouseDown(that);
				}
			});
			
			// Allow to Dnd
			dojoDomClass.add(this._domNode, "dojoDndItem");
			dojoDomAttr.set(this._domNode, "dndtype", "seoSitemapItemDnd");
		},
		
		getDomNode: function() {
			return this._domNode;	// DomNode
		},
		
		getSitemapItem: function() {
			return this._sitemapItem;	// Object
		},
		
		updateLink: function(/*String*/ link) {
			// summary:
			//		Updates the link attribute
			var a = dojo.query("a", this._domNode)[0];
			dojoDomAttr.set(a, {
				href: link,
				innerHTML: link
			});
		}
	});
});
