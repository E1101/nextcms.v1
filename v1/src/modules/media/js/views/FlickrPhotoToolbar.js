/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		media
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-26
 */

define([
	"dojo/_base/declare",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/Toolbar",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare) {
	return dojoDeclare("media.js.views.FlickrPhotoToolbar", null, {
		// _toolbar: dijit.Toolbar
		_toolbar: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _refreshButton: dijit.form.Button
		_refreshButton: null,
		
		constructor: function(/*String*/ id) {
			this._toolbar = new dijit.Toolbar({}, id);
			
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
			
			this._createToolbar();
		},
		
		_createToolbar: function() {
			// summary:
			//		Creates the toolbar
			// Add toolbar items
			var that = this;
			
			// Refresh button
			this._refreshButton = new dijit.form.Button({
				label: '<span class="app-icon app-icon-refresh"></span><br />' + this._i18n.global._share.refreshAction,
				showLabel: true,
				disabled: !core.js.base.controllers.ActionProvider.get("media_flickr_photo").isAllowed,
				onClick: function(e) {
					that.onRefresh();
				}
			});
			this._toolbar.addChild(this._refreshButton);
		},
		
		/* ========== ENABLE/DISABLE CONTROLS =============================== */
		
		allowToRefresh: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to reload the list of photos
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("media_flickr_photo").isAllowed;
			this._refreshButton.set("disabled", !isAllowed);
			return this;	// media.js.views.PhotoToolbar
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of Flickr photos
			// tags:
			//		callback
		}
	});
});
