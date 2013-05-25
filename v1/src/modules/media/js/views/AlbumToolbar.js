/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		media
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-30
 */

define([
	"dojo/_base/declare",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"dijit/form/TextBox",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/Config",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoDeclare) {
	return dojoDeclare("media.js.views.AlbumToolbar", null, {
		// _toolbar: dijit.Toolbar
		_toolbar: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _searchTextBox: dijit.form.TextBox
		_searchTextBox: null,
		
		// _languageDropDownButton: dijit.form.DropDownButton
		_languageDropDownButton: null,
		
		constructor: function(/*String*/ id) {
			this._toolbar = new dijit.Toolbar({}, id);
			
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
			
			// Add toolbar items
			var that = this;
			
			// Add button
			this._toolbar.addChild(new dijit.form.Button({
				label: this._i18n.album.list.newAlbumButton,
				showLabel: false,
				iconClass: "app-icon app-icon-add",
				disabled: !core.js.base.controllers.ActionProvider.get("media_album_add").isAllowed,
				onClick: function(e) {
					that.onAddAlbum();
				}
			}));
			
			// Refresh button
			this._toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				disabled: !core.js.base.controllers.ActionProvider.get("media_album_list").isAllowed,
				onClick: function(e) {
					that.onRefresh();
				}
			}));
			
			this._toolbar.addChild(new dijit.ToolbarSeparator());
			
			// Search control
			this._searchTextBox = new dijit.form.TextBox({
				style: "width: 100px",
				placeHolder: this._i18n.album.list.searchAlbumHelp
			});
			this._toolbar.addChild(this._searchTextBox);
			this._toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.searchAction,
				showLabel: false,
				iconClass: "app-icon app-icon-search",
				disabled: !core.js.base.controllers.ActionProvider.get("media_album_list").isAllowed,
				onClick: function(e) {
					var title = that._searchTextBox.get("value");
					that.onSearchAlbums(title);
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
				this._toolbar.addChild(new dijit.ToolbarSeparator());
				this._languageDropDownButton = new dijit.form.DropDownButton({
					label: this._i18n.global._share.language,
					showLabel: true,
					dropDown: languagesMenu
				});
				this._toolbar.addChild(this._languageDropDownButton);
			}
			
			// View in various modes
			var viewTypeDropDown = new dijit.form.DropDownButton({
				label: this._i18n.global._share.viewAsListAction,
				showLabel: false, 
				iconClass: "app-icon module-media-icon-list"
			});
			
			var viewTypeMenu = new dijit.Menu();
			viewTypeMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.viewAsListAction,
				iconClass: "app-icon module-media-icon-list",
				onClick: function() {
					viewTypeDropDown.set("iconClass", "app-icon module-media-icon-list");
					that.onChangeViewType("list");
				}
			}));
			viewTypeMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.viewAsGridAction,
				iconClass: "app-icon module-media-icon-grid",
				onClick: function() {
					viewTypeDropDown.set("iconClass", "app-icon module-media-icon-grid");
					that.onChangeViewType("grid");
				}
			}));
			viewTypeDropDown.dropDown = viewTypeMenu;
			this._toolbar.addChild(viewTypeDropDown);
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
		
		onAddAlbum: function() {
			// summary:
			//		This method is called when the adding album button is clicked
			// tags:
			//		callback
		},
		
		onChangeViewType: function(/*String*/ viewType) {
			// summary:
			//		This method is called when the view type is changed
			// viewType:
			//		Can be "grid" or "list"
			// tags:
			//		callback
		},
		
		onRefresh: function() {
			// summary:
			//		This method is called when the refresh button is clicked
			// tags:
			//		callback
		},
		
		onSearchAlbums: function(/*String*/ title) {
			// summary:
			//		This method is called when user search for albums
			// title:
			//		The album's title
			// tags:
			//		callback
		},
		
		onSwitchToLanguage: function(/*String?*/ language) {
			// summary:
			//		Loads the list of albums when switching to other language
			// tags:
			//		callback
		}
	});
});
