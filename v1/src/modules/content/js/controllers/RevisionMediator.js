/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		content
 * @subpackage	js
 * @since		1.0
 * @version		2012-09-26
 */

define([
	"dojo/_base/declare",
	"dojo/aspect"
], function(dojoDeclare, dojoAspect) {
	return dojoDeclare("content.js.controllers.RevisionMediator", null, {
		// _revisionGrid: content.js.views.RevisionGrid
		_revisionGrid: null,
		
		setRevisionGrid: function(/*content.js.views.RevisionGrid*/ revisionGrid) {
			// summary:
			//		Sets the revision grid
			this._revisionGrid = revisionGrid;
			
			dojoAspect.after(revisionGrid, "onRowContextMenu", function(item) {
				var isActive = (parseInt(item.is_active[0]) == 1);
				// Don't allow to delete/restore the current active item
				revisionGrid.allowToDelete(!isActive)
							.allowToRestore(!isActive);
			}, true);
		}
	});
});
