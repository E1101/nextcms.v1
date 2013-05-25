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
	"dojo/parser",
	"dijit/form/Button",
	"dijit/Toolbar",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"	
], function(dojoDeclare) {
	return dojoDeclare("file.js.views.ConnectionToolbar", null, {
		// _toolbar: dijit.Toolbar
		_toolbar: null,
		
		// _i18n: Object
		_i18n: null,	
		
		constructor: function(/*String*/ id) {
			this._toolbar = new dijit.Toolbar({}, id);
			
			core.js.base.I18N.requireLocalization("file/languages");
			this._i18n = core.js.base.I18N.getLocalization("file/languages");
			
			var that = this;
			
			// Add button
			this._toolbar.addChild(new dijit.form.Button({
				label: this._i18n.connection.add.newConnectionButton,
				showLabel: false,
				iconClass: "app-icon app-icon-add",
				disabled: !core.js.base.controllers.ActionProvider.get("file_connection_add").isAllowed,
				onClick: function(e) {
					that.onAddConnection();
				}
			}));
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onAddConnection: function() {
			// summary:
			//		This method is called when the adding connection button is clicked
			// tags:
			//		callback
		}
	});
});
