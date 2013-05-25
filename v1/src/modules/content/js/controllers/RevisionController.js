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
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/io-query",
	"dojo/topic",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/I18N",
	"content/js/controllers/RevisionMediator"
], function(dojoDeclare, dojoLang, dojoAspect, dojoIoQuery, dojoTopic) {
	return dojoDeclare("content.js.controllers.RevisionController", null, {
		// _id: String
		_id: null,
		
		// _articleId: String
		_articleId: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _revisionToolbar: content.js.views.RevisionToolbar
		_revisionToolbar: null,
		
		// _revisionGrid: content.js.views.RevisionGrid
		_revisionGrid: null,
		
		// _defaultCriteria: Object
		_defaultCriteria: {
			article_id: null,
			keyword: null
		},
		
		// _revisionMediator: content.js.controllers.RevisionMediator
		_revisionMediator: new content.js.controllers.RevisionMediator(),
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/content/js/controllers/RevisionController",
		
		constructor: function(/*String*/ id, /*String*/ articleId) {
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
			
			this._id = id;
			this._defaultCriteria.article_id = articleId;
			
			core.js.base.I18N.requireLocalization("content/languages");
			this._i18n = core.js.base.I18N.getLocalization("content/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
		},
		
		setRevisionToolbar: function(/*content.js.views.RevisionToolbar*/ toolbar) {
			// summary:
			//		Sets the revision toolbar
			this._revisionToolbar = toolbar;
			
			var that = this;
			// Refresh handler
			dojoAspect.after(toolbar, "onRefresh", dojoLang.hitch(this, "searchRevisions"));
			
			// Seach handler
			dojoAspect.after(toolbar, "onSearchRevisions", function(keyword) {
				that.searchRevisions({
					keyword: keyword
				});
			}, true);
			
			// Close toolbar handler
			dojoAspect.after(toolbar, "onClose", function() {
				dojoTopic.publish("/app/content/revision/list/onClose");
			});
			
			return this;	// content.js.controllers.RevisionController
		},
		
		setRevisionGrid: function(/*content.js.views.RevisionGrid*/ revisionGrid) {
			// summary:
			//		Sets the revision grid
			this._revisionGrid = revisionGrid;
			this._revisionMediator.setRevisionGrid(revisionGrid);
			
			// Restore handler
			dojoAspect.after(revisionGrid, "onRestoreRevision", dojoLang.hitch(this, "restoreRevision"), true);
			
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/revision/restore/onCancel", this, function() {
				this._helper.closeDialog();
			});
			
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/revision/restore/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.revision.restore[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					// this.searchRevisions();
				}
			});
			
			// View revision handler
			dojoAspect.after(revisionGrid, "onViewRevision", dojoLang.hitch(this, "viewRevision"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/revision/view/onClose", this, function() {
				this._helper.removePane();
			});
			
			// Delete revision handler
			dojoAspect.after(revisionGrid, "onDeleteRevision", dojoLang.hitch(this, "deleteRevision"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/revision/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/content/revision/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.revision["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchRevisions();
				}
			});
			
			return this;	// content.js.controllers.RevisionController
		},
		
		deleteRevision: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Deletes given revision
			var params = {
				revision_id: item.revision_id[0]
			};
			var url = core.js.base.controllers.ActionProvider.get("content_revision_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "contentRevisionDeleteDialog",
				title: this._i18n.revision["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		restoreRevision: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Restores given revision
			var params = {
				revision_id: item.revision_id[0]
			};
			var url = core.js.base.controllers.ActionProvider.get("content_revision_restore").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "contentRevisionRestoreDialog",
				title: this._i18n.revision.restore.title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		searchRevisions: function(/*Object*/ criteria) {
			// summary:
			//		Searches for revisions
			criteria = dojoLang.mixin(this._defaultCriteria, criteria);
			if (this._revisionGrid) {
				this._revisionGrid.show(criteria);
			}
		},
		
		viewRevision: function(/*dojo.data.Item*/ item) {
			// summary:
			//		Shows revision's details
			var params = {
				revision_id: item.revision_id[0]
			};
			var url = core.js.base.controllers.ActionProvider.get("content_revision_view").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				region: "bottom",
				splitter: true,
				gutters: false,
				minSize: 400,
				style: "height: 75%; width: 100%"
			});
		}
	});
});
