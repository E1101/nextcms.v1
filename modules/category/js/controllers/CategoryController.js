/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		category
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-26
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/io-query",
	"dojo/request/xhr",
	"dojo/topic",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/I18N",
	"core/js/base/views/Helper",
	"category/js/controllers/CategoryMediator"
], function(dojoDeclare, dojoLang, dojoAspect, dojoIoQuery, dojoRequestXhr, dojoTopic) {
	return dojoDeclare("category.js.controllers.CategoryController", null, {
		// _id: String
		_id: null,
		
		// _module: String
		//		Name of module
		_module: null,
		
		// _language: String
		_language: null,
		
		// _i18n: Object
		_i18n: null,

		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _toolbar: category.js.views.CategoryToolbar
		_toolbar: null,
		
		// _tree: category.js.views.CategoryTreeView
		_tree: null,
		
		// _mediator: category.js.controllers.CategoryMediator
		_mediator: new category.js.controllers.CategoryMediator(),
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/category/js/controllers/CategoryController",
		
		constructor: function(/*String*/ id) {
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
			
			this._id = id;
			core.js.base.I18N.requireLocalization("category/languages");
			this._i18n = core.js.base.I18N.getLocalization("category/languages");
		},
		
		setModule: function(/*String*/ module) {
			// summary:
			//		Sets the module's name
			this._module = module;
			return this;	// category.js.controllers.CategoryController
		},
		
		setLanguage: function(/*String*/ language) {
			// summary:
			//		Sets the language
			// language:
			//		The language in format of languagecode_COUNTRYCODE
			this._language = language;
			return this;	// category.js.controllers.CategoryController
		},
		
		setHelperContainer: function(/*String*/ containerId) {
			// summary:
			//		Sets the Id of helper container
			this._helper = new core.js.base.views.Helper(containerId);
			this._helper.setLanguageData(this._i18n);
			return this;	// category.js.controllers.CategoryController
		},
		
		setCategoryToolbar: function(/*category.js.views.CategoryToolbar*/ toolbar) {
			// summary:
			//		Sets the category toolbar
			this._toolbar = toolbar;
			
			// Set the language
			this._toolbar.setLanguage(this._language);
			
			var that = this;
			// Add new category handler
			dojoAspect.after(toolbar, "onAddCategory", dojoLang.hitch(this, "addCategory"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/category/add/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/category/add/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/category/add/onComplete", this, function(data) {
				this._helper.hideStandby();
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.category.add[data.result == "APP_RESULT_OK" ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
			});
			
			// Refresh handler
			dojoAspect.after(toolbar, "onRefresh", function() {
				if (that._tree) {
					that._tree.render(that._language);
				}
			});
			
			// Switch to other language handler
			dojoAspect.after(toolbar, "onSwitchToLanguage", function(language) {
				that._language = language;
				if (that._tree) {
					that._tree.render(that._language);
					
					// Extension point
					dojoTopic.publish("/app/category/controllers/CategoryController/onSwitchToLanguage_" + that._module, language);
				}
			});
			
			return this;	// category.js.views.CategoryToolbar
		},
		
		setCategoryTreeView: function(/*category.js.views.CategoryTreeView*/ tree) {
			// summary:
			//		Sets the category tree view
			this._mediator.setCategoryTreeView(tree);

			var that   = this;
			this._tree = tree;
			this._tree.setModule(this._module)
					  .render(this._language);
			
			// Reload the tree after adding new category
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/category/add/onComplete", this, function(data) {
				if ("APP_RESULT_OK" == data.result) {
					tree.render(this._language);
				}
			});
			
			// Select category handler
			dojoAspect.after(tree, "onSelectCategory", function(item) {
				var categoryId = item.root ? null : item.category_id[0];
				
				// Extension point
				dojoTopic.publish("/app/category/controllers/CategoryController/onSelectCategory_" + that._module, categoryId);
			}, true);
			
			// Add category handler
			dojoAspect.after(tree, "onAddCategory", dojoLang.hitch(this, "addCategory"), true);
			
			// Edit handler
			dojoAspect.after(tree, "onEditCategory", dojoLang.hitch(this, "editCategory"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/category/edit/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/category/edit/onComplete", this, function(data) {
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.category.edit[data.result == "APP_RESULT_OK" ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				if ("APP_RESULT_OK" == data.result) {
					tree.render(this._language);
				}
			});
			
			// Delete handler
			dojoAspect.after(tree, "onDeleteCategory", dojoLang.hitch(this, "deleteCategory"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/category/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/category/delete/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/category/delete/onComplete", this, function(data) {
				this._helper.hideStandby();
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.category["delete"][data.result == "APP_RESULT_OK" ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				if ("APP_RESULT_OK" == data.result) {
					tree.render(this._language);
				}
			});
			
			// Rename handler
			dojoAspect.after(tree, "onRenameCategory", dojoLang.hitch(this, "renameCategory"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/category/rename/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/category/rename/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.category.rename[data.result == "APP_RESULT_OK" ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				if ("APP_RESULT_OK" == data.result) {
					tree.render(this._language);
				}
			});
			
			// Move handler
			dojoAspect.after(tree, "onMoveCategory", dojoLang.hitch(this, "moveCategory"), true);
			
			// Drop external item to the tree
			dojoAspect.after(tree, "onDropExternalSource", function(/*dojo.dnd.Item*/ externalItem, /*dojo.data.Item*/ categoryItem) {
				var category = {
					category_id: categoryItem.category_id[0],
					name: categoryItem.name[0]
				};
				dojoTopic.publish("/app/category/controllers/CategoryController/onDropExternalSource_" + that._module, {
					source: externalItem,
					category: category
				});
			});
			
			// Translate category handler
			dojoAspect.after(tree, "onTranslateCategory", dojoLang.hitch(this, "translateCategory"), true);
			
			return this;	// category.js.views.CategoryToolbar
		},
		
		addCategory: function(/*dojo.data.Item?*/ item) {
			// summary:
			//		Adds new category
			// item:
			//		The parent category item
			var params = {
				mod: this._module,
				language: this._language,
				parent_id: (item && item.category_id) ? item.category_id[0] : null
			};
			var url = core.js.base.controllers.ActionProvider.get("category_category_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		},
		
		deleteCategory: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Deletes given category
			var params = {
				category_id: item.category_id[0]
			};
			var url = core.js.base.controllers.ActionProvider.get("category_category_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "categoryCategoryDeleteDialog",
				title: this._i18n.category["delete"].title,
				style: "width: 300px",
				refreshOnShow: true
			});
		},
		
		editCategory: function(/*dojo.data.Item|String*/ item) {
			// summary:
			//		Edits given category
			var params = {
				category_id: dojoLang.isObject(item) ? item.category_id[0] : item
			};
			var url = core.js.base.controllers.ActionProvider.get("category_category_edit").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		},
		
		moveCategory: function(/*dojo.data.Item*/ sourceItem, /*dojo.data.Item*/ targetItem) {
			// summary:
			//		Moves given category
			var that	   = this;
			var categoryId = sourceItem.category_id[0];
			var parentId   = targetItem.root ? "0" : targetItem.category_id[0];
			this._helper.showStandby();
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("category_category_move").url, {
				data: {
					category_id: categoryId,
					parent_id: parentId
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.category.move[data.result == "APP_RESULT_OK" ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				if ("APP_RESULT_OK" == data.result) {
					that._tree.render();
				}
			});
		},
		
		renameCategory: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Renames given category
			var params = {
				category_id: item.category_id[0]
			};
			var url = core.js.base.controllers.ActionProvider.get("category_category_rename").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "categoryCategoryRenameDialog",
				title: this._i18n.category.rename.title,
				style: "width: 300px",
				refreshOnShow: true
			});
		},
		
		translateCategory: function(/*dojo.data.Item*/ item, /*String*/ language) {
			// summary:
			//		Translates given category to other language
			var params = {
				source_id: item.category_id[0],
				language: language,
				mod: this._module
			};
			var url = core.js.base.controllers.ActionProvider.get("category_category_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		}
	});
});
