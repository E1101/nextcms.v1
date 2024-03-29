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
	"dijit/form/DropDownButton",
	"dijit/form/TextBox",
	"dijit/CheckedMenuItem",
	"dijit/Menu",
	"dijit/MenuSeparator",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare) {
	return dojoDeclare("file.js.views.FileToolbar", null, {
		// _toolbar: dijit.Toolbar
		_toolbar: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _goHomeButton: dijit.form.Button
		_goHomeButton: null,
		
		// _backwardButton: dijit.form.Button
		_backwardButton: null,
		
		// _forwardButton: dijit.form.Button
		_forwardButton: null,
		
		// _backwardPaths: Array
		_backwardPaths: [{ previous: "", current: "" }],
		
		// _forwardPaths: Array
		_forwardPaths: [],
		
		// _path: String
		//		The current sub-path
		_path: "",
		
		// _refreshButton: dijit.form.Button
		_refreshButton: null,
		
		// _uploadButton: dijit.form.Button
		_uploadButton: null,
		
		// _showFilesOnlyMenuItem: dijit.CheckedMenuItem
		_showFilesOnlyMenuItem: null,
		
		// _showHiddenFilesMenuItem: dijit.CheckedMenuItem
		_showHiddenFilesMenuItem: null,
		
		// _searchTextBox: dijit.form.TextBox
		_searchTextBox: null,
		
		// _searchButton: dijit.form.Button
		_searchButton: null,
		
		// _searchCaseSensitiveMenuItem: dijit.CheckedMenuItem
		_searchCaseSensitiveMenuItem: null,
		
		// _searchRegularExpressionMenuItem: dijit.CheckedMenuItem
		_searchRegularExpressionMenuItem: null,
		
		// _searchInSubFoldersMenuItem: dijit.CheckedMenuItem
		_searchInSubFoldersMenuItem: null,
		
		// _searchCriteria: Object
		_searchCriteria: {
			name: "",
			case_sensitive: false,
			regular_expression: false,
			recurse: false
		},
		
		constructor: function(/*String*/ id) {
			this._toolbar = new dijit.Toolbar({}, id);
			
			core.js.base.I18N.requireLocalization("file/languages");
			this._i18n = core.js.base.I18N.getLocalization("file/languages");
			
			var that = this;
			
			// Go home button
			this._goHomeButton = new dijit.form.Button({
				label: this._i18n.global._share.goHomeAction,
				showLabel: false,
				iconClass: "app-icon fileExplorerHomeIcon",
				disabled: true,
				onClick: function(e) {
					that.onGotoPath(".");
				}
			});
			this._toolbar.addChild(this._goHomeButton);
			
			// Backward button
			this._backwardButton = new dijit.form.Button({
				label: this._i18n.global._share.backwardAction,
				showLabel: false,
				iconClass: "app-icon fileExplorerBackwardDisabledIcon",
				disabled: true,
				onClick: function(e) {
					if (that._backwardPaths.length > 0) {
						var path = that._backwardPaths.pop();
						that._forwardPaths.push(path);
						that._updateNavButtons();
						that.onGotoPath(path.previous);
					}
				}
			});
			this._toolbar.addChild(this._backwardButton);
			
			// Forward button
			this._forwardButton = new dijit.form.Button({
				label: this._i18n.global._share.forwardAction,
				showLabel: false,
				iconClass: "app-icon fileExplorerForwardDisabledIcon",
				disabled: true,
				onClick: function(e) {
					if (that._forwardPaths.length > 0) {
						var path = that._forwardPaths.pop();
						that._backwardPaths.push(path);
						that._updateNavButtons();
						that.onGotoPath(path.current);
					}
				}
			});
			this._toolbar.addChild(this._forwardButton);
			
			// Refresh button
			this._refreshButton = new dijit.form.Button({
				label: this._i18n.global._share.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				disabled: true,
				onClick: function(e) {
					that.onRefresh();
				}
			});
			this._toolbar.addChild(this._refreshButton);
			
			this._toolbar.addChild(new dijit.ToolbarSeparator());
			
			// Upload button
			this._uploadButton = new dijit.form.Button({
				label: this._i18n.global._share.uploadAction,
				showLabel: false,
				iconClass: "app-icon app-icon-upload",
				disabled: true,
				onClick: function(e) {
					that.onUploadFile();
				}
			});
			this._toolbar.addChild(this._uploadButton);
			
			this._toolbar.addChild(new dijit.ToolbarSeparator());
			
			// View filter
			var filterMenu = new dijit.Menu();
			this._showFilesOnlyMenuItem = new dijit.CheckedMenuItem({
				label: this._i18n.explorer.list.showFilesOnly,
				checked: false,
				disabled: true,
				onClick: function(e) {
					that.onSetShowingFilesOnly(this.get("checked"));
				}
			});
			filterMenu.addChild(this._showFilesOnlyMenuItem);
			
			this._showHiddenFilesMenuItem = new dijit.CheckedMenuItem({
				label: this._i18n.explorer.list.showHiddenFiles,
				disabled: true,
				onClick: function(e) {
					that.onSetShowingHiddenFiles(this.get("checked"));
				}
			});
			filterMenu.addChild(this._showHiddenFilesMenuItem);
			this._toolbar.addChild(new dijit.form.DropDownButton({
				label: this._i18n.explorer.list.viewFilter,
				showLabel: false,
				iconClass: 'app-icon app-icon-filter',
				dropDown: filterMenu
			}));
			
			// Search
			this._searchTextBox = new dijit.form.TextBox({
				style: "width: 150px",
				disabled: true,
				placeHolder: this._i18n.explorer.list.searchFileHelp
			});
			this._searchButton = new dijit.form.Button({
				label: this._i18n.global._share.searchAction,
				showLabel: false,
				iconClass: "app-icon app-icon-search",
				disabled: true,
				onClick: function(e) {
					that._searchCriteria.name = that._searchTextBox.get("value");
					that.onSearchFiles(that._searchCriteria);
				}
			});
			this._toolbar.addChild(this._searchTextBox);
			this._toolbar.addChild(this._searchButton);
			
			// Search options
			var searchOptionsMenu = new dijit.Menu();
			this._searchCaseSensitiveMenuItem = new dijit.CheckedMenuItem({
				label: this._i18n.explorer.list.searchCaseSensitive,
				checked: false,
				disabled: true,
				onClick: function(e) {
					that._searchCriteria.case_sensitive = this.get("checked");
				}
			});
			searchOptionsMenu.addChild(this._searchCaseSensitiveMenuItem);
			
			this._searchRegularExpressionMenuItem = new dijit.CheckedMenuItem({
				label: this._i18n.explorer.list.searchRegularExpression,
				checked: false,
				disabled: true,
				onClick: function(e) {
					that._searchCriteria.regular_expression = this.get("checked");
				}
			});
			searchOptionsMenu.addChild(this._searchRegularExpressionMenuItem);
			
			searchOptionsMenu.addChild(new dijit.MenuSeparator());
			this._searchInSubFoldersMenuItem = new dijit.CheckedMenuItem({
				label: this._i18n.explorer.list.searchInSubFolders,
				checked: false,
				disabled: true,
				onClick: function(e) {
					that._searchCriteria.recurse = this.get("checked");
				}
			});
			searchOptionsMenu.addChild(this._searchInSubFoldersMenuItem);
			
			this._toolbar.addChild(new dijit.form.DropDownButton({
				label: this._i18n.explorer.list.searchOptions,
				showLabel: false,
				dropDown: searchOptionsMenu
			}));
		},
		
		addPathToHistory: function(/*String*/ path) {
			if (this._path != path) {
				if (this._backwardPaths.length > 0 && this._backwardPaths[this._backwardPaths.length - 1].current != path) {
					this._backwardPaths.push({
						previous: this._path,
						current: path
					});
				}
				this._path = path;
				this._updateNavButtons();
			}
		},
		
		resetPathHistory: function() {
			// summary:
			//		Remove all tracked paths. It should be called after disconnecting
			this._path = "";
			this._backwardPaths = [{ previous: "", current: "" }];
			this._forwardPaths  = [];
			this._updateNavButtons();
		},
		
		_updateNavButtons: function() {
			// summary:
			//		Update the status of the backward and forward buttons
			var isAllowed   = core.js.base.controllers.ActionProvider.get("file_explorer_list").isAllowed;
			var canBackward = isAllowed && this._backwardPaths.length > 1;
			this._backwardButton.set("disabled", !canBackward);
			this._backwardButton.set("iconClass", "app-icon " + (canBackward ? "fileExplorerBackwardIcon" : "fileExplorerBackwardDisabledIcon"));
			
			var canForward = isAllowed && this._forwardPaths.length > 0;
			this._forwardButton.set("disabled", !canForward);
			this._forwardButton.set("iconClass", "app-icon " + (canForward ? "fileExplorerForwardIcon" : "fileExplorerForwardDisabledIcon"));
		},
		
		/* ========== UPDATE STATE OF CONTROLS ============================== */
		
		allowToUpload: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to upload file
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("file_explorer_upload").isAllowed;
			this._uploadButton.set("disabled", !isAllowed);
			return this;	// file.js.views.FileToolbar
		},
		
		allowToList: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to view the list of files
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("file_explorer_list").isAllowed;
			
			this._goHomeButton.set("disabled", !isAllowed);
			this._refreshButton.set("disabled", !isAllowed);
			
			this._showFilesOnlyMenuItem.set("disabled", !isAllowed);
			this._showHiddenFilesMenuItem.set("disabled", !isAllowed);
			
			this._searchTextBox.set("disabled", !isAllowed);
			this._searchButton.set("disabled", !isAllowed);
			
			this._searchCaseSensitiveMenuItem.set("disabled", !isAllowed);
			this._searchRegularExpressionMenuItem.set("disabled", !isAllowed);
			this._searchInSubFoldersMenuItem.set("disabled", !isAllowed);
			
			return this;	// file.js.views.FileToolbar
		},
		
		/* ========== CALLBACKS ============================================= */

		onGotoPath: function(/*String*/ path) {
			// tags:
			// 		callback
		},
		
		onRefresh: function() {
			// summary:
			//		This method is called when the refresh button is clicked
			// tags:
			//		callback
		},
		
		onSearchFiles: function(/*Object*/ searchCriteria) {
			// summary:
			//		This method is called when the search button is clicked
			// searchCriteria:
			//		Contains the following members:
			//		- name
			//		- case_sensitive
			//		- regular_expression
			//		- recurse
			// tags:
			//		callback
		},
		
		onSetShowingFilesOnly: function(/*Boolean*/ showFilesOnly) {
			// summary:
			//		This method is called when the show files only item is clicked
			// tags:
			//		callback
		},
		
		onSetShowingHiddenFiles: function(/*Boolean*/ showHiddenFiles) {
			// summary:
			//		This method is called when the show hidden files item is clicked
			// tags:
			//		callback
		},
		
		onUploadFile: function() {
			// summary:
			//		This method is called when the upload button is clicked
			// tags:
			//		callback
		}
	});
});
