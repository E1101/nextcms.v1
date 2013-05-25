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
 * @version		2012-08-30
 */

define([
	"dojo/_base/declare",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/on",
	"dojox/string/sprintf",
	"core/js/base/I18N"
], function(dojoDeclare, dojoDomAttr, dojoDomConstruct, dojoOn) {
	return dojoDeclare("core.js.views.CharacterCounter", null, {
		// _container: DomNode
		_container: null,
		
		// _i18n: Object
		_i18n: null,
		
		constructor: function(/*dijit.form.TextBox*/ textbox) {
			core.js.base.I18N.requireLocalization("core/languages");
			this._i18n = core.js.base.I18N.getLocalization("core/languages");
			
			// Create a container to show the number of characters
			this._container = dojoDomConstruct.create("span", {
				style: "padding: 0 5px; vertical-align: top"
			}, textbox.domNode, "after");
			
			this._updateNumCharacters(textbox.get("value").length);
			
			var that = this;
			dojoOn(textbox, "change", function(value) {
				that._updateNumCharacters(value.length);
			});
			dojoOn(textbox, "keydown", function() {
				that._updateNumCharacters(textbox.get("value").length);
			});
			dojoOn(textbox, "keyup", function() {
				that._updateNumCharacters(textbox.get("value").length);
			});
		},
		
		_updateNumCharacters: function(numCharacters) {
			// summary:
			//		Shows the total number of characters
			dojoDomAttr.set(this._container, "innerHTML", (numCharacters == 0) ? "" : dojox.string.sprintf(this._i18n.global._share.characters, numCharacters));
		}
	});
});
