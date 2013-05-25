/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		category
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-26
 */

define([
	"dojo/_base/declare",
	"dojo/aspect"
], function(dojoDeclare, dojoAspect) {
	return dojoDeclare("category.js.controllers.CategoryMediator", null, {
		// _categoryTreeView: category.js.views.CategoryTreeView
		_categoryTreeView: null,
		
		setCategoryTreeView: function(/*category.js.views.CategoryTreeView*/ categoryTreeView) {
			// summary:
			//		Sets the category tree view
			this._categoryTreeView = categoryTreeView;
			
			dojoAspect.after(categoryTreeView, "onNodeContextMenu", function(item) {
				// Disable delete/edit/rename menu items when selecting the root node
				var isRoot = item.root;
				categoryTreeView.allowToDelete(!isRoot)
								.allowToEdit(!isRoot)
								.allowToRename(!isRoot);
			}, true);
		}
	});
});
