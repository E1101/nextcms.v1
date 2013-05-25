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
 * @version		2012-09-14
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/aspect",
	"dojo/dom",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-attr",
	"dojo/json",
	"dijit/registry",
	"dojo/data/ItemFileWriteStore",
	"dojo/NodeList-traverse",
	"dojo/parser",
	"dojo/query",
	"dijit/Menu",
	"dijit/MenuItem",
	"dijit/MenuSeparator",
	"dijit/PopupMenuItem",
	"dijit/Tree",
	"dijit/tree/dndSource",
	"dijit/tree/ForestStoreModel",
	"dojox/fx",
	"dojox/string/sprintf",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/LayoutConstant"
], function(dojoArray, dojoDeclare, dojoAspect, dojoDom, dojoDomClass, dojoDomConstruct, dojoDomAttr, dojoJson, dijitRegistry) {
	return dojoDeclare("core.js.views.LayoutTreeView", null, {
		// _id: String
		//		Id of container
		_id: null,
		
		// _parentNode: DomNode
		_parentNode: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _tree: dijit.Tree
		_tree: null,
		
		// _selectedNode: dijit._TreeNode
		_selectedNode: null,
		
		// _layoutContainer: core.js.views.LayoutContainer
		_layoutContainer: null,
		
		// _contextMenu: dijit.Menu
		_contextMenu: null,
		
		// _insertBorderContainerMenu: dijit.Menu
		_insertBorderContainerMenu: null,
		
		// _deleteBorderContainerMenuItem: dijit.MenuItem
		_deleteBorderContainerMenuItem: null,
		
		// _layoutBorderContainerMenu: dijit.Menu
		_layoutBorderContainerMenu: null,
		
		// _insertGridContainerMenuItem: dijit.MenuItem
		_insertGridContainerMenuItem: null,
		
		// _setGridColumnsMenu: dijit.Menu
		_setGridColumnsMenu: null,
		
		// _deleteGridContainerMenuItem: dijit.MenuItem
		_deleteGridContainerMenuItem: null,
		
		// _gridColumnSettings: Object
		_gridColumnSettings: {
			minGridColumns: 1,
			maxGridColumns: 10
		},
		
		// _insertTabContainerMenuItem: dijit.MenuItem
		_insertTabContainerMenuItem: null,
		
		// _deleteTabContainerMenuItem: dijit.MenuItem
		_deleteTabContainerMenuItem: null,
		
		// _activateTabContainerMenuItem: dijit.MenuItem
		_activateTabContainerMenuItem: null,
		
		// _insertMainContentPaneMenuItem: dijit.MenuItem
		_insertMainContentPaneMenuItem: null,
		
		// _deleteMainContentPaneMenuItem: dijit.MenuItem
		_deleteMainContentPaneMenuItem: null,
		
		// _collapseMenuItem: dijit.MenuItem
		_collapseMenuItem: null,
		
		// _expandMenuItem: dijit.MenuItem
		_expandMenuItem: null,
		
		// _deletePortletMenuItem: dijit.MenuItem
		_deletePortletMenuItem: null,
		
		// _setFiltersMenuItem: dijit.MenuItem
		_setFiltersMenuItem: null,
		
		// _locateMenuItem: dijit.MenuItem
		_locateMenuItem: null,
		
		// _propertiesMenuItem: dijit.MenuItem
		_propertiesMenuItem: null,
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/core/js/views/LayoutTreeView",
		
		constructor: function(/*String*/ id, /*core.js.views.LayoutContainer*/ layoutContainer) {
			// summary:
			//		Creates new tree view instance
			this._id = id;
			this._parentNode = dojoDom.byId(id).parentNode;
			this._layoutContainer = layoutContainer;
			
			core.js.base.I18N.requireLocalization("core/languages");
			this._i18n = core.js.base.I18N.getLocalization("core/languages");
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
			
			this._createContextMenu();
			this._createTree();
			this._init();
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
			
			// "Insert border container" menu items
			this._insertBorderContainerMenu = new dijit.Menu();
			
			dojoArray.forEach(["top", "left", "right", "bottom"], function(region) {
				that._insertBorderContainerMenu.addChild(new dijit.MenuItem({
					label: that._i18n.page._share[region + "Region"],
					onClick: function() {
						if (that._selectedNode) {
							var borderContainer = dijitRegistry.byId(that._selectedNode.item.container_id[0]);
							that._layoutContainer.addBorderContainer(borderContainer, region);
						}
					}
				}));
			});
			this._contextMenu.addChild(new dijit.PopupMenuItem({
				label: this._i18n.page._share.insertBorderContainer,
				iconClass: "app-icon module-core-layout-icon-add",
				popup: this._insertBorderContainerMenu
			}));
			
			// "Delete border container" menu item
			this._deleteBorderContainerMenuItem = new dijit.MenuItem({
				label: that._i18n.page._share.deleteBorderContainer,
				iconClass: "app-icon module-core-layout-icon-delete",
				onClick: function() {
					if (that._selectedNode) {
						var borderContainer = dijitRegistry.byId(that._selectedNode.item.container_id[0]);
						that._layoutContainer.deleteBorderContainer(borderContainer);
					}
				}
			});
			this._contextMenu.addChild(this._deleteBorderContainerMenuItem);
			
			// "Layout" menu item
			this._layoutBorderContainerMenu = new dijit.Menu();
			dojoArray.forEach(["headline", "sidebar"], function(design) {
				that._layoutBorderContainerMenu.addChild(new dijit.MenuItem({
					_design: design,
					label: that._i18n.page._share[design],
					iconClass: "app-icon " + (design == "headline" ? "app-icon-vertical" : "app-icon-horizontal"),
					onClick: function() {
						if (that._selectedNode) {
							var borderContainer = dijitRegistry.byId(that._selectedNode.item.container_id[0]);
							that._layoutContainer.setLayoutDesign(borderContainer, design);
						}
					}
				}));
			});
			this._contextMenu.addChild(new dijit.PopupMenuItem({
				label: this._i18n.page._share.layout,
				popup: this._layoutBorderContainerMenu
			}));
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// "Insert grid container" menu item
			this._insertGridContainerMenuItem = new dijit.MenuItem({
				label: that._i18n.page._share.insertGridContainer,
				onClick: function() {
					if (that._selectedNode) {
						var borderContainer = dijitRegistry.byId(that._selectedNode.item.container_id[0]);
						that._layoutContainer.addGridContainer(borderContainer);
					}
				}
			});
			this._contextMenu.addChild(this._insertGridContainerMenuItem);
			
			// "Set columns" menu item
			this._setGridColumnsMenu = new dijit.Menu();
			
			for (var i = this._gridColumnSettings.minGridColumns; i <= this._gridColumnSettings.maxGridColumns; i++) {
				this._setGridColumnsMenu.addChild(new dijit.MenuItem({
					label: i,
					value: i,
					onClick: function() {
						if (that._selectedNode) {
							var gridContainer = dijitRegistry.byId(that._selectedNode.item.container_id[0]);
							that._layoutContainer.setGridColumns(gridContainer, this.value);
						}
					}
				}));
			}
			this._contextMenu.addChild(new dijit.PopupMenuItem({
				label: this._i18n.page._share.setGridColumns,
				popup: this._setGridColumnsMenu
			}));
			
			// "Delete grid container" menu item
			this._deleteGridContainerMenuItem = new dijit.MenuItem({
				label: that._i18n.page._share.deleteGridContainer,
				iconClass: "app-icon module-core-layout-icon-delete",
				onClick: function() {
					if (that._selectedNode) {
						var gridContainer = dijitRegistry.byId(that._selectedNode.item.container_id[0]);
						that._layoutContainer.deleteGridContainer(gridContainer);
					}
				}
			});
			this._contextMenu.addChild(this._deleteGridContainerMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// "Insert tab container" menu item
			this._insertTabContainerMenuItem = new dijit.MenuItem({
				label: that._i18n.page._share.insertTabContainer,
				iconClass: "app-icon module-core-layout-icon-tab-add",
				onClick: function() {
					if (that._selectedNode) {
						var item = that._selectedNode.item, container, tabContainer;
						switch (item.cls[0]) {
							case "dijit.layout.BorderContainer":
								container	 = dijitRegistry.byId(item.container_id[0]);
								tabContainer = that._layoutContainer.addTabContainer(container);
								break;
							case "gridContainerZone":
								var portletIndex = item.portlet_index ? item.portlet_index[0] : 0;
								container	 = dijitRegistry.byId(item.grid_container[0]);
								tabContainer = that._layoutContainer.addTabContainer(container, item.zone_index[0], portletIndex);
								break;
							case "dijit.layout.TabContainer":
							case "dojox.layout.GridContainer":
							case "core.js.views.LayoutPortlet":
							case "dijit.layout.ContentPane":
								// Do nothing
								break;
						}
					}
				}
			});
			this._contextMenu.addChild(this._insertTabContainerMenuItem);
			
			// "Delete tab container" menu item
			this._deleteTabContainerMenuItem = new dijit.MenuItem({
				label: that._i18n.page._share.deleteTabContainer,
				iconClass: "app-icon module-core-layout-icon-tab-delete",
				onClick: function() {
					if (that._selectedNode) {
						var tabContainer = dijitRegistry.byId(that._selectedNode.item.container_id[0]);
						that._layoutContainer.deleteTabContainer(tabContainer);
					}
				}
			});
			this._contextMenu.addChild(this._deleteTabContainerMenuItem);
			
			// "Activate tab container" menu item
			this._activateTabContainerMenuItem = new dijit.MenuItem({
				label: that._i18n.page._share.activateTabContainer,
				onClick: function() {
					if (that._selectedNode) {
						var gridContainer = dijitRegistry.byId(that._selectedNode.item.container_id[0]);
						that._layoutContainer.activateTabContainer(gridContainer);
					}
				}
			});
			this._contextMenu.addChild(this._activateTabContainerMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// "Insert main content" menu item
			this._insertMainContentPaneMenuItem = new dijit.MenuItem({
				label: that._i18n.page._share.insertMainContentPane,
				onClick: function() {
					if (that._selectedNode) {
						var item = that._selectedNode.item, container, pane;
						switch (item.cls[0]) {
							case "dijit.layout.BorderContainer":
								container = dijitRegistry.byId(item.container_id[0]);
								pane	  = that._layoutContainer.addMainContentPane(container);
								break;
							case "gridContainerZone":
								container = dijitRegistry.byId(item.grid_container[0]);
								pane	  = that._layoutContainer.addMainContentPane(container, item.zone_index[0], 0);
								break;
							case "dijit.layout.TabContainer":
								break;
							case "dojox.layout.GridContainer":
							case "core.js.views.LayoutPortlet":
							case "dijit.layout.ContentPane":
								// Do nothing
								break;
						}
					}
				}
			});
			this._contextMenu.addChild(this._insertMainContentPaneMenuItem);
			
			// "Delete main content" menu item
			this._deleteMainContentPaneMenuItem = new dijit.MenuItem({
				label: that._i18n.page._share.deleteMainContentPane,
				onClick: function() {
					if (that._selectedNode) {
						var item = that._selectedNode.item;
						if (item.cls && item.cls[0] == "dijit.layout.ContentPane") {
							that._layoutContainer.deleteMainContentPane();
						}
					}
				}
			});
			this._contextMenu.addChild(this._deleteMainContentPaneMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// "Collapse" menu item
			this._collapseMenuItem = new dijit.MenuItem({
				label: this._i18n.page._share.collapseAllWidgets,
				iconClass: "app-icon app-icon-collapse",
				onClick: function() {
					if (that._selectedNode) {
						var item = that._selectedNode.item;
						that._collapsePortlets(item, true);
					}
				}
			});
			this._contextMenu.addChild(this._collapseMenuItem);
			
			// "Expand" menu item
			this._expandMenuItem = new dijit.MenuItem({
				label: this._i18n.page._share.expandAllWidgets,
				iconClass: "app-icon app-icon-expand",
				onClick: function() {
					if (that._selectedNode) {
						var item = that._selectedNode.item;
						that._collapsePortlets(item, false);
					}
				}
			});
			this._contextMenu.addChild(this._expandMenuItem);
			
			// "Set filters" menu item
			this._setFiltersMenuItem = new dijit.MenuItem({
				label: this._i18n.page._share.setFilters,
				iconClass: "app-icon app-icon-filter",
				onClick: function() {
					if (that._selectedNode) {
						that.onSetFilters(that._selectedNode.item);
					}
				}
			});
			this._contextMenu.addChild(this._setFiltersMenuItem);
			
			// "Delete portlet" menu item
			this._deletePortletMenuItem = new dijit.MenuItem({
				label: this._i18n.page._share.deleteWidget,
				onClick: function() {
					if (that._selectedNode) {
						var portlet = dijitRegistry.byId(that._selectedNode.item.container_id[0]);
						portlet.onClose();
					}
				}
			});
			this._contextMenu.addChild(this._deletePortletMenuItem);
			
			this._contextMenu.addChild(new dijit.MenuSeparator());
			
			// "Locate" menu item
			this._locateMenuItem = new dijit.MenuItem({
				label: this._i18n.page._share.locateAction,
				onClick: function() {
					if (that._selectedNode) {
						that._locateContainer(that._selectedNode.item);
					}
				}
			});
			this._contextMenu.addChild(this._locateMenuItem);
			
			// "Properties" menu item
			this._propertiesMenuItem = new dijit.MenuItem({
				label: this._i18n.page.layout.properties,
				onClick: function() {
					if (that._selectedNode) {
						that.onSetProperties(that._selectedNode.item);
					}
				}
			});
			this._contextMenu.addChild(this._propertiesMenuItem);
			
			dojoAspect.after(this._contextMenu, "_openMyself", function(e) {
				var widget = dijitRegistry.getEnclosingWidget(e.target);
				if (widget && (widget instanceof dijit.Tree) && widget.selectedNode) {
					that._selectedNode = widget.selectedNode;
					that.onNodeContextMenu(widget.selectedNode.item);
				}
			}, true);
		},
		
		_createTree: function() {
			// summary:
			//		Creates the tree
			if (this._tree) {
				this._tree.destroyRecursive();
				this._tree = null;
			}
			
			var children = [];
			var that = this;
			// The root node associates with the root border container
			var rootNodeId = this._layoutContainer.getId();
			var store = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: "container_id",
					label: "title",
					items: [{ 
						container_id: rootNodeId,
						cls: "dijit.layout.BorderContainer",
						title: this._i18n.page._share.rootContainer,
						children: children
					}]
				}
			});
			
			var model = new dijit.tree.ForestStoreModel({
				store: store,
				rootLabel: this._i18n.page._share.rootContainer,
				rootId: this._id + "Root",
				query: {
					container_id: rootNodeId
				}
			});
			dojoAspect.after(model, "pasteItem", function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy, /*Int?*/ insertIndex) {
				// Called after dropping tree node to the tree
				if (oldParentItem.container_id[0] == newParentItem.container_id[0]) {
					// Drop to the same parent
					return;
				}
				
				// Move the portlet or tab container
				var widget = dijitRegistry.byId(childItem.container_id[0]);
				
				// Place the widget at the last position of new zone
				var newGrid		 = dijitRegistry.byId(newParentItem.grid_container[0]);
				var newZoneIndex = newParentItem.zone_index[0];
				var newZoneNode  = dojo.query("> .gridContainerZone", newGrid.gridNode)[newZoneIndex];
				// var numPortlets  = dojo.query(".dojoxPortlet", newZoneNode).length;
				var numPortlets  = dojo.query("> ." + core.js.LayoutConstant.PORTLET_CONTAINER_CLASS, newZoneNode).length;
				
				that._layoutContainer.movePortlet(widget, widget.get("indices"), {
										grid: newGrid,
										zoneIndex: newZoneIndex,
										portletIndex: numPortlets
									});
			}, true);
			
			model.newItem = function(/*dojo.dnd.Item*/ args, /*Item*/ parent, /*Int?*/ insertIndex) {
				// I override the newItem() method to prevent the tree from create a new item automatically
				// after dropping a widget from the Layout toolbox
				// The "args" variable are returned from the this._tree.itemCreator() method
				if (!args) {
					return;
				}
				switch (args.cls) {
					case "core.js.views.LayoutPortlet":
						var gridContainer = dijitRegistry.byId(parent.grid_container[0]);
						
						// New portlet will be placed at the bottom of zone
						var zoneIndex	 = parent.zone_index[0];
						var zoneNode	 = dojo.query("> .gridContainerZone", gridContainer.gridNode)[zoneIndex];
						var portletIndex = dojo.query("> ." + core.js.LayoutConstant.PORTLET_CONTAINER_CLASS, zoneNode).length;
						
						// The "widget_module" and "widget_name" are set in the this._tree.itemCreator() method
						that._layoutContainer.addPortlet(gridContainer, {
															module: args.widget_module,
															name: args.widget_name,
															title: args.title
														}, zoneIndex, portletIndex, true);
						break;
					case "dijit.layout.BorderContainer":
						var borderContainer = dijitRegistry.byId(parent.container_id[0]);
						if (borderContainer.getChildren().length == 0) {
							// The "regions" attribute is set in the this._tree.itemCreator() method
							that._layoutContainer.addBorderContainers(borderContainer, args.regions);	
						}
						break;
					default:
						break;
				}
			};
			
			var div	= dojoDomConstruct.create("div", {
				id: this._id
			}, this._parentNode);
			this._tree = new dijit.Tree({
				model: model,
				showRoot: false,
				persist: false,
				getIconClass: function(/*dojo.data.Item*/ item, /*Boolean*/ opened) {
					// Set the icon based on the node type
					var cls = item.root ? "dijit.layout.BorderContainer" : item.cls[0];
					switch (cls) {
						case "dijit.layout.BorderContainer":
							return "module-core-layout-icon-container";
							break;
						case "dojox.layout.GridContainer":
							return "module-core-layout-icon-grid";
							break;
						case "dijit.layout.TabContainer":
							return "module-core-layout-icon-tab";
							break;
						case "gridContainerZone":
							return "module-core-layout-icon-zone";
							break;
						case "dijit.layout.ContentPane":
						case "core.js.views.LayoutPortlet":
						default:
							return "module-core-layout-icon-widget";
							break;
					}
				},
				// DnD
//				dragThreshold: 8,
				betweenThreshold: 5,
				dndController: "dijit.tree.dndSource",
				itemCreator: function(nodes, target, source) {
					// DOJO LESSON: Override the itemCreator() method when dragging
					// the external source to the tree
					// Each item data will be passed as the first parameter of the model's newItem() method
					//		model.newItem = function(/*dojo.dnd.Item*/ args, /*Item*/ parent, /*int?*/ insertIndex) {
					//			console.log(args);
					//		};
					var dndtype = dojoDomAttr.get(nodes[0], "dndtype");
					if ((dndtype != "coreHooksLayoutWidgetDnd") && (dndtype != "coreHooksLayoutItemDnd")) {
						return [];
					}
					
					var items = [], data;
					switch (dndtype) {
						case "coreHooksLayoutWidgetDnd":
							data  = dojoDomAttr.get(nodes[0], "data-app-entity-props");
							data  = core.js.base.Encoder.decode(data);
							items = [{
								// Generate unique Id
								container_id: "core.js.views.LayoutPortlet_" + (new Date().getTime()),
								cls: "core.js.views.LayoutPortlet",
								title: data.title,
								widget_module: data.module,
								widget_name: data.name
							}];
							break;
						case "coreHooksLayoutItemDnd":
							data  = dojoDomAttr.get(nodes[0], "data-app-entity-props");
							data  = core.js.base.Encoder.decode(data);
							items = [{
								// Generate unique Id
								container_id: "dijit.layout.BorderContainer_" + (new Date().getTime()),
								cls: "dijit.layout.BorderContainer",
								regions: data
							}];
							break;
						default:
							break;
					}
					return items;
				},
				checkAcceptance: function(source, nodes) {
					var i = 0;
					// Allow to drag widget from the Layout toolbox
					for (i in nodes) {
						if (("coreHooksLayoutWidgetDnd" == dojoDomAttr.get(nodes[i], "dndtype"))
							|| ("coreHooksLayoutItemDnd" == dojoDomAttr.get(nodes[i], "dndtype"))) 
						{
							return true;
						}
					}
					
					// Drag and drop a tree node
					if (!source.tree || source.tree.id != that._id) {
						return false;
					}
					for (i in nodes) {
						var treeNode = dijitRegistry.byNode(nodes[i]);
						// Only accept the tab container, portlet
						if (treeNode.item.cls[0] != "dijit.layout.TabContainer"
							&& treeNode.item.cls[0] != "core.js.views.LayoutPortlet"
							&& treeNode.item.cls[0] != "dijit.layout.ContentPane")
						{
							return false;
						}
					}
					return true;
				},
				checkItemAcceptance: function(target, source, position) {
					var treeNode = dijitRegistry.getEnclosingWidget(target);
					
					// Drag a widget from the Layout toolbox and drop over a grid zone
					if (source.node && ("widget" == dojoDomAttr.get(dojo.query(source.node)[0], "data-app-dndtype"))
						&& ("over" == position) && ("gridContainerZone" == treeNode.item.cls[0])) 
					{
						return true;
					}
					
					// Drag layout from the Layout toolbox and drop over a border container node
					if (source.node && ("layout" == dojoDomAttr.get(dojo.query(source.node)[0], "data-app-dndtype"))
						&& ("over" == position) && ("dijit.layout.BorderContainer" == treeNode.item.cls[0])) 
					{
						return true;
					}
					
					// Drag and drop tree node
					if (!source.tree || source.tree.id != that._id) {
						return false;
					}
					var selection = source.selection; 
					switch (treeNode.item.cls[0]) {
						case "dijit.layout.BorderContainer":
						case "dojox.layout.GridContainer":
						case "dijit.layout.TabContainer":
						case "dijit.layout.ContentPane":
							return false;
							break;
						case "gridContainerZone":
							// Accept tab containers and portlet
							for (var i in selection) {
								if (selection[i].item.cls[0] != "dijit.layout.TabContainer"
									&& selection[i].item.cls[0] != "core.js.views.LayoutPortlet"
									&& selection[i].item.cls[0] != "dijit.layout.ContentPane")
								{
									return false;
								}
							}
							break;
						case "core.js.views.LayoutPortlet":
							// Don't allow to drop to the node associating with a portlet
							return false;
							break;
						default:
							break;
					}
					return true;
				}
			}, this._id);
			
			// Bind the context menu to the tree node
			this._contextMenu.bindDomNode(this._tree.domNode);
		},
		
		/* ========== MENU HANDLERS ========================================= */
		
		_collapsePortlets: function(/*dojo.data.item*/ item, /*Boolean*/ collapsed) {
			// summary:
			//		Collapse/expand all portlets in the given tree node
			// item:
			//		The node data
			// collapsed:
			//		If true, collapses all portlets. If false, expands all portlets.
			var cls = item.root ? "dijit.layout.BorderContainer" : item.cls[0];
			switch (cls) {
				case "dijit.layout.BorderContainer":
				case "dojox.layout.GridContainer":
				case "dijit.layout.TabContainer":
				case "core.js.views.LayoutPortlet":
					var container = dijitRegistry.byId(item.container_id[0]);
					this._layoutContainer.collapsePortlets(container, collapsed);
					break;
				case "gridContainerZone":
					var gridContainer = item.grid_container[0];
					var zoneIndex     = item.zone_index[0];
					var zoneNode	  = dojo.query(".gridContainerZone", dojoDom.byId(gridContainer))[zoneIndex];
					this._layoutContainer.collapsePortlets(zoneNode, collapsed);
					break;
				case "dijit.layout.ContentPane":
				default:
					// Do nothing
					break;
			}
		},
		
		_locateContainer: function(/*dojo.data.item*/ item) {
			// summary:
			//		Locates the container associating with the selected tree node
			// item:
			//		The node data
			// Highlight the container node
			var domNode = null;
			switch (item.cls[0]) {
				case "dijit.layout.BorderContainer":
				case "dojox.layout.GridContainer":
				case "dijit.layout.TabContainer":
				case "dijit.layout.ContentPane":
					domNode = item.container_id[0];
					break;
				case "core.js.views.LayoutPortlet":
					// Cannot highlight the Dijit portlet which contains the settings part.
					// I have to highlight the content container
					domNode = dijitRegistry.byId(item.container_id[0]).hideNode;
					break;
				case "gridContainerZone":
					// Define the DomNode of grid zone
					var grid	  = dijitRegistry.byId(item.grid_container[0]);
					var zones	  = dojo.query(".gridContainerZone", grid.domNode);
					var zoneIndex = item.zone_index[0];
					if (zones[zoneIndex]) {
						domNode = zones[zoneIndex];
					}
					break;
				default:
					break;
			}
			if (domNode) {
				dojox.fx.highlight({
					node: domNode,
					duration: 5000
				}).play();
			}
		},
		
		/* ========== CONTROL STATE ========================================= */
		
		allowToDeleteBorderContainer: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the border container
			this._deleteBorderContainerMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutTreeView
		},
		
		allowToInsertBorderContainer: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to insert new border container
			dojoArray.forEach(this._insertBorderContainerMenu.getChildren(), function(menuItem) {
				menuItem.set("disabled", !isAllowed);
			});
			return this;	// core.js.views.LayoutTreeView
		},
		
		allowToLayoutBorderContainer: function(/*Boolean*/ isAllowed, /*String?*/ design) {
			// summary:
			//		Allows/disallows to set the layout design to border container
			// design:
			//		The layout design, can be "headline" or "sidebar"
			var children = this._layoutBorderContainerMenu.getChildren();
			for (var i in children) {
				if (design) {
					if (children[i].get("_design") == design) {
						children[i].set("disabled", !isAllowed);
						break;
					}
				} else {
					children[i].set("disabled", !isAllowed);
				}
			}
			return this;	// core.js.views.LayoutTreeView
		},	
		
		allowToDeleteGridContainer: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the grid container
			this._deleteGridContainerMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutTreeView
		},
		
		allowToInsertGridContainer: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to insert new grid container
			this._insertGridContainerMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutTreeView
		},
		
		allowToSetGridColumns: function(/*Boolean*/ isAllowed, /*Integer?*/ numColumns) {
			// summary:
			//		Allows/disallows to set the number of columns to a grid container
			var children = this._setGridColumnsMenu.getChildren();
			if (numColumns && children[numColumns - 1]) {
				children[numColumns - 1].set("disabled", !isAllowed);
				return this;	// core.js.views.LayoutTreeView
			}
			
			dojoArray.forEach(children, function(menuItem) {
				menuItem.set("disabled", !isAllowed);
			});
			return this;	// core.js.views.LayoutTreeView
		},
		
		allowToActivateTabContainer: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the tab container
			this._activateTabContainerMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutTreeView
		},
		
		allowToDeleteTabContainer: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the tab container
			this._deleteTabContainerMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutTreeView
		},
		
		allowToInsertTabContainer: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to insert new tab container
			this._insertTabContainerMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutTreeView
		},
		
		allowToDeleteMainContentPane: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the main content pane
			this._deleteMainContentPaneMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutTreeView
		},
		
		allowToInsertMainContentPane: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to insert the main content pane
			this._insertMainContentPaneMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutTreeView
		},
		
		allowToDeletePortlet: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to delete the portlet
			this._deletePortletMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutTreeView
		},
		
		allowToSetFilters: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to set the filters
			this._setFiltersMenuItem.set("disabled", !isAllowed);
			return this;	// core.js.views.LayoutTreeView
		},
		
		/* ========== SUBSCRIBE EVENTS OF LAYOUT CONTAINER ================== */
		
		_init: function() {
			// summary:
			//		Subscribes events of the layout container
			var layoutContainerId = this._layoutContainer.getId();
			// Set layout event
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/setLayoutData_" + layoutContainerId, this, function(layoutData) {
				// Recreate the tree after setting new layout data
				this._createTree();
			});
			
			// Managing border container events
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/addBorderContainers_" + layoutContainerId, this, function(data) {
				this._addBorderContainers(data.container, data.regions, data.children);
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/deleteBorderContainer_" + layoutContainerId, this, function(container) {
				this._deleteContainer(container);
			});
			
			// Managing grid container events
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/addGridContainer_" + layoutContainerId, this, function(data) {
				this._addGridContainer(data.container, data.settings, data.grid);
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/deleteGridContainer_" + layoutContainerId, this, function(container) {
				this._deleteContainer(container);
			});
			
			// Managing tab container events
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/addTabContainer_" + layoutContainerId, this, function(data) {
				this._addTabContainer(data.container, data.tabContainer, data.zoneIndex, data.portletIndex);
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/deleteTabContainer_" + layoutContainerId, this, function(container) {
				this._deleteContainer(container);
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/activateTabContainer_" + layoutContainerId, this, function(data) {
				this._activateTabContainer(data.container, data.tabContainer);
			});
			
			// Managing main content pane events
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/addMainContentPane_" + layoutContainerId, this, function(data) {
				this._addMainContentPane(data.container, data.contentPane, data.zoneIndex, data.portletIndex);
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/deleteMainContentPane_" + layoutContainerId, this, function(pane) {
				this._deleteContainer(pane);
			});
			
			// Managing portlet events
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/addPortlet_" + layoutContainerId, this, function(data) {
				this._addPortlet(data.container, data.portlet, data.widget, data.zone_index, data.portlet_index);
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/movePortlet_" + layoutContainerId, this, function(data) {
				this._movePortlet(data.portlet, data.source, data.target);
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/closePortlet_" + layoutContainerId, this, function(data) {
				this._closePortlet(data.container, data.portlet, data.widget, data.zone_index, data.portlet_index);
			});
			
			// Setting filter and properties events
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/setProperties_" + layoutContainerId, this, function(data) {
				this._setProperties(data.container, data.properties);
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/core/views/LayoutContainer/setFilters_" + layoutContainerId, this, function(data) {
				this._setFilters(data.portlet, data.filters);
			});
		},
		
		_addBorderContainers: function(/*dijit.layout.BorderContainer*/ container, /*Array*/ regions, /*dijit.layout.BorderContainer[]*/ children) {
			// summary:
			//		Called after adding new border containers
			var nodes  = this._tree.getNodesByItem(container.id);
			var parent = nodes[0] ? nodes[0].item : this._tree._getRootOrFirstNode().item;
			var store  = this._tree.model.store;
			
			for (var region in children) {
				store.newItem({
					container_id: children[region].id,
					title: this._generateContainerNodeTitle(children[region]),
					cls: "dijit.layout.BorderContainer"
				}, {
					parent: parent,
					attribute: "children"
				});
			}
		},
		
		_deleteContainer: function(/*dijit.layout.BorderContainer|dojox.layout.GridContainer*/ container) {
			// summary:
			//		Called after deleting the container
			this._deleteNode(container.id);
		},
		
		_addGridContainer: function(/*dijit.layout.BorderContainer|dijit.layout.TabContainer*/ container, /*Object*/ settings, /*dojox.layout.GridContainer*/ grid) {
			// summary:
			//		Called after adding new grid container
			var that   = this;
			var nodes  = this._tree.getNodesByItem(container.id);
			var parent = nodes[0] ? nodes[0].item : this._tree._getRootOrFirstNode().item;

			var store  = this._tree.model.store;
			store.newItem({
				container_id: grid.id,
				title: this._generateContainerNodeTitle(grid),
				cls: "dojox.layout.GridContainer"
			}, {
				parent: parent,
				attribute: "children"
			});
			
			dojoAspect.after(grid, "_addColumn", function(numColumns) {
				that._addColumn(grid, numColumns);
			}, true);
			dojoAspect.after(grid, "_deleteColumn", function(indices) {
				that._deleteColumn(grid, indices);
			}, true);
			
			this._addColumn(grid, grid.nbZones);
		},
		
		_addColumn: function(/*dojox.layout.GridContainer*/ container, /*Integer*/ numColumns) {
			// summary:
			//		Called after setting the number of columns to the grid container
			var nodes  = this._tree.getNodesByItem(container.id);
			var parent = nodes[0].item;
			var store  = this._tree.model.store;
			
			var currentNumColumns = parent.num_columns ? parseInt(parent.num_columns) : 0;
			store.setValue(parent, "num_columns", container._grid.length);
			
			var zones = dojo.query(".gridContainerZone", container.domNode);
			
			var total = numColumns + currentNumColumns, i = 0, that = this, j;
			while (i < total) {
				var nodeId = this._generateGridZoneIdentity(container, i);
				store.fetchItemByIdentity({
					identity: nodeId,
					onItem: function(item) {
						if (item) {
							store.setValue(item, "zone_index", i);
						} else {
							j = parseInt(i) + 1;
							
							store.newItem({
								container_id: nodeId,
								title: dojox.string.sprintf(that._i18n.page._share.columnTitleTemplate, j),
								zone_index: i,
								grid_container: container.id,
								cls: "gridContainerZone"
							}, {
								parent: parent,
								attribute: "children"
							});
						}
						i++;
					}
				});
			}
		},
		
		_deleteColumn: function(/*dojox.layout.GridContainer*/ container, /*Array*/ indices) {
			// summary:
			//		Called after setting the number of columns to the grid container
			var nodes  = this._tree.getNodesByItem(container.id);
			var parent = nodes[0].item;
			var store  = this._tree.model.store;
			
			store.setValue(parent, "num_columns", container._grid.length);
			
			var that = this;
			dojoArray.forEach(indices, function(zoneIndex) {
				var nodeId = that._generateGridZoneIdentity(container, zoneIndex);
				that._deleteNode(nodeId);
			});
			
			// Update the label of other columns
			dojoArray.forEach(parent.children, function(child, index) {
				store.setValue(child, "title", dojox.string.sprintf(that._i18n.page._share.columnTitleTemplate, parseInt(index + 1)));
			});
		},
		
		_addTabContainer: function(/*dijit.layout.BorderContainer|dojox.layout.GridContainer*/ container, /*dijit.layout.TabContainer*/ tabContainer, /*Integer?*/ zoneIndex, /*Integer?*/ portletIndex) {
			// summary:
			//		Called after adding new tab container
			if (!tabContainer) {
				return;
			}
			var parentNodeId = (container instanceof dijit.layout.BorderContainer)
							 ? container.id : this._generateGridZoneIdentity(container, zoneIndex);
			var nodes = this._tree.getNodesByItem(parentNodeId);
			if (nodes[0] == null) {
				return;
			}
			var parent = nodes[0].item;
			var store  = this._tree.model.store;
			store.newItem({
				container_id: tabContainer.id,
				title: this._generateContainerNodeTitle(tabContainer),
				cls: "dijit.layout.TabContainer"
			}, {
				parent: parent,
				attribute: "children"
			});
		},
		
		_activateTabContainer: function(/*dojox.layout.GridContainer*/ container, /*dijit.layout.TabContainer*/ tabContainer) {
			// summary:
			//		Called after activating a grid container that belongs to a tab container
			var nodes = this._tree.getNodesByItem(container.id);
			if (nodes[0] != null) {
				// Deactivate the previous tab
				if (tabContainer.get("appSelectedTab")) {
					var prevNodes = this._tree.getNodesByItem(tabContainer.get("appSelectedTab").id);
					if (prevNodes[0] != null) {
						dojoDomClass.remove(prevNodes[0].labelNode, "module-core-layout-tab-active-title");
					}
				}
				
				// Set selected tab
				tabContainer.set("appSelectedTab", container);
				dojoDomClass.add(nodes[0].labelNode, "module-core-layout-tab-active-title");
			}
		},
		
		_addMainContentPane: function(/*dijit.layout.BorderContainer|dojox.layout.GridContainer*/ container, /*dijit.layout.ContentPane*/ pane, /*Integer?*/ zoneIndex, /*Integer?*/ portletIndex) {
			// summary:
			//		Called after adding main content pane
			var parentNodeId = (container instanceof dijit.layout.BorderContainer)
							 ? container.id : this._generateGridZoneIdentity(container, zoneIndex);
			var nodes = this._tree.getNodesByItem(parentNodeId);
			if (nodes[0] == null) {
				return;
			}
			var parent = nodes[0].item;
			var store  = this._tree.model.store;
			store.newItem({
				container_id: pane.id,
				title: this._i18n.page._share.mainContent,
				cls: "dijit.layout.ContentPane"
			}, {
				parent: parent,
				attribute: "children"
			});
		},
		
		_addPortlet: function(/*dojox.layout.GridContainer|DomNode*/ container, /*core.js.views.LayoutPortlet*/ portlet, /*Object*/ widget, /*Integer*/ zoneIndex, /*Integer*/ portletIndex) {
			// summary:
			//		Called after adding new portlet to given grid container
			var nodeId = this._generateGridZoneIdentity(container, zoneIndex);
			var nodes  = this._tree.getNodesByItem(nodeId);
			if (nodes[0] == null) {
				return;
			}
			var parent = nodes[0].item;
			var store  = this._tree.model.store;
			
			store.newItem({
				container_id: portlet.id,
				title: widget.title,
				cls: "core.js.views.LayoutPortlet"
			}, {
				parent: parent,
				attribute: "children"
			});
		},
		
		_movePortlet: function(/*core.js.views.LayoutPortlet|dijit.layout.TabContainer|dijit.layout.ContentPane*/ portlet, /*Object*/ source, /*Object*/ target) {
			// summary:
			//		Called after moving portlet to other grid container or position
			// portlet:
			//		The portlet
			// source:
			//		Defines the position of portlet before moving.
			//		Contains the members: grid, zoneIndex, portletIndex
			// target:
			//		Defines the position of portlet after moving.
			//		Contains the members: grid, zoneIndex, portletIndex
			switch (true) {
				// Move a portlet
				case (portlet instanceof core.js.views.LayoutPortlet):
					var properties = this._layoutContainer.getProperties(portlet);
					var filters	   = this._layoutContainer.getFilters(portlet);
					
					// Delete the portlet node
					this._deleteNode(portlet.id);
					
					// And add new node
					this._addPortlet(target.grid, portlet, portlet.get("_widget"), target.zoneIndex, target.portletIndex);
					
					// Keep the properties and filters of portlet
//					this._setProperties(portlet, properties);
//					this._setFilters(portlet, filters);
					break;
					
				// Move a tab container
				case (portlet instanceof dijit.layout.TabContainer):
					var that	 = this;
					var children = portlet.getChildren();

					dojoArray.forEach(children, function(gridContainer) {
						// Delete all portlets inside grid container
						dojoArray.forEach(gridContainer.getChildren(), function(child) {
							that._closePortlet(gridContainer, child, child.get("_widget"), child.get("indices").zoneIndex, child.get("indices").portletIndex);
						});
						
						// Delete all tree nodes associated with the container columns
						var zones = dojo.query(".gridContainerZone", gridContainer.domNode);
						for (var zoneIndex in zones) {
							that._deleteNode(that._generateGridZoneIdentity(gridContainer, zoneIndex));
						}
						
						that._deleteContainer(gridContainer);
					});
					this._deleteContainer(portlet);
					
					// Add nodes
					this._addTabContainer(target.grid, portlet, target.zoneIndex, target.portletIndex);
					dojoArray.forEach(children, function(gridContainer) {
						that._addGridContainer(portlet, {}, gridContainer);
						
						var childPortlets = gridContainer.getChildren();
						dojoArray.forEach(childPortlets, function(child) {
							that._addPortlet(gridContainer, child, child.get("_widget"), child.get("indices").zoneIndex, child.get("indices").portletIndex);
							
							that._setProperties(child, that._layoutContainer.getProperties(child));
							that._setFilters(child, that._layoutContainer.getFilters(child));
						});
					});
					break;
					
				// Move the main content pane
				case (portlet instanceof dijit.layout.ContentPane):
					var properties = this._layoutContainer.getProperties(portlet);
					var filters	   = this._layoutContainer.getFilters(portlet);
				
					this._deleteNode(portlet.id);
					this._addMainContentPane(target.grid, portlet, target.zoneIndex, target.portletIndex);
					
					this._setProperties(portlet, properties);
					this._setFilters(portlet, filters);
					break;
			}
		},
		
		_closePortlet: function(/*dojox.layout.GridContainer|DomNode*/ container, /*core.js.views.LayoutPortlet*/ portlet, /*Object*/ widget, /*Integer*/ zoneIndex, /*Integer*/ portletIndex) {
			// summary:
			//		Called after closing the portlet
			this._deleteNode(portlet.id);
		},
		
		_deleteNode: function(/*String*/ containerId) {
			// summary:
			//		Deletes node from the tree
			// containerId:
			//		Id of node item
			var store = this._tree.model.store;
			store.fetchItemByIdentity({
				identity: containerId,
				onItem: function(item) {
					if (item) {
						store.deleteItem(item);
					}
				}
			});
			store.save({
				onComplete: function() {
					// Do nothing
					// DOJO LESSON: After deleting item from the store, I have to save in order to make newItem() work
					// when the new item has the same Id as one of removed item
				}
			});
		},
		
		_generateContainerNodeTitle: function(/*dijit.layout.BorderContainer|dojox.layout.GridContainer|dijit.layout.TabContainer*/ container) {
			// summary:
			//		Generates the title for container node
			// container:
			//		The border, grid or tab container
			// Parse the index of container based on its id
			// (the standard id of container is dijit_layout_BorderContainer_index, dojox_layout_GridContainer_index or dijit_layout_TabContainer_index)
			var array = container.id.split("_");
			var index = array[array.length - 1];
			
			switch (true) {
				case (container instanceof dijit.layout.TabContainer):
					return dojox.string.sprintf(this._i18n.page._share.tabContainerTitleTemplate, index);	// String
					break;
				case (container instanceof dijit.layout.BorderContainer):
					var region = this._i18n.page._share[container.region];
					return dojox.string.sprintf(this._i18n.page._share.borderContainerTitleTemplate, index, region);	// String
					break;
				case (container instanceof dojox.layout.GridContainer):
					return dojox.string.sprintf(this._i18n.page._share.gridContainerTitleTemplate, index);	// String
					break;
				default:
					return "";	// String
					break;
			}
		},
		
		/* ========== MANAGE NODE PROPERTIES ================================ */
		
		setProperties: function(/*String*/ containerId, /*Object*/ properties) {
			// summary:
			//		Sets properties to given container
			// containerId:
			//		The container's Id
			// properties:
			//		Properties of container
			var that  = this;
			var store = this._tree.model.store;
			store.fetchItemByIdentity({
				identity: containerId,
				onItem: function(item) {
					if (item) {
						// I don't need to store the "container_id" property
						if (properties["container_id"]) {
							delete properties["container_id"];
						}
						switch (item.cls[0]) {
							case "dijit.layout.BorderContainer":
							case "dojox.layout.GridContainer":
							case "dijit.layout.TabContainer":
							case "core.js.views.LayoutPortlet":
							case "dijit.layout.ContentPane":
								var widget = dijitRegistry.byId(containerId);
								that._layoutContainer.setProperties(widget, properties);
								break;
							case "gridContainerZone":
								// Get the grid container
								var gridContainer = item.grid_container[0];
								var zoneIndex     = item.zone_index[0];
								var zoneNode	  = dojo.query(".gridContainerZone", dojoDom.byId(gridContainer))[zoneIndex];
								that._layoutContainer.setProperties(zoneNode, properties);
								break;
							default:
								break;
						}
					}
				}
			});
		},
		
		_setProperties: function(/*dijit.layout.BorderContainer|dojox.layout.GridContainer|HTMLElement|core.js.views.LayoutPortlet*/ container, /*Object*/ properties) {
			// summary:
			//		Called after setting the properties to the container
			// container:
			//		The container
			// properties:
			//		Properties of container
			var containerId = null;
			switch (true) {
				case (container instanceof dijit.layout.BorderContainer):
				case (container instanceof dijit.layout.TabContainer):	
				case (container instanceof dojox.layout.GridContainer):
				case (container instanceof core.js.views.LayoutPortlet):
				case (container instanceof dijit.layout.ContentPane):
					containerId = container.id;
					break;
				case (container instanceof HTMLElement):
					// Get the grid container
					var gridNode  = dojo.query(container.parentNode).closest(".gridContainer")[0];
					var grid	  = dijitRegistry.byNode(gridNode);
					var zoneIndex = dojoArray.indexOf(dojo.query(".gridContainerZone", gridNode), container);
					containerId   = this._generateGridZoneIdentity(grid, zoneIndex);
					break;
				default:
					break;
			}
			
			if (containerId) {
				var store = this._tree.model.store;
				store.fetchItemByIdentity({
					identity: containerId,
					onItem: function(item) {
						if (item) {
							store.setValue(item, "properties", dojoJson.stringify(properties));
							if (properties.title) {
								store.setValue(item, "title", properties.title);
							}
						}
					}
				});
			}
		},
		
		_generateGridZoneIdentity: function(/*dojox.layout.GridContainer*/ gridContainer, /*Integer*/ zoneIndex) {
			// summary:
			//		Generates unique string which will be used to set as identity
			//		of item associating with a grid zone node
			// gridContainer:
			//		The grid container
			// zoneIndex:
			//		The index of grid zone
			return gridContainer.id + "_column_" + zoneIndex;	// String
		},
		
		setFilters: function(/*String*/ portletId, /*String[]*/ filters) {
			// summary:
			//		Sets filters to given portlet
			// portletId:
			//		The portlet's Id
			// filters:
			//		Array of filters
			var that = this;
			var store = this._tree.model.store;
			store.fetchItemByIdentity({
				identity: portletId,
				onItem: function(item) {
					if (item && (item.cls[0] == "core.js.views.LayoutPortlet"
								|| item.cls[0] == "dijit.layout.ContentPane")) 
					{
						var portlet = dijitRegistry.byId(portletId);
						that._layoutContainer.setFilters(portlet, filters);
					}
				}
			});
		},
		
		_setFilters: function(/*core.js.views.LayoutPortlet*/ portlet, /*String[]*/ filters) {
			// summary:
			//		Called after setting filters to given portlet
			// portlet:
			//		The portlet instance
			// filters:
			//		Array of filters
			if ((portlet instanceof core.js.views.LayoutPortlet)
				|| (portlet instanceof dijit.layout.ContentPane))
			{
				var store = this._tree.model.store;
				store.fetchItemByIdentity({
					identity: portlet.id,
					onItem: function(item) {
						if (item) {
							store.setValue(item, "filters", dojoJson.stringify(filters));
						}
					}
				});
			}
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onNodeContextMenu: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Called when right-click on tree node
			// tags:
			//		callback
		},
		
		onSetFilters: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Sets filters to given portlet
			// tags:
			//		callback
		},
		
		onSetProperties: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Sets properties to given item
			// tags:
			//		callback
		}
	});
});
