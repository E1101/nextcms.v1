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
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/on",
	"dojo/request/xhr",
	"dojo/dnd/Target",
	"dojo/NodeList-dom",
	"dojo/query",
	"core/js/base/controllers/ActionProvider"
], function(dojoDeclare, dojoDom, dojoDomAttr, dojoDomClass, dojoOn, dojoRequestXhr) {
	return dojoDeclare("content.js.views.ArticleStatusListView", null, {
		// _id: String
		_id: null,
		
		// _trashId: String
		//		Id of div showing the trash
		_trashId: null,
		
		// _numDeletedArticles: Integer
		//		Number of deleted articles
		_numDeletedArticles: 0,
		
		// _domNode: DomNode
		_domNode: null,
		
		constructor: function(/*String*/ id, /*String*/ trashId) {
			this._id	  = id;
			this._trashId = trashId;
			this._domNode = dojoDom.byId(id);
			
			this._init();
		},

		_init: function() {
			var that = this;
			
			// Set trash icon based on the number of deleted articles
			this._numDeletedArticles = parseInt(dojoDomAttr.get(this._trashId, "data-app-deleted-articles"));
			dojoDomClass.add(this._trashId, this._numDeletedArticles == 0 ? "app-icon-trash-empty-big" : "app-icon-trash-full-big");
			
			dojoOn(dojoDom.byId(this._trashId), "click", function() {
				dojo.query(".contentArticleStatusSelected", this._domNode).removeClass("contentArticleStatusSelected");
				that.onStatusSelected("deleted");
			});
			
			dojo.query(".contentArticleStatusLabel", this._domNode).forEach(function(node, index, attr) {
				dojoOn(node, "click", function(e) {
					dojo.query(".contentArticleStatusSelected", that._domNode).removeClass("contentArticleStatusSelected");
					dojoDomClass.add(node.parentNode, "contentArticleStatusSelected");
					
					var status = dojoDomAttr.get(this, "data-app-status");
					if ("" == status) {
						status = null;
					}
					that.onStatusSelected(status);
				});
			});
			
			// Allow to drag and drop articles to the status item to update status
			if (core.js.base.controllers.ActionProvider.get("content_article_activate").isAllowed) {
				dojo.query("li", this._domNode).forEach(function(node) {
					var statusNode = dojo.query("a.contentArticleStatusLabel", node)[0];
					var status	   = dojoDomAttr.get(statusNode, "data-app-status");
					
					if (status != "") {
						new dojo.dnd.Target(node, {
							accept: ["contentArticleItemDnd"],
							onDropExternal: function(source, nodes, copy) {
								that.onUpdateStatus(status, nodes);
							}
						});
					}
				});
			}
			
			if (core.js.base.controllers.ActionProvider.get("content_article_delete").isAllowed) {
				new dojo.dnd.Target(this._trashId, {
					accept: ["contentArticleItemDnd"],
					onDropExternal: function(source, nodes, copy) {
						that.onDeleteArticles(nodes);
					}
				});
			}
		},
		
		increaseArticleCounter: function(/*String*/ status, /*Integer*/ increasingNumber) {
			// summary:
			//		Increases (or descreases) the number of articles which have the same status
			if ("deleted" == status) {
				this._setNumDeletedArticles(parseInt(this._numDeletedArticles) + parseInt(increasingNumber));
			} else {
				this._updateArticleCounter(status, increasingNumber);
				
				// Update the counter of "View all" node
				this._updateArticleCounter("", increasingNumber);
			}
		},
		
		setTrashEmpty: function() {
			// summary:
			//		Sets the trash as empty
			this._setNumDeletedArticles(0);
		},
		
		_updateArticleCounter: function(/*String*/ status, /*Integer*/ increasingNumber) {
			// summary:
			//		Updates the article counter
			var statusItemNodes = dojo.query('.contentArticleStatusLabel[data-app-status="' + status + '"]', this._domNode);
			if (statusItemNodes.length > 0) {
				var counterNode		  = dojo.query(".contentArticleStatusCounter", statusItemNodes[0].parentNode)[0];
				var numArticles		  = parseInt(counterNode.innerHTML);
				counterNode.innerHTML = numArticles + increasingNumber;
			}
		},
		
		getNumDeletedArticles: function() {
			// summary:
			//		Gets the number of articles in the trash
			return this._numDeletedArticles;	// Integer
		},
		
		_setNumDeletedArticles: function(/*Integer*/ numDeletedArticles) {
			// summary:
			//		Sets the number of deleted articles
			this._numDeletedArticles = numDeletedArticles;
			
			dojoDomAttr.set(this._trashId, "data-app-articles", this._numDeletedArticles);
			dojoDomClass.remove(this._trashId, ["app-icon-trash-empty-big", "app-icon-trash-full-big"]);
			dojoDomClass.add(this._trashId, this._numDeletedArticles == 0 ? "app-icon-trash-empty-big" : "app-icon-trash-full-big");
			
			this.onSetNumDeletedArticles(this._numDeletedArticles);
		},
		
		setArticleCounter: function(/*String*/ status, /*Integer*/ numArticles) {
			// summary:
			//		Sets and shows the number of articles which have the same status
			if (status == null) {
				status = "";
			}
			switch (true) {
				case ("deleted" == status):
					// Update the trash icon
					this._setNumDeletedArticles(numArticles);
					break;
				case ("" == status):
				case ("activated" == status):
				case ("not_activated" == status):
					var statusItemNodes = dojo.query('.contentArticleStatusLabel[data-app-status="' + status + '"]', this._domNode);
					if (statusItemNodes.length > 0) {
						var counterNode		  = dojo.query(".contentArticleStatusCounter", statusItemNodes[0].parentNode)[0];
						counterNode.innerHTML = numArticles;
					}
					break;
				default:
					break;
			}
		},
		
		countArticles: function(/*String*/ language) {
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("content_article_count").url, {
				data: {
					language: language
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				for (var status in data) {
					that.setArticleCounter("total" == status ? null : status, data[status]);
				}
			});
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onDeleteArticles: function(/*DomNode[]*/ articleNodes) {
			// summary:
			//		Deletes given articles
			// tags:
			//		callback
		},
		
		onSetNumDeletedArticles: function() {
			// summary:
			//		Called after setting the number of deleted articles
			// tags:
			//		callback
		},
		
		onStatusSelected: function(/*String?*/ status) {
			// summary:
			//		Called when selecting a status item
			// tags:
			//		callback
		},
		
		onUpdateStatus: function(/*String*/ status, /*DomNode[]*/ articleNodes) {
			// summary:
			//		Updates status of multiple article items
			// tags:
			//		callback
		}
	});
});
