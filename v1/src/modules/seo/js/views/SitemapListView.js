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
	"dojo/_base/lang",
	"dojo/dom-construct",
	"dojo/aspect",
	"dojo/dnd/AutoSource",
	"dojo/query",
	"core/js/base/Encoder",
	"seo/js/views/SitemapItemView"
], function(dojoDeclare, dojoLang, dojoDomConstruct, dojoAspect) {
	return dojoDeclare("seo.js.views.SitemapListView", null, {
		// _domNode: DomNode
		_domNode: null,
		
		// _contextMenu: seo.js.views.SitemapContextMenu
		_contextMenu: null,
		
		// _sitemapItemViews: Object
		_sitemapItemViews: {},
		
		// _uniqueItemId: String
		_uniqueItemId: 0,
		
		constructor: function(/*String*/ id) {
			this._domNode	  = dojo.byId(id);
			this._contextMenu = new seo.js.views.SitemapContextMenu();
			
			this._init();
		},
		
		_init: function() {
			// summary:
			//		Initializes node
			var that = this;
			
			new dojo.dnd.AutoSource(this._domNode, {
				accept: [],
				selfAccept: false,
				selfCopy: false
			});
			
			dojo.query(".module-seo-sitemap-item", this._id).forEach(function(node, index, arr) {
				var sitemapItemView = new seo.js.views.SitemapItemView(node, that);
				that._sitemapItemViews[sitemapItemView.getSitemapItem().id] = sitemapItemView;
			});
			
			// Show the context menu
			dojoAspect.after(this, "onMouseDown", function(sitemapItemView) {
				that._contextMenu.setSitemapItemView(sitemapItemView).show();
			}, true);
			
			// Delete item handler
			dojoAspect.after(this._contextMenu, "onDeleteItem", function(sitemapItemView) {
				delete that._sitemapItemViews[sitemapItemView.getSitemapItem().id];
				dojoDomConstruct.destroy(sitemapItemView.getDomNode());
			}, true);
			dojoAspect.after(this._contextMenu, "onEditItem", dojoLang.hitch(this, "onEditSitemapItem"), true);
		},
		
		saveSitemapItem: function(/*Object*/ sitemapItem) {
			// summary:
			//		Saves (Adds or updates) sitemap item
			if (sitemapItem.id) {
				// Update the sitemap item
				var sitemapItemView = this._sitemapItemViews[sitemapItem.id];
				for (var prop in sitemapItem) {
					sitemapItemView.getSitemapItem()[prop] = sitemapItem[prop];
				}
				sitemapItemView.updateLink(sitemapItem.link);
			} else {
				// Add new sitemap item
				this.addNewItem(sitemapItem);
			}
		},
		
		addNewItem: function(/*Object*/ sitemapItem) {
			// summary:
			//		Adds new sitemap item
			this._uniqueItemId++;
			var id = "_seoSitemapItem_" + this._uniqueItemId;
			
			var div = dojoDomConstruct.create("div", {
				id: id,
				className: "module-seo-sitemap-item",
				"data-app-entity-props": core.js.base.Encoder.encode({
					id: id,
					link: sitemapItem.link,
					frequency: sitemapItem.frequency,
					priority: sitemapItem.priority,
					last_modified: sitemapItem.last_modified
				})
			}, this._domNode);
			dojoDomConstruct.create("a", {
				href: sitemapItem.link,
				target: "_blank",
				innerHTML: sitemapItem.link
			}, div);
			var sitemapItemView = new seo.js.views.SitemapItemView(div, this);
			this._sitemapItemViews[id] = sitemapItemView;
		},
		
		getSitemapItemView: function(/*String*/ id) {
			// summary:
			//		Gets sitemap item view by given Id
			if (this._sitemapItemViews[id]) {
				return this._sitemapItemViews[id];		// seo.js.views.SitemapItemView
			}
			return null;
		},
		
		getSitemapItems: function() {
			// summary:
			//		Gets array of sitemap items
			var items = [];
			for (var id in this._sitemapItemViews) {
				items.push(this._sitemapItemViews[id].getSitemapItem());
			}
			return items;	// Array
		},
		
		/* ========== CALLBACKS ============================================= */	
		
		onEditSitemapItem: function(/*seo.js.views.SitemapItemView*/ sitemapItemView) {
			// summary:
			//		Edits given sitemap item
			// tags:
			//		callback
		},
		
		onMouseDown: function(/*seo.js.views.SitemapItemView*/ sitemapItemView) {
			// summary:
			//		Called when user right-click a sitemap item
			// sitemapItemView:
			//		The selected sitemap item
			// tags:
			//		callback
		}
	});
});
