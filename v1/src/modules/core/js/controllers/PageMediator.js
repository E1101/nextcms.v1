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
	"dojo/aspect"
], function(dojoDeclare, dojoAspect) {
	return dojoDeclare("core.js.controllers.PageMediator", null, {
		// _pageToolbar: core.js.views.PageToolbar
		_pageToolbar: null,
		
		// _pageGrid: core.js.views.PageGrid
		_pageGrid: null,
		
		setPageToolbar: function(/*core.js.views.PageToolbar*/ toolbar) {
			// summary:
			//		Sets the page toolbar
			this._pageToolbar = toolbar;
			
			var that = this;
			dojoAspect.after(this._pageToolbar, "onSelectTemplate", function(template) {
				that._pageToolbar.allowToSaveOrder(template && that._pageToolbar.criteria.language);
			}, true);
			dojoAspect.after(this._pageToolbar, "onSwitchToLanguage", function(language) {
				that._pageToolbar.allowToSaveOrder(language && that._pageToolbar.criteria.template);
			}, true);
		},
		
		setPageGrid: function(/*core.js.views.PageGrid*/ grid) {
			// summary:
			//		Sets the page grid
			this._pageGrid = grid;
			
			var that = this;
			dojoAspect.after(grid, "onRowContextMenu", function(/*dojo.data.item*/ item) {
				var layoutData = that._pageGrid.getCurrentLayoutData();
				// Don't allow to paste the layout to original page
				that._pageGrid.allowToCopyLayout(item.layout[0])
							  .allowToPasteLayout(layoutData.layout && layoutData.page_id && item.page_id[0] != layoutData.page_id)
							  .allowToExportLayout(item.layout[0]);
			}, true);
		}
	});
});
