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
 * @version		2012-09-11
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/io-query",
	"dojo/request/iframe",
	"dojo/request/xhr",
	"dojo/parser",
	"dijit/InlineEditBox",
	"dijit/form/TextBox",
	"dojox/image/Lightbox",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/I18N",
	"core/js/base/views/Helper",
	"file/js/controllers/ExplorerMediator"
], function(dojoArray, dojoDeclare, dojoLang, dojoAspect, dojoIoQuery, dojoRequestIframe, dojoRequestXhr) {
	return dojoDeclare("file.js.controllers.ExplorerController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _path: String
		//		Store the current path
		_path: ".",
		
		// _connectionId: String
		_connectionId: null,
		
		// _copyData: Object
		//		Store the information for moving/copying actions. It contains two members:
		//		- items: Array, which each item contains the file data stored by each row in the grid
		//		- action: Can be "move", "copy"
		_copyData: {
			items: [],
			action: "copy"
		},
		
		// _mediator: file.js.controllers.ExplorerMediator
		_mediator: null,
		
		// _imageLightboxDialog: dojox.image.LightboxDialog
		//		It is used to preview the image
		_imageLightboxDialog: null,
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/file/js/controllers/ExplorerController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("file/languages");
			this._i18n = core.js.base.I18N.getLocalization("file/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
			
			this._mediator = new file.js.controllers.ExplorerMediator();
			
			this._imageLightboxDialog = new dojox.image.LightboxDialog({});
			this._imageLightboxDialog.startup();
		},
		
		/* ========== MANAGE CONNECTIONS ==================================== */
		
		// _connectionToolbar: file.js.views.ConnectionToolbar
		_connectionToolbar: null,
		
		// _connectionListView: file.js.views.ConnectionListView
		_connectionListView: null,
		
		// _connectionContextMenu: file.js.views.ConnectionContextMenu
		_connectionContextMenu: null,
		
		setConnectionToolbar: function(/*file.js.views.ConnectionToolbar*/ connectionToolbar) {
			// summary:
			//		Sets the connection toolbar
			this._connectionToolbar = connectionToolbar;
			
			// Add connection handler
			dojoAspect.after(connectionToolbar, "onAddConnection", dojoLang.hitch(this, "addConnection"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/connection/add/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/connection/add/onSuccess", this, function() {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.connection.add.success,
					type: "message"
				});
				this.reloadConnections();
			});
			
			return this;	// file.js.controllers.ExplorerController
		},
		
		setConnectionListView: function(/*file.js.views.ConnectionListView*/ connectionListView) {
			// summary:
			//		Sets the connections list view
			this._connectionListView = connectionListView;
			
			var that = this;
			// Show the context menu
			dojoAspect.after(connectionListView, "onMouseDown", function(connectionItemView) {
				if (that._connectionContextMenu) {
					that._connectionContextMenu.show(connectionItemView);
				}
			}, true);
			
			return this;	// file.js.controllers.ExplorerController
		},
		
		setConnectionContextMenu: function(/*file.js.views.ConnectionContextMenu*/ connectionContextMenu) {
			// summary:
			//		Sets the connection's context menu
			this._connectionContextMenu = connectionContextMenu;
			this._mediator.setConnectionContextMenu(connectionContextMenu);
			
			// Edit handler
			dojoAspect.after(connectionContextMenu, "onEditConnection", dojoLang.hitch(this, "editConnection"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/connection/edit/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/connection/edit/onComplete", this, function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.connection.edit[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				if ("APP_RESULT_OK" == data.result) {
					this.reloadConnections();
				}
			});
			
			// Delete handler
			dojoAspect.after(connectionContextMenu, "onDeleteConnection", dojoLang.hitch(this, "deleteConnection"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/connection/delete/onSuccess", this, function() {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.connection["delete"].success
				});
				this.reloadConnections();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/connection/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			
			// Rename
			dojoAspect.after(connectionContextMenu, "onRenameConnection", dojoLang.hitch(this, "renameConnection"), true);
			
			// Connect handler
			dojoAspect.after(connectionContextMenu, "onConnect", dojoLang.hitch(this, "connect"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/connection/connect/onConnected", this, "onConnected");

			// Disconnect handler
			dojoAspect.after(connectionContextMenu, "onDisconnect", dojoLang.hitch(this, "disconnect"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/connection/disconnect/onDisconnected", this, "onDisconnected");
			
			return this;	// file.js.controllers.ExplorerController
		},
		
		addConnection: function() {
			// summary:
			//		Adds new connection
			this._helper.showPane(core.js.base.controllers.ActionProvider.get("file_connection_add").url);
		},
		
		connect: function(/*media.js.views.ConnectionItemView*/ connectionItemView) {
			// summary:
			//		Connects to the server using information of given connection item
			this._connectionListView.setSelectedConnection(connectionItemView);
			
			var that		 = this;
			var connectionId = connectionItemView.getConnection().connection_id;
			this._helper.showStandby();
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("file_connection_connect").url, {
				data: {
					connection_id: connectionId
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				if ("APP_RESULT_OK" == data.result) {
					connectionItemView.getConnection().is_connected = true;
					dojoTopic.publish("/app/global/notification", {
						message: that._i18n.connection.connect.success
					});
					dojoTopic.publish("/app/file/connection/connect/onConnected", {
						connection_id: connectionId,
						path: data.path
					});
				} else {
					dojoTopic.publish("/app/global/notification", {
						message: that._i18n.connection.connect.error,
						type: "error"
					});
				}
			});
		},
		
		deleteConnection: function(/*media.js.views.ConnectionItemView*/ connectionItemView) {
			// summary:
			//		Deletes given connection item
			var params = {
				connection_id: connectionItemView.getConnection().connection_id
			};
			var url = core.js.base.controllers.ActionProvider.get("file_connection_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "fileConnectionDeleteDialog",
				title: this._i18n.connection["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		editConnection: function(/*media.js.views.ConnectionItemView*/ connectionItemView) {
			// summary:
			//		Edits given connection item
			var params = {
				connection_id: connectionItemView.getConnection().connection_id
			};
			var url = core.js.base.controllers.ActionProvider.get("file_connection_edit").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		},
		
		disconnect: function(/*media.js.views.ConnectionItemView*/ connectionItemView) {
			// summary:
			//		Disconnects given connection
			this._connectionListView.setSelectedConnection(null);
			
			var that		 = this;
			var connectionId = connectionItemView.getConnection().connection_id;
			this._helper.showStandby();
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("file_connection_disconnect").url, {
				data: {
					connection_id: connectionId
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				if ("APP_RESULT_OK" == data.result) {
					connectionItemView.getConnection().is_connected = false;
					dojoTopic.publish("/app/global/notification", {
						message: that._i18n.connection.disconnect.success
					});
					dojoTopic.publish("/app/file/connection/disconnect/onDisconnected", connectionId);
				} else {
					dojoTopic.publish("/app/global/notification", {
						message: that._i18n.connection.disconnect.error,
						type: "error"
					});
				}
			});
		},
		
		reloadConnections: function() {
			// summary:
			//		Reloads the list of connections
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("file_connection_list").url, {
				method: "POST"
			}).then(function(data) {
				that._connectionListView.setContent(data);
			});
		},
		
		renameConnection: function(/*media.js.views.ConnectionItemView*/ connectionItemView) {
			// summary:
			//		Renames given connection item
			var that		 = this;
			var connectionId = connectionItemView.getConnection().connection_id;
			
			if (!connectionItemView.nameEditBox) {
				connectionItemView.nameEditBox = new dijit.InlineEditBox({
					editor: "dijit.form.TextBox",
					autoSave: true,
					disabled: false,
					editorParams: {
						required: true
					},
					onChange: function(newName) {
						this.set("disabled", true);
						if (newName != "") {
							dojoRequestXhr(core.js.base.controllers.ActionProvider.get("file_connection_rename").url, {
								data: {
									connection_id: connectionId,
									name: newName
								},
								handleAs: "json",
								method: "POST"
							}).then(function(data) {
								if ("APP_RESULT_OK" == data.result) {
									connectionItemView.getConnection().name = newName;
									dojoTopic.publish("/app/global/notification", {
										message: that._i18n.connection.rename.success
									});
								}
							});
						}
					}, 
					onCancel: function() {
						this.set("disabled", true);
					}
				}, connectionItemView.getNameNode());
			}
			connectionItemView.nameEditBox.set("disabled", false);
			connectionItemView.nameEditBox.startup();
			connectionItemView.nameEditBox.edit();
		},
		
		/* ========== MANAGE DIRECTORIES ==================================== */
		
		// _directoryTreeView: file.js.views.DirectoryTreeView
		_directoryTreeView: null,
		
		setDirectoryTreeView: function(/*file.js.views.DirectoryTreeView*/ directoryTreeView) {
			// summary:
			//		Sets the directory tree view
			this._directoryTreeView = directoryTreeView;
			this._mediator.setDirectoryTreeView(directoryTreeView);
			
			var that = this;
			dojoAspect.after(directoryTreeView, "onOpenDirectory", function(item) {
				// When click on the directory to browse, reset the search criteria
				if (that._fileDataGrid) {
					that._fileDataGrid.resetSearchCriteria();
				}
				that.gotoPath(item.path);
			}, true);
			
			// Create new directory handler
			dojoAspect.after(directoryTreeView, "onCreateDirectory", dojoLang.hitch(this, "createDirectory"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/add/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/add/onError", this, function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer.add.error,
					type: "error"
				});
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/add/onSuccess", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer.add.success,
					type: "message"
				});
				this.gotoPath(data.path, true);
			});
			
			// Add, remove bookmark handler
			dojoAspect.after(directoryTreeView, "onBookmarkDirectory", dojoLang.hitch(this, "bookmarkDirectory"), true);
			dojoAspect.after(directoryTreeView, "onUnbookmarkDirectory", function(item) {
				if (item.directory) {
					that.unbookmarkDirectory(item.path);
				}
			}, true);
			
			// Cut, copy, paste handlers
			dojoAspect.after(directoryTreeView, "onCutDirectory", dojoLang.hitch(this, "cutFile"), true);
			dojoAspect.after(directoryTreeView, "onCopyDirectory", dojoLang.hitch(this, "copyFile"), true);
			dojoAspect.after(directoryTreeView, "onPasteDirectory", dojoLang.hitch(this, "pasteFile"), true);
			dojoAspect.after(directoryTreeView, "onMoveDirectories", function(sourceItems, targetItem) {
				that._copyData = {
					items: sourceItems,
					action: "move"
				};
				that.pasteFile(targetItem, true);
			}, true);
			
			// Delete directory handler
			dojoAspect.after(directoryTreeView, "onDeleteDirectory", dojoLang.hitch(this, "deleteFile"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/delete/onError", this, function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer["delete"].error,
					type: "error"
				});
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/delete/onSuccess", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer["delete"].success,
					type: "message"
				});
				this.gotoPath(data.path, true);
			});
			
			// Rename handler
			dojoAspect.after(directoryTreeView, "onRenameDirectory", dojoLang.hitch(this, "renameFile"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/rename/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/rename/onError", this, function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer.rename.error,
					type: "error"
				});
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/rename/onSuccess", this, function(/*Object*/ data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer.rename.success,
					type: "message"
				});
				
				var path = (data.directory) 
						 ? data.path + "/" + data.name		// If I have just renamed a directory
						 : data.path;						// If I have just renamed a file
				this.gotoPath(path, true);
			});
			
			// Upload handler
			dojoAspect.after(directoryTreeView, "onUploadFile", dojoLang.hitch(this, "uploadFile"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/upload/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/upload/onSuccess", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer.upload.success,
					type: "message"
				});
				if (data.length > 0) {
					this.gotoPath(data[0].path);
				}
			});
			
			// Change permissions handler
			dojoAspect.after(directoryTreeView, "onChangePermissions", dojoLang.hitch(this, "changePermissions"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/perm/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/perm/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/perm/onError", this, function(data) {
				this._helper.closeDialog();
				this._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer.perm.error,
					type: "error"
				});
				this.gotoPath(this._path);
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/perm/onSuccess", this, function(data) {
				this._helper.closeDialog();
				this._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer.perm.success,
					type: "message"
				});
				this.gotoPath(this._path);
			});
			
			return this;	// file.js.controllers.ExplorerController
		},
		
		createDirectory: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Creates new directory
			var params = {
				connection_id: this._connectionId,
				path: item.path
			};
			var url = core.js.base.controllers.ActionProvider.get("file_explorer_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "fileExplorerAddDialog",
				title: this._i18n.explorer.add.title,
				style: "width: 300px",
				refreshOnShow: true
			});
		},
		
		/* ========== MANAGE FILES ========================================== */
		
		// _fileDataGrid: file.js.views.FileDataGrid
		_fileDataGrid: null,
		
		// _fileToolbar: file.js.views.FileToolbar
		_fileToolbar: null,
		
		// _pathBreadcrumb:file.js.views.PathBreadcrumb
		_pathBreadcrumb: null,
		
		setFileDataGrid: function(/*file.js.views.FileDataGrid*/ fileDataGrid) {
			// summary:
			//		Sets the file grid
			this._fileDataGrid = fileDataGrid;
			this._mediator.setFileDataGrid(fileDataGrid);
			
			var that = this;
			dojoAspect.after(fileDataGrid, "onOpenDirectory", dojoLang.hitch(this, "gotoPath"), true);
			
			// Create directory handler
			dojoAspect.after(fileDataGrid, "onCreateDirectory", dojoLang.hitch(this, "createDirectory"), true);
			
			// Bookmark handler
			dojoAspect.after(fileDataGrid, "onBookmarkDirectory", dojoLang.hitch(this, "bookmarkDirectory"), true);
			dojoAspect.after(fileDataGrid, "onUnbookmarkDirectory", function(item) {
				if (item.directory) {
					that.unbookmarkDirectory(item.path);
				}
			}, true);
			
			// Cut/copy/paste handler
			dojoAspect.after(fileDataGrid, "onCutFile", dojoLang.hitch(this, "cutFile"), true);
			dojoAspect.after(fileDataGrid, "onCopyFile", dojoLang.hitch(this, "copyFile"), true);
			dojoAspect.after(fileDataGrid, "onPasteFile", dojoLang.hitch(this, "pasteFile"), true);
			
			// Edit handler
			dojoAspect.after(fileDataGrid, "onEditFile", dojoLang.hitch(this, "editFile"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/edit/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/edit/onError", this, function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer.edit.error,
					type: "error"
				});
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/edit/onSuccess", this, function(data) {
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer.edit.success,
					type: "message"
				});
			});
			
			// View file handler
			dojoAspect.after(fileDataGrid, "onViewFile", dojoLang.hitch(this, "viewFile"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/view/onCancel", this, function() {
				this._helper.removePane();
			});
			
			// Delete handler
			dojoAspect.after(fileDataGrid, "onDeleteFile", dojoLang.hitch(this, "deleteFile"), true);
			
			// Rename handler
			dojoAspect.after(fileDataGrid, "onRenameFile", dojoLang.hitch(this, "renameFile"), true);
			
			// Compress handler
			dojoAspect.after(fileDataGrid, "onCompressFile", dojoLang.hitch(this, "compressFile"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/compress/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/compress/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/compress/onComplete", this, function(data) {
				this._helper.closeDialog();
				this._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer.compress[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				this.gotoPath(data.path, true);
			});
			
			// Extract handler
			dojoAspect.after(fileDataGrid, "onExtractFile", dojoLang.hitch(this, "extractFile"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/extract/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/extract/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/explorer/extract/onComplete", this, function(data) {
				this._helper.closeDialog();
				this._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.explorer.extract[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				this.gotoPath(data.path, true);
			});
			
			// Download handler
			dojoAspect.after(fileDataGrid, "onDownloadFile", dojoLang.hitch(this, "downloadFile"), true);
			
			// Upload handler
			dojoAspect.after(fileDataGrid, "onUploadFile", dojoLang.hitch(this, "uploadFile"), true);
			
			// Change permissions handler
			dojoAspect.after(fileDataGrid, "onChangePermissions", dojoLang.hitch(this, "changePermissions"), true);
			
			return this;	// file.js.controllers.ExplorerController
		},
		
		setFileToolbar: function(/*file.js.views.FileToolbar*/ fileToolbar) {
			// summary:
			//		Sets the file toolbar
			this._fileToolbar = fileToolbar;
			this._mediator.setFileToolbar(fileToolbar);
			
			var that = this;
			dojoAspect.after(fileToolbar, "onGotoPath", dojoLang.hitch(this, "gotoPath"), true);
			
			// Refresh handler
			dojoAspect.after(fileToolbar, "onRefresh", function() {
				that.gotoPath(that._path);
			});
			
			// Upload handler
			dojoAspect.after(fileToolbar, "onUploadFile", function() {
				that.uploadFile({ path: that._path });
			});
			
			// Filter handler
			dojoAspect.after(fileToolbar, "onSetShowingFilesOnly", function(showFilesOnly) {
				if (that._fileDataGrid) {
					that._fileDataGrid.setSearchCriteria({ files_only: showFilesOnly });
					that.gotoPath(that._path);
				}
			}, true);
			dojoAspect.after(fileToolbar, "onSetShowingHiddenFiles", function(showHiddenFiles) {
				if (that._fileDataGrid) {
					that._fileDataGrid.setSearchCriteria({ hidden_files: showHiddenFiles });
					that.gotoPath(that._path);
				}
			}, true);
			
			// Search handler
			dojoAspect.after(fileToolbar, "onSearchFiles", function(searchCriteria) {
				if (that._fileDataGrid) {
					that._fileDataGrid.setSearchCriteria(searchCriteria);
					that.gotoPath(that._path);
				}
			}, true);
			
			return this;	// file.js.controllers.ExplorerController
		},
		
		setPathBreadcrumb: function(/*file.js.views.PathBreadcrumb*/ pathBreadcrumb) {
			// summary:
			//		Sets the path breadcrumb
			this._pathBreadcrumb = pathBreadcrumb;
			dojoAspect.after(pathBreadcrumb, "onGotoPath", dojoLang.hitch(this, "gotoPath"), true);
			
			return this;	// file.js.controllers.ExplorerController
		},
		
		changePermissions: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Sets the permissions to given file/directory
			var params = {
				connection_id: this._connectionId,
				path: item.path,
				perms: item.perms
			};
			var url = core.js.base.controllers.ActionProvider.get("file_explorer_perm").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "fileExplorerPermDialog",
				title: this._i18n.explorer.perm.title,
				style: "width: 350px",
				refreshOnShow: true
			});
		},
		
		compressFile: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Compress given file
			var params = {
				connection_id: this._connectionId,
				path: item.path
			};
			var url = core.js.base.controllers.ActionProvider.get("file_explorer_compress").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "fileExplorerCompressDialog",
				title: this._i18n.explorer.compress.title,
				style: "width: 300px",
				refreshOnShow: true
			});
		},
		
		copyFile: function(/*dojo.data.Item*/ sourceItem) {
			// summary:
			//		Copies file
			this._copyData = {
				items: [ sourceItem ],
				action: "copy"
			};
		},
		
		cutFile: function(/*dojo.data.Item*/ sourceItem) {
			// summary:
			//		Moves file
			this._copyData = {
				items: [ sourceItem ],
				action: "move"
			};
		},
		
		deleteFile: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Deletes file
			var params = {
				connection_id: this._connectionId,
				path: item.path,
				directory: item.directory
			};
			var url = core.js.base.controllers.ActionProvider.get("file_explorer_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "fileExplorerDeleteDialog",
				title: this._i18n.explorer["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		downloadFile: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Downloads file
			if (item.directory) {
				return;
			}
			// FIXME: There is an loading issue in the console
			dojoRequestIframe(core.js.base.controllers.ActionProvider.get("file_explorer_download").url, {
				data: {
					connection_id: this._connectionId,
					path: item.path
				},
				method: "POST"
			});
		},
		
		editFile: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Edits file
			if (item.directory) {
				return;
			}
			var params = {
				connection_id: this._connectionId,
				path: item.path
			};
			var url = core.js.base.controllers.ActionProvider.get("file_explorer_edit").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url);
		},
		
		extractFile: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Extracts compressed file
			var params = {
				connection_id: this._connectionId,
				path: item.path
			};
			var url = core.js.base.controllers.ActionProvider.get("file_explorer_extract").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "fileExplorerExtractDialog",
				title: this._i18n.explorer.extract.title,
				style: "width: 300px",
				refreshOnShow: true
			});
		},
		
		pasteFile: function(/*dojo.data.Item*/ targetItem, /*Boolean*/ overwrite) {
			// summary:
			//		Copies or moves file
			var sourceItems = this._copyData.items;
			if (!sourceItems || sourceItems.length == 0) {
				return;
			}
			
			// Make a client check to determine which file can be copied/moved
			if (!targetItem.directory) {
				// Target is not a directory
				return;
			}
			
			var sourcePaths = [];
			dojoArray.forEach(sourceItems, function(item, index) {
				if ("" == item.path || "." == item.path								// Source is the root directory
					|| item.parentDir == targetItem.path							// Target is already the parent directory of the source
					|| item.path == targetItem.path									// The source and the target are the same
					|| targetItem.path.substr(0, item.path.length) == item.path)	// Target is sub-directory of the source 
				{
					// It is not able to copy/move the source item
				} else {
					sourcePaths.push(item.path);
				}
			});
			if (sourcePaths.length == 0) {
				return;
			}
			
			var action = this._copyData.action;
			var route  = ("copy" == action) ? "file_explorer_copy" : "file_explorer_move";
			var url	   = core.js.base.controllers.ActionProvider.get(route).url;
			var that   = this;
			this._helper.showStandby();
			
			dojoRequestXhr(url, {
				data: {
					connection_id: this._connectionId,
					"source_paths[]": sourcePaths,
					target_path: targetItem.path,
					overwrite: overwrite
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.explorer[action][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					that.gotoPath(targetItem.path, true);
				}
			});
		},
		
		renameFile: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Renames file
			var params = {
				connection_id: this._connectionId,
				directory: item.directory,
				path: item.path
			};
			var url = core.js.base.controllers.ActionProvider.get("file_explorer_rename").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "fileExplorerRenameDialog",
				title: this._i18n.explorer.rename.title,
				style: "width: 300px",
				refreshOnShow: true
			});
		},
		
		uploadFile: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Uploads file
			var params = {
				connection_id: this._connectionId,
				path: item.path
			};
			var url = core.js.base.controllers.ActionProvider.get("file_explorer_upload").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "fileExplorerUploadDialog",
				title: this._i18n.explorer.upload.title,
				style: "width: 350px",
				refreshOnShow: true
			});
		},
		
		viewFile: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Views file
			if (item.directory) {
				return;
			}
			var params = {
				connection_id: this._connectionId,
				path: item.path
			};
			var url = core.js.base.controllers.ActionProvider.get("file_explorer_view").url + "?" + dojoIoQuery.objectToQuery(params);
			
			// If user view an image, show a preview dialog
			var that = this;
			if (dojoArray.indexOf(["bmp", "gif", "jpeg", "jpg", "png"], item.extension.toLowerCase()) != -1) {
				this._helper.showStandby();
				dojoRequestXhr(url, {
					handleAs: "json",
					method: "POST"
				}).then(function(data) {
					that._helper.hideStandby();
					that._imageLightboxDialog.show({
						title: data.title,
						href: data.url
					});
				});
			} else {
				// The file might be a text file, show its content in a pane
				this._helper.showPane(url);
			}
		},
		
		/* ========== MANAGE BOOKMARKS ====================================== */
		
		// _bookmarkListView: file.js.views.BookmarkListView
		_bookmarkListView: null,
		
		setBookmarkListView: function(/*file.js.views.BookmarkListView*/ bookmarkListView) {
			// summary:
			//		Sets the bookmarks list view
			this._bookmarkListView = bookmarkListView;
			this._mediator.setBookmarkListView(bookmarkListView);
			
			var that = this;
			// Go to the associating directory when clicking on the bookmark item
			dojoAspect.after(bookmarkListView, "onClickBookmark", function(bookmarkItemView) {
				var bookmark = bookmarkItemView.getBookmark();
				that.gotoPath(bookmark.path);
			}, true);
			
			// Remove the bookmark when clicking on the Star icon
			dojoAspect.after(bookmarkListView, "onUnbookmarkDirectory", function(bookmarkItemView) {
				that.unbookmarkDirectory(bookmarkItemView.getBookmark().path);
			}, true);
			
			// Allow to drag the directory from the grid to the list of bookmarks
			dojoAspect.after(bookmarkListView, "onBookmarkDirectory", dojoLang.hitch(this, "bookmarkDirectory"), true);
			
			// Rename handler
			dojoAspect.after(bookmarkListView, "onRenameBookmark", dojoLang.hitch(this, "renameBookmark"), true);
			
			return this;	// file.js.controllers.ExplorerController
		},
		
		bookmarkDirectory: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Bookmark given directory
			if (!item.directory) {
				return;
			}
			this._helper.showStandby();
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("file_bookmark_add").url, {
				data: {
					connection_id: this._connectionId,
					path: item.path
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.bookmark.add[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				if ("APP_RESULT_OK" == data.result) {
					that.reloadBookmarks();
				}
			});
		},
		
		reloadBookmarks: function() {
			// summary:
			//		Reloads the list of bookmarks
			if (!this._bookmarkListView) {
				return;
			}
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("file_bookmark_list").url, {
				data: {
					connection_id: this._connectionId
				},
				method: "POST"
			}).then(function(data) {
				that._bookmarkListView.setContent(data);
			});
		},
		
		renameBookmark: function(/*file.js.views.BookmarkItemView*/ bookmarkItemView) {
			// summary:
			//		Renames given bookmark
			var bookmark = bookmarkItemView.getBookmark();
			var that = this;
			if (!bookmarkItemView.nameEditBox) {
				bookmarkItemView.nameEditBox = new dijit.InlineEditBox({
					editor: "dijit.form.TextBox", 
					autoSave: true, 
					disabled: false,
					editorParams: {
						required: true
					},
					onChange: function(newName) {
						this.set("disabled", true);
						if (newName != "") {
							dojoRequestXhr(core.js.base.controllers.ActionProvider.get("file_bookmark_rename").url, {
								data: {
									bookmark_id: bookmark.bookmark_id,
									name: newName
								},
								handleAs: "json",
								method: "POST"
							}).then(function(data) {
								dojoTopic.publish("/app/global/notification", {
									message: that._i18n.bookmark.rename[("APP_RESULT_OK" == data.result) ? "success" : "error"],
									type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
								});
								
								if ("APP_RESULT_OK" == data.result) {
									bookmark.name = newName;
								}
							});
						}
					}, 
					onCancel: function() {
						this.set("disabled", true);
					}
				}, bookmarkItemView.getBookmarkNameNode());
			}
			bookmarkItemView.nameEditBox.set("disabled", false);
			bookmarkItemView.nameEditBox.startup();
			bookmarkItemView.nameEditBox.edit();
		},
		
		unbookmarkDirectory: function(/*String*/ path) {
			// summary:
			//		Unbookmarks given directory
			this._helper.showStandby();
			var that = this;
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("file_bookmark_delete").url, {
				data: {
					connection_id: this._connectionId,
					path: path
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.bookmark["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				if ("APP_RESULT_OK" == data.result) {
					that.reloadBookmarks();
				}
			});
		},
		
		/* ========== SUBSCRIBE TOPICS ====================================== */
		
		gotoPath: function(/*String*/ path, /*Boolean*/ reload) {
			// summary:
			//		Updates the directory tree, file grid and other controls when setting the current path
			// path:
			//		The sub-path to the directory
			// reload:
			//		If true, then some controls need to reload
			
			// There is another way that I don't have to check if the view instance already exist or not.
			// Instead of checking 
			//		if (this._directoryTreeView) {
			//		...
			//		}
			// I can use dojoAspect.after to handle the method when setting the view instance:
			//		setDirectoryTreeView: function(directoryTreeView) {
			//			this._directoryTreeView = directoryTreeView;
			//			dojoAspect.after(this, "gotoPath", directoryTreeView, function(path, reload) {
			//				directoryTreeView.show(path, reload);
			//			});
			//		}
			
			this._path = path;
			if (this._directoryTreeView) {
				this._directoryTreeView.show(path, reload);
			}
			if (this._fileDataGrid) {
				this._fileDataGrid.show(path);
			}
			if (this._fileToolbar) {
				this._fileToolbar.addPathToHistory(path);
			}
			if (this._pathBreadcrumb) {
				this._pathBreadcrumb.show(path);
			}
		},
		
		onConnected: function(/*Object*/ data) {
			// summary:
			//		Called after connecting
			this._connectionId = data.connection_id;
			if (this._directoryTreeView) {
				this._directoryTreeView.setConnectionId(this._connectionId);
			}
			if (this._fileDataGrid) {
				this._fileDataGrid.setConnectionId(this._connectionId);
			}
			this.reloadBookmarks();
			
			var path = data.path;
			this.gotoPath(!path ? "." : path);
		},
		
		onDisconnected: function(/*String*/ connectionId) {
			// summary:
			//		Called after disconnecting
			this._helper.removePane();
			this._helper.closeDialog();
			
			this._connectionId = null;
			this._path = ".";
			if (this._directoryTreeView) {
				this._directoryTreeView.disconnect();
			}
			if (this._fileDataGrid) {
				this._fileDataGrid.disconnect();
			}
			if (this._pathBreadcrumb) {
				this._pathBreadcrumb.disconnect();
			}
			if (this._fileToolbar) {
				this._fileToolbar.resetPathHistory();
			}
			if (this._bookmarkListView) {
				this._bookmarkListView.setContent("");
			}
		}
	});
});
