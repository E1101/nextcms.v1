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
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/io-query",
	"dojo/on",
	"dijit/registry",
	"dojo/parser",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dijit/Tree",
	"dijit/tree/dndSource",
	"dijit/tree/ForestStoreModel",
	"dojox/data/FileStore",
	"dojox/grid/enhanced/plugins/GridSource",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"	
], function(dojoArray, dojoDeclare, dojoAspect, dojoDom, dojoDomConstruct, dojoIoQuery, dojoOn, dijitRegistry) {
	return dojoDeclare("file.js.views.DirectoryTreeView", null, {
		// _id: String
		_id: null,
		
		// _rootTreeId: [readonly] String
		//		The string that is used to identicate the root node
		_rootTreeId: "DirectoryRoot",
		
		// _currentPath: String
		_currentPath: ".",
		
		// _parentNode: DomNode
		_parentNode: null,
		
		// _i18n: Object
		_i18n: null,
		
		// __connectionId: String
		_connectionId: null,
		
		// _tree: dijit.Tree
		_tree: null,
		
		// _selectedNode: dijit._TreeNode
		_selectedNode: null,
		
		// _hoverNode: dijit._TreeNode
		//		The tree node that mouse is over on
		_hoverNode: null,
		
		// _contextMenu: dijit.Menu
		_contextMenu: null,
		
		// _bookmarkMenuItem: dijit.MenuItem
		_bookmarkMenuItem: null,
		
		// _cutMenuItem: dijit.MenuItem
		_cutMenuItem: null,
		
		// _copyMenuItem: dijit.MenuItem
		_copyMenuItem: null,
		
		// _pasteMenuItem: dijit.MenuItem
		_pasteMenuItem: null,
		
		// _pasteWithoutOverwritingMenuItem: dijit.MenuItem
		_pasteWithoutOverwritingMenuItem: null,
		
		// _deleteMenuItem: dijit.Menu
		_deleteMenuItem: null,
		
		// _renameMenuItem: dijit.Menu
		_renameMenuItem: null,
		
		// _changePermissionsMenuItem: dijit.MenuItem
		_changePermissionsMenuItem: null,
		
		constructor: function(/*String*/ id) {
			this._id		 = id;
			this._parentNode = dojo.byId(id).parentNode;
			
			core.js.base.I18N.requireLocalization("file/languages");
			this._i18n = core.js.base.I18N.getLocalization("file/languages");
			
			this._createContextMenu();
		},
		
		setConnectionId: function(/*String*/ connectionId) {
			this._connectionId = connectionId;
			
			// I have to re-create the tree, because there is no way to reload the tree when the connection is changed
			this._createTree();
		},
		
		_createContextMenu: function() {
			// summary:
			//		Creates the context menu for the tree view
			var contextMenuId = this._id + "_ContextMenu";
			var div = dojoDomConstruct.create("div", {
				id: contextMenuId
			}, this._parentNode);
			this._contextMenu = new dijit.Menu({
				targetNodeIds: [ contextMenuId ]
			});

			var that = this;
			
			// Add directory item
			this._createMenuItem = new dijit.MenuItem({
				label: this._i18n.explorer._share.createDirectoryAction,
				iconClass: "app-icon fileExplorerAddFolderIcon",
				disabled: !core.js.base.controllers.ActionProvider.get("file_explorer_add").isAllowed,
				onClick: function() {
					if (that._selectedNode) {
						that.onCreateDirectory(that._selectedNode.item);
					}
				}
			});
			this._contextMenu.addChild(this._createMenuItem);
			
			// Bookmark menu item
			this._bookmarkMenuItem = new dijit.MenuItem({
				label: this._i18n.bookmark._share.bookmarkAction,
				iconClass: "app-icon app-icon-bookmark",
				disabled: !core.js.base.controllers.ActionProvider.get("file_bookmark_add").isAllowed,
				onClick: function(e) {
					if (that._selectedNode && that._selectedNode.item && that._selectedNode.item.directory) {
						that.onBookmarkDirectory(that._selectedNode.item);
					}
				}
			});
			this._contextMenu.addChild(this._bookmarkMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// Cut, copy, paste menu items
			this._cutMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.cutAction,
				disabled: !core.js.base.controllers.ActionProvider.get("file_explorer_move").isAllowed,
				onClick: function(e) {
					if (that._selectedNode) {
						that.onCutDirectory(that._selectedNode.item);
					}
				}
			});
			this._contextMenu.addChild(this._cutMenuItem);
			
			this._copyMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.copyAction,
				iconClass: "app-icon app-icon-copy",
				disabled: !core.js.base.controllers.ActionProvider.get("file_explorer_copy").isAllowed,
				onClick: function(e) {
					if (that._selectedNode) {
						that.onCopyDirectory(that._selectedNode.item);
					}
				}
			});
			this._contextMenu.addChild(this._copyMenuItem);
			
			this._pasteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.pasteAction,
				iconClass: "app-icon app-icon-paste",
				disabled: true,
				onClick: function(e) {
					if (that._selectedNode) {
						that.onPasteDirectory(that._selectedNode.item, true);
					}
				}
			});
			this._contextMenu.addChild(this._pasteMenuItem);
			
			this._pasteWithoutOverwritingMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.pasteWithoutOverwritingAction,
				iconClass: "app-icon app-icon-paste",
				disabled: true,
				onClick: function(e) {
					if (that._selectedNode) {
						that.onPasteDirectory(that._selectedNode.item, false);
					}
				}
			});
			this._contextMenu.addChild(this._pasteWithoutOverwritingMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// Refresh
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.refreshAction,
				iconClass: "app-icon app-icon-refresh",
				disabled: !core.js.base.controllers.ActionProvider.get("file_explorer_list").isAllowed,
				onClick: function() {
					that.show("", true);
				}
			}));
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// Delete directory item
			this._deleteMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.deleteAction,
				iconClass: "app-icon app-icon-delete",
				disabled: !core.js.base.controllers.ActionProvider.get("file_explorer_delete").isAllowed,
				onClick: function() {
					if (that._selectedNode) {
						that.onDeleteDirectory(that._selectedNode.item);
					}
				}
			});
			this._contextMenu.addChild(this._deleteMenuItem);
			
			// Rename directory item
			this._renameMenuItem = new dijit.MenuItem({
				label: this._i18n.global._share.renameAction,
		    	iconClass: "app-icon app-icon-rename",
		    	disabled: !core.js.base.controllers.ActionProvider.get("file_explorer_rename").isAllowed,
		    	onClick: function() {
		    		if (that._selectedNode) {
		    			that.onRenameDirectory(that._selectedNode.item);
		    		}
		    	}
			});
			this._contextMenu.addChild(this._renameMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// Upload item
			this._contextMenu.addChild(new dijit.MenuItem({
				label: this._i18n.global._share.uploadAction,
				iconClass: "app-icon app-icon-upload",
				disabled: !core.js.base.controllers.ActionProvider.get("file_explorer_upload").isAllowed,
				onClick: function() {
					if (that._selectedNode) {
						that.onUploadFile(that._selectedNode.item);
					}
				}
			}));
			
			// Change permissions item
			this._changePermissionsMenuItem = new dijit.MenuItem({
				label: this._i18n.explorer._share.changePermissionsAction,
				disabled: true,
				onClick: function(e) {
					if (that._selectedNode) {
						that.onChangePermissions(that._selectedNode.item);
					}
				}
			});
			this._contextMenu.addChild(this._changePermissionsMenuItem);
			
			dojoAspect.after(this._contextMenu, "_openMyself", function(e) {
				// DOJO LESSON: Get the enclosing widget based on the selected target
				var widget = dijitRegistry.getEnclosingWidget(e.target);
				if (widget && (widget instanceof dijit.Tree) && widget.selectedNode) {
					// If user click on the root node
					if (widget.selectedNode.item.root) {
						widget.selectedNode.item.path = ".";
					}
					that._selectedNode = widget.selectedNode;
					that.onNodeContextMenu(widget.selectedNode.item);
				}
			}, true);
		},
		
		_createTree: function() {
			// summary:
			//		Creates the directory tree
			var that   = this;
			var params = {
				format: "json",
				dirs_only: true,
				connection_id: this._connectionId
			};
			
			// Create store
			var store = new dojox.data.FileStore({
				url: core.js.base.controllers.ActionProvider.get("file_explorer_list").url + "?" + dojoIoQuery.objectToQuery(params),
				pathAsQueryParam: true
			});
			store.setValues = function(newParentItem, parentAttr, childItems) {
				// Do nothing
				// This method is required to make the tree draggable
			};
			
			// Create model
			var model = new dijit.tree.ForestStoreModel({
				store: store,
				query: "{}",
				rootLabel: this._i18n.explorer.list.rootDirectory,
				rootId: this._rootTreeId
			});
			
			// DOJO LESSON: After dragging a node and dropping it within the tree, the tree will call 
			// pasteItem() method of the model to update the data.
			// By this way, Dojo wants the Tree, Model, and Store to be synchronized together.
			// In my case, the store (dojox.data.FileStore) does not provide the write API, therefore I create 
			// an empty method to set the values to item as you see above:
			//
			//		store.setValues = function(newParentItem, parentAttr, childItems) {
			//			// Do nothing
			//		};
			//
			// and the data will be updated manually as follow:
			dojoAspect.after(model, "pasteItem", function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy) {
				// Do some simple logic checking before moving directory
				if (that._canMove(childItem, newParentItem)) {
					that.onMoveDirectories([ childItem ], newParentItem);
				}
			}, true);
			
			// DOJO LESSON: Don't need to override this method if I want to drag and drop within the tree.
			// The reason why it is here is that I want to drag the file from the grid and drop it on the tree.
			// Due to the flow of tree widget, it will call the newItem() from the tree model, which will make a request 
			// to the server to get the information of new item.
			// In my case, the Ajax request passes an invalid path of file (the value of "path" parameter is Id of dragged item, 
			// such as dojox_grid_EnhancedGrid_0_dndItem0)
			model.newItem = function(/* dojo.dnd.Item */ args, /*Item*/ parent, /*int?*/ insertIndex) {
				// Do nothing
			};
			
			// Create tree
			if (this._tree) {
				this._tree.destroyRecursive();
				this._tree = null;
			}
			var div = dojoDomConstruct.create("div", {
				id: this._id
			}, this._parentNode);
			
			this._tree = new dijit.Tree({
				model: model,
				showRoot: true,
				getIconClass: function(/*dojo.data.Item*/ item, /*Boolean*/ opened) {
					return (!item || this.model.mayHaveChildren(item)) ? (opened ? "dijitFolderOpened" : "dijitFolderClosed") : "dijitLeaf";
				},
				onClick: function(/*dojo.data.Item*/ item, /*TreeNode*/ node, /*Event*/ e) {
					that.onOpenDirectory(item);
				},
				style: "width: 100%; height: 100%",
				// DnD
				"class": "container",
				dndController: !core.js.base.controllers.ActionProvider.get("file_explorer_move").isAllowed ? "dijit.tree._dndSelector" : "dijit.tree.dndSource",
				checkAcceptance: function(source, nodes) {
					if (source instanceof dojox.grid.enhanced.plugins.GridDnDSource) {
						return true;
					}
					return (source.tree && source.tree.id == that._id);
				},
				checkItemAcceptance: function(node, source, position) {
					if (source instanceof dojox.grid.enhanced.plugins.GridDnDSource) {
						return true;
					}
					if (!source.tree || source.tree.id != that._id) {
						return false;
					}
					
					var targetNode = dijit.getEnclosingWidget(node);
					if (!targetNode) {
						return false;
					}
					var sourceItem = null;
					targetItem = targetNode.item;
					for (var i in source.selection) {
						sourceItem = source.selection[i].item;
					}
					
					return that._canMove(sourceItem, targetItem);
				}
			}, this._id);
			
			// Track the hover node
			dojoAspect.after(this._tree, "_onNodeMouseEnter", function(node) {
				that._hoverNode = node;
			}, true);
			dojoAspect.after(this._tree, "_onNodeMouseLeave", function(node) {
				that._hoverNode = null;
			}, true);
			
			// Allow to drag file from the grid to the tree
			var treeTarget = new dojox.grid.enhanced.plugins.GridSource(dojoDom.byId(this._id), {
				isSource: false,
				insertNodesForGrid: false
			});
			dojoOn(treeTarget, "dropgridrows", function(grid, rowIndexes) {
				// Determine the source items from the grid view
				var sourceItems = [];
				dojoArray.forEach(rowIndexes, function(rowIndex, index) {
					var item = grid.getItem(rowIndex);
					if (item) {
						sourceItems.push(item);
					}
				});
				
				var that = this;
				// The target item is already tracked by listening _onNodeMouseEnter() and _onNodeMouseLeave() events
				if (this._hoverNode) {
					var targetItem = this._hoverNode.item;
					
					var movableSourceItems = [];
					dojoArray.forEach(sourceItems, function(item, index) {
						if (that._canMove(item, targetItem)) {
							movableSourceItems.push(item);
						}
					});
					
					that.onMoveDirectories(movableSourceItems, targetItem);
				}
			});
			
			// Attach the context menu
			// DOJO LESSON: This is another way to show the context menu
			this._contextMenu.bindDomNode(this._tree.domNode);
		},
		
		disconnect: function() {
			// summary:
			//		Disconnects. It should be called after disconnecting
			if (this._tree) {
				this._tree.destroyRecursive();
				this._tree = null;
			}
		},
		
		show: function(/*String*/ path, /*Boolean*/ reload) {
			// summary:
			//		Shows the tree
			// path:
			//		If this parameter is passed, the tree will load the path
			// reload:
			//		If true, re-create the tree
			if (this._currentPath == path && reload === false) {
				return;
			}
			this._currentPath = path;
			
			if (reload) {
				this._createTree();
			}
			
			// Init the tree with given path
			// The valid call is:
			//		this._tree.set("path", ["DirectoryRoot", "./folder", "./folder/subFolder", "./folder/subFolder/subOfSubFolder"]);
			// where "DirectoryRoot" is rootId defined by the model
			if (path) {
				while ("." == path[0] || "/" == path[0]) {
					path = path.substring(1);
				}
				var paths = new Array(this._tree.model.rootId);
				if (path != "") {
					var str = ".";
					dojoArray.forEach(path.split('/'), function(folder, index) {
						str += "/" + folder;
						paths.push(str);
					});
				}
				this._tree.set("path", paths);
			}
		},
		
		_canMove: function(/*dojo.data.Item*/ sourceItem, /*dojo.data.Item*/ targetItem) {
			// summary:
			//		Checks if it is possible to move item or not
			// Do not allow to move to the current parent node,
			if (sourceItem.parentDir == targetItem.path) {
				return false;
			}
			// and its chidlren node
			if (targetItem.path.substr(0, sourceItem.path.length) == sourceItem.path) {
				return false;
			}
			return true;
		},
		
		/* ========== UPDATE STATE OF CONTROLS ============================== */

		allowToBookmark: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to bookmark the directory
			var that  = this;
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("file_bookmark_add").isAllowed;
			this._bookmarkMenuItem.set("label", this._i18n.bookmark._share.bookmarkAction);
			this._bookmarkMenuItem.set("disabled", !isAllowed);
			this._bookmarkMenuItem.onClick = function(e) {
				if (that._selectedNode && that._selectedNode.item && that._selectedNode.item.directory) {
					that.onBookmarkDirectory(that._selectedNode.item);
				}
			};
			return this;	// file.js.views.DirectoryTreeView
		},
		
		allowToChangePermissions: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to update the permissions on the directory
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("file_explorer_perm").isAllowed;
			this._changePermissionsMenuItem.set("disabled", !isAllowed);
			return this;	// file.js.views.DirectoryTreeView
		},
		
		allowToCopy: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to copy directory
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("file_explorer_copy").isAllowed;
			this._copyMenuItem.set("disabled", !isAllowed);
			return this;	// file.js.views.DirectoryTreeView
		},
		
		allowToCut: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to cut directory
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("file_explorer_move").isAllowed;
			this._cutMenuItem.set("disabled", !isAllowed);
			return this;	// file.js.views.DirectoryTreeView
		},
		
		allowToDelete: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete directory
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("file_explorer_delete").isAllowed;
			this._deleteMenuItem.set("disabled", !isAllowed);
			return this;	// file.js.views.DirectoryTreeView
		},
		
		allowToPaste: function(/*Boolean*/ isAllowed, /*String*/ action) {
			// summary:
			//		Allows/disallows to copy/move directory
			// action:
			//		Can be "copy" or "move"
			isAllowed = isAllowed && (("copy" == action) 
											  ? core.js.base.controllers.ActionProvider.get("file_explorer_copy").isAllowed
											  : core.js.base.controllers.ActionProvider.get("file_explorer_move").isAllowed);
			this._pasteMenuItem.set("disabled", !isAllowed);
			this._pasteWithoutOverwritingMenuItem.set("disabled", !isAllowed);
			return this;	// file.js.views.DirectoryTreeView
		},
		
		allowToRename: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to rename directory
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("file_explorer_rename").isAllowed;
			this._renameMenuItem.set("disabled", !isAllowed);
			return this;	// file.js.views.DirectoryTreeView
		},
		
		allowToUnbookmark: function() {
			// summary:
			//		Allows/disallows to remove bookmark of directory
			var that	  = this;
			var isAllowed = core.js.base.controllers.ActionProvider.get("file_bookmark_delete").url;
			this._bookmarkMenuItem.set("label", this._i18n.bookmark._share.unbookmarkAction);
			this._bookmarkMenuItem.set("disabled", !isAllowed);
			this._bookmarkMenuItem.onClick = function(e) {
				if (that._selectedNode && that._selectedNode.item && that._selectedNode.item.directory) {
					that.onUnbookmarkDirectory(that._selectedNode.item);
				}
			};
			return this;	// file.js.views.DirectoryTreeView
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onBookmarkDirectory: function(/*dojo.data.Item*/ item) {
			// tags:
			//		callback
		},
		
		onChangePermissions: function(/*dojo.data.Item*/ item) {
			// tags:
			//		callback
		},
		
		onCopyDirectory: function(/*dojo.data.Item*/ sourceItem) {
			// tags:
			//		callback
		},
		
		onCreateDirectory: function(/*dojo.data.Item*/ item) {
			// tags:
			//		callback
		},
		
		onCutDirectory: function(/*dojo.data.Item*/ sourceItem) {
			// tags:
			//		callback
		},
		
		onDeleteDirectory: function(/*dojo.data.Item*/ item) {
			// tags:
			//		callback
		},
		
		onMoveDirectories: function(/*dojo.data.Item[]*/ sourceItems, /*dojo.data.Item*/ targetItem) {
			// summary:
			//		This method is called after moving a directory node to other node
			// tags:
			//		callback
		},
		
		onNodeContextMenu: function(/*dojo.data.Item*/ item) {
			// tags:
			//		callback
		},
		
		onOpenDirectory: function(/*dojo.data.Item*/ item) {
			// tags:
			//		callback
		},

		onPasteDirectory: function(/*dojo.data.Item*/ targetItem, /*Boolean*/ overwrite) {
			// summary:
			//		This method is called when the Paste menu item is clicked
			// overwrite:
			//		If true, the action will overwrite the existent files
			// tags:
			//		callback
		},
		
		onRenameDirectory: function(/*dojo.data.Item*/ item) {
			// tags:
			//		callback
		},
		
		onUnbookmarkDirectory: function(/*dojo.data.Item*/ item) {
			// tags:
			//		callback
		},
		
		onUploadFile: function(/*dojo.data.Item*/ item) {
			// tags:
			//		callback
		}
	});
});
