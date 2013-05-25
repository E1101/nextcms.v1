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
 * @version		2012-09-05
 */

define([
	"dojo/_base/declare",
	"dojo/dom-style",
	"dojo/on",
	"dojo/sniff",
	"dijit/registry",
	"dojo/data/ItemFileReadStore",
	"dojo/parser",
	"dojo/query",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dojox/grid/EnhancedGrid",
	"dojox/grid/enhanced/plugins/DnD",
	"dojox/grid/enhanced/plugins/Menu",
	"dojox/grid/enhanced/plugins/NestedSorting",
	"dojox/widget/PlaceholderMenuItem",
	"core/js/base/Config",
	"core/js/base/I18N",
	"file/js/views/FileFormatter"
], function(dojoDeclare, dojoDomStyle, dojoOn, dojoSniff, dijitRegistry) {
	return dojoDeclare("file.js.views.AttachmentGrid", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _attachmentGrid: dojox.grid.EnhancedGrid
		_attachmentGrid: null,
		
		// _editMenuItem: dijit.MenuItem
		_editMenuItem: null,
		
		// _deleteMenuItem: dijit.MenuItem
		_deleteMenuItem: null,
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("file/languages");
			this._i18n = core.js.base.I18N.getLocalization("file/languages");
			
			this._createGrid();
		},
		
		_createGrid: function() {
			// summary:
			//		Creates the grid
			var that	  = this;
			var languages = core.js.base.Config.get("core", "localization_languages");
			
			// Columns
			var layout = [{
				field: "title",
				width: "300px",
				name: this._i18n.attachment._share.title,
				formatter: function(title) {
					return '<span>' + title + '</span>';
				}
			}, {
				field: "slug",
				width: "300px",
				name: this._i18n.attachment._share.slug
			}, {
				field: "hash",
				width: "300px",
				name: this._i18n.attachment._share.hash
			}, {
				field: "size",
				width: "150px",
				name: this._i18n.attachment._share.size,
				formatter: function(size) {
					return file.js.views.FileFormatter.formatSize(size, "0 byte");
				},
				styles: "text-align: right;"
			}, {
				field: "uploaded_date",
				width: "150px",
				name: this._i18n.attachment._share.uploadedDate
			}, {
				field: "language",
				width: "150px",
				name: this._i18n.attachment._share.language,
				formatter: function(language) {
					return languages ? language + " (" + languages[language] + ")" : language;
				}
			}, {
				field: "num_downloads",
				width: "150px",
				name: this._i18n.attachment._share.numDownloads
			}];
			
			// Header menu
			var headerMenu = new dijit.Menu();
			headerMenu.addChild(new dijit.MenuItem({
				label: this._i18n.attachment.list.showColumns,
				disabled: true
			}));
			headerMenu.addChild(new dijit.MenuSeparator());
			headerMenu.addChild(new dojox.widget.PlaceholderMenuItem({
				label: "GridColumns"
			}));
			headerMenu.startup();
			
			// Cell context menu
			var cellMenu = new dijit.Menu();
			
			// "Edit" menu item
			this._editMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.editAction,
				disabled: !core.js.base.controllers.ActionProvider.get("file_attachment_edit").isAllowed,
				onClick: function(e) {
					var rowIndex = that._attachmentGrid.selection.selectedIndex;
					var item = that._attachmentGrid.getItem(rowIndex);
					if (item) {
						that.onEditAttachment(item);
					}
				}
			});
			cellMenu.addChild(this._editMenuItem);
			
			// "Delete" menu item
			this._deleteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("file_attachment_delete").isAllowed,
				onClick: function(e) {
					var rowIndex = that._attachmentGrid.selection.selectedIndex;
					var item = that._attachmentGrid.getItem(rowIndex);
					if (item) {
						that.onDeleteAttachment(item);
					}
				}
			});
			cellMenu.addChild(this._deleteMenuItem);
			
			// "Localize" menu item
			if (languages) {
				var localizePopupMenu = new dijit.Menu();
				for (var locale in languages) {
					localizePopupMenu.addChild(new dijit.MenuItem({
						appLocale: locale,
						label: languages[locale],
						iconClass: "app-icon app-flag-" + locale,
						onClick: function(e) {
							var rowIndex = that._attachmentGrid.selection.selectedIndex;
							var item = that._attachmentGrid.getItem(rowIndex);
							if (item) {
								var translations = dojo.fromJson(item.translations[0]);
								if (translations[this.appLocale]) {
									that.onEditAttachment(translations[this.appLocale]);
								} else {
									that.onTranslateAttachment(item, this.appLocale);
								}
							}
						}
					}));
				}
				
				cellMenu.addChild(new dijit.MenuSeparator());
				cellMenu.addChild(new dijit.PopupMenuItem({
					label: this._i18n.global._share.localizeAction,
					popup: localizePopupMenu
				}));
			}
			
			// Create grid
			this._attachmentGrid = new dojox.grid.EnhancedGrid({
				clientSort: false,
				rowSelector: "20px",
				style: "visibility: hidden",
				structure: layout,
				plugins: {
					dnd: true,
					menus: {
						cellMenu: cellMenu,
						headerMenu: headerMenu
					},
					nestedSorting: true
				},
				loadingMessage: "<span class='dojoxGridLoading'>" + this._i18n.global._share.loadingAction  + "</span>",
				errorMessage: "<span class='dojoxGridError'>" + this._i18n.attachment.list.error + "</span>",
				noDataMessage: "<span class='dojoxGridNoData'>" + this._i18n.attachment.list.notFound + "</span>"
				// rowsPerPage: 40
			});
			this._attachmentGrid.placeAt(this._id);
			this._attachmentGrid.startup();
			
			dojoOn(this._attachmentGrid, "rowcontextmenu", function(e) {
				var item = this.getItem(e.rowIndex);
				if (item) {
					that.onRowContextMenu(item);
				}
			});
			
			// Show an icon to indicate password protected attachment
			dojoOn(this._attachmentGrid, "stylerow", function(row) {
				var item = this.getItem(row.index);
				if (item) {
					// Find the cell showing the attachment's title
					var attachmentNameNode = dojo.query('.dojoxGridCell[idx="0"] span', row.node);
					if (item.password_required[0] == true) {
						attachmentNameNode.addClass("fileAttachmentPasswordRequired");
					}
				}
			});
			
			// It is a workaround to fix the issue that the datagrid show
			// the scrollbar on Chrome
			if (!dojoSniff("ie")) {
				dijitRegistry.byId(this._id).resize();
			}
		},
		
		showAttachments: function(/*Object*/ attachments) {
			// summary:
			//		Shows the list of attachments
			var store = new dojo.data.ItemFileReadStore({
				data: attachments
			});
			dojoDomStyle.set(this._attachmentGrid.domNode, "visibility", "visible");
			this._attachmentGrid.setStore(store);
		},
		
		/* ========== UPDATE STATE OF CONTROLS ============================== */
		
		allowToDelete: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the attachment
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("file_attachment_delete").isAllowed;
			this._deleteMenuItem.set("disabled", !isAllowed);
			return this;	// file.js.views.AttachmentGrid
		},
		
		allowToEdit: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to edit the attachment
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("file_attachment_edit").isAllowed;
			this._editMenuItem.set("disabled", !isAllowed);
			return this;	// file.js.views.AttachmentGrid
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onDeleteAttachment: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Deletes given attachment
			// tags:
			//		callback
		},
		
		onEditAttachment: function(/*dojo.data.Item|String*/ item) {
			// summary:
			//		Edits given attachment
			// tags:
			//		callback
		},
		
		onRowContextMenu: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Called when right-click on attachment item
			// tags:
			//		callback
		},
		
		onTranslateAttachment: function(/*dojo.data.Item*/ item, /*String*/ language) {
			// summary:
			//		Translates given attachment item to other language
			// tags:
			//		callback
		}
	});
});
