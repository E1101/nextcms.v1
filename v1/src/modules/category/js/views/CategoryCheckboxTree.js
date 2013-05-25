/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		category
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-26
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/io-query",
	"dojo/data/ItemFileReadStore",
	"dojo/parser",
	"dijit/_TreeNode",
	"dijit/form/CheckBox",
	"dijit/Tree",
	"dijit/tree/ForestStoreModel",
	"core/js/base/controllers/ActionProvider"
], function(dojoArray, dojoDeclare, dojoLang, dojoDomAttr, dojoDomConstruct, dojoIoQuery) {
	return dojoDeclare("category.js.views.CategoryCheckboxTree", null, {
		// _id: String
		_id: null,
		
		// _module: String
		_module: null,
		
		// _language: String
		_language: null,
		
		// _params: Array
		_params: {
			name: "categories[]",
			selected: [],
			disabled: false
		},
		
		constructor: function(/*String*/ id, /*String*/ module, /*String*/ language, /*Object*/ params) {
			// params:
			//		Contains the following members:
			//		- name [String]: Name of checkboxes
			//		- selected [String]: Ids of selected categories, separated by a comma
			//		- disabled [Boolean]
			this._id	   = id;
			this._module   = module;
			this._language = language;
			
			params.selected = params.selected ? params.selected.split(",") : [];
			dojoLang.mixin(this._params, params);
			
			this._createTree();
		},
		
		_createTree: function() {
			// summary:
			//		Creates the tree
			var url	   = core.js.base.controllers.ActionProvider.get("category_category_list").url;
			var params = { 
				format: "json", 
				mod: this._module,
				language: this._language
			};
			
			var that  = this;
			var div	  = dojoDomConstruct.create("div", {
				id: this._id
			}, this._parentNode);
			var store = new dojo.data.ItemFileReadStore({ 
				url: url + "?" + dojoIoQuery.objectToQuery(params)
			});
			var model = new dijit.tree.ForestStoreModel({
				store: store
			});
			var tree = new dijit.Tree({
				model: model,
				showRoot: false,
				getIconClass: function(/*dojo.data.Item*/ item, /*Boolean*/ opened) {
					return '';
				},
				// DOJO LESSON: Override _createTreeNode() to add a checkbox to each node
				_createTreeNode: function(/*Object*/ args) {
					var node = new dijit._TreeNode(args);
					if (args.item.root == true) {
						return node;
					}
					
					var categoryId   = args.item.category_id[0] + "";
					var checkboxNode = dojoDomConstruct.create("input", {}, node.labelNode, "before");
					var checked		 = dojoArray.indexOf(that._params.selected, categoryId) != -1;
					var checkbox	 = new dijit.form.CheckBox({
						name: that._params.name,
						value: categoryId,
						checked: checked,
						disabled: that._params.disabled,
						onClick: function() {
							this.checked ? dojoDomAttr.set(this.focusNode, "checked", "checked")		  : dojoDomAttr.remove(this.focusNode, "checked");
							this.checked ? dojoDomAttr.set(this.focusNode, "data-app-checked", "checked") : dojoDomAttr.remove(this.focusNode, "data-app-checked");
						}
					}, checkboxNode);
					if (checked) {
						dojoDomAttr.set(checkbox.focusNode, "data-app-checked", "checked");
					}
					
					return node;
				}
			}, this._id);
		}
	});
});
