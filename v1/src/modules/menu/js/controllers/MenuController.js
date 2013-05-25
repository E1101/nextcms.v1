/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		menu
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-03
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/hash",
	"dojo/io-query",
	"dojo/request/xhr",
	"dojo/topic",
	"dijit/registry",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/base/views/Helper"
], function(dojoDeclare, dojoLang, dojoAspect, dojoHash, dojoIoQuery, dojoRequestXhr, dojoTopic, dijitRegistry) {
	return dojoDeclare("menu.js.controllers.MenuController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _menuToolbar: menu.js.views.MenuToolbar
		_menuToolbar: null,
		
		// _menuGrid: menu.js.views.MenuGrid
		_menuGrid: null,
		
		// _paginatorContainer: String
		_paginatorContainer: null,
		
		// _defaultCriteria: Object
		_defaultCriteria: {
			keyword: null,
			page: 1,
			per_page: 20,
			language: null
		},
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/menu/js/controllers/MenuController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("menu/languages");
			this._i18n = core.js.base.I18N.getLocalization("menu/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setMenuToolbar: function(/*menu.js.views.MenuToolbar*/ menuToolbar) {
			// summary:
			//		Sets the menu toolbar
			this._menuToolbar = menuToolbar;
			
			var that = this;
			// Add menu handler
			dojoAspect.after(menuToolbar, "onAddMenu", dojoLang.hitch(this, "addMenu"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/menu/menu/add/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/menu/menu/add/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/menu/menu/add/onComplete", this, function(data) {
				this._helper.hideStandby();
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.menu.add[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchMenus();
				}
			});

			// Refresh handler
			dojoAspect.after(menuToolbar, "onRefresh", dojoLang.hitch(this, "searchMenus"));
			
			// Search handler
			dojoAspect.after(menuToolbar, "onSearchMenus", function(keyword) {
				that.searchMenus({
					keyword: keyword,
					page: 1
				});
			}, true);
			dojoAspect.after(menuToolbar, "onUpdatePageSize", function(perPage) {
				that.searchMenus({
					page: 1,
					per_page: perPage
				});
			}, true);
			
			// Switch to other language handler
			dojoAspect.after(menuToolbar, "onSwitchToLanguage", function(language) {
				that.searchMenus({
					language: language,
					page: 1
				});
			}, true);
			
			return this;	// menu.js.controllers.MenuController
		},
		
		setMenuGrid: function(/*menu.js.views.MenuGrid*/ menuGrid) {
			// summary:
			//		Sets the menu grid
			this._menuGrid = menuGrid;
			
			// Edit menu handler
			dojoAspect.after(menuGrid, "onEditMenu", dojoLang.hitch(this, "editMenu"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/menu/menu/edit/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/menu/menu/edit/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/menu/menu/edit/onComplete", this, function(data) {
				this._helper.hideStandby();
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.menu.edit[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchMenus();
				}
			});
			
			// Delete menu handler
			dojoAspect.after(menuGrid, "onDeleteMenu", dojoLang.hitch(this, "deleteMenu"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/menu/menu/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/menu/menu/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.menu["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchMenus();
				}
			});
			
			// Translate menu handler
			dojoAspect.after(menuGrid, "onTranslateMenu", dojoLang.hitch(this, "translateMenu"), true);
			
			return this;	// menu.js.controllers.MenuController
		},
		
		setMenuPaginator: function(/*String*/ paginatorContainer) {
			// summary:
			//		Sets the container of paginator
			this._paginatorContainer = paginatorContainer;
			
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/menu/menu/list/onGotoPage", this, function(page) {
				this.searchMenus({
					page: page
				});
			});
			
			return this;	// menu.js.controllers.MenuController
		},	
		
		addMenu: function() {
			// summary:
			//		Adds new menu
			var url = core.js.base.controllers.ActionProvider.get("menu_menu_add").url;
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		},
		
		deleteMenu: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Deletes given menu
			var params = {
				menu_id: item.menu_id[0]
			};
			var url = core.js.base.controllers.ActionProvider.get("menu_menu_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				title: this._i18n.menu["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		editMenu: function(/*dojo.data.Item|String*/ item) {
			// summary:
			//		Edits given menu
			var params = {
				menu_id: dojoLang.isObject(item) ? item.menu_id[0] : item
			};
			var url = core.js.base.controllers.ActionProvider.get("menu_menu_edit").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits the controls with given criteria
			dojoLang.mixin(this._defaultCriteria, criteria);
			this._menuToolbar.initSearchCriteria(criteria);
			
			return this;	// menu.js.controllers.MenuController
		},
		
		searchMenus: function(/*Object*/ criteria) {
			// summary:
			//		Searches for menus
			dojoLang.mixin(this._defaultCriteria, criteria);
			var q   = core.js.base.Encoder.encode(this._defaultCriteria);
			var url = core.js.base.controllers.ActionProvider.get("menu_menu_list").url;
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
				that._menuGrid.showMenus(data.data);
				
				// Update the paginator
				dijitRegistry.byId(that._paginatorContainer).set("content", data.paginator);
			});
		},
		
		translateMenu: function(/*dojo.data.Item*/ item, /*String*/ language) {
			// summary:
			//		Translates given menu to other language
			var params = {
				source_id: item.menu_id[0],
				language: language
			};
			var url = core.js.base.controllers.ActionProvider.get("menu_menu_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		}
	});
});
