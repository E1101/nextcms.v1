/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		message
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-24
 */

define([
	"dojo/_base/declare",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare) {
	return dojoDeclare("message.js.views.FolderToolbar", null, {
		// _id: String
		_id: null,
		
		// _toolbar: dijit.Toolbar
		_toolbar: null,
		
		// _i18n: Object
		_i18n: null,
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("message/languages");
			this._i18n = core.js.base.I18N.getLocalization("message/languages");
			
			this._createToolbar();
		},
		
		_createToolbar: function() {
			// summary:
			//		Creates the toolbar
			var toolbar = new dijit.Toolbar({}, this._id);
			var that    = this;
			
			// "Add" button
			toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.addAction,
				showLabel: false,
				iconClass: "app-icon app-icon-add",
				disabled: !core.js.base.controllers.ActionProvider.get("message_folder_add").isAllowed,
				onClick: function(e) {
					that.onAddFolder();
				}
			}));
			
			// "Refresh" button
			toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				disabled: !core.js.base.controllers.ActionProvider.get("message_folder_list").isAllowed,
				onClick: function(e) {
					that.onRefresh();
				}
			}));
			
			toolbar.addChild(new dijit.ToolbarSeparator());
			
			// "Filter" button
			toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.filterAction,
				showLabel: false,
				iconClass: "app-icon app-icon-filter",
				disabled: !core.js.base.controllers.ActionProvider.get("message_filter_list").isAllowed,
				onClick: function(e) {
					that.onListFilters();
				}
			}));
			
			// "Sort folders by name" button
			var sortButton = new dijit.form.Button({
				appAscending: false,
				label: this._i18n.global._share.sortAction,
				showLabel: false,
				iconClass: "app-icon app-icon-sort-asc",
				disabled: !core.js.base.controllers.ActionProvider.get("message_folder_list").isAllowed,
				onClick: function(e) {
					that.onSortAscending(this.appAscending);
					this.appAscending = this.appAscending ? false : true;
					this.set("iconClass", "app-icon " + (this.appAscending ? "app-icon-sort-desc" : "app-icon-sort-asc"));
				}
			});
			dojo.addClass(sortButton.domNode, "app-right");
			toolbar.addChild(sortButton);
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onAddFolder: function() {
			// summary:
			//		Adds new folder
			// tags:
			//		callback
		},
		
		onListFilters: function() {
			// summary:
			//		Lists message filters
			// tags:
			//		callback
		},
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of folders
			// tags:
			//		callback
		},
		
		onSortAscending: function(/*Boolean*/ ascending) {
			// summmary:
			//		Sorts the list of folders by names
			// tags:
			//		callback
		}
	});
});
