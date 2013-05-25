/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		comment
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-03
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/parser",
	"dijit/CheckedMenuItem",
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"dijit/form/Select",
	"dijit/form/TextBox",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/Config",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"	
], function(dojoArray, dojoDeclare, dojoDomClass) {
	return dojoDeclare("comment.js.views.CommentToolbar", null, {
		// _id: String
		_id: null,

		// _i18n: Object
		_i18n: null,
		
		// _refreshButton: dijit.form.Button
		_refreshButton: null,
		
		// _searchTextBox: dijit.form.TextBox
		_searchTextBox: null,
		
		// _statusMenuItems: dijit.CheckedMenuItem[]
		_statusMenuItems: [],
		
		// _searchButton: dijit.form.Button
		_searchButton: null,
		
		// _perPageSelect: dijit.form.Select
		_perPageSelect: null,
		
		// _numCommentsPerPage: Array
		_numCommentsPerPage: [ 20, 40, 60, 80, 100 ],
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("comment/languages");
			this._i18n = core.js.base.I18N.getLocalization("comment/languages");
			
			this._createToolbar();
		},
		
		_createToolbar: function() {
			// summary:
			//		Creates the toolbar
			var that	= this;
			var toolbar = new dijit.Toolbar({}, this._id);
			
			// "Refresh" button
			this._refreshButton = new dijit.form.Button({
				label: this._i18n.global._share.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_list").isAllowed,
				onClick: function(e) {
					that.onRefresh();
				}
			});
			toolbar.addChild(this._refreshButton);
			
			toolbar.addChild(new dijit.ToolbarSeparator());
			
			// Search control
			this._searchTextBox = new dijit.form.TextBox({
				style: "width: 150px",
				placeHolder: this._i18n.comment.list.searchHelp
			});
			toolbar.addChild(this._searchTextBox);

			this._searchButton = new dijit.form.Button({
				label: this._i18n.global._share.searchAction,
				showLabel: false,
				iconClass: "app-icon app-icon-search",
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_list").isAllowed,
				onClick: function(e) {
					var keyword = that._searchTextBox.get("value");
					that.onSearchComments({ keyword: keyword });
				}
			});
			toolbar.addChild(this._searchButton);
			
			// Language selector
			var languages = core.js.base.Config.get("core", "localization_languages");
			if (languages) {
				var languagesMenu = new dijit.Menu();
				languagesMenu.addChild(new dijit.MenuItem({
					label: this._i18n.global._share.allLanguages,
					onClick: function(e) {
						that._languageDropDownButton.set("label", this.label);
						that._languageDropDownButton.set("iconClass", null);
						that.onSwitchToLanguage(null);
					}
				}));
				
				for (var locale in languages) {
					languagesMenu.addChild(new dijit.MenuItem({
						appLocale: locale,
						label: languages[locale],
						iconClass: "app-icon app-flag-" + locale,
						onClick: function(e) {
							that._languageDropDownButton.set("label", this.label);
							that._languageDropDownButton.set("iconClass", this.iconClass);
							that.onSwitchToLanguage(this.appLocale);
						}
					}));
				}
				toolbar.addChild(new dijit.ToolbarSeparator());
				this._languageDropDownButton = new dijit.form.DropDownButton({
					label: this._i18n.global._share.allLanguages,
					showLabel: true,
					dropDown: languagesMenu
				});
				toolbar.addChild(this._languageDropDownButton);
			}
			
			var options = [];
			dojoArray.forEach(this._numCommentsPerPage, function(value, index) {
				options.push({
					label: value,
					value: value + ""
				});
			});
			this._perPageSelect = new dijit.form.Select({ 
				options: options, 
				style: "height: 20px",
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_list").isAllowed,
				onChange: function(value) {
					that.onUpdatePageSize(parseInt(value));
				}
			});
			dojoDomClass.add(this._perPageSelect.domNode, "app-right");
			toolbar.addChild(this._perPageSelect);
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Init the toolbar with given criteria
			if (criteria.keyword) {
				this._searchTextBox.set("value", criteria.keyword);
			}
			if (criteria.per_page) {
				this._perPageSelect.set("value", criteria.per_page + "");
			}
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of comments
			// tags:
			//		callback
		},
		
		onSearchComments: function(/*Object*/ criteria) {
			// summary:
			//		Searches for comments
			// tags:
			//		callback
		},
		
		onSwitchToLanguage: function(/*String?*/ language) {
			// summary:
			//		Called after switching to other language
			// tags:
			//		callback
		},
		
		onUpdatePageSize: function(/*Integer*/ perPage) {
			// summary:
			//		This method is called when the page size select changes its value
			// perPage:
			//		The number of comments per page
			// tags:
			//		callback
		}
	});
});
