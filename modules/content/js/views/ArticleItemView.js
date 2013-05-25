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
	"dojo/dom-style",
	"dojo/mouse",
	"dojo/on",
	"dojo/query",
	"core/js/base/Encoder",
	"core/js/Constant"
], function(dojoDeclare, dojoDomAttr, dojoDomStyle, dojoMouse, dojoOn) {
	return dojoDeclare("content.js.views.ArticleItemView", null, {
		// _domNode: DomNode
		_domNode: null,
		
		// _articleListView: content.js.views.ArticleListView
		_articleListView: null,
		
		// _article: Object
		// 		Represent article's data
		_article: null,
		
		// _articleTitleNode: DomNode
		_articleTitleNode: null,
		
		// _articleCoverNode: DomNode
		_articleCoverNode: null,
		
		constructor: function(/*DomNode*/ domNode, /*content.js.views.ArticleListView*/ articleListView) {
			this._domNode		   = domNode;
			this._articleTitleNode = dojo.query(".contentArticleItemTitle", domNode)[0];
			this._articleCoverNode = dojo.query(".contentArticleItemCover img", domNode)[0];
			this._articleListView  = articleListView;
			
			this._article = core.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props"));
			
			var that = this;
			this._articleCoverNode.onload = function() {
				dojoDomStyle.set(that._articleTitleNode, "maxWidth", this.width + "px");
			};
			
			this._init();
		},
		
		getDomNode: function() {
			return this._domNode;		// DomNode
		},
		
		getArticle: function() {
			// summary:
			//		Gets the article's properties
			return this._article;		// Object
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
					that._articleListView.onMouseDown(that);
				}
			});
		},
		
		setViewSize: function(/*String*/ size) {
			// summary:
			//		Shows the article in given size of thumbnail
			// size:
			//		The size of thumbnail, can be: square, thumbnail, small, crop, medium
			this._article.view_size = size;
			dojoDomAttr.set(this._articleCoverNode, "src", this._article[size]);
		},
		
		updateCoverThumbnails: function(/*Object*/ thumbnails) {
			// summary:
			//		Updates article's cover
			// thumbnails:
			//		Contains the thumbnails of cover
			var size = this._article.view_size;
			if (thumbnails[size]) {
				dojoDomAttr.set(this._articleCoverNode, "src", core.js.Constant.ROOT_URL + thumbnails[size]);
			}
			for (var thumb in thumbnails) {
				this._article[thumb] = core.js.Constant.ROOT_URL + thumbnails[thumb];
			}
		}
	});
});
