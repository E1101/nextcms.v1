/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		file
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-11
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/query"
], function(dojoArray, dojoDeclare, dojoDom, dojoDomAttr, dojoDomConstruct, dojoOn) {
	return dojoDeclare("file.js.views.PathBreadcrumb", null, {
		// _id: String
		_id: null,
		
		// _domNode: DomNode
		_domNode: null,
		
		constructor: function(/*String*/ id) {
			this._id 	  = id;
			this._domNode = dojoDom.byId(id);
		},
		
		show: function(/*String*/ path) {
			var that = this;
			if (!path) {
				that._domNode.innerHTML = "./";
				return;
			}
			that._domNode.innerHTML = ".";
			
			var breadcrumb = ".";
			while ("." == path[0] || "/" == path[0]) {
				path = path.substring(1);
			}
			dojoArray.forEach(path.split("/"), function(folder, index) {
				breadcrumb += "/" + folder;
				that._domNode.innerHTML += "/";
				dojoDomConstruct.create("span", {
					innerHTML: folder,
					"data-app-breacrumb": breadcrumb
				}, that._domNode);
			});
			
			dojo.query("span", this._domNode).forEach(function(node, index) {
				dojoOn(node, "click", function() {
					that.onGotoPath(dojoDomAttr.get(node, "data-app-breacrumb"));
				});
			});
		},
		
		disconnect: function() {
			// summary:
			//		Disconnect. It should be called after disconnecting
			this._domNode.innerHTML = ".";
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onGotoPath: function(/*String*/ path) {
			// summary:
			//		This method is called when user click on each folder in the path
			// tags:
			//		callback
		}
	});
});
