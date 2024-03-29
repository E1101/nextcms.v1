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
 * @version		2012-09-12
 */

define([
	"dojo/_base/declare",
	"dojo/dom-attr",
	"dojo/mouse",
	"dojo/on",
	"dojo/dnd/Target",
	"dojo/query",
	"core/js/base/Encoder"
], function(dojoDeclare, dojoDomAttr, dojoMouse, dojoOn) {
	return dojoDeclare("core.js.views.RoleItemView", null, {
		// _domNode: DomNode
		//		The DomNode of role item
		_domNode: null,
		
		// _roleListView: core.js.views.RoleListView
		//		The list view that role item belong to
		_roleListView: null,
		
		// _role: Object
		//		Represents a role data
		_role: null,
		
		constructor: function(/*DomNode*/ domNode, /*core.js.views.RoleListView*/ roleListView) {
			this._domNode 	   = domNode;
			this._roleListView = roleListView;
			
			// Create a role instance based on the node's properties
			// See role/add.ajax.phtml to see the HTML template of role item
			this._role = core.js.base.Encoder.decode(dojoDomAttr.get(domNode, "data-app-entity-props"));
			
			this._init();
		},
		
		getDomNode: function() {
			return this._domNode;	// DomNode
		},
		
		getRoleNameNode: function() {
			// summary:
			//		Gets the DomNode that shows the role's name
			// description:
			//		In some case, you need to access this node such as create inline edit box to update role's name
			return dojo.query(".coreRoleLabel", this._domNode)[0];		// DomNode
		},
		
		getRole: function() {
			// summary:
			//		Gets the role object that role item is showing
			return this._role;	// Object
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
					that._roleListView.onMouseDown(that);
				}
			});
			
			dojoOn(this.getRoleNameNode(), "click", function(e) {
				that._roleListView.onClickRole(that);
			});
			
			// Allow to drag users to role node
			new dojo.dnd.Target(this._domNode, {
				accept: ["coreUserItemDnd"],
				onDropExternal: function(source, nodes, copy) {
					// The following loop does not work. It loops through all the
					// user nodes, not selected nodes:
					//		for(var i in nodes) {
					//		}
					that._roleListView.onDropUsers(that, nodes);
				}
			});
		},
		
		increaseUserCounter: function(/*Integer*/ increasingNumber) {
			// summary:
			//		Increases (or descreases) the number of users in the role
			// increasingNumber:
			//		The number of users that will be added to or removed from the role
			var nodes = dojo.query(".coreRoleUserCounter", this._domNode);
			if (nodes.length > 0) {
				var numUsers	   = parseInt(nodes[0].innerHTML);
				nodes[0].innerHTML = numUsers + increasingNumber;
			}
		}
	});
});
