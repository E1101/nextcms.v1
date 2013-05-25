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
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/hash",
	"dojo/io-query",
	"dojo/json",
	"dojo/on",
	"dojo/request/iframe",
	"dojo/request/xhr",
	"dojo/topic",
	"dijit/registry",
	"dojo/parser",
	"dojox/layout/ContentPane",
	"dojox/string/sprintf",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/base/views/Helper",
	"core/js/controllers/PageMediator"
], function(dojoDeclare, dojoLang, dojoAspect, dojoHash, dojoIoQuery, dojoJson, dojoOn, dojoRequestIframe, dojoRequestXhr, dojoTopic, dijitRegistry) {
	return dojoDeclare("core.js.controllers.PageController", null, {
		// _id: String
		_id: null,
		
		// _tabContainerId: String
		_tabContainerId: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,	
		
		// _pageToolbar: core.js.views.PageToolbar
		_pageToolbar: null,
		
		// _pageGrid: core.js.views.PageGrid
		_pageGrid: null,
		
		// _defaultCriteria: Object
		_defaultCriteria: {
			template: null,
			language: null
		},
		
		// _mediator: core.js.controllers.PageMediator
		_mediator: new core.js.controllers.PageMediator(),
		
		// _layoutPane: dojox.layout.ContentPane
		//		The pane shows the page's layout editor
		_layoutPane: null,
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/core/js/controllers/PageController",
		
		constructor: function(/*String*/ id, /*String*/ tabContainerId) {
			this._id = id;
			this._tabContainerId = tabContainerId;
			
			core.js.base.I18N.requireLocalization("core/languages");
			this._i18n = core.js.base.I18N.getLocalization("core/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setPageToolbar: function(/*core.js.views.PageToolbar*/ toolbar) {
			// summary:
			//		Sets the page toolbar
			this._pageToolbar = toolbar;
			this._mediator.setPageToolbar(toolbar);
			
			var that = this;
			// Add new page handler
			dojoAspect.after(toolbar, "onAddPage", dojoLang.hitch(this, "addPage"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/page/add/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/page/add/onComplete", this, function(data) {
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.page.add[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchPages();
				}
			});
			
			// Refresh handler
			dojoAspect.after(toolbar, "onRefresh", dojoLang.hitch(this, "searchPages"));
			
			// Save order handler
			dojoAspect.after(toolbar, "onSaveOrder", dojoLang.hitch(this, "saveOrder"));
			
			// Select template handler
			dojoAspect.after(toolbar, "onSelectTemplate", function(template) {
				that.searchPages({
					template: template
				});
			}, true);
			
			// Switch language handler
			dojoAspect.after(toolbar, "onSwitchToLanguage", function(language) {
				that.searchPages({
					language: language
				});
			}, true);
			
			return this;	// core.js.controllers.PageController
		},
		
		setPageGrid: function(/*core.js.views.PageGrid*/ grid) {
			// summary:
			//		Sets the page grid
			this._pageGrid = grid;
			this._mediator.setPageGrid(grid);
			
			// Edit page handler
			dojoAspect.after(grid, "onEditPage", dojoLang.hitch(this, "editPage"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/page/edit/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/page/edit/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/page/edit/onComplete", this, function(data) {
				this._helper.hideStandby();
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.page.edit[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchPages();
				}
			});
			
			// Delete page handler
			dojoAspect.after(grid, "onDeletePage", dojoLang.hitch(this, "deletePage"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/page/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/page/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.page["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchPages();
				}
			});
			
			// Layout page handler
			dojoAspect.after(grid, "onLayoutPage", dojoLang.hitch(this, "layoutPage"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/page/layout/onComplete", this, function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.page.layout[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/page/layout/onCancel", this, function(pageId) {
				var tabContainer = dijitRegistry.byId(this._tabContainerId);
				if (this._layoutPane) {
					tabContainer.closeChild(this._layoutPane);
					this._layoutPane = null;
				}
			});
			
			// Paste layout handler
			dojoAspect.after(grid, "onPasteLayout", dojoLang.hitch(this, "pasteLayout"), true);
			
			// Import layout handler
			dojoAspect.after(grid, "onImportLayout", dojoLang.hitch(this, "importLayout"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/page/import/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/page/import/onSuccess", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.page.import.success
				});
				this.searchPages();
			});
			
			// Export layout handler
			dojoAspect.after(grid, "onExportLayout", dojoLang.hitch(this, "exportLayout"), true);
			
			// Translate page handler
			dojoAspect.after(grid, "onTranslatePage", dojoLang.hitch(this, "translatePage"), true);
			
			// Set cache lifetime handler
			dojoAspect.after(grid, "onSetCacheLifetime", dojoLang.hitch(this, "setCacheLifetime"), true);
			
			// Remove cache handler
			dojoAspect.after(grid, "onRemoveCache", dojoLang.hitch(this, "removeCache"), true);
			
			return this;	// core.js.controllers.PageController
		},
		
		addPage: function() {
			// summary:
			//		Adds new page
			var params = {
				template: this._defaultCriteria.template,
				language: this._defaultCriteria.language
			};
			var url = core.js.base.controllers.ActionProvider.get("core_page_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		},
		
		deletePage: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Deletes given page
			var params = {
				page_id: item.page_id[0]
			};
			var url = core.js.base.controllers.ActionProvider.get("core_page_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "corePageDeleteDialog",
				title: this._i18n.page["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		editPage: function(/*dojo.data.Item|String*/ item) {
			// summary:
			//		Edits given page
			var params = {
				page_id: dojoLang.isObject(item) ? item.page_id[0] : item
			};
			var url = core.js.base.controllers.ActionProvider.get("core_page_edit").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		},
		
		exportLayout: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Exports layout of given page
			dojoRequestIframe(core.js.base.controllers.ActionProvider.get("core_page_export").url, {
				data: {
					page_id: item.page_id[0]
				},
				method: "GET"
			});
		},
		
		importLayout: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Imports layout of given page
			var params = {
				page_id: item.page_id[0]
			};
			var url = core.js.base.controllers.ActionProvider.get("core_page_import").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "corePageImportDialog",
				title: this._i18n.page.import.title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits with given criteria
			dojoLang.mixin(this._defaultCriteria, criteria);
			this._pageToolbar.initSearchCriteria(this._defaultCriteria);
			return this;	// core.js.controllers.PageController
		},
		
		layoutPage: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Layouts given page item
			var params = {
				page_id: item.page_id[0]
			};
			var url = core.js.base.controllers.ActionProvider.get("core_page_layout").url + "?" + dojoIoQuery.objectToQuery(params);
			
			// Get the tab container
			var tabContainer = dijitRegistry.byId(this._tabContainerId);
			
			if (this._layoutPane && this._layoutPane.get("appPageId") == params.page_id) {
				tabContainer.selectChild(this._layoutPane);
			} else {
				// Close the layout pane
				dojoTopic.publish("/app/core/page/layout/onCancel", params.page_id);
				
				// Create new one
				this._layoutPane = new dojox.layout.ContentPane({
					loadingMessage: "<div class='app-center'><div><span class='dijitContentPaneLoading'>" + this._i18n.global._share.loadingAction + "</span></div></div>",
					appPageId: params.page_id
				});
				this._layoutPane.set("href", url);
				this._layoutPane.set("title", dojox.string.sprintf(this._i18n.page.layout.title, item.name[0]));
				dojoOn(this._layoutPane, "downloadend", function() {
					dojoTopic.publish("/app/global/onLoadComplete", url);
				});
				
				// Add new tab for updating the page's layout and activate the tab
				tabContainer.addChild(this._layoutPane);
				tabContainer.selectChild(this._layoutPane);
			}
		},
		
		pasteLayout: function(/*dojo.data.Item*/ item, /*String*/ layoutData) {
			// summary:
			//		Pastes layout data
			// layoutData:
			//		The layout data which will be set to the selected page
			this._helper.showStandby();
			var pageId = item.page_id[0];
			var that   = this;
			
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("core_page_layout").url, {
				data: {
					page_id: pageId,
					layout: layoutData,
					format: "json"
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.page.layout[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				dojoTopic.publish("/app/core/page/layout/onPasteSuccess", {
					page_id: pageId,
					layout: dojoJson.parse(layoutData)
				});
			});
		},
		
		removeCache: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Removes cache of selected page
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("core_cache_remove").url, {
				data: {
					page_id: item.page_id[0]
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.cache.remove[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
			});
		},
		
		saveOrder: function() {
			// summary:
			//		Saves the order of pages
			// DOJO LESSON: How to get the number of rows of a data grid
			var grid	 = this._pageGrid.getGrid();
			var rowCount = grid.get("rowCount");
			var pages	 = [], item;
			for (var i = 0; i < rowCount; i++) {
				item = grid.getItem(i);
				pages.push(item.page_id[0] + "");
			}
			
			var that = this;
			this._helper.showStandby();
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("core_page_order").url, {
				data: {
					pages: pages.join(",")
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.page.order[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					that.searchPages();
				}
			});
		},
		
		searchPages: function(/*Object*/ criteria) {
			// summary:
			//		Searches for pages
			dojoLang.mixin(this._defaultCriteria, criteria);
			
			var q   = core.js.base.Encoder.encode(this._defaultCriteria);
			var url = core.js.base.controllers.ActionProvider.get("core_page_list").url;
			dojoHash("u=" + url + "/?q=" + q);
			
			var that = this;
			this._helper.showStandby();
			dojoRequestXhr(url, {
				data: {
					q: q,
					format: "json"
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				that._pageGrid.showPages(data.pages);
			});
			
			return this;	// core.js.controllers.PageController
		},
		
		setCacheLifetime: function(/*dojo.data.Item*/ item, /*Integer*/ numSeconds) {
			// summary:
			//		Sets page cache lifetime
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("core_cache_page").url, {
				data: {
					page_id: item.page_id[0],
					lifetime: numSeconds
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.cache.page[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
			});
		},
		
		translatePage: function(/*dojo.data.Item*/ item, /*String*/ language) {
			// summary:
			//		Translates given menu to other language
			var params = {
				source_id: item.page_id[0],
				language: language
			};
			var url = core.js.base.controllers.ActionProvider.get("core_page_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		}
	});
});
