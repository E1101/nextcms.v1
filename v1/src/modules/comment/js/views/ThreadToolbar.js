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
	"dojo/_base/declare",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/form/TextBox",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare) {
	return dojoDeclare("comment.js.views.ThreadToolbar", null, {
		// _id: String
		_id: null,

		// _i18n: Object
		_i18n: null,
		
		// _refreshButton: dijit.form.Button
		_refreshButton: null,
		
		// _searchTextBox: dijit.form.TextBox
		_searchTextBox: null,
		
		// _searchButton: dijit.form.Button
		_searchButton: null,
		
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
			
			// "Close" button
			toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.closeAction,
				showLabel: false,
				iconClass: "app-icon app-icon-cancel",
				onClick: function(e) {
					that.onClose();
				}
			}));
			
			// "Refresh" button
			this._refreshButton = new dijit.form.Button({
				label: this._i18n.global._share.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_view").isAllowed,
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
			this._searchButton = new dijit.form.Button({
				label: this._i18n.global._share.searchAction,
				showLabel: false,
				iconClass: "app-icon app-icon-search",
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_list").isAllowed,
				onClick: function(e) {
					var keyword = that._searchTextBox.get("value");
					that.onSearchComments(keyword);
				}
			});
			toolbar.addChild(this._searchTextBox);
			toolbar.addChild(this._searchButton);
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onClose: function() {
			// summary:
			//		Closes the thread pane
			// tags:
			//		callback
		},
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of comments in the thread
			// tags:
			//		callback
		},
		
		onSearchComments: function(/*String*/ keyword) {
			// summary:
			//		Searches for comments by keyword
			// tags:
			//		callback
		}
	});
});
