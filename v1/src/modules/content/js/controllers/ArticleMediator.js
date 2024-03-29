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
	"dojo/aspect",
	"core/js/base/controllers/Subscriber"
], function(dojoDeclare, dojoAspect) {
	return dojoDeclare("content.js.controllers.ArticleMediator", null, {
		// _articleToolbar: content.js.views.ArticleToolbar
		_articleToolbar: null,

		// _statusListView: content.js.views.ArticleStatusListView
		_statusListView: null,
		
		// _articleContextMenu: content.js.views.ArticleContextMenu
		_articleContextMenu: null,
		
		// _selectedFolder: Object
		_selectedFolder: null,
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/content/js/controllers/ArticleMediator",
		
		constructor: function() {
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setArticleToolbar: function(/*content.js.views.ArticleToolbar*/ toolbar) {
			// summary:
			//		Sets the article toolbar
			this._articleToolbar = toolbar;
			this._articleToolbar.allowToSaveOrder(false);
			
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/controllers/CategoryController/onSelectCategory_content", this, function(categoryId) {
				this._articleToolbar.allowToSaveOrder(categoryId != null);
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/controllers/CategoryController/onSwitchToLanguage_content", this, function(language) {
				this._articleToolbar.allowToSaveOrder(false);
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/controllers/FolderController/onClickFolder_Content_Models_Article", this, function(data) {
				this._articleToolbar.allowToSaveOrder(false);
			});
		},
		
		setStatusListView: function(/*content.js.views.ArticleStatusListView*/ statusListView) {
			// summary:
			//		Sets the status list view
			this._statusListView = statusListView;
			
			var that = this;
			if (this._articleToolbar) {
				this._articleToolbar.setTrashIcon(statusListView.getNumDeletedArticles() == 0 ? "empty" : "full");
			}
			dojoAspect.after(statusListView, "onSetNumDeletedArticles", function(numDeletedArticles) {
				if (that._articleToolbar) {
					that._articleToolbar.setTrashIcon(numDeletedArticles == 0 ? "empty" : "full");
				}
			}, true);
		},
		
		setArticleContextMenu: function(/*content.js.views.ArticleContextMenu*/ articleContextMenu) {
			// summary:
			//		Sets the article's context menu
			this._articleContextMenu = articleContextMenu;
			
			var that = this;
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/controllers/FolderController/onClickFolder_Content_Models_Article", this, function(folderItemView) {
				this._selectedFolder = folderItemView.getFolder();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/category/controllers/CategoryController/onSelectCategory_content", this, function(categoryId) {
				this._selectedFolder = null;
			});
			dojoAspect.after(articleContextMenu, "show", function(articleItemView) {
				that._articleContextMenu.allowToRemoveFromFolder(that._selectedFolder);
			}, true);
		},
		
		initArticleSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits the controls with given criteria
			if (criteria.category_id) {
				this._articleToolbar.allowToSaveOrder(true);
			}
		}
	});
});
