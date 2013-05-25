/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		ad
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-03
 */

define([
	"dojo/_base/declare",
	"dojo/dom",
	"dijit/registry",
	"dojo/query",
	"ad/js/views/BannerItemView"
], function(dojoDeclare, dojoDom, dijitRegistry) {
	return dojoDeclare("ad.js.views.BannerListView", null, {
		// _id: String
		_id: null,
		
		// _domNode: DomNode
		_domNode: null,
		
		constructor: function(/*String*/ id) {
			this._id 	  = id;
			this._domNode = dojoDom.byId(id);
			this._init();
		},
		
		_init: function() {
			var that = this;
			dojo.query(".module-ad-banner", this._id).forEach(function(node, index, arr) {
				var bannerItemView = new ad.js.views.BannerItemView(node, that);
			});
		},
		
		setContent: function(/*String*/ html) {
			// summary:
			//		Reloads the entire list by HTML content
			// html:
			//		Entire HTML to show the list of banners
			dijitRegistry.byId(this._id).set("content", html);
			
			// Re-init
			this._init();
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onMouseDown: function(/*ad.js.views.BannerItemView*/ bannerItemView) {
			// summary:
			//		Called when user right-click a banner item
			// bannerItemView:
			//		The selected banner item
			// tags:
			//		callback
		}
	});
});
