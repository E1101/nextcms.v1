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
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/form/Select",
	"dijit/form/TextBox",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"	
], function(dojoArray, dojoDeclare, dojoDomClass) {
	return dojoDeclare("ad.js.views.BannerToolbar", null, {
		// _id: String
		_id: null,

		// _i18n: Object
		_i18n: null,
		
		// _addButton: dijit.form.Button
		_addButton: null,
		
		// _refreshButton: dijit.form.Button
		_refreshButton: null,
		
		// _searchTextBox: dijit.form.TextBox
		_searchTextBox: null,
		
		// _searchButton: dijit.form.Button
		_searchButton: null,
		
		// _perPageSelect: dijit.form.Select
		_perPageSelect: null,
		
		// _numBannersPerPage: Array
		_numBannersPerPage: [ 20, 40, 60, 80, 100 ],
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("ad/languages");
			this._i18n = core.js.base.I18N.getLocalization("ad/languages");
			
			this._createToolbar();
		},
		
		_createToolbar: function() {
			// summary:
			//		Creates the toolbar
			var that	= this;
			var toolbar = new dijit.Toolbar({}, this._id);
			
			// "Add" button
			this._addButton = new dijit.form.Button({
				label: this._i18n.global._share.addAction,
				showLabel: false,
				iconClass: "app-icon app-icon-add",
				disabled: !core.js.base.controllers.ActionProvider.get("ad_banner_add").isAllowed,
				onClick: function(e) {
					that.onAddBanner();
				}
			});
			toolbar.addChild(this._addButton);
			
			// "Refresh" button
			this._refreshButton = new dijit.form.Button({
				label: this._i18n.global._share.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				disabled: !core.js.base.controllers.ActionProvider.get("ad_banner_list").isAllowed,
				onClick: function(e) {
					that.onRefresh();
				}
			});
			toolbar.addChild(this._refreshButton);
			
			toolbar.addChild(new dijit.ToolbarSeparator());
			
			// Search control
			this._searchTextBox = new dijit.form.TextBox({
				style: "width: 150px",
				placeHolder: this._i18n.banner.list.searchHelp
			});
			this._searchButton = new dijit.form.Button({
				label: this._i18n.global._share.searchAction,
				showLabel: false,
				iconClass: "app-icon app-icon-search",
				disabled: !core.js.base.controllers.ActionProvider.get("ad_banner_list").isAllowed,
				onClick: function(e) {
					var keyword = that._searchTextBox.get("value");
					that.onSearchBanners(keyword);
				}
			});
			toolbar.addChild(this._searchTextBox);
			toolbar.addChild(this._searchButton);
			
			// Select the number of articles per page
			var options = [];
			dojoArray.forEach(this._numBannersPerPage, function(value, index) {
				options.push({
					label: value,
					value: value + ""
				});
			});
			this._perPageSelect = new dijit.form.Select({ 
				options: options, 
				style: "height: 20px",
				disabled: !core.js.base.controllers.ActionProvider.get("ad_banner_list").isAllowed,
				onChange: function(value) {
					that.onUpdatePageSize(parseInt(value));
				}
			});
			dojoDomClass.add(this._perPageSelect.domNode, "app-right");
			toolbar.addChild(this._perPageSelect);
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits controls based on given criteria
			if (criteria.keyword) {
				this._searchTextBox.set("value", criteria.keyword);
			}
			if (criteria.per_page) {
				this._perPageSelect.set("value", criteria.per_page);
			}
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onAddBanner: function() {
			// summary:
			//		Adds new banner
			// tags:
			//		callback
		},
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of banners
			// tags:
			//		callback
		},
		
		onSearchBanners: function(/*String*/ keyword) {
			// summary:
			//		Searches for banners by given keyword
			// tags:
			//		callback
		},
		
		onUpdatePageSize: function(/*Integer*/ perPage) {
			// summary:
			//		Updates the number of banners per page
			// perPage:
			//		The number of banners per page
			// tags:
			//		callback
		}
	});
});
