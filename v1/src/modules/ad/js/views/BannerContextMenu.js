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
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare, dojoDomAttr) {
	return dojoDeclare("ad.js.views.BannerContextMenu", null, {
		// _contextMenu: dijit.Menu
		_contextMenu: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _activateMenuItem: dijit.MenuItem
		_activateMenuItem: null,

		// _editMenuItem: dijit.MenuItem
		_editMenuItem: null,
		
		// _deleteMenuItem: dijit.MenuItem
		_deleteMenuItem: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("ad/languages");
			this._i18n = core.js.base.I18N.getLocalization("ad/languages");
		},
		
		show: function(/*ad.js.views.BannerItemView*/ bannerItemView) {
			// summary:
			//		Shows the context menu for given banner item
			var that   = this;
			var banner = bannerItemView.getBanner();
			
			this._contextMenu = new dijit.Menu({
				targetNodeIds: [ dojoDomAttr.get(bannerItemView.getDomNode(), "id") ]
			});
			
			// "Activate" menu item
			this._activateMenuItem = new dijit.MenuItem({
				label: ("activated" == banner.status) ? this._i18n.global._share.deactivateAction : this._i18n.global._share.activateAction,
				iconClass: "app-icon " + ("activated" == banner.status ? "app-icon-deactivate" : "app-icon-activate"),
				disabled: !core.js.base.controllers.ActionProvider.get("ad_banner_activate").isAllowed,
				onClick: function() {
					that.onActivateBanner(bannerItemView);
				}
			});
			this._contextMenu.addChild(this._activateMenuItem);
			
			// "Edit" menu item
			this._editMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.editAction,
				disabled: !core.js.base.controllers.ActionProvider.get("ad_banner_edit").isAllowed,
				onClick: function() {
					that.onEditBanner(bannerItemView);
				}
			});
			this._contextMenu.addChild(this._editMenuItem);
			
			// "Delete" menu item
			this._deleteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("ad_banner_delete").isAllowed,
				onClick: function() {
					that.onDeleteBanner(bannerItemView);
				}
			});
			this._contextMenu.addChild(this._deleteMenuItem);
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onActivateBanner: function(/*ad.js.views.BannerItemView*/ bannerItemView) {
			// summary:
			//		Activates/deactivates banner
			// tags:
			//		callback
		},
		
		onDeleteBanner: function(/*ad.js.views.BannerItemView*/ bannerItemView) {
			// summary:
			//		Deletes banner
			// tags:
			//		callback
		},
		
		onEditBanner: function(/*ad.js.views.BannerItemView*/ bannerItemView) {
			// summary:
			//		Edits banner
			// tags:
			//		callback
		}
	});
});
