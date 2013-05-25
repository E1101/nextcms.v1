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
	return dojoDeclare("media.js.views.FlickrToolbar", null, {
		// _toolbar: dijit.Toolbar
		_toolbar: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _importButton: dijit.form.Button
		_importButton: null,
		
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
			this._importButton = new dijit.form.Button({
				label: '<span class="app-icon module-media-icon-import"></span><br />' + this._i18n.global._share.importAction,
				showLabel: true,
				disabled: !core.js.base.controllers.ActionProvider.get("media_flickr_import").isAllowed,
				onClick: function(e) {
					that.onImport();
				}
			});
			this._toolbar.addChild(this._importButton);
		},
		
		/* ========== ENABLE/DISABLE CONTROLS =============================== */
		
		allowToImport: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to import photos
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("media_flickr_import").isAllowed;
			this._importButton.set("disabled", !isAllowed);
			return this;	// media.js.views.PhotoToolbar
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onImport: function() {
			// summary:
			//		Imports the selected photos
			// tags:
			//		callback
		}
	});
});
