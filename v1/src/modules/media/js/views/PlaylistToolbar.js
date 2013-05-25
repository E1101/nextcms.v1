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
	return dojoDeclare("media.js.views.PlaylistToolbar", null, {
		// _toolbar: dijit.Toolbar
		_toolbar: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _searchTextBox: dijit.form.TextBox
		_searchTextBox: null,
		
		// _languageDropDownButton: dijit.form.DropDownButton
		_languageDropDownButton: null,
		
		constructor: function(/*String*/ id) {
			core.js.base.I18N.requireLocalization("media/languages");
			this._i18n = core.js.base.I18N.getLocalization("media/languages");
			
			this._toolbar = new dijit.Toolbar({}, id);
			this._createToolbar();
		},
		
		_createToolbar: function() {
			// summary:
			//		Creates the toolbar
			// Add toolbar items
			var that = this;
			
			// Add button
			this._toolbar.addChild(new dijit.form.Button({
				label: this._i18n.playlist.list.newPlaylistButton,
				showLabel: false,
				iconClass: "app-icon app-icon-add",
				disabled: !core.js.base.controllers.ActionProvider.get("media_playlist_add").isAllowed,
				onClick: function(e) {
					that.onAddPlaylist();
				}
			}));
			
			// Refresh button
			this._toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				disabled: !core.js.base.controllers.ActionProvider.get("media_playlist_list").isAllowed,
				onClick: function(e) {
					that.onRefresh();
				}
			}));
			
			this._toolbar.addChild(new dijit.ToolbarSeparator());
			
			// Search control
			this._searchTextBox = new dijit.form.TextBox({
				style: "width: 100px",
				placeHolder: this._i18n.playlist.list.searchHelp
			});
			this._toolbar.addChild(this._searchTextBox);
			this._toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.searchAction,
				showLabel: false,
				iconClass: "app-icon app-icon-search",
				disabled: !core.js.base.controllers.ActionProvider.get("media_playlist_list").isAllowed,
				onClick: function(e) {
					var title = that._searchTextBox.get("value");
					that.onSearchPlaylists(title);
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
				iconClass: 'app-icon module-media-icon-list'
			});
			
			var viewTypeMenu = new dijit.Menu();
			viewTypeMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.viewAsListAction,
				iconClass: 'app-icon module-media-icon-list',
				onClick: function() {
					viewTypeDropDown.set("iconClass", "app-icon module-media-icon-list");
					that.onChangeViewType("list");
				}
			}));
			viewTypeMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.viewAsGridAction,
				iconClass: 'app-icon module-media-icon-grid',
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
		
		onAddPlaylist: function() {
			// summary:
			//		Adds new playlist
			// tags:
			//		callback
		},
		
		onChangeViewType: function(/*String*/ viewType) {
			// summary:
			//		Updates the view type
			// viewType:
			//		Can be "grid" or "list"
			// tags:
			//		callback
		},
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of playlists
			// tags:
			//		callback
		},
		
		onSearchPlaylists: function(/*String*/ title) {
			// summary:
			//		Searches for playlists by title
			// tags:
			//		callback
		},
		
		onSwitchToLanguage: function(/*String?*/ language) {
			// summary:
			//		Loads the list of playlists when switch to other language
			// tags:
			//		callback
		}
	});
});
