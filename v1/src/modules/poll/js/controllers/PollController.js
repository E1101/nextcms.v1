/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		poll
 * @subpackage	js
 * @since		1.0
 * @version		2012-08-26
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/hash",
	"dojo/io-query",
	"dojo/request/xhr",
	"dojo/topic",
	"dijit/registry",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/base/views/Helper"
], function(dojoDeclare, dojoLang, dojoAspect, dojoHash, dojoIoQuery, dojoRequestXhr, dojoTopic, dijitRegistry) {
	return dojoDeclare("poll.js.controllers.PollController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _pollToolbar: poll.js.views.PollToolbar
		_pollToolbar: null,
		
		// _pollGrid: poll.js.views.PollGrid
		_pollGrid: null,
		
		// _paginatorContainer: String
		_paginatorContainer: null,
		
		// _defaultCriteria: Object
		_defaultCriteria: {
			keyword: null,
			page: 1,
			per_page: 20,
			language: null
		},
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/poll/js/controllers/PollController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("poll/languages");
			this._i18n = core.js.base.I18N.getLocalization("poll/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setPollToolbar: function(/*poll.js.views.PollToolbar*/ pollToolbar) {
			// summary:
			//		Sets the poll toolbar
			this._pollToolbar = pollToolbar;
			
			var that = this;
			// Add poll handler
			dojoAspect.after(pollToolbar, "onAddPoll", dojoLang.hitch(this, "addPoll"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/poll/poll/add/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/poll/poll/add/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/poll/poll/add/onComplete", this, function(data) {
				this._helper.hideStandby();
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.poll.add[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchPolls();
				}
			});
			
			// Refresh handler
			dojoAspect.after(pollToolbar, "onRefresh", dojoLang.hitch(this, "searchPolls"));
			
			// Search handler
			dojoAspect.after(pollToolbar, "onSearchPolls", function(keyword) {
				that.searchPolls({
					keyword: keyword,
					page: 1
				});
			}, true);
			
			// Switch to other language handler
			dojoAspect.after(pollToolbar, "onSwitchToLanguage", function(language) {
				that.searchPolls({
					language: language,
					page: 1
				});
			}, true);
			
			// Update page size handler
			dojoAspect.after(pollToolbar, "onUpdatePageSize", function(perPage) {
				that.searchPolls({
					page: 1,
					per_page: perPage
				});
			}, true);
			
			return this;	// poll.js.controllers.PollController
		},
		
		setPollGrid: function(/*poll.js.views.PollGrid*/ pollGrid) {
			// summary:
			//		Sets the poll grid
			this._pollGrid = pollGrid;
			
			// Edit poll handler
			dojoAspect.after(pollGrid, "onEditPoll", dojoLang.hitch(this, "editPoll"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/poll/poll/edit/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/poll/poll/edit/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/poll/poll/edit/onComplete", this, function(data) {
				this._helper.hideStandby();
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.poll.edit[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchPolls();
				}
			});
			
			// Delete poll handler
			dojoAspect.after(pollGrid, "onDeletePoll", dojoLang.hitch(this, "deletePoll"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/poll/poll/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/poll/poll/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.poll["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchPolls();
				}
			});
			
			// Translate poll handler
			dojoAspect.after(pollGrid, "onTranslatePoll", dojoLang.hitch(this, "translatePoll"), true);
			
			return this;	// poll.js.controllers.PollController
		},
		
		setPollPaginator: function(/*String*/ paginatorContainer) {
			// summary:
			//		Sets the container of paginator
			this._paginatorContainer = paginatorContainer;
			
			return this;	// poll.js.controllers.PollController
		},
		
		addPoll: function() {
			// summary:
			//		Adds new poll
			var url = core.js.base.controllers.ActionProvider.get("poll_poll_add").url;
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		},
		
		deletePoll: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Deletes given poll
			var params = {
				poll_id: item.poll_id[0]
			};
			var url = core.js.base.controllers.ActionProvider.get("poll_poll_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "pollPollDeleteDialog",
				title: this._i18n.poll["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		editPoll: function(/*dojo.data.Item|String*/ item) {
			// summary:
			//		Edits given poll
			var params = {
				poll_id: dojoLang.isObject(item) ? item.poll_id[0] : item
			};
			var url = core.js.base.controllers.ActionProvider.get("poll_poll_edit").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits the controls with given criteria
			dojoLang.mixin(this._defaultCriteria, criteria);
			this._pollToolbar.initSearchCriteria(criteria);
			
			return this;	// poll.js.controllers.PollController
		},
		
		searchPolls: function(/*Object*/ criteria) {
			// summary:
			//		Searches for polls
			dojoLang.mixin(this._defaultCriteria, criteria);
			var q   = core.js.base.Encoder.encode(this._defaultCriteria);
			var url = core.js.base.controllers.ActionProvider.get("poll_poll_list").url;
			dojoHash("u=" + url + "/?q=" + q);
			
			var that = this;
			this._helper.showStandby();
			dojoRequestXhr(url, {
				data: {
					q: q,
					format: "json"
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				that._pollGrid.showPolls(data.data);
				
				// Update the paginator
				dijitRegistry.byId(that._paginatorContainer).set("content", data.paginator);
			});
		},
		
		translatePoll: function(/*dojo.data.Item*/ item, /*String*/ language) {
			// summary:
			//		Translates given poll to other language
			var params = {
				source_id: item.poll_id[0],
				language: language
			};
			var url = core.js.base.controllers.ActionProvider.get("poll_poll_add").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		}
	});
});
