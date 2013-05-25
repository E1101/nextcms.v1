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
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/on",
	"dojo/NodeList-dom",
	"dojo/query"
], function(dojoDeclare, dojoDom, dojoDomAttr, dojoDomClass, dojoOn) {
	return dojoDeclare("comment.js.views.CommentStatusListView", null, {
		// _id: String
		_id: null,
		
		// _domNode: DomNode
		_domNode: null,
		
		constructor: function(/*String*/ id) {
			this._id	  = id;
			this._domNode = dojoDom.byId(id);
			
			this._init();
		},

		_init: function() {
			var that = this;
			
			dojo.query(".module-comment-status-label", this._domNode).forEach(function(node, index, attr) {
				dojoOn(node, "click", function(e) {
					dojo.query(".module-comment-status-active", that._domNode).removeClass("module-comment-status-active");
					dojoDomClass.add(node.parentNode, "module-comment-status-active");
					
					var status = dojoDomAttr.get(this, "data-app-status");
					if ("" == status) {
						status = null;
					}
					that.onStatusSelected(status);
				});
			});
		},
		
		increaseCommentCounter: function(/*String*/ status, /*Integer*/ increasingNumber) {
			this._updateCommentCounter(status, increasingNumber);
			
			// Update the counter of "View all" node
			this._updateCommentCounter("", increasingNumber);
		},
		
		_updateCommentCounter: function(/*String*/ status, /*Integer*/ increasingNumber) {
			var statusItemNodes = dojo.query('.module-comment-status-label[data-app-status="' + status + '"]', this._domNode);
			if (statusItemNodes.length > 0) {
				var counterNode = dojo.query(".app-counter", statusItemNodes[0].parentNode)[0];
				var numComments	= parseInt(counterNode.innerHTML);
				counterNode.innerHTML = numComments + increasingNumber;
			}
		},
		
		setCommentCounter: function(/*String?*/ status, /*Integer*/ numComments) {
			// summary:
			//		Updates the number of comments which have the same status
			if (status == null) {
				status = "";
			}
			var statusItemNodes = dojo.query('.module-comment-status-label[data-app-status="' + status + '"]', this._domNode);
			if (statusItemNodes.length > 0) {
				var counterNode		  = dojo.query(".app-counter", statusItemNodes[0].parentNode)[0];
				counterNode.innerHTML = numComments;
			}
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onStatusSelected: function(/*String?*/ status) {
			// summary:
			//		Called when clicking on a status item
			// tags:
			//		callback
		}
	});
});
