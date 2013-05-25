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
 * @version		2012-09-13
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/Config",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare, dojoLang) {
	return dojoDeclare("core.js.views.PageToolbar", null, {
		// _id: String
		_id: null,

		// _i18n: Object
		_i18n: null,
		
		// _templates: Array
		_templates: [],
		
		// _templateDropDownButton: dijit.form.DropDownButton
		_templateDropDownButton: null,
		
		// _languageDropDownButton: dijit.form.DropDownButton
		_languageDropDownButton: null,
		
		// _saveOrderButton: dijit.form.Button
		_saveOrderButton: null,
		
		// criteria: Object
		criteria: {
			template: null,
			language: null
		},
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("core/languages");
			this._i18n = core.js.base.I18N.getLocalization("core/languages");
		},
		
		setTemplates: function(/*Array*/ templates) {
			// summary:
			//		Sets the array of available templates
			this._templates = templates;
			return this;	// core.js.views.PageToolbar
		},
		
		show: function() {
			// summary:
			//		Shows the toolbar
			var that = this;
			var toolbar = new dijit.Toolbar({}, this._id);
			
			// Add button
			toolbar.addChild(new dijit.form.Button({
				label: '<span class="app-icon app-icon-add"></span><br />' + this._i18n.global._share.addAction,
				showLabel: true,
				disabled: !core.js.base.controllers.ActionProvider.get("core_page_add").isAllowed,
				onClick: function(e) {
					that.onAddPage();
				}
			}));
			
			// Refresh button
			toolbar.addChild(new dijit.form.Button({
				label: '<span class="app-icon app-icon-refresh"></span><br />' + this._i18n.global._share.refreshAction,
				showLabel: true,
				disabled: !core.js.base.controllers.ActionProvider.get("core_page_list").isAllowed,
				onClick: function(e) {
					that.onRefresh();
				}
			}));
			
			toolbar.addChild(new dijit.ToolbarSeparator());
			
			// Save order button
			this._saveOrderButton = new dijit.form.Button({
				label: this._i18n.global._share.saveOrderAction,
				showLabel: true,
				disabled: !core.js.base.controllers.ActionProvider.get("core_page_order").isAllowed,
				onClick: function(e) {
					that.onSaveOrder();
				}
			});
			toolbar.addChild(this._saveOrderButton);
			
			// Template filter
			if (this._templates.length > 0) {
				var templatesMenu = new dijit.Menu();
				templatesMenu.addChild(new dijit.MenuItem({
					label: this._i18n.page.list.allTemplates,
					onClick: function(e) {
						that._templateDropDownButton.set("label", this.label);
						that.criteria.template = null;
						that.onSelectTemplate(null);
					}
				}));
				templatesMenu.addChild(new dijit.MenuSeparator());
				
				for (var i in this._templates) {
					templatesMenu.addChild(new dijit.MenuItem({
						appTemplate: this._templates[i],
						label: this._templates[i],
						onClick: function(e) {
							that._templateDropDownButton.set("label", this.label);
							that.criteria.template = this.appTemplate;
							that.onSelectTemplate(this.appTemplate);
						}
					}));
				}
				toolbar.addChild(new dijit.ToolbarSeparator());
				this._templateDropDownButton = new dijit.form.DropDownButton({
					label: this._i18n.page.list.allTemplates,
					showLabel: true,
					dropDown: templatesMenu
				});
				toolbar.addChild(this._templateDropDownButton);
			}
			
			// Language filter
			var languages = core.js.base.Config.get("core", "localization_languages");
			if (languages) {
				var languagesMenu = new dijit.Menu();
				languagesMenu.addChild(new dijit.MenuItem({
					label: this._i18n.global._share.allLanguages,
					onClick: function(e) {
						that._languageDropDownButton.set("label", this.label);
						that._languageDropDownButton.set("iconClass", null);
						that.criteria.language = null;
						that.onSwitchToLanguage(null);
					}
				}));
				languagesMenu.addChild(new dijit.MenuSeparator());
				
				for (var locale in languages) {
					languagesMenu.addChild(new dijit.MenuItem({
						appLocale: locale,
						label: languages[locale],
						iconClass: "app-icon app-flag-" + locale,
						onClick: function(e) {
							that._languageDropDownButton.set("label", this.label);
							that._languageDropDownButton.set("iconClass", this.iconClass);
							that.criteria.language = this.appLocale;
							that.onSwitchToLanguage(this.appLocale);
						}
					}));
				}
				this._languageDropDownButton = new dijit.form.DropDownButton({
					label: this._i18n.global._share.allLanguages,
					showLabel: true,
					dropDown: languagesMenu
				});
				toolbar.addChild(this._languageDropDownButton);
			}
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits controls with given criteria
			dojoLang.mixin(this.criteria, criteria);
			if (criteria.template && this._templateDropDownButton) {
				this._templateDropDownButton.set("label", criteria.template);
			}
			
			var languages = core.js.base.Config.get("core", "localization_languages");
			if (languages && criteria.language && this._languageDropDownButton) {
				this._languageDropDownButton.set("label", languages[criteria.language]);
				this._languageDropDownButton.set("iconClass", "app-icon app-flag-" + criteria.language);
			}
			
			this.allowToSaveOrder(this.criteria.template && this.criteria.language);
		},
		
		/* ========== CONTROL STATE OF CONTROLS ============================= */
		
		allowToSaveOrder: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to save order of pages
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("core_page_order").isAllowed;
			this._saveOrderButton.set("disabled", !isAllowed);
			return this;	// core.js.views.PageToolbar
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onAddPage: function() {
			// summary:
			//		Adds new page
			// tags:
			//		callback
		},
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of pages
			// tags:
			//		callback
		},
		
		onSaveOrder: function() {
			// summary:
			//		Updates the orders of pages
			// tags:
			//		callback
		},
		
		onSelectTemplate: function(/*String?*/ template) {
			// summary:
			//		Loads the list of pages in given template
			// tags:
			//		callback
		},
		
		onSwitchToLanguage: function(/*String?*/ language) {
			// summary:
			//		Loads the list of pages by given language
			// tags:
			//		callback
		}
	});
});
