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
	"dojo/aspect",
	"core/js/base/Config",
	"core/js/base/controllers/Subscriber"
], function(dojoArray, dojoDeclare, dojoAspect) {
	return dojoDeclare("file.js.controllers.ExplorerMediator", null, {
		// _connectionContextMenu: file.js.views.ConnectionContextMenu
		_connectionContextMenu: null,
		
		// _directoryTreeView: file.js.views.DirectoryTreeView
		_directoryTreeView: null,
		
		// _sourceItem: dojo.data.Item
		//		The source item in the cut/copy actions
		_sourceItem: null,
		
		// _fileToolbar: file.js.views.FileToolbar
		_fileToolbar: null,
		
		// _fileDataGrid: file.js.views.FileDataGrid
		_fileDataGrid: null,
		
		// _bookmarkListView: file.js.views.BookmarkListView
		_bookmarkListView: null,
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/file/js/controllers/ExplorerMediator",
		
		constructor: function() {
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
			
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/connection/connect/onConnected", this, "onConnected");
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/file/connection/disconnect/onDisconnected", this, "onDisconnected");
		},
		
		setConnectionContextMenu: function(/*file.js.views.ConnectionContextMenu*/ connectionContextMenu) {
			// summary:
			//		Sets the connection's context menu
			this._connectionContextMenu = connectionContextMenu;
			
			var that = this;
			dojoAspect.after(connectionContextMenu, "onContextMenu", function(connectionItemView) {
				var isConnected = connectionItemView.getConnection().is_connected;
				that._connectionContextMenu.allowToDelete(!isConnected);
			}, true);
		},
		
		setDirectoryTreeView: function(/*file.js.views.DirectoryTreeView*/ directoryTreeView) {
			// summary:
			//		Sets the directory tree view
			this._directoryTreeView = directoryTreeView;
			
			var that = this;
			dojoAspect.after(directoryTreeView, "onCutDirectory", function(sourceItem) {
				that._sourceItem = sourceItem;
				that._directoryTreeView.allowToPaste(true, "move");
			}, true);
			dojoAspect.after(directoryTreeView, "onCopyDirectory", function(sourceItem) {
				that._sourceItem = sourceItem;
				that._directoryTreeView.allowToPaste(true, "copy");
			}, true);
			dojoAspect.after(directoryTreeView, "onNodeContextMenu", function(item) {
				var canPaste = that._canPaste(item);
				that._directoryTreeView.allowToPaste(canPaste, "copy")
									   .allowToPaste(canPaste, "move")
									   // Don't allow to some actions to root
									   .allowToCut(!item.root)
									   .allowToCopy(!item.root)
									   .allowToRename(!item.root)
									   .allowToDelete(!item.root)
									   .allowToChangePermissions(!item.root);
			}, true);
		},
		
		setFileToolbar: function(/*file.js.views.FileToolbar*/ fileToolbar) {
			// summary:
			//		Sets the file toolbar
			this._fileToolbar = fileToolbar;
		},
		
		setFileDataGrid: function(/*file.js.views.FileDataGrid*/ fileDataGrid) {
			// summary:
			//		Sets the file grid
			this._fileDataGrid = fileDataGrid;
			
			var that = this;
			dojoAspect.after(fileDataGrid, "onCutFile", function(sourceItem) {
				that._sourceItem = sourceItem;
				that._fileDataGrid.allowToPaste(true, "move");
			}, true);
			dojoAspect.after(fileDataGrid, "onCopyFile", function(sourceItem) {
				that._sourceItem = sourceItem;
				that._fileDataGrid.allowToPaste(true, "copy");
			}, true);
			
			dojoAspect.after(fileDataGrid, "onRowContextMenu", function(item) {
				var canPaste	 = that._canPaste(item);
				
				var editableExts = core.js.base.Config.get("file", "editable_files");
				editableExts	 = editableExts.split(",");
				
				var viewableExts = core.js.base.Config.get("file", "viewable_files");
				viewableExts	 = viewableExts.split(",");
				
				var compressableExts   = core.js.base.Config.get("file", "compressable_files", "");
				var decompressableExts = core.js.base.Config.get("file", "decompressable_files", "");
				var isExtractAllowed   = !item.directory && decompressableExts != "" && dojoArray.indexOf(decompressableExts.split(","), item.extension) != -1;
				
				that._fileDataGrid.allowToCreateDirectory(item.directory)
								  .allowToPaste(canPaste, "copy")
								  .allowToPaste(canPaste, "move")
								  .allowToEdit(!item.directory && dojoArray.indexOf(editableExts, item.extension) != -1)
								  .allowToView(!item.directory && dojoArray.indexOf(viewableExts, item.extension) != -1)
								  .allowToCompress(compressableExts != "")
								  .allowToExtract(isExtractAllowed)
								  .allowToDownload(!item.directory)
								  .allowToUpload(item.directory);
			}, true);
		},
		
		setBookmarkListView: function(/*file.js.views.BookmarkListView*/ bookmarkListView) {
			// summary:
			//		Sets the bookmarks list view
			this._bookmarkListView = bookmarkListView;
			
			var that = this;
			if (this._fileDataGrid) {
				dojoAspect.after(this._fileDataGrid, "onRowContextMenu", function(item) {
					if (!item.directory) {
						that._fileDataGrid.allowToBookmark(false);
					} else {
						var bookmarkedPaths = that._bookmarkListView.getBookmarkedPaths();
						if (dojoArray.indexOf(bookmarkedPaths, item.path) == -1) {
							that._fileDataGrid.allowToBookmark(true);
						} else {
							that._fileDataGrid.allowToUnbookmark();
						}
					}
				}, true);
			}
			
			if (this._directoryTreeView) {
				dojoAspect.after(this._directoryTreeView, "onNodeContextMenu", function(item) {
					if (!item.directory) {
						that._directoryTreeView.allowToBookmark(false);
					} else {
						var bookmarkedPaths = this._bookmarkListView.getBookmarkedPaths();
						if (dojoArray.indexOf(bookmarkedPaths, item.path) == -1) {
							that._directoryTreeView.allowToBookmark(true);
						} else {
							that._directoryTreeView.allowToUnbookmark();
						}
					}
				}, true);
			}
		},
		
		_canPaste: function(/*dojo.data.Item*/ targetItem) {
			// summary:
			//		Check whether it is possible to perform pasting action or not
			if (!this._sourceItem
				|| "" == this._sourceItem.path || "." == this._sourceItem.path							// Source is the root
				|| !targetItem.directory																// Target is not a directory
				|| this._sourceItem.parentDir == targetItem.path										// Target is already the parent directory of the source
				|| this._sourceItem.path == targetItem.path												// Don't allow to paste to itself
				|| targetItem.path.substr(0, this._sourceItem.path.length) == this._sourceItem.path)	// Target is sub-directory of the source 
			{
				return false;
			}
			return true;
		},
		
		onConnected: function(/*Object*/ data) {
			// summary:
			//		Called after connecting
			if (this._fileToolbar) {
				this._fileToolbar.allowToList(true)
								 .allowToUpload(true);
			}
		},
		
		onDisconnected: function(/*String*/ connectionId) {
			// summary:
			//		Called after disconnecting
			if (this._fileToolbar) {
				this._fileToolbar.allowToList(false)
								 .allowToUpload(false);
			}
		}
	});
});
