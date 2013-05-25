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
	"dojo/dom-attr",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dijit/PopupMenuItem",
	"core/js/base/Config",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare, dojoDomAttr) {
	return dojoDeclare("content.js.views.ArticleContextMenu", null, {
		// _contextMenu: dijit.Menu
		_contextMenu: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _activateMenuItem: dijit.MenuItem
		_activateMenuItem: null,

		// _editMenuItem: dijit.MenuItem
		_editMenuItem: null,
		
		// _deleteMenuItem: dijit.MenuItem
		_deleteMenuItem: null,
		
		// _revisionMenuItem: dijit.MenuItem
		_revisionMenuItem: null,
		
		// _removeFromFolderMenuItem: dijit.MenuItem
		_removeFromFolderMenuItem: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("content/languages");
			this._i18n = core.js.base.I18N.getLocalization("content/languages");
		},
		
		show: function(/*content.js.views.ArticleItemView*/ articleItemView) {
			var that = this;
			
			// Get article data
			var article = articleItemView.getArticle();
			
			// Create menu
			this._contextMenu = new dijit.Menu({
				targetNodeIds: [ dojoDomAttr.get(articleItemView.getDomNode(), "id") ]
			});
			
			// "Activate" menu item
			this._activateMenuItem = new dijit.MenuItem({
				label: ("activated" == article.status) ? this._i18n.global._share.deactivateAction : this._i18n.global._share.activateAction,
				iconClass: "app-icon " + ("activated" == article.status ? "app-icon-deactivate" : "app-icon-activate"),
				disabled: !core.js.base.controllers.ActionProvider.get("content_article_activate").isAllowed,
				onClick: function() {
					that.onActivateArticle(articleItemView);
				}
			});
			this._contextMenu.addChild(this._activateMenuItem);
			
			// "Edit" menu item
			this._editMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.editAction,
				disabled: !core.js.base.controllers.ActionProvider.get("content_article_edit").isAllowed,
				onClick: function() {
					that.onEditArticle(articleItemView);
				}
			});
			this._contextMenu.addChild(this._editMenuItem);
			
			// "Delete" menu item
			this._deleteMenuItem = new dijit.MenuItem({
				label: ("deleted" == article.status) ? this._i18n.global._share.deleteForeverAction : this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("content_article_delete").isAllowed,
				onClick: function() {
					that.onDeleteArticle(articleItemView);
				}
			});
			this._contextMenu.addChild(this._deleteMenuItem);
			
			// "Remove from folder" menu item
			this._removeFromFolderMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.removeFromFolderAction,
				disabled: !core.js.base.controllers.ActionProvider.get("content_folder_remove").isAllowed,
				onClick: function() {
					that.onRemoveFromFolder(articleItemView);
				}
			});
			this._contextMenu.addChild(this._removeFromFolderMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// "Revision" menu item
			this._revisionMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.viewRevisionsAction,
				disabled: !core.js.base.controllers.ActionProvider.get("content_revision_list").isAllowed,
				onClick: function() {
					that.onViewRevisions(articleItemView);
				}
			});
			this._contextMenu.addChild(this._revisionMenuItem);
			
			// "Localize" menu item
			var languages = core.js.base.Config.get("core", "localization_languages");
			if (languages) {
				var localizePopupMenu = new dijit.Menu();
				for (var locale in languages) {
					localizePopupMenu.addChild(new dijit.MenuItem({
						appLocale: locale,
						label: languages[locale],
						iconClass: "app-icon app-flag-" + locale,
						onClick: function(e) {
							var translations = articleItemView.getArticle().translations;
							if (translations[this.appLocale]) {
								that.onEditArticle(articleItemView);
							} else {
								that.onTranslateArticle(articleItemView, this.appLocale);
							}
						}
					}));
				}
				
				this._contextMenu.addChild(new dijit.PopupMenuItem({
					label: this._i18n.global._share.localizeAction,
					popup: localizePopupMenu
				}));
			}
			
			this._contextMenu.startup();
		},
		
		/* ========== ENABLE/DISABLE CONTROLS =============================== */
		
		allowToRemoveFromFolder: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to remove articles from a given folder
			this._removeFromFolderMenuItem.set("disabled", !isAllowed || !core.js.base.controllers.ActionProvider.get("content_folder_remove").isAllowed);
			return this;	// content.js.views.ArticleContextMenu
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onActivateArticle: function(/*content.js.views.ArticleItemView*/ articleItemView) {
			// summary:
			//		Activates or deactivates given article item
			// tags:
			//		callback
		},
		
		onDeleteArticle: function(/*content.js.views.ArticleItemView*/ articleItemView) {
			// summary:
			//		Deletes given article item
			// tags:
			//		callback
		},
		
		onEditArticle: function(/*content.js.views.ArticleItemView*/ articleItemView) {
			// summary:
			//		Edits given article item
			// tags:
			//		callback
		},
		
		onRemoveFromFolder: function(/*content.js.views.ArticleItemView*/ articleItemView) {
			// summary:
			//		Removes given article item from the selected folder
			// tags:
			//		callback
		},
		
		onTranslateArticle: function(/*content.js.views.ArticleItemView*/ articleItemView, /*String*/ language) {
			// summary:
			//		Translates given article item to other language
			// tags:
			//		callback
		},
		
		onViewRevisions: function(/*content.js.views.ArticleItemView*/ articleItemView) {
			// summary:
			//		Shows revisions of given article item
			// tags:
			//		callback
		}
	});
});
