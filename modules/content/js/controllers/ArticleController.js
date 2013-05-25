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
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/aspect",
	"dojo/hash",
	"dojo/io-query",
	"dojo/json",
	"dojo/request/xhr",
	"dojo/topic",
	"dojox/string/sprintf",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/base/views/Helper",
	"content/js/controllers/ArticleMediator"
], function(dojoDeclare, dojoLang, dojoDomAttr, dojoAspect, dojoHash, dojoIoQuery, dojoJson, dojoRequestXhr, dojoTopic) {
	return dojoDeclare("content.js.controllers.ArticleController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _articleToolbar: content.js.views.ArticleToolbar
		_articleToolbar: null,
		
		// _articleListView: content.js.views.ArticleListView
		_articleListView: null,
		
		// _articleContextMenu: content.js.views.ArticleContextMenu
		_articleContextMenu: null,
		
		// _articleSearchCriteria: Object
		_articleSearchCriteria: {
			category_id: null,
			folder_id: null,
			status: null,
			page: 1,
			view_size: "thumbnail",
			per_page: 20,
			language: null
		},
		
		// _articleMediator: content.js.controllers.ArticleMediator
		_articleMediator: new content.js.controllers.ArticleMediator(),
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/content/js/controllers/ArticleController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("content/languages");
			this._i18n = core.js.base.I18N.getLocalization("content/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setArticleToolbar: function(/*content.js.views.ArticleToolbar*/ toolbar) {
			// summary:
			//		Sets the article toolbar
			this._articleToolbar = toolbar;
			this._articleMediator.setArticleToolbar(toolbar);
			
			var that = this;
			// Add article handler
			dojoAspect.after(toolbar, "onAddArticle", dojoLang.hitch(this, "addArticle"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/add/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/add/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/add/onComplete", this, function(data) {
				this._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.article.add[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					dojoTopic.publish("/app/content/article/add/onSuccess", data);
					this.searchArticles();
				}
			});
			
			// Refresh handler
			dojoAspect.after(toolbar, "onRefresh", dojoLang.hitch(this, "searchArticles"));
			
			// Save order of articles
			dojoAspect.after(toolbar, "onSaveOrder", dojoLang.hitch(this, "saveArticleOrder"));
			
			// Empty trash handler
			dojoAspect.after(toolbar, "onEmptyTrash", dojoLang.hitch(this, "emptyTrash"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/empty/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/empty/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.article.empty[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					dojoTopic.publish("/app/content/article/empty/onSuccess");
				}
			});
			
			// Search handler
			dojoAspect.after(toolbar, "onSearchArticles", function(keyword) {
				that.searchArticles({
					keyword: keyword,
					page: 1
				});
			}, true);
			
			// View size handler
			dojoAspect.after(toolbar, "onViewSize", function(size) {
				that._articleSearchCriteria.view_size = size;
				if (that._articleListView) {
					that._articleListView.setViewSize(size);
				}
			}, true);
			
			// Update page size handler
			dojoAspect.after(toolbar, "onUpdatePageSize", function(perPage) {
				if (that._articleSearchCriteria.per_page != perPage) {
					that.searchArticles({
						page: 1,
						per_page: perPage
					});
				}
			}, true);
			
			return this;	// content.js.controllers.ArticleController
		},
		
		setArticleListView: function(/*content.js.views.ArticleListView*/ articleListView) {
			// summary:
			//		Sets the articles list view
			this._articleListView = articleListView;
			
			var that = this;
			// Update cover handler
			dojoAspect.after(articleListView, "onUpdateCover", dojoLang.hitch(this, "updateCover"), true);
			
			// Show context menu
			dojoAspect.after(articleListView, "onMouseDown", function(articleItemView) {
				if (that._articleContextMenu) {
					that._articleContextMenu.show(articleItemView);
				}
			}, true);
			
			// Paging handler
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/list/onGotoPage", this, function(page) {
				this.searchArticles({
					page: page
				});
			});
			
			// Load articles when selecting a category
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/controllers/CategoryController/onSelectCategory_content", this, function(categoryId) {
				this.searchArticles({
					category_id: categoryId,
					folder_id: null
				});
			});
			
			// Load articles when switching category to other language
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/controllers/CategoryController/onSwitchToLanguage_content", this, function(language) {
				this.searchArticles({
					category_id: null,
					folder_id: null,
					language: language
				});
			});
			
			// Update total number of articles after activating an user
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/activate/onSuccess", this, function(data) {
				if (this._articleSearchCriteria.status) {
					this._articleListView.removeArticleItemView(data.article_id);
					this._articleListView.increaseArticleCounter(-1);
				}
			});
			
			// Remove article item from the list view after deleting an article
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/delete/onSuccess", this, function(data) {
				this._articleListView.removeArticleItemView(data.article_id);
				this._articleListView.increaseArticleCounter(-1);
			});
			
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/empty/onSuccess", this, function() {
				if ("deleted" == this._articleSearchCriteria.status) {
					// Empty the list
					this._articleListView.empty();
				}
			});
			
			// Drop the article to tree handler
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/controllers/CategoryController/onDropExternalSource_content", this, function(data) {
				this.moveToCategory(data.source, data.category);
			});
			
			// Drop article to folder handler
			if (core.js.base.controllers.ActionProvider.get("content_folder_add").isAllowed) {
				core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/controllers/FolderController/onDropItems_Content_Models_Article", this, function(data) {
					this.addToFolder(data.folderItemView.getFolder(), data.nodes);
				});
			}
			
			// Select folder handler
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/controllers/FolderController/onClickFolder_Content_Models_Article", this, function(folderItemView) {
				this.searchArticles({
					category_id: null,
					folder_id: folderItemView.getFolder().folder_id
				});
			});
			
			return this;	// content.js.controllers.ArticleController
		},
		
		setArticleContextMenu: function(/*content.js.views.ArticleContextMenu*/ articleContextMenu) {
			// summary:
			//		Sets the article's context menu
			this._articleContextMenu = articleContextMenu;
			this._articleMediator.setArticleContextMenu(articleContextMenu);
			
			// Activate handler
			dojoAspect.after(articleContextMenu, "onActivateArticle", dojoLang.hitch(this, "activateArticle"), true);
			
			// Delete handler
			dojoAspect.after(articleContextMenu, "onDeleteArticle", dojoLang.hitch(this, "deleteArticle"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.article["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					dojoTopic.publish("/app/content/article/delete/onSuccess", data);
				}
			});
			
			// Edit handler
			dojoAspect.after(articleContextMenu, "onEditArticle", dojoLang.hitch(this, "editArticle"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/edit/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/edit/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/edit/onComplete", this, function(data) {
				this._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.article.edit[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchArticles();
				}
			});
			
			// Remove from folder handler
			dojoAspect.after(articleContextMenu, "onRemoveFromFolder", dojoLang.hitch(this, "removeFromFolder"), true);
			
			// View revisions
			dojoAspect.after(articleContextMenu, "onViewRevisions", dojoLang.hitch(this, "viewRevisions"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/revision/list/onClose", this, function() {
				this._helper.removePane();
			});
			// Refresh the list of article after restoring a revision
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/revision/restore/onComplete", this, function(data) {
				if ("APP_RESULT_OK" == data.result) {
					this.searchArticles();
				}
			});
			
			// Translate article handler
			dojoAspect.after(articleContextMenu, "onTranslateArticle", dojoLang.hitch(this, "translateArticle"), true);
			
			return this;	// content.js.controllers.ArticleController
		},
		
		activateArticle: function(/*content.js.views.ArticleItemView*/ articleItemView) {
			// summary:
			//		Activates/deactivates given article item
			var articleId = articleItemView.getArticle().article_id;
			var status	  = articleItemView.getArticle().status;
			var that	  = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("content_article_activate").url, {
				data: {
					article_id: articleId
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				var message = ("APP_RESULT_OK" == data.result) 
						    ? ("activated" == status ? "deactivateSuccess" : "activateSuccess") 
						    : ("activated" == status ? "deactivateError" : "activateError");
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.article.activate[message],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					var newStatus = ("activated" == status) ? "not_activated" : "activated";
					articleItemView.getArticle().status = newStatus;
					dojoTopic.publish("/app/content/article/activate/onSuccess", {
						article_id: articleId,
						oldStatus: status,
						newStatus: newStatus
					});
				}
			});
		},
		
		addArticle: function() {
			// summary:
			//		Adds new article
			var url = core.js.base.controllers.ActionProvider.get("content_article_add").url;
			this._helper.showPane(url);
		},
		
		deleteArticle: function(/*content.js.views.ArticleItemView*/ articleItemView) {
			// summary:
			//		Deletes given article item
			var params = {
				article_id: articleItemView.getArticle().article_id
			};
			var url = core.js.base.controllers.ActionProvider.get("content_article_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "contentArticleDeleteDialog",
				title: this._i18n.article["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		editArticle: function(/*content.js.views.ArticleItemView*/ articleItemView) {
			// summary:
			//		Edits given article item
			var params = {
				article_id: articleItemView.getArticle().article_id
			};
			var url = core.js.base.controllers.ActionProvider.get("content_article_edit").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		},
		
		emptyTrash: function() {
			// summary:
			//		Empties the trash
			var url = core.js.base.controllers.ActionProvider.get("content_article_empty").url;
			this._helper.showDialog(url, {
				id: "contentArticleEmptyDialog",
				title: this._i18n.article.empty.title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		moveToCategory: function(/*Object*/ articleItem, /*Object*/ categoryItem) {
			// summary:
			//		Called when dropping article item to the category tree
			var that = this;
			this._helper.showStandby();
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("content_article_move").url, {
				data: {
					article_id: articleItem.article_id,
					category_id: categoryItem.category_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				
				var message = ("APP_RESULT_OK" == data.result) ? "success" : "error";
				message		= dojox.string.sprintf(that._i18n.article.move[message], articleItem.title, categoryItem.name);
				dojoTopic.publish("/app/global/notification", {
					message: message,
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					if (that._articleSearchCriteria.category_id == null) {
						// Reload the list of articles
						that.searchArticles();
					} else if (data.category_id != that._articleSearchCriteria.category_id) {
						// Remove article item from the list
						that._articleListView.removeArticleItemView(data.article_id);
						that._articleListView.increaseArticleCounter(-1);
					}
				}
			});
		},
		
		initArticleSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits the controls with given criteria
			dojoLang.mixin(this._articleSearchCriteria, criteria);
			this._articleToolbar.initSearchCriteria(this._articleSearchCriteria);
			this._articleMediator.initArticleSearchCriteria(this._articleSearchCriteria);
		},
		
		saveArticleOrder: function() {
			// summary:
			//		Saves the order of articles in the selected category
			var articleItemViews = this._articleListView.getArticleItemViews(),
				data			 = [],
				startIndex		 = this._articleSearchCriteria.per_page * (this._articleSearchCriteria.page - 1) + 1;  
			for (var i = 0; i < articleItemViews.length; i++) {
				data.push({
					article_id: articleItemViews[i].getArticle().article_id,
					category_id: this._articleSearchCriteria.category_id,
					index: startIndex + i
				});
			}
			
			this._helper.showStandby();
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("content_article_order").url, {
				data: {
					data: dojoJson.stringify(data)
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.article.order[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
			});
		},
		
		searchArticles: function(/*Object*/ criteria) {
			// summary:
			//		Searches for articles
			this._helper.closeDialog();
			
			dojoLang.mixin(this._articleSearchCriteria, criteria);
			var that = this;
			var q    = core.js.base.Encoder.encode(this._articleSearchCriteria);
			var url  = core.js.base.controllers.ActionProvider.get("content_article_list").url;
			dojoHash("u=" + url + "/?q=" + q);
			
			this._helper.showStandby();
			dojoRequestXhr(url, {
				data: {
					q: q,
					format: "html"
				},
				method: "POST"
			}).then(function(data) {
				that._articleListView.setContent(data);
				that._helper.hideStandby();
			});
			
			// Update the counter
			this._statusListView.countArticles(this._articleSearchCriteria.language);
		},
		
		translateArticle: function(/*content.js.views.ArticleItemView*/ articleItemView, /*String*/ language) {
			// summary:
			//		Translates given article item to other language
			var params = {
				source_id: articleItemView.getArticle().article_id,
				language: language
			};
			var url = core.js.base.controllers.ActionProvider.get("content_article_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		},
		
		updateCover: function(/*content.js.views.ArticleItemView*/ articleItemView, /*Object*/ thumbnails) {
			// summary:
			//		Updates article's cover
			var articleId = articleItemView.getArticle().article_id;
			var that	  = this;
			this._helper.showStandby();
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("content_article_cover").url, {
				data: {
					article_id: articleId,
					thumbnails: dojoJson.stringify(thumbnails)
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.article.cover[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					articleItemView.updateCoverThumbnails(thumbnails);
				}
			});
		},
		
		viewRevisions: function(/*content.js.views.ArticleItemView*/ articleItemView) {
			// summary:
			//		Lists revisions of given article
			var params = {
				article_id: articleItemView.getArticle().article_id
			};
			var url = core.js.base.controllers.ActionProvider.get("content_revision_list").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		},
		
		/* ========== STATUS FILTER ========================================= */
		
		// _statusListView: content.js.views.ArticleStatusListView
		_statusListView: null,
		
		setStatusListView: function(/*content.js.views.ArticleStatusListView*/ statusListView) {
			// summary:
			//		Sets the status list view
			this._statusListView = statusListView;
			this._articleMediator.setStatusListView(statusListView);
			
			var that = this;
			// Filter articles by status
			dojoAspect.after(statusListView, "onStatusSelected", function(status) {
				that.searchArticles({
					status: status
				});
			}, true);
			
			// Update number of articles after updating article's status
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/activate/onSuccess", this, function(data) {
				statusListView.increaseArticleCounter(data.oldStatus, -1);
				statusListView.increaseArticleCounter(data.newStatus, 1);
			});
			
			// after deleting an article
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/delete/onSuccess", this, function(data) {
				if (data.status) {
					statusListView.increaseArticleCounter(data.status, -1);
					if (data.status != "deleted") {
						statusListView.increaseArticleCounter("deleted", 1);
					}
				}
			});
			
			dojoAspect.after(statusListView, "onUpdateStatus", dojoLang.hitch(this, "updateStatus"), true);
			dojoAspect.after(statusListView, "onDeleteArticles", dojoLang.hitch(this, "deleteArticles"), true);
			
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/article/empty/onSuccess", this, function() {
				statusListView.setTrashEmpty();
			});
			
			// after switching to other language
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/controllers/CategoryController/onSwitchToLanguage_content", this, function(language) {
				statusListView.countArticles(language);
			});
			
			return this;	// content.js.controllers.ArticleController
		},
		
		deleteArticles: function(/*DomNode[]*/ articleNodes) {
			// summary:
			//		Called when moving article items to the trash
			this._helper.showStandby();
			var url = core.js.base.controllers.ActionProvider.get("content_article_delete").url;
			while (articleNodes.length > 0) {
				var article	= core.js.base.Encoder.decode(dojo.attr(articleNodes[0], "data-app-entity-props"));
				articleNodes.splice(0, 1);
				if (article.status != "deleted") {
					dojoRequestXhr(url, {
						data: {
							article_id: article.article_id,
							format: "json"
						},
						handleAs: "json",
						method: "POST"
					}).then(function(data) {
						dojoTopic.publish("/app/content/article/delete/onComplete", data);
					});
				}
			}
			
			if (articleNodes.length == 0) {
				this._helper.hideStandby();
			}
		},
		
		updateStatus: function(/*String*/ status, /*DomNode[]*/ articleNodes) {
			// summary:
			//		Called when moving article items to a status item
			if (this._articleSearchCriteria.status == status) {
				return;
			}
			
			this._helper.showStandby();
			while (articleNodes.length > 0) {
				var article			= core.js.base.Encoder.decode(dojoDomAttr.get(articleNodes[0], "data-app-entity-props"));
				var articleItemView = this._articleListView.getArticleItemView(article.article_id);
				if (articleItemView && article.status) {
					this.activateArticle(articleItemView);
					articleNodes.splice(0, 1);
				}
			}
			
			if (articleNodes.length == 0) {
				this._helper.hideStandby();
			}
		},
		
		/* ========== MANAGE ARTICLES IN FOLDERS ============================ */
		
		addToFolder: function(/*Object*/ folder, /*DomNode[]*/ articleNodes) {
			// summary:
			//		Called after dropping articles to given folder
			if (!folder || folder.entity_class != "Content_Models_Article") {
				return;
			}
			var folderId = folder.folder_id;
			var url		 = core.js.base.controllers.ActionProvider.get("content_folder_add").url;
			
			this._helper.showStandby();
			while (articleNodes.length > 0) {
				var article	= core.js.base.Encoder.decode(dojoDomAttr.get(articleNodes[0], "data-app-entity-props"));
				articleNodes.splice(0, 1);
				dojoRequestXhr(url, {
					data: {
						article_id: article.article_id,
						folder_id: folderId
					},
					handleAs: "json",
					method: "POST"
				}).then(function(data) {
					dojoTopic.publish("/app/content/folder/add/onComplete", data);
				});
			}
			
			if (articleNodes.length == 0) {
				this._helper.hideStandby();
			}
		},
		
		removeFromFolder: function(/*content.js.views.ArticleItemView*/ articleItemView) {
			// summary:
			//		Removes given article item from the selected folder
			if (!this._articleSearchCriteria.folder_id) {
				return;
			}
			this._helper.showStandby();
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("content_folder_remove").url, {
				data: {
					article_id: articleItemView.getArticle().article_id,
					folder_id: this._articleSearchCriteria.folder_id
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.folder.remove[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					that.searchArticles();
				}
			});
		}
	});
});
