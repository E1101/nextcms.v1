/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		core
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-22
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/dnd/Target",
	"dojo/NodeList-dom",
	"dojo/query",
	"core/js/base/Encoder"
], function(dojoArray, dojoDeclare, dojoDomAttr, dojoDomClass, dojoDomConstruct, dojoOn) {
	return dojoDeclare("core.js.views.UserCollectionView", null, {
		// summary:
		//		This class shows the list of users which can be dragged from the Users Toolbox
		
		// _id: String
		_id: null,
		
		// _clearDiv: DomNode
		_clearDiv: null,
		
		// _inputName: String
		_inputName: null,
		
		// _users: Array
		//		Map user's Id with user data
		_users: {},
		
		constructor: function(/*String*/ id, /*String?*/ inputName) {
			// inputName:
			//		If this param is defined, the view will generate hidden inputs
			//		containing the user's Ids
			this._id		= id;
			this._inputName = inputName;
			this._users		= {};
			
			dojoDomClass.add(this._id, "coreUserCollectionItemsContainer");
			this._clearDiv = dojoDomConstruct.create("div", {
				style: "clear: both"
			}, this._id);
			
			this._init();
		},
		
		_init: function() {
			// summary:
			//		Allows to drag the user item from the Users Toolbox
			//		and drop to the view container
			var that = this;
			
			new dojo.dnd.Target(this._id, {
				accept: ["coreUserItemDnd"],
				onDropExternal: function(source, nodes, copy) {
					dojoArray.forEach(nodes, function(node) {
						var user = core.js.base.Encoder.decode(dojoDomAttr.get(node, "data-app-entity-props"));
						that.addUser(user);
					});
				}
			});
		},
		
		addUser: function(/*Object*/ user) {
			// summary:
			//		Adds user
			// user:
			//		Contains user's Id and username
			var that = this;
			if (this._users[user.user_id]) {
				return;
			}
			this._users[user.user_id] = user;
			
			// Add a DIV container to show the user
			var div = dojoDomConstruct.create("div", {
				className: "coreUserCollectionItem"
			}, this._clearDiv, "before");
			var span = dojoDomConstruct.create("span", {
				innerHTML: user.user_name
			}, div);
			
			// Remove the div if click on the username
			dojoOn(span, "click", function() {
				dojo.query(div).orphan();
				delete that._users[user.user_id];
			});
			
			// Add hidden input
			if (this._inputName) {
				dojoDomConstruct.create("input", {
					type: "hidden",
					name: this._inputName,
					value: user.user_id
				}, div);
			}
		}
	});
});
