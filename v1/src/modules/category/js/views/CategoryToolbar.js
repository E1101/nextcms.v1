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
	"dojo/_base/declare",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/Config",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare) {
	return dojoDeclare("category.js.views.CategoryToolbar", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("category/languages");
			this._i18n = core.js.base.I18N.getLocalization("category/languages");
			
			this._createToolbar();
		},
		
		_createToolbar: function() {
			// summary:
			//		Creates toolbar
			var that	= this;
			var toolbar = new dijit.Toolbar({}, this._id);
			toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.addAction,
				showLabel: false,
				iconClass: "app-icon app-icon-add",
				disabled: !core.js.base.controllers.ActionProvider.get("category_category_add").isAllowed,
				onClick: function(e) {
					that.onAddCategory();
				}
			}));
			
			// Refresh button
			toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				disabled: !core.js.base.controllers.ActionProvider.get("category_category_list").isAllowed,
				onClick: function(e) {
					that.onRefresh();
				}
			}));
			
			// Language selector
			var languages = core.js.base.Config.get("core", "localization_languages");
			if (languages) {
				var languagesMenu = new dijit.Menu();
				for (var locale in languages) {
					languagesMenu.addChild(new dijit.MenuItem({
						appLocale: locale,
						label: languages[locale],
						iconClass: "app-icon app-flag-" + locale,
						onClick: function(e) {
							that._languageDropDownButton.set("label", this.label);
							that._languageDropDownButton.set("iconClass", this.iconClass);
							that.onSwitchToLanguage(this.appLocale);
						}
					}));
				}
				toolbar.addChild(new dijit.ToolbarSeparator());
				this._languageDropDownButton = new dijit.form.DropDownButton({
					label: this._i18n.global._share.language,
					showLabel: true,
					dropDown: languagesMenu
				});
				toolbar.addChild(this._languageDropDownButton);
			}
		},
		
		setLanguage: function(/*String*/ language) {
			// summary:
			//		Set the language
			if (language) {
				var languages = core.js.base.Config.get("core", "localization_languages");
				this._languageDropDownButton.set("label", languages[language]);
				this._languageDropDownButton.set("iconClass", "app-icon app-flag-" + language);
			}
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onAddCategory: function() {
			// summary:
			//		Adds new category
			// tags:
			//		callback
		},
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of categories
			// tags:
			//		callback
		},
		
		onSwitchToLanguage: function(/*String?*/ language) {
			// summary:
			//		Loads the list of category when switching to other language
			// tags:
			//		callback
		}
	});
});
