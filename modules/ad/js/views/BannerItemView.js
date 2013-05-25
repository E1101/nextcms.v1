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
	"dojo/dom-attr",
	"dojo/mouse",
	"dojo/on",
	"core/js/base/Encoder"
], function(dojoDeclare, dojoDomAttr, dojoMouse, dojoOn) {
	return dojoDeclare("ad.js.views.BannerItemView", null, {
		// _domNode: DomNode
		_domNode: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _banner: Object
		_banner: null,
		
		// _bannerListView: ad.js.views.BannerListView
		_bannerListView: null,
		
		constructor: function(/*DomNode*/ domNode, /*ad.js.views.BannerListView*/ bannerListView) {
			this._domNode		 = domNode;
			this._bannerListView = bannerListView;
			this._banner		 = core.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props"));
			this._init();
		},
		
		getBanner: function() {
			// summary:
			//		Gets banner data
			return this._banner;	// Object
		},
		
		getDomNode: function() {
			// summary:
			//		Gets DomNode of the banner item
			return this._domNode;	// DomNode
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
					that._bannerListView.onMouseDown(that);
				}
			});
		}
	});
});
