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
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/dom-class",
	"dojo/parser",
	"dijit/form/Button",
	"dijit/form/Select",
	"dijit/form/TextBox",
	"dijit/Toolbar",
	"dijit/ToolbarSeparator",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/I18N"
], function(dojoArray, dojoDeclare, dojoDomClass) {
	return dojoDeclare("message.js.views.MessageToolbar", null, {
		// _id: String
		_id: null,
		
		// _toolbar: dijit.Toolbar
		_toolbar: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _emptyTrashButton: dijit.form.Button
		_emptyTrashButton: null,
		
		// _searchTextBox: dijit.form.TextBox
		_searchTextBox: null,
		
		// _searchButton: dijit.form.Button
		_searchButton: null,
		
		// _perPageSelect: dijit.form.Select
		_perPageSelect: null,
		
		// _numMessagesPerPage: Array
		_numMessagesPerPage: [ 20, 40, 60, 80, 100 ],
		
		// _numDeletedMessages: Integer
		//		Number of messages in the trash
		_numDeletedMessages: 0,
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("message/languages");
			this._i18n = core.js.base.I18N.getLocalization("message/languages");
			
			this._createToolbar();
		},
		
		_createToolbar: function() {
			// summary:
			//		Creates the toolbar
			this._toolbar = new dijit.Toolbar({}, this._id);
			var that	  = this;
			
			// "Send" button
			this._toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.sendAction,
				showLabel: false,
				iconClass: "app-icon module-message-icon-send",
				disabled: !core.js.base.controllers.ActionProvider.get("message_message_send").isAllowed,
				onClick: function(e) {
					that.onSendMessage();
				}
			}));
			
			// "Refresh" button
			this._toolbar.addChild(new dijit.form.Button({
				label: this._i18n.global._share.refreshAction,
				showLabel: false,
				iconClass: "app-icon app-icon-refresh",
				disabled: !core.js.base.controllers.ActionProvider.get("message_message_list").isAllowed,
				onClick: function(e) {
					that.onRefresh();
				}
			}));
			
			this._toolbar.addChild(new dijit.ToolbarSeparator());
			
			// "Empty trash" button
			this._emptyTrashButton = new dijit.form.Button({
				label: this._i18n.global._share.emptyTrashAction,
				showLabel: false,
				iconClass: "app-icon app-icon-trash-empty",
				disabled: !core.js.base.controllers.ActionProvider.get("message_message_empty").isAllowed,
				onClick: function(e) {
					that.onEmptyTrash();
				}
			});
			this._toolbar.addChild(this._emptyTrashButton);
			
			this._toolbar.addChild(new dijit.ToolbarSeparator());
			
			// Search control
			this._searchTextBox = new dijit.form.TextBox({
				style: "width: 150px",
				placeHolder: this._i18n.message.list.searchMessageHelp
			});
			this._searchButton = new dijit.form.Button({
				label: this._i18n.global._share.searchAction,
				showLabel: false,
				iconClass: "app-icon app-icon-search",
				disabled: !core.js.base.controllers.ActionProvider.get("message_message_list").isAllowed,
				onClick: function(e) {
					var keyword = that._searchTextBox.get("value");
					that.onSearchMessages(keyword);
				}
			});
			this._toolbar.addChild(this._searchTextBox);
			this._toolbar.addChild(this._searchButton);
			
			// Select the number of articles per page
			var options = [];
			dojoArray.forEach(this._numMessagesPerPage, function(value, index) {
				options.push({
					label: value,
					value: value + ""
				});
			});
			this._perPageSelect = new dijit.form.Select({ 
				options: options, 
				style: "height: 20px",
				disabled: !core.js.base.controllers.ActionProvider.get("message_message_list").isAllowed,
				onChange: function(value) {
					that.onUpdatePageSize(parseInt(value));
				}
			});
			dojoDomClass.add(this._perPageSelect.domNode, "app-right");
			this._toolbar.addChild(this._perPageSelect);
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits controls with given criteria
			if (criteria.per_page) {
				this._perPageSelect.set("value", criteria.per_page + "");
			}
			this.allowToEmptyTrash("1" == criteria.deleted);
		},
		
		increaseDeletedMessages: function(/*Integer*/ increasingNumber) {
			// summary:
			//		Increases (or decreases) the number of deleted messages
			this.setNumDeletedMessages(this._numDeletedMessages + increasingNumber);
		},
		
		setNumDeletedMessages: function(/*Integer*/ numDeletedMessages) {
			// summary:
			//		Sets the number of deleted messages
			this._numDeletedMessages = numDeletedMessages;
			this._emptyTrashButton.set("iconClass", "app-icon " + ((0 == numDeletedMessages) ? "app-icon-trash-empty" : "app-icon-trash-full"));
		},
		
		setTrashEmpty: function() {
			// summary:
			//		Sets the trash as empty
			this.setNumDeletedMessages(0);
		},
		
		/* ========== CONTROL STATE OF CONTROLS ============================= */
		
		allowToEmptyTrash: function(/*Boolean*/ isAllowed) {
			// summary:
			//		Allows/disallows to empty the trash
			isAllowed = isAllowed && core.js.base.controllers.ActionProvider.get("message_message_empty").isAllowed;
			this._emptyTrashButton.set("disabled", !isAllowed);
			return this;	// message.js.views.MessageToolbar
		},
		
		/* ========== CALLBACKS ============================================= */
		
		onEmptyTrash: function() {
			// summary:
			//		Empties the trash
			// tags:
			//		callback		
		},
		
		onRefresh: function() {
			// summary:
			//		Reloads the list of messages
			// tags:
			//		callback
		},
		
		onSearchMessages: function(/*String*/ keyword) {
			// summary:
			//		Searches for messages by given keyword
			// tags:
			//		callback
		},
		
		onSendMessage: function() {
			// summary:
			//		Sends new message
			// tags:
			//		callback
		},
		
		onUpdatePageSize: function(/*Integer*/ perPage) {
			// summary:
			//		Called when the page size select changes its value
			// perPage:
			//		The number of messages per page
			// tags:
			//		callback
		}
	});
});
