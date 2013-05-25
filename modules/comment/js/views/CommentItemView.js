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
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/mouse",
	"dojo/on",
	"dojo/fx",
	"dojo/fx/Toggler",
	"dojo/query",
	"core/js/base/Encoder",
	"core/js/base/I18N"
], function(dojoArray, dojoDeclare, dojoDomAttr, dojoDomClass, dojoDomConstruct, dojoDomStyle, dojoMouse, dojoOn) {
	return dojoDeclare("comment.js.views.CommentItemView", null, {
		// _domNode: DomNode
		_domNode: null,
		
		// _comment: Object
		_comment: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _commentListView: comment.js.views.CommentListView
		_commentListView: null,
		
		constructor: function(/*DomNode*/ domNode, /*comment.js.views.CommentListView*/ commentListView) {
			this._domNode		  = domNode;
			this._commentListView = commentListView;
			this._comment		  = core.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props"));
			
			core.js.base.I18N.requireLocalization("comment/languages");
			this._i18n = core.js.base.I18N.getLocalization("comment/languages");
			
			this._init();
		},
		
		getComment: function() {
			// summary:
			//		Gets comment data
			return this._comment;	// Object
		},
		
		getDomNode: function() {
			// summary:
			//		Gets DomNode of the comment item
			return this._domNode;	// DomNode
		},
		
		_init: function() {
			// summary:
			//		Initializes node
			var that = this;
			
			dojoOn(this._domNode, "contextmenu", function(e) {
				e.preventDefault();
			});
			dojoOn(this._domNode, "mousedown", function(e) {
				if (dojoMouse.isRight(e)) {
					e.preventDefault();
					that._commentListView.onMouseDown(that);
				}
			});
			
			this.setStatus(this._comment.status);
			
			// If there is quote content, create a new DIV to toggle the quote
			var quotes = dojo.query(".commentCommentQuote", this._domNode);
			dojoArray.forEach(quotes, function(quoteDiv) {
				var toggleDiv = dojoDomConstruct.create("div", {
					innerHTML: that._i18n.global._share.showQuoteAction,
					className: "module-comment-quote-toggler"
				}, quoteDiv, "before");
				dojoDomStyle.set(quoteDiv, "display", "none");
				
				dojoOn(toggleDiv, "click", function() {
					var toggler = new dojo.fx.Toggler({
			            node: quoteDiv,
			            showFunc: dojo.fx.wipeIn,
			            hideFunc: dojo.fx.wipeOut
			        });
					var displayed = dojoDomStyle.get(quoteDiv, "display");
					if ("none" == displayed) {
						dojoDomAttr.set(toggleDiv, "innerHTML", that._i18n.global._share.hideQuoteAction);
						toggler.show();
					} else {
						dojoDomAttr.set(toggleDiv, "innerHTML", that._i18n.global._share.showQuoteAction);
						toggler.hide();
					}
				});
			});
		},
		
		setStatus: function(/*String*/ status) {
			// summary:
			//		Sets comment status
			// status:
			//		Comment's status, can be "activated", "not_activated", "spam"
			this._comment.status = status;
			dojoDomClass.remove(this._domNode, ["module-comment-item-active", "module-comment-item-unactive", "module-comment-item-spam"]);
			
			switch (status) {
				case "activated":
					dojoDomClass.add(this._domNode, "module-comment-item-active"); 
					break;
				case "not_activated":
					dojoDomClass.add(this._domNode, "module-comment-item-unactive");
					break;
				case "spam":
					dojoDomClass.add(this._domNode, "module-comment-item-spam");
					break;
				default:
					break;
			}
		}
	});
});
