/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		ad
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-03
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/json",
	"dojo/on",
	"dijit/registry",
	"dojo/parser",
	"dojo/query",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/layout/TabContainer",
	"dojox/layout/GridContainer",
	"dojox/mdnd/adapter/DndFromDojo",	// Include this to allow drag and drop elements to a grid container
	"dojox/string/sprintf",
	"dojox/widget/Portlet",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/Constant",
	"core/js/views/LayoutPortlet"
], function(dojoArray, dojoDeclare, dojoDom, dojoDomAttr, dojoDomClass, dojoDomStyle, dojoJson, dojoOn, dijitRegistry) {
	return dojoDeclare("ad.js.views.LayoutContainer", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _acceptDropClasses: Array
		_acceptDropClasses: [ "adBannerItemDnd", "adBannerPortlet" ],
		
		// _gridContainers: Array
		//		Array of grid containers on page. It maps the container's Id with container
		_gridContainers: {},
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/ad/js/views/LayoutContainer",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("ad/languages");
			this._i18n = core.js.base.I18N.getLocalization("ad/languages");
			
			core.js.base.controllers.Subscriber.unsubscribeAll("/dnd/drop/after");
			core.js.base.controllers.Subscriber.unsubscribeAll("/dojox/mdnd/drop");
//			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
			this._initDnd();
		},
		
		_initDnd: function() {
			// summary:
			//		Allows to drag banner from the BannerProvider and drop to the 
			//		layout container
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/dnd/drop/after", this, function(source, nodes, copy, target, dropIndex) {
				if (dojoArray.indexOf(this._acceptDropClasses, dojoDomAttr.get(nodes[0], "dndtype")) == -1) {
					return;
				}
				
				var banner = core.js.base.Encoder.decode(dojoDomAttr.get(nodes[0], "data-app-entity-props"));
				
				// Define the grid container and the zone index
				// target is a zone (TD element)
				var gridContainer = dijitRegistry.getEnclosingWidget(target);
				var zoneIndex	  = dojoArray.indexOf(dojo.query(".gridContainerZone", target.parentNode), target);

				// Add portlet to the grid container
				var numPortlets = dojo.query(".dojoxPortlet", target).length;
				this._addBanner(gridContainer, banner, zoneIndex, (dropIndex == -1) ? numPortlets : dropIndex);
			});
		},
		
		loadPage: function(/*Object*/ page) {
			// summary:
			//		Loads the layout and banners on given page
			// page:
			//		The page data, including the following properties:
			//		- template: The template's name
			//		- page_id: The page's Id
			//		- layout: Layout of page
			//		- banners: Array of banners on the page
			// Remove child widgets
			dojoArray.forEach(dijitRegistry.byId(this._id).getChildren(), function(widget) {
				widget.destroyRecursive();
			});
			dojoDom.byId(this._id).innerHTML = "";
			
			// Reset the array of grid containers
			this._gridContainers = {};
			
			var layout = dojoJson.parse(page.layout);
			for (var i in layout.containers) {
				this._loadLayout(dijitRegistry.byId(this._id), layout.containers[i]);	
			}
			
			// Load banners to grid containers
			if (page.banners) {
				var that = this, gridContainer;
				dojoArray.forEach(page.banners, function(banner, index) {
					gridContainer = that._gridContainers[banner.zone_id + ""];
					if (gridContainer) {
						// that._addBanner(gridContainer, banner, 0, index);
						that._addBanner(gridContainer, banner, 0, banner.ordering);
					}
				});
			}
		},
		
		_loadLayout: function(/*dijit.layout.BorderContainer|dojox.layout.GridContainer|HTMLElement|core.js.views.LayoutPortlet*/ container, /*Object*/ layout) {
			// summary:
			//		Loads layout of given container
			switch (layout.cls) {
				case "dijit.layout.BorderContainer":
//					var parent = (1 == layout.containers.length && "dojox.layout.GridContainer" == layout.containers[0].cls)
					var parent = this._addBorderContainer(container, layout.region, layout.style);
					
					for (var i in layout.containers) {
						this._loadLayout(parent, layout.containers[i]);
					}
					break;
				case "dojox.layout.GridContainer":
					var borderContainer = this._addBorderContainer(container, "center");
					if (layout.properties && layout.properties.title) {
						borderContainer.set("title", layout.properties.title);
					}
					for (var i in layout.containers) {
						this._loadLayout(borderContainer, layout.containers[i]);
					}
					break;
				case "dijit.layout.TabContainer":
					if (layout.numPortlets) {
						// The tab container is placed inside a grid zone
						var height		 = 100 / layout.numPortlets;
						var tabContainer = this._addTabContainer(container, "top", "height: " + height + "%");
						for (var i in layout.containers) {
							this._loadLayout(tabContainer, layout.containers[i]);
						}
					} else {
						// The tab container is placed inside a border container
						var tabContainer = this._addTabContainer(container, "center", "height: 100%");
						for (var i in layout.containers) {
							this._loadLayout(tabContainer, layout.containers[i]);
						}
					}
					break;
				case "gridContainerZone":
					var width  = 100 / layout.numZones;
					var region = (layout.zoneIndex == layout.numZones - 1) ? "center" : "left";
					var borderContainer = this._addBorderContainer(container, region, "width: " + width + "%");
					borderContainer.addChild(new dijit.layout.ContentPane({
						region: "center",
						style: "height: 1px"
					}));
					
					for (var i in layout.containers) {
						this._loadLayout(borderContainer, layout.containers[i]);
					}
					break;
				case "core.js.views.LayoutPortlet":
					var height = 100 / layout.numPortlets;
					if ("ad" == layout.widget.module && "banners" == layout.widget.name) {
						var zoneId = layout.widget.params.zone_id;
						
						// Create a grid container to contain banner
						// User can drag and drop banner in the same grid or between grid containers
						var borderContainer = new dijit.layout.BorderContainer({
							region: "top",
							style: "width: 100%; height: " + height + "%",
							splitter: false,
							gutters: true,
							"class": "app-container-border"
						});
						
						// I have to put the grid container at the center of a border
						// container. So, when user drag many banners to the grid,
						// there will be a scroll bar
						var gridContainer = new dojox.layout.GridContainer({
							region: "center",
							nbZones: 1,
							hasResizableColumns: true,
							doLayout: true,
							acceptTypes: this._acceptDropClasses,
							style: "width: 100%; height: 100%",
							"class": "module-ad-banner-grid",
							dragHandleClass: "dijitTitlePaneTitle",
							appZoneId: zoneId
						});
						borderContainer.addChild(gridContainer);
						container.addChild(borderContainer);
						
						// On the page, it must be less than 2 banner widgets
						// which are set the same zone
						this._gridContainers[zoneId + ""] = gridContainer;
					} else {
						container.addChild(new dijit.layout.ContentPane({
							region: "top",
							style: "height: " + height + "%",
							// Show the title of widget at the center
							content: "<div class='app-center'><div>" + dojox.string.sprintf(this._i18n.banner.place.widgetTitleTemplate, layout.widget.title) + "</div></div>"
						}));
					}
					break;
				case "dijit.layout.ContentPane":
					// The main content pane
					if (layout.numPortlets) {
						// The main content pane is placed inside a grid zone
						var height = 100 / layout.numPortlets;
						container.addChild(new dijit.layout.ContentPane({
							region: "top",
							style: "height: " + height + "%",
							content: "<div class='app-center'><div>" + this._i18n.banner.place.mainContent + "</div></div>"
						}));
					}
					break;
				default:
					break;
			}
		},
		
		_addBorderContainer: function(/*dijit.layout.BorderContainer*/ container, /*String*/ region, /*String*/ style) {
			// summary:
			//		Adds border container to selected border container
			// container:
			//		The selected container
			// region:
			//		The position the new container will be placed.
			//		Can be "top", "bottom", "left", "right" or "center"
			// Remove border from the container
			dojoDomStyle.set(container.domNode, "border", "none");
			dojoDomClass.remove(container.domNode, "app-container-border");
			
			var childContainer = new dijit.layout.BorderContainer({
				region: region,
				style: style,
				splitter: true,
				gutters: true,
				"class": "app-container-border"
			});
			container.addChild(childContainer);
			
			return childContainer;	// dijit.layout.BorderContainer
		},
		
		_addTabContainer: function(/*dijit.layout.BorderContainer*/ container, /*String*/ region, /*String*/ style) {
			// summary:
			//		Adds a tab container to given border container or grid zone
			var tabContainer = new dijit.layout.TabContainer({
				region: region,
				style: style
			});
			container.addChild(tabContainer);
			return tabContainer;	// dijit.layout.TabContainer
		},
		
		_addBanner: function(/*dojox.layout.GridContainer*/ container, /*Object*/ banner, /*Integer*/ zoneIndex, /*Integer*/ bannerIndex) {
			// summary:
			//		Adds a banner to a grid container
			// container:
			//		The grid container
			// banner:
			//		The banner data, including the title, format, code and URL of banner
			// zoneIndex:
			//		The index of zone
			// bannerIndex:
			//		The index of banner in zone
			var portlet = new core.js.views.LayoutPortlet({
				title: banner.title,
				closable : true,
				open: false,	// By default, don't show the banner
				dndType: "adBannerPortlet",
				loadingMessage: "<div style='text-align: center'><span class='dijitContentPaneLoading'>" + this._i18n.global._share.loadingAction + "</span></div>",
				appBanner: banner
			});
			
			// Set the content of portlet
			var content = "";
			switch (banner.format) {
				case "image":
					content = '<img src="' + core.js.Constant.normalizeUrl(banner.url) + '" />';
					break;
				case "flash":
					// Preview the banner
					var jsCode = [];
					var playerId = "ad.js.views.LayoutContainer_" + portlet.id;
					jsCode.push('swfobject.embedSWF("' + core.js.Constant.ROOT_URL + '/static/js/strobemediaplayback/StrobeMediaPlayback.swf"', 
													'"' + playerId + '"',
													'"100%"',
													'"200"',
													'"10.0.1"',
													'"' + core.js.Constant.ROOT_URL + '/static/js/strobemediaplayback/expressInstall.swf"',
													'{ autoPlay: true, src: "' + core.js.Constant.normalizeUrl(banner.url) + '" }, { allowfullscreen: true });');
					content = '<div id="' + playerId + '"></div><script type="text/javascript">' + "\n" + jsCode.join(",") + "</" + "script>";
					break;
				case "html":
					break;
				case "javascript":
					content = "<div style='text-align: center'>" + this._i18n.banner._share.notPreviewable + "</div>";
					break;
				default:
					break;
			}
			portlet.set("content", content);
			
			// Remove the portlet from the container when user closes it
			dojoOn(portlet, "close", function() {
				container.removeChild(portlet);
				portlet.destroyRecursive();
			});
			
			// Add portlet to grid container
			portlet.startup();
			container.addChild(portlet, zoneIndex, bannerIndex);
		},
		
		getBanners: function() {
			// summary:
			//		Gets the list of banners on the page
			var banners = [], gridContainer;
			for (var zoneId in this._gridContainers) {
				gridContainer = this._gridContainers[zoneId];
				dojoArray.forEach(gridContainer.getChildren(), function(portlet, index) {
					banners.push({
						banner_id: portlet.get("appBanner").banner_id,
						title: portlet.get("appBanner").title,
						zone_id: zoneId,
						ordering: index
					});
				});
			}
			return banners;		// Array
		}
	});
});
