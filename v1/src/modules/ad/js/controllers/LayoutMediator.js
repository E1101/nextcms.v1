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
	"dojo/_base/declare",
	"dojo/aspect"
], function(dojoDeclare, dojoAspect) {
	return dojoDeclare("ad.js.controllers.LayoutMediator", null, {
		// _toolbar: ad.js.views.LayoutToolbar
		_toolbar: null,
		
		setLayoutToolbar: function(/*ad.js.views.LayoutToolbar*/ toolbar) {
			// summary:
			//		Sets the layout toolbar
			this._toolbar = toolbar;
			
			toolbar.allowToSaveLayout(false);
			dojoAspect.after(toolbar, "onLoadPage", function(/*Object*/ page) {
				// Allow to save the layout after loading the page
				toolbar.allowToSaveLayout(page.layout ? true : false);
			});
		}
	});
});
