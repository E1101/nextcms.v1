/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		message
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-24
 */

define([
	"dojo/_base/declare",
	"dojo/aspect"
], function(dojoDeclare, dojoAspect) {
	return dojoDeclare("message.js.controllers.ThreadMediator", null, {
		// _messageContextMenu: message.js.views.MessageContextMenu
		_messageContextMenu: null,
		
		setMessageContextMenu: function(/*message.js.views.MessageContextMenu*/ messageContextMenu) {
			// summary:
			//		Sets the message's context menu
			this._messageContextMenu = messageContextMenu;
			
			dojoAspect.after(messageContextMenu, "onContextMenu", function(/*message.js.views.MessageItemView*/ messageItemView) {
				var message = messageItemView.getMessage();
				messageContextMenu.allowToMoveExceptOne(message.folder_id);
				
				if (message.folder_id != "inbox" || "1" == message.deleted) {
					messageContextMenu.allowToMove("inbox");
				}
				
				messageContextMenu.allowToStar(message.deleted + "" == "0");
			}, true);
		}
	});
});
