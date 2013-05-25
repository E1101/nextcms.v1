/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		message
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-24
 */

define([
	"dojo/_base/array",        
	"dojo/_base/declare",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/fx/Toggler",
	"dojo/mouse",
	"dojo/on",
	"dojo/fx",
	"dojo/query",
	"core/js/base/Encoder",
	"core/js/base/I18N"
], function(dojoArray, dojoDeclare, dojoDomAttr, dojoDomConstruct, dojoDomStyle, dojoFxToggler, dojoMouse, dojoOn) {
	return dojoDeclare("message.js.views.MessageItemView", null, {
		// _domNode: DomNode
		_domNode: null,
		
		// _messageListView: message.js.views.MessageListView
		_messageListView: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _message: Object
		_message: null,
		
		constructor: function(/*DomNode*/ domNode, /*message.js.views.MessageListView*/ messageListView) {
			this._domNode		  = domNode;
			this._messageListView = messageListView;
			this._message		  = core.js.base.Encoder.decode(dojo.attr(domNode, "data-app-entity-props"));
			
			core.js.base.I18N.requireLocalization("message/languages");
			this._i18n = core.js.base.I18N.getLocalization("message/languages");
			
			this._init();
		},
		
		getMessage: function() {
			// summary:
			//		Gets message data
			return this._message;	// Object
		},
		
		getDomNode: function() {
			// summary:
			//		Gets DomNode of the message item
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
					that._messageListView.onMouseDown(that);
				}
			});
			
			// If there is quote content, create a new DIV to toggle the quote
			var quotes = dojo.query(".module-message-quote", this._domNode);
			dojoArray.forEach(quotes, function(quoteDiv) {
				var toggleDiv = dojoDomConstruct.create("div", {
					innerHTML: that._i18n.message.view.showQuoteAction,
					className: "module-message-quote-toggler"
				}, quoteDiv, "before");
				dojoDomStyle.set(quoteDiv, "display", "none");
				
				dojoOn(toggleDiv, "click", function() {
					var toggler = new dojoFxToggler({
			            node: quoteDiv,
			            showFunc: dojo.fx.wipeIn,
			            hideFunc: dojo.fx.wipeOut
			        });
					var displayed = dojoDomStyle.get(quoteDiv, "display");
					if ("none" == displayed) {
						dojoDomAttr.set(toggleDiv, "innerHTML", that._i18n.message.view.hideQuoteAction);
						toggler.show();
					} else {
						dojoDomAttr.set(toggleDiv, "innerHTML", that._i18n.message.view.showQuoteAction);
						toggler.hide();
					}
				});
			});
		}
	});
});
