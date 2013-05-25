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
 * @version		2012-08-22
 */

define(["dojo/_base/declare"], function(dojoDeclare) {
	var clazz = dojoDeclare("core.js.base.Config", null, {});
	
	clazz.set = function(/*String*/ module, /*String*/ key, /*String*/ value) {
		// summary:
		//		Sets a module setting
		if (!clazz._configs[module]) {
			clazz._configs[module] = {};
		}
		clazz._configs[module][key] = value;
	};
	
	clazz.get = function(/*String*/ module, /*String*/ key, /*String*/ defaultValue) {
		// summary:
		//		Gets value of module setting
		if (!clazz._configs[module]) {
			return defaultValue;
		}
		var value = clazz._configs[module][key];
		return (value == null && defaultValue) ? defaultValue : value;	// Object
	};
	
	clazz._configs = {};
	
	return clazz;
});
