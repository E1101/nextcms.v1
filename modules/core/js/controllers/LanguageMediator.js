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
	"dojo/aspect",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/dom-style",
	"core/js/base/I18N"
], function(dojoDeclare, dojoAspect, dojoDom, dojoDomConstruct, dojoDomStyle) {
	return dojoDeclare("core.js.controllers.LanguageMediator", null, {
		// _i18n: Object
		_i18n: null,
		
		// _grid: core.js.views.LanguageGrid
		_grid: null,
		
		// _toolbar: core.js.views.LanguageToolbar
		_toolbar: null,
		
		// _gridParentNode: DomNode
		_gridParentNode: null,
		
		// _messageNode: DomNode
		//		The node shows help message
		_messageNode: null,
		
		constructor: function() {
			core.js.base.I18N.requireLocalization("core/languages");
			this._i18n = core.js.base.I18N.getLocalization("core/languages");
		},
		
		setLanguageToolbar: function(/*core.js.views.LanguageToolbar*/ toolbar) {
			// summary:
			//		Sets the translator toolbar
			this._toolbar = toolbar;
			
			// Load the language file handler
			var that = this;
			dojoAspect.after(toolbar, "onLoadLanguage", function(file) {
				if (that._messageNode) {
					// Hide the help message
					dojoDomStyle.set(that._messageNode, "display", "none");
				}
			}, true);
		},
		
		setLanguageGrid: function(/*core.js.views.LanguageGrid*/ grid) {
			// summary:
			//		Sets the translator grid
			this._grid			 = grid;
			this._gridParentNode = dojoDom.byId(grid.getId()).parentNode;
			
			var that = this;
			dojoAspect.after(this._grid, "onRowContextMenu", function(item) {
				// Don't allow to edit and delete the root node
				var isRoot = item.root && item.root[0];
				that._grid.allowToDelete(!isRoot)
						  .allowToEdit(!isRoot);
			}, true);
			
			this._messageNode = dojoDomConstruct.create("div", {
				className: "app-center",
				innerHTML: "<div>" + this._i18n.language.list.help + "</div>"
			}, this._gridParentNode);
			dojoAspect.after(this._grid, "onClose", function() {
				// Show the help message
				dojoDomStyle.set(this._messageNode, "display", "block");
			});
		}
	});
});
