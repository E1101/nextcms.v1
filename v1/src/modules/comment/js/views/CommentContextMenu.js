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
	"dojo/dom-attr",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare, dojoDomAttr) {
	return dojoDeclare("comment.js.views.CommentContextMenu", null, {
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
		
		// _reportSpamMenuItem: dijit.MenuItem
		_reportSpamMenuItem: null,
		
		// _replyMenuItem: dijit.MenuItem
		_replyMenuItem: null,
		
		// _replyWithQuoteMenuItem: dijit.MenuItem
		_replyWithQuoteMenuItem: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("comment/languages");
			this._i18n = core.js.base.I18N.getLocalization("comment/languages");
		},
		
		show: function(/*comment.js.views.CommentItemView*/ commentItemView) {
			// summary:
			//		Shows the context menu when right-click the comment item
			var that = this;
			
			// Get comment data
			var comment = commentItemView.getComment();
			
			// Create menu
			this._contextMenu = new dijit.Menu({
				targetNodeIds: [ dojoDomAttr.get(commentItemView.getDomNode(), "id") ]
			});
			
			// "Activate" menu item
			this._activateMenuItem = new dijit.MenuItem({
				label: ("activated" == comment.status) ? this._i18n.global._share.deactivateAction : this._i18n.global._share.activateAction,
				iconClass: "app-icon " + ("activated" == comment.status ? "app-icon-deactivate" : "app-icon-activate"),
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_activate").isAllowed,
				onClick: function() {
					that.onActivateComment(commentItemView);
				}
			});
			this._contextMenu.addChild(this._activateMenuItem);
			
			// "Edit" menu item
			this._editMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.editAction,
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_edit").isAllowed,
				onClick: function() {
					that.onEditComment(commentItemView);
				}
			});
			this._contextMenu.addChild(this._editMenuItem);
			
			// "Delete" menu item
			this._deleteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_delete").isAllowed,
				onClick: function() {
					that.onDeleteComment(commentItemView);
				}
			});
			this._contextMenu.addChild(this._deleteMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// "Report spam" menu item
			this._reportSpamMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.reportSpamAction,
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_spam").isAllowed,
				onClick: function() {
					that.onReportSpam(commentItemView);
				}
			});
			this._contextMenu.addChild(this._reportSpamMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// "Reply" menu item
			this._replyMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.replyAction,
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_reply").isAllowed,
				onClick: function() {
					that.onReplyComment(commentItemView, false);
				}
			});
			this._contextMenu.addChild(this._replyMenuItem);
			
			// "Reply with quote" menu item
			this._replyWithQuoteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.replyWithQuoteAction,
				iconClass: "app-icon module-comment-icon-quote",
				disabled: !core.js.base.controllers.ActionProvider.get("comment_comment_reply").isAllowed,
				onClick: function() {
					that.onReplyComment(commentItemView, true);
				}
			});
			this._contextMenu.addChild(this._replyWithQuoteMenuItem);
			
			this._contextMenu.startup();
			
			this.onContextMenu(commentItemView);
		},
		
		/* ========== CONTROL STATE OF MENU ITEMS =========================== */
		
		allowToReportSpam: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to report a comment as spam
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("comment_comment_spam").isAllowed;
			this._reportSpamMenuItem.set("disabled", !isAllowed);
			return this;	// comment.js.views.CommentContextMenu
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onActivateComment: function(/*comment.js.views.CommentItemView*/ commentItemView) {
			// summary:
			//		Activates or deactivates given comment item
			// tags:
			//		callback
		},
		
		onContextMenu: function(/*comment.js.views.CommentItemView*/ commentItemView) {
			// summary:
			//		Called when right-click on given comment item
			// tags:
			//		callback
		},
		
		onDeleteComment: function(/*comment.js.views.CommentItemView*/ commentItemView) {
			// summary:
			//		Deletes given comment item
			// tags:
			//		callback
		},
		
		onEditComment: function(/*comment.js.views.CommentItemView*/ commentItemView) {
			// summary:
			//		Edits given comment item
			// tags:
			//		callback
		},
		
		onReplyComment: function(/*comment.js.views.CommentItemView*/ commentItemView, /*Boolean*/ withQuote) {
			// summary:
			//		Replies to given comment
			// tags:
			//		callback
		},
		
		onReportSpam: function(/*comment.js.views.CommentItemView*/ commentItemView) {
			// summary:
			//		Reports given comment as spam
			// tags:
			//		callback
		}
	});
});
