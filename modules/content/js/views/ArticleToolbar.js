/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		content
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-26
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/form/Select",
	"dijit/form/Slider",
	"dijit/form/TextBox",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoArray, dojoDeclare, dojoDomClass) {
	return dojoDeclare("content.js.views.ArticleToolbar", null, {
		// _id: String
		_id: null,

		// _i18n: Object
		_i18n: null,
		
		// _addButton: dijit.form.Button
		_addButton: null,
		
		// _refreshButton: dijit.form.Button
		_refreshButton: null,
		
		// _saveOrderButton: dijit.form.Button
		_saveOrderButton: null,
		
		// _searchTextBox: dijit.form.TextBox
		_searchTextBox: null,
		
		// _searchButton: dijit.form.Button
		_searchButton: null,
		
		// _emptyTrashButton: dijit.form.Button
		_emptyTrashButton: null,
		
		// _sizeSlider: dijit.form.HorizontalSlider
		_sizeSlider: null,
		
		// _sizeSliderValueHash: Object
		_sizeSliderValueHash: {
			"0": "square",
			"10": "thumbnail",
			"20": "small",
			"30": "crop",
			"40": "medium"
		},
		
		// _sizeSliderLabelHash: Object
		_sizeSliderLabelHash: {
			"square": "0",
			"thumbnail": "10",
			"small": "20",
			"crop": "30",
			"medium": "40"
		},
		
		// _perPageSelect: dijit.form.Select
		_perPageSelect: null,
		
		// _numArticlesPerPage: Array
		_numArticlesPerPage: [ 20, 40, 60, 80, 100, 200, 500 ],
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("content/languages");
			this._i18n = core.js.base.I18N.getLocalization("content/languages");
			
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
				disabled: !core.js.base.controllers.ActionProvider.get("content_article_add").isAllowed,
				onClick: function(e) {
					that.onAddArticle();
				}
			});
			toolbar.addChild(this._addButton);
			
			// "Refresh" button
			this._refreshButton = new dijit.form.Button({
				label: this._i18n.global._share.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				disabled: !core.js.base.controllers.ActionProvider.get("content_article_list").isAllowed,
				onClick: function(e) {
					that.onRefresh();
				}
			});
			toolbar.addChild(this._refreshButton);
			
			// Save orders button
			this._saveOrderButton = new dijit.form.Button({
				label: this._i18n.global._share.saveOrderAction,
				showLabel: true,
				iconClass: "app-icon app-icon-save",
				disabled: !core.js.base.controllers.ActionProvider.get("content_article_order").isAllowed,
				onClick: function(e) {
					that.onSaveOrder();
				}
			});
			toolbar.addChild(this._saveOrderButton);
			
			toolbar.addChild(new dijit.ToolbarSeparator());
			
			// "Empty trash" button
			this._emptyTrashButton = new dijit.form.Button({
				label: this._i18n.global._share.emptyTrashAction,
				showLabel: false,
				iconClass: "app-icon app-icon-trash-empty",
				disabled: !core.js.base.controllers.ActionProvider.get("content_article_empty").isAllowed,
				onClick: function(e) {
					that.onEmptyTrash();
				}
			});
			toolbar.addChild(this._emptyTrashButton);
			
			toolbar.addChild(new dijit.ToolbarSeparator());
			
			// Search control
			this._searchTextBox = new dijit.form.TextBox({
				style: "width: 150px",
				placeHolder: this._i18n.article.list.searchArticleHelp
			});
			this._searchButton = new dijit.form.Button({
				label: this._i18n.global._share.searchAction,
				showLabel: false,
				iconClass: "app-icon app-icon-search",
				disabled: !core.js.base.controllers.ActionProvider.get("content_article_list").isAllowed,
				onClick: function(e) {
					var keyword = that._searchTextBox.get("value");
					that.onSearchArticles(keyword);
				}
			});
			toolbar.addChild(this._searchTextBox);
			toolbar.addChild(this._searchButton);
			
			// Thumbnails slider
			this._sizeSlider = new dijit.form.HorizontalSlider({
				value: 10,
				minimum: 0,
				maximum: 40,
				discreteValues: 5,
				intermediateChanges: true,
				style: "width: 200px;",
				showButtons: true,
				onChange: function(value) {
					that.onViewSize(that._sizeSliderValueHash[value + ""]);
				}
			});
			
			// Put the slider at the right side
			dojoDomClass.add(this._sizeSlider.domNode, "app-right");
			toolbar.addChild(this._sizeSlider);
			
			var separator = new dijit.ToolbarSeparator();
			dojoDomClass.add(separator.domNode, "app-right");
			toolbar.addChild(separator);
			
			// Select the number of articles per page
			var options = [];
			dojoArray.forEach(this._numArticlesPerPage, function(value, index) {
				options.push({
					label: value,
					value: value + ""
				});
			});
			this._perPageSelect = new dijit.form.Select({ 
				options: options, 
				style: "height: 20px",
				disabled: !core.js.base.controllers.ActionProvider.get("content_article_list").isAllowed,
				onChange: function(value) {
					that.onUpdatePageSize(parseInt(value));
				}
			});
			dojoDomClass.add(this._perPageSelect.domNode, "app-right");
			toolbar.addChild(this._perPageSelect);
		},
		
		setTrashIcon: function(/*String*/ icon) {
			// summary:
			//		Sets icon for trash button
			// icon:
			//		Can be "full" or "empty"
			this._emptyTrashButton.set("iconClass", "app-icon " + (("empty" == icon) ? "app-icon-trash-empty" : "app-icon-trash-full"));
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits the controls with given criteria
			this._searchTextBox.set("value", criteria.keyword || "");
			this._perPageSelect.set("value", (criteria.per_page || 20) + "");
			this._sizeSlider.set("value", this._sizeSliderLabelHash[criteria.view_size || "thumbnail"] + "");
		},
		
		/* ========== ENABLE/DISABLE CONTROLS =============================== */
		
		allowToSaveOrder: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to save order of articles in category
			this._saveOrderButton.set("disabled", !isAllowed || !core.js.base.controllers.ActionProvider.get("content_article_order").isAllowed);
			return this;	// content.js.views.ArticleToolbar
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onAddArticle: function() {
			// summary:
			//		Adds new article
			// tags:
			//		callback
		},
		
		onEmptyTrash: function() {
			// summary:
			//		Empties the trash
			// tags:
			//		callback
		},
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of articles
			// tags:
			//		callback
		},
		
		onSaveOrder: function() {
			// summary:
			//		Save the order of articles in the category
			// tags:
			//		callback
		},
		
		onSearchArticles: function(/*String*/ keyword) {
			// summary:
			//		Searches for articles by given keyword
			// tags:
			//		callback
		},
		
		onUpdatePageSize: function(/*Integer*/ perPage) {
			// summary:
			//		This method is called when the page size select changes its value
			// perPage:
			//		The number of articles per page
			// tags:
			//		callback
		},
		
		onViewSize: function(/*String*/ size) {
			// summary:
			//		This method is called when the size slider changed value
			// size:
			//		The thumbnail size: square, thumbnail, small, crop, medium 
			// tags:
			//		callback
		}
	});
});
