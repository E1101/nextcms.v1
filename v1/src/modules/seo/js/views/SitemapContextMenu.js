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
	"dijit/registry",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare, dijitRegistry) {
	return dojoDeclare("seo.js.views.SitemapContextMenu", null, {
		// _contextMenu: dijit.Menu
		_contextMenu: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _sitemapItemView: seo.js.views.SitemapItemView
		_sitemapItemView: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("seo/languages");
			this._i18n = core.js.base.I18N.getLocalization("seo/languages");
			
			this._createMenu();
		},
		
		setSitemapItemView: function(/*seo.js.views.SitemapItemView*/ sitemapItemView) {
			this._sitemapItemView = sitemapItemView;
			return this;	// seo.js.views.SitemapContextMenu 
		},
		
		show: function() {
			// summary:
			//		Shows the context menu
			if (!this._sitemapItemView) {
				return;
			}
			this._contextMenu.bindDomNode(this._sitemapItemView.getDomNode());
		},

		_createMenu: function(/*seo.js.views.SitemapItemView*/ sitemapItemView) {
			// summary:
			//		Creates the context menu
			var that = this;
			
			if (dijitRegistry.byId("seo.js.views.SitemapContextMenu")) {
				dijitRegistry.byId("seo.js.views.SitemapContextMenu").destroy();
			}
			
			// Create menu
			this._contextMenu = new dijit.Menu({
				id: "seo.js.views.SitemapContextMenu"
			});
			
			// "Edit" item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.editAction,
				disabled: !core.js.base.controllers.ActionProvider.get("seo_sitemap_build").isAllowed,
				onClick: function() {
					that.onEditItem(that._sitemapItemView);
				}
			}));
			
			// "Delete" item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("seo_sitemap_build").isAllowed,
				onClick: function() {
					that.onDeleteItem(that._sitemapItemView);
				}
			}));
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onDeleteItem: function(/*seo.js.views.SitemapItemView*/ sitemapItemView) {
			// summary:
			//		Deletes given sitemap item
			// tags:
			//		callback
		},
		
		onEditItem: function(/*seo.js.views.SitemapItemView*/ sitemapItemView) {
			// summary:
			//		Edits given sitemap item
			// tags:
			//		callback
		}
	});
});
