/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		file
 * @subpackage	hooks
 * @since		1.0
 * @version		2012-10-01
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/form/Select",
	"dijit/Toolbar",
	"core/js/base/I18N"
], function(dojoArray, dojoDeclare, dojoDomClass) {
	return dojoDeclare("file.hooks.explorer.ExplorerToolbar", null, {
		// _toolbar: dijit.Toolbar
		_toolbar: null,
		
		// _i18n: Object
		_i18n: null,	
		
		// _refreshButton: dijit.form.Button
		_refreshButton: null,
		
		// _goHomeButton: dijit.form.Button
		_goHomeButton: null,
		
		// _perPageSelect: dijit.form.Select
		_perPageSelect: null,
		
		// _numFilesPerPage: Array
		_numFilesPerPage: [ 20, 40, 60, 80, 100 ],	
		
		constructor: function(/*String*/ id) {
			this._toolbar = new dijit.Toolbar({}, id);
			
			core.js.base.I18N.requireLocalization("file/hooks/explorer");
			this._i18n = core.js.base.I18N.getLocalization("file/hooks/explorer");
			
			this._createToolbar();
		},
		
		_createToolbar: function() {
			// summary:
			//		Creates the toolbar
			var that = this;
			
			// Go home button
			this._goHomeButton = new dijit.form.Button({
				label: this._i18n.show.goHomeAction,
				showLabel: false,
				iconClass: "app-icon hook-file-explorer-icon-home",
				onClick: function(e) {
					that.onGoHome();
				}
			});
			this._toolbar.addChild(this._goHomeButton);
			
			// Refresh button
			this._refreshButton = new dijit.form.Button({
				label: this._i18n.show.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				onClick: function(e) {
					that.onRefresh();
				}
			});
			this._toolbar.addChild(this._refreshButton);
			
			// View in various modes
			var viewTypeDropDown = new dijit.form.DropDownButton({
				label: this._i18n.show.viewAsGridAction,
				showLabel: false, 
				iconClass: "app-icon hook-file-explorer-icon-grid"
			});
			
			var viewTypeMenu = new dijit.Menu();
			viewTypeMenu.addChild(new dijit.MenuItem({
				label: this._i18n.show.viewAsListAction,
				iconClass: "app-icon hook-file-explorer-icon-list",
				onClick: function() {
					viewTypeDropDown.set("iconClass", "app-icon hook-file-explorer-icon-list");
					that.onChangeViewType("list");
				}
			}));
			viewTypeMenu.addChild(new dijit.MenuItem({
				label: this._i18n.show.viewAsGridAction,
				iconClass: "app-icon hook-file-explorer-icon-grid",
				onClick: function() {
					viewTypeDropDown.set("iconClass", "app-icon hook-file-explorer-icon-grid");
					that.onChangeViewType("grid");
				}
			}));
			viewTypeDropDown.dropDown = viewTypeMenu;
			this._toolbar.addChild(viewTypeDropDown);
			
			// Select the number of files per page
			var options = [];
			dojoArray.forEach(this._numFilesPerPage, function(value, index) {
				options.push({
					label: value,
					value: value + ""
				});
			});
			this._perPageSelect = new dijit.form.Select({ 
				options: options, 
				style: "height: 20px",
				onChange: function(value) {
					that.onUpdatePageSize(parseInt(value));
				}
			});
			dojoDomClass.add(this._perPageSelect.domNode, "app-right");
			this._toolbar.addChild(this._perPageSelect);
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onChangeViewType: function(/*String*/ viewType) {
			// summary:
			//		Called when the view type is changed
			// viewType:
			//		Can be "grid" or "list"
			// tags:
			//		callback
		},
		
		onGoHome: function() {
			// summary:
			//		Goes to the root directory
			// tags:
			//		callback
		},
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of files
			// tags:
			//		callback
		},
		
		onUpdatePageSize: function(/*Integer*/ perPage) {
			// summary:
			//		Updates the number of files per page
			// perPage:
			//		The number of files per page
			// tags:
			//		callback
		}
	});
});
