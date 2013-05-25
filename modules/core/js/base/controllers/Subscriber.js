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
 * @version		2012-08-30
 */

define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/topic"
], function(dojoDeclare, dojoLang, dojoTopic) {
	var clazz = dojoDeclare("core.js.base.controllers.Subscriber", null, {});

	clazz.subscribe = function(/*String*/ group, /*String*/ topic, /*Object*/ context, /*Function*/ callback) {
		if (!clazz._handlers[group]) {
			clazz._handlers[group] = {};
		}
		clazz._handlers[group][topic] = dojoTopic.subscribe(topic, dojoLang.hitch(context, callback));
		return clazz._handlers[group][topic];		// Object
	};
	
	clazz.unsubscribe = function(/*String*/ group, /*String?*/ topic) {
		var groupHandlers = clazz._handlers[group];
		if (groupHandlers) {
			if (topic) {
				groupHandlers[topic].remove();
			} else {
				for (var i in groupHandlers) {
					groupHandlers[i].remove();
				}
			}
		}
	};
	
	clazz.unsubscribeAll = function(/*String?*/ topic) {
		var handlers = clazz._handlers;
		for (var group in handlers) {
			if (topic && handlers[group][topic]) {
				handlers[group][topic].remove();
			} else {
				clazz.unsubscribe(handlers[group]);
			}
		}
	};
	
	clazz._handlers = {};
	
	return clazz;
});
