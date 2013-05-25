/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		file
 * @subpackage	hooks
 * @since		1.0
 * @version		2012-10-01
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/io-query",
	"dojo/topic",
	"dijit/registry",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/Encoder"
], function(dojoDeclare, dojoLang, dojoAspect, dojoIoQuery, dojoTopic, dijitRegistry) {
	return dojoDeclare("file.hooks.explorer.ExplorerController", null, {
		// _id: String
		_id: null,
		
		// _toolbar: file.hooks.explorer.ExplorerToolbar
		_toolbar: null,
		
		// _fileListView: file.hooks.explorer.FileListView
		_fileListView: null,
		
		// _pathBreadcrumb: file.js.views.PathBreadcrumb
		_pathBreadcrumb: null,
		
		// _criteria: Object
		_criteria: {
			path: "",
			page: 1,
			per_page: 30,
			view_type: "grid"
		},
		
		constructor: function(/*String*/ id) {
			this._id = id;
		},
		
		setToolbar: function(/*file.hooks.explorer.ExplorerToolbar*/ toolbar) {
			// summmary:
			//		Sets the toolbar
			this._toolbar = toolbar;
			
			var that = this;
			// Go home handler
			dojoAspect.after(toolbar, "onGoHome", function() {
				that._criteria.page = 1;
				that.gotoPath("/");
			});
			
			// Refresh handler
			dojoAspect.after(toolbar, "onRefresh", dojoLang.hitch(this, "searchFiles"));
			
			// Change view type handler
			dojoAspect.after(toolbar, "onChangeViewType", function(viewType) {
				that._criteria.view_type = viewType;
				if (that._fileListView) {
					that._fileListView.setViewType(viewType);
				}
			}, true);
			
			// Update page size handler
			dojoAspect.after(toolbar, "onUpdatePageSize", function(perPage) {
				that.searchFiles({
					per_page: perPage
				});
			}, true);
			
			return this;	// file.hooks.explorer.ExplorerController
		},
		
		setFileListView: function(/*file.hooks.explorer.FileListView*/ fileListView) {
			// summary:
			//		Sets the file list view
			this._fileListView = fileListView;
			
			// Open directory handler
			dojoAspect.after(fileListView, "onOpenDir", dojoLang.hitch(this, "gotoPath"), true);
			
			// Paging handler
			dojoTopic.subscribe("/app/file/hooks/explorer/search/onGotoPage", this, function(page) {
				this.searchFiles({
					page: page
				});
			});
			
			return this;	// file.hooks.explorer.ExplorerController
		},
		
		setPathBreadcrumb: function(/*file.js.views.PathBreadcrumb*/ pathBreadcrumb) {
			// summary:
			//		Sets the path breadcrumb
			this._pathBreadcrumb = pathBreadcrumb;
			
			dojoAspect.after(pathBreadcrumb, "onGotoPath", dojoLang.hitch(this, "gotoPath"), true);
			return this;	// file.hooks.explorer.ExplorerController
		},
		
		gotoPath: function(/*String*/ path) {
			// summary:
			//		Opens given path
			if (!path) {
				return;
			}
			while ("." == path[0] || "/" == path[0]) {
				path = path.substring(1);
			}
			this._pathBreadcrumb.show(path);
			this.searchFiles({
				path: path
			});
		},
		
		searchFiles: function(/*Object*/ criteria) {
			// summary:
			//		Searches for files
			dojoLang.mixin(this._criteria, criteria);
			var q = core.js.base.Encoder.encode(this._criteria);

			var params = {
				_type: "hook",
				_mod: "file",
				_name: "explorer",
				_method: "search",
				q: q
			};
			dijitRegistry.byNode(this._fileListView.getDomNode())
						 .set("href", core.js.base.controllers.ActionProvider.get("core_extension_render").url + "?" + dojoIoQuery.objectToQuery(params));
		}
	});
});
