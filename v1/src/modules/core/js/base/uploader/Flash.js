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
 * @version		2012-08-24
 */

define([
	"dojo/_base/array",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/on",
	"dojo/topic",
	"dojox/form/Uploader",
	"dojox/form/uploader/plugins/Flash"
], function(dojoArray, dojoDeclare, dojoLang, dojoDomAttr, dojoDomConstruct, dojoOn, dojoTopic) {
	// This hack fixes the issue that Flash uploader does NOT work on IE9
	var flashUploader = dojoDeclare("core.js.base.uploader.Flash", dojox.form.uploader.plugins.Flash, {
		_fileComplete: function(dataArray) {
			this.onFileComplete(dataArray);
		},
		
		onFileComplete: function(dataArray) {
			// summary:
			//		This method is called after a file is uploaded completely.
		},
		
		_setUrlAttr: function(/*String*/ url) {
			// I need to rebuild the embed flash when set new upload URL
			if (this.inputNode && this.url && url &&
					(this.url != url) && ("flash" == this.uploadType))
			{
				this.url = url;
				var node = this.inputNode;
				var handler = dojoOn(this, "load", function() {
					dojoDomConstruct.destroy(node);
					handler.remove();
				});
				this._createFlashUploader();
			} else {
				this.inherited(arguments);
			}
		},
		
		_connectFlash: function() {
			var that = this;

			if (this._subs == null) {
				this._subs = [];
				
				var doSub = dojoLang.hitch(this, function(s, funcStr){
					this._subs.push(dojoTopic.subscribe(this.id + s, dojoLang.hitch(this, funcStr)));
				});
		
				doSub("/filesSelected", "_change");
				doSub("/filesUploaded", "_complete");
				doSub("/filesProgress", "_progress");
				doSub("/filesError", "_error");
				doSub("/filesCanceled", "onCancel");
				doSub("/stageBlur", "_onFlashBlur");
				
				// NEW METHOD:
				doSub("/fileComplete", "_fileComplete");
			}
			
			this.connect(this.domNode, "focus", function() {
				// HACK: http://bugs.dojotoolkit.org/ticket/14150
				if (!that.flashMovie) {
					return;
				}
				// ORIGINAL BY DOJO
				that.flashMovie.focus();
				that.flashMovie.doFocus();
			});
			if (this.tabIndex >= 0) {
				dojoDomAttr.set(this.domNode, "tabIndex", this.tabIndex);
			}
		},
		
		destroy: function(/*Boolean*/ preserveDom) {
			// summary:
			//		Destroy the widget
			//		I need to unsubscribe all handlers
			this.inherited(arguments);
			dojoArray.forEach(this._subs, function(s) {
				s.remove();
			});
		}
	});
	
	dojox.form.addUploaderPlugin(flashUploader);
	
	return flashUploader;
});
