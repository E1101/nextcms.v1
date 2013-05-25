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
	"dojo/_base/lang",
	"dojo/aspect",
	"dojo/hash",
	"dojo/io-query",
	"dojo/request/xhr",
	"dojo/topic",
	"core/js/base/controllers/ActionProvider",
	"core/js/base/controllers/Subscriber",
	"core/js/base/Encoder",
	"core/js/base/I18N",
	"core/js/base/views/Helper"
], function(dojoDeclare, dojoLang, dojoAspect, dojoHash, dojoIoQuery, dojoRequestXhr, dojoTopic) {
	return dojoDeclare("ad.js.controllers.BannerController", null, {
		// _id: String
		_id: null,
		
		// _i18n: Object
		_i18n: null,
		
		// _helper: core.js.base.views.Helper
		_helper: null,
		
		// _toolbar: ad.js.views.BannerToolbar
		_toolbar: null,
		
		// _bannerListView: ad.js.views.BannerListView
		_bannerListView: null,
		
		// _bannerContextMenu: ad.js.views.BannerContextMenu
		_bannerContextMenu: null,
		
		// _defaultCriteria: Object
		_defaultCriteria: {
			page: 1,
			per_page: 20
		},
		
		// TOPIC_GROUP: [const] String
		TOPIC_GROUP: "/ad/js/controllers/BannerController",
		
		constructor: function(/*String*/ id) {
			this._id = id;
			
			core.js.base.I18N.requireLocalization("ad/languages");
			this._i18n = core.js.base.I18N.getLocalization("ad/languages");
			
			// Create helper instance
			this._helper = new core.js.base.views.Helper(id);
			this._helper.setLanguageData(this._i18n);
			
			core.js.base.controllers.Subscriber.unsubscribe(this.TOPIC_GROUP);
		},
		
		setBannerToolbar: function(/*ad.js.views.BannerToolbar*/ toolbar) {
			// summary:
			//		Sets the banner toolbar
			this._toolbar = toolbar;
			
			var that = this;
			// Add banner handler
			dojoAspect.after(toolbar, "onAddBanner", dojoLang.hitch(this, "addBanner"));
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/ad/banner/add/onCancel", this._helper, "removePane");
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/ad/banner/add/onStart", this._helper, "showStandby");
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/ad/banner/add/onComplete", this, function(data) {
				this._helper.hideStandby();
				this._helper.removePane();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.banner.add[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchBanners();
				}
			});
			
			// Refresh handler
			dojoAspect.after(toolbar, "onRefresh", dojoLang.hitch(this, "searchBanners"));
			
			// Search handler
			dojoAspect.after(toolbar, "onSearchBanners", function(keyword) {
				that.searchBanners({
					keyword: keyword
				});
			}, true);
			
			// Update page size handler
			dojoAspect.after(toolbar, "onUpdatePageSize", function(perPage) {
				that.searchBanners({
					per_page: perPage
				});
			}, true);
			
			return this;	// ad.js.controllers.BannerController
		},
		
		setBannerListView: function(/*ad.js.views.BannerListView*/ bannerListView) {
			// summary:
			//		Sets the banner list view
			this._bannerListView = bannerListView;
			
			// Paging handler
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/ad/banner/list/onGotoPage", this, function(page) {
				this.searchBanners({
					page: page
				});
			});
			
			var that = this;
			dojoAspect.after(bannerListView, "onMouseDown", function(bannerItemView) {
				if (that._bannerContextMenu) {
					that._bannerContextMenu.show(bannerItemView);
				}
			}, true);
			
			return this;	// ad.js.controllers.BannerController
		},
		
		setBannerContextMenu: function(/*ad.js.views.BannerContextMenu*/ bannerContextMenu) {
			// summary:
			//		Sets the banner context menu
			this._bannerContextMenu = bannerContextMenu;
			
			// Activate handler
			dojoAspect.after(bannerContextMenu, "onActivateBanner", dojoLang.hitch(this, "activateBanner"), true);
			
			// Delete handler
			dojoAspect.after(bannerContextMenu, "onDeleteBanner", dojoLang.hitch(this, "deleteBanner"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/ad/banner/delete/onCancel", this, function() {
				this._helper.closeDialog();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/ad/banner/delete/onComplete", this, function(data) {
				this._helper.closeDialog();
				
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.banner["delete"][("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchBanners();
				}
			});
			
			// Edit handler
			dojoAspect.after(bannerContextMenu, "onEditBanner", dojoLang.hitch(this, "editBanner"), true);
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/ad/banner/edit/onCancel", this, function() {
				this._helper.removePane();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/ad/banner/edit/onStart", this, function() {
				this._helper.showStandby();
			});
			core.js.base.controllers.Subscriber.subscribe(this.TOPIC_GROUP, "/app/ad/banner/edit/onComplete", this, function(data) {
				this._helper.hideStandby();
				dojoTopic.publish("/app/global/notification", {
					message: this._i18n.banner.edit[("APP_RESULT_OK" == data.result) ? "success" : "error"],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					this.searchBanners();
				}
			});
			
			return this;	// ad.js.controllers.BannerController
		},
		
		activateBanner: function(/*ad.js.views.BannerItemView*/ bannerItemView) {
			// summary:
			//		Activates/deactivates given banner item
			var bannerId = bannerItemView.getBanner().banner_id;
			var status	 = bannerItemView.getBanner().status;
			var that	 = this;
			
			dojoRequestXhr(core.js.base.controllers.ActionProvider.get("ad_banner_activate").url, {
				data: {
					banner_id: bannerId
				},
				handleAs: "json",
				method: "POST"
			}).then(function(data) {
				var message = ("APP_RESULT_OK" == data.result) 
							? ("activated" == status ? "deactivateSuccess" : "activateSuccess") 
							: ("activated" == status ? "deactivateError" : "activateError");
				dojoTopic.publish("/app/global/notification", {
					message: that._i18n.banner.activate[message],
					type: ("APP_RESULT_OK" == data.result) ? "message" : "error"
				});
				
				if ("APP_RESULT_OK" == data.result) {
					var newStatus = ("activated" == status) ? "not_activated" : "activated";
					bannerItemView.getBanner().status = newStatus;
				}
			});
		},
		
		addBanner: function() {
			// summary:
			//		Adds new banner
			var url = core.js.base.controllers.ActionProvider.get("ad_banner_add").url;
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		},
		
		deleteBanner: function(/*ad.js.views.BannerItemView*/ bannerItemView) {
			// summary:
			//		Deletes banner
			var params = {
				banner_id: bannerItemView.getBanner().banner_id
			};
			var url = core.js.base.controllers.ActionProvider.get("ad_banner_delete").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showDialog(url, {
				id: "adBannerDeleteDialog",
				title: this._i18n.banner["delete"].title,
				style: "width: 250px",
				refreshOnShow: true
			});
		},
		
		editBanner: function(/*ad.js.views.BannerItemView*/ bannerItemView) {
			// summary:
			//		Edits given banner
			var params = {
				banner_id: bannerItemView.getBanner().banner_id
			};
			var url = core.js.base.controllers.ActionProvider.get("ad_banner_edit").url + "?" + dojoIoQuery.objectToQuery(params);
			this._helper.showPane(url, {
				style: "width: 50%"
			});
		},
		
		initSearchCriteria: function(/*Object*/ criteria) {
			// summary:
			//		Inits controls based on given criteria
			dojoLang.mixin(this._defaultCriteria, criteria);
			this._toolbar.initSearchCriteria(this._defaultCriteria);
		},
		
		searchBanners: function(/*Object*/ criteria) {
			// summary:
			//		Searches for banners by given criteria
			dojoLang.mixin(this._defaultCriteria, criteria);

			var that = this;
			var q    = core.js.base.Encoder.encode(this._defaultCriteria);
			var url  = core.js.base.controllers.ActionProvider.get("ad_banner_list").url;
			dojoHash("u=" + url + "/?q=" + q);
			
			this._helper.showStandby();
			dojoRequestXhr(url, {
				data: {
					q: q,
					format: "html"
				},
				method: "POST"
			}).then(function(data) {
				that._helper.hideStandby();
				that._bannerListView.setContent(data);
			});
		}
	});
});
