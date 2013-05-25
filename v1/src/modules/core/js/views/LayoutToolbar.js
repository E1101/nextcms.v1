/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		core
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-14
 */

define([
	"dojo/_base/declare",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/I18N"
], function(dojoDeclare) {
	return dojoDeclare("core.js.views.LayoutToolbar", null, {
		// _toolbar: dijit.Toolbar
		_toolbar: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _editButton: dijit.form.Button
		_editButton: null,
		
		// _saveButton: dijit.form.Button
		_saveButton: null,
		
		// _cancelButton: dijit.form.Button
		_cancelButton: null,
		
		constructor: function(/*String*/ id) {
			this._toolbar = new dijit.Toolbar({}, id);
			
			core.js.base.I18N.requireLocalization("core/languages");
			this._i18n = core.js.base.I18N.getLocalization("core/languages");
		
			// Add toolbar items
			var that = this;
			
			// "Edit" button
			this._editButton = new dijit.form.Button({
				label: '<span class="app-icon module-core-layout-icon-edit"></span><br />' + that._i18n.page._share.editAction,
				showLabel: true,
				disabled: false,
				onClick: function(e) {
					that.onEditLayout();
				}
			});
			this._toolbar.addChild(this._editButton);
			
			// "Save" button
			this._saveButton = new dijit.form.Button({
				label: '<span class="app-icon app-icon-save"></span><br />' + that._i18n.global._share.saveAction,
				showLabel: true,
				disabled: true,
				onClick: function(e) {
					that.onSaveLayout();
				}
			});
			this._toolbar.addChild(this._saveButton);
			
			// "Edit" button
			this._cancelButton = new dijit.form.Button({
				label: '<span class="app-icon app-icon-cancel"></span><br />' + that._i18n.global._share.cancelAction,
				showLabel: true,
				disabled: true,
				onClick: function(e) {
					that.onCancel();
				}
			});
			this._toolbar.addChild(this._cancelButton);
		},
		
		/* ========== CONTROL STATE ========================================= */
		
		allowToCancel: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to cancel the updating
			this._cancelButton.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutToolbar
		},
		
		allowToEdit: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to edit the layout
			this._editButton.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutToolbar
		},
		
		allowToSave: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to save the layout
			this._saveButton.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutToolbar
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onCancel: function() {
			// summary:
			//		Cancels the layout updating
			// tags:
			//		callback
		},
		
		onEditLayout: function() {
			// summary:
			//		Edits the layout
			// tags:
			//		callback
		},
		
		onSaveLayout: function() {
			// summary:
			//		Saves the layout
			// tags:
			//		callback
		}
	});
});
