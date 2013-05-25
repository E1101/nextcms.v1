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
	"dojo/parser",
	"dijit/form/TextBox",
	"dijit/InlineEditBox",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/base/views/Helper"	
], function(dojoDeclare, dojoLang, dojoAspect, dojoIoQuery, dojoRequestXhr, dojoTopic) {
	return dojoDeclare("category.js.controllers.FolderController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _folderToolbar: category.js.views.FolderToolbar
		_folderToolbar: null,
		
		// _folderListView: category.js.views.FolderListView
		_folderListView: null,
		
		// _folderContextMenu: category.js.views.FolderContextMenu
		_folderContextMenu: null,
		
		// _criteria: Object
		_criteria: {
			entity_class: null,
			language: null
		},
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/category/js/controllers/FolderController",
		
		constructor: function(/*String*/ id) {
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
			
			this._id = id;
			core.js.base.I18N.requireLocalization("category/languages");
			this._i18n = core.js.base.I18N.getLocalization("category/languages");
		},
		
		setEntityClass: function(/*String*/ clazz) {
			// summary:
			//		Sets the entity class
			this._criteria.entity_class = clazz;
			return this;	// category.js.controllers.FolderController
		},
		
		setLanguage: function(/*String*/ language) {
			// summary:
			//		Sets the language
			// language:
			//		The language in format of languagecode_COUNTRYCODE
			this._criteria.language = language;
			return this;	// category.js.controllers.FolderController
		},
		
		setHelperContainer: function(/*String*/ containerId) {
			// summary:
			//		Sets the Id of helper container
			this._helper = new core.js.base.views.Helper(containerId);
			this._helper.setLanguageData(this._i18n);
			return this;	// category.js.controllers.FolderController
		},
		
		setFolderToolbar: function(/*category.js.views.FolderToolbar*/ toolbar) {
			// summary:
			//		Sets the folder toolbar
			this._folderToolbar = toolbar;
			
			// Set the language
			this._folderToolbar.setLanguage(this._criteria.language);
			
			var that = this;
			// Add new folder handler
			dojoAspect.after(toolbar, "onAddFolder", dojoLang.hitch(this, "addFolder"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/folder/add/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/folder/add/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.folder.add[data.result == "APP_RESULT_OK" ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				if ("APP_RESULT_OK" == data.result) {
					this.search();
				}
			});
			
			// Refresh handler
			dojoAspect.after(toolbar, "onRefresh", dojoLang.hitch(this, "search"));
			
			// Switch to other language handler
			dojoAspect.after(toolbar, "onSwitchToLanguage", function(language) {
				that.search({
					language: language
				});
				
				// Extension point
				dojoTopic.publish("/app/category/controllers/FolderController/onSwitchToLanguage_" + that._criteria.entity_class, language);
			}, true);
			
			return this;	// category.js.controllers.FolderController
		},
		
		setFolderListView: function(/*category.js.views.FolderListView*/ listView) {
			// summary:
			//		Sets the folder list view
			this._folderListView = listView;
			
			var that = this;
			dojoAspect.after(listView, "onDropExternal", function(folderItemView, nodes) {
				// Extension point
				dojoTopic.publish("/app/category/controllers/FolderController/onDropItems_" + that._criteria.entity_class, {
					folderItemView: folderItemView,
					nodes: nodes
				});
			}, true);
			
			dojoAspect.after(listView, "onClickFolder", function(folderItemView) {
				// Extension point
				dojoTopic.publish("/app/category/controllers/FolderController/onClickFolder_" + that._criteria.entity_class, folderItemView);
			}, true);
			
			dojoAspect.after(listView, "onMouseDown", function(folderItemView) {
				if (that._folderContextMenu) {
					that._folderContextMenu.show(folderItemView);
				}
			}, true);
			
			return this;	// category.js.controllers.FolderController
		},
		
		setFolderContextMenu: function(/*category.js.views.FolderContextMenu*/ menu) {
			// summary:
			//		Sets the folder context menu
			this._folderContextMenu = menu;
			
			// Delete folder handler
			dojoAspect.after(menu, "onDeleteFolder", dojoLang.hitch(this, "deleteFolder"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/folder/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.folder["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				if ("APP_RESULT_OK" == data.result) {
					this.search();
				}
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/folder/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			
			// Rename folder handler
			dojoAspect.after(menu, "onRenameFolder", dojoLang.hitch(this, "renameFolder"), true);
			
			return this;	// category.js.controllers.FolderController
		},
		
		addFolder: function() {
			// summary:
			//		Adds new folder
			var url = core.js.base.controllers.ActionProvider.get("category_folder_add").url + "?" + dojoIoQuery.objectToQuery(this._criteria);
			this._helper.showDialog(url, {
				id: "categoryFolderAddDialog",
				title: this._i18n.folder.add.title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		deleteFolder: function(/*category.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Deletes given folder
			var params = {
				folder_id: folderItemView.getFolder().folder_id
			};
			var url = core.js.base.controllers.ActionProvider.get("category_folder_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "categoryFolderDeleteDialog",
				title: this._i18n.folder["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		renameFolder: function(/*category.js.views.FolderItemView*/ folderItemView) {
			// summary:
			//		Renames given folder
			var that	 = this;
			var folderId = folderItemView.getFolder().folder_id;
			if (!folderItemView.nameEditBox) {
				folderItemView.nameEditBox = new dijit.InlineEditBox({
					editor: "dijit.form.TextBox", 
					autoSave: true, 
					disabled: false,
					editorParams: {
						required: true
					},
					onChange: function(newName) {
						this.set("disabled", true);
						if (newName != "") {
							dojoRequestXhr(core.js.base.controllers.ActionProvider.get("category_folder_rename").url, {
								data: {
									folder_id: folderId,
									name: newName
								},
								handleAs: "json",
								method: "POST"
							}).then(function(data) {
								dojoTopic.publish("/app/global/notification", {
									message: that._i18n.folder.rename[data.result == "APP_RESULT_OK" ? "success" : "error"],
									type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
								});
								if ("APP_RESULT_OK" == data.result) {
									folderItemView.getFolder().name = data.name;
								}
							});
						}
					},
					onCancel: function() {
						this.set("disabled", true);
					}
				}, folderItemView.getFolderNameNode());
			}
			folderItemView.nameEditBox.set("disabled", false);
			folderItemView.nameEditBox.startup();
			folderItemView.nameEditBox.edit();
		},
		
		search: function(/*Object*/ criteria) {
			// summary:
			//		Searches for folders
			dojoLang.mixin(this._criteria, criteria);
			
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("category_folder_list").url, {
				data: dojoLang.mixin({
					format: "html"
				}, this._criteria),
			}).then(function(data) {
				that._folderListView.setContent(data);
			});
		}
	});
});
