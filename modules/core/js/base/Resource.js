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

define([
	"dojo/_base/declare",
	"dojo/dom-construct",
	"dojo/query"
], function(dojoDeclare, dojoDomConstruct) {
	var clazz = dojoDeclare("core.js.base.Resource", null, {});
	
	clazz.loadCss = function(/*String*/ path) {
		// summary:
		//		Loads a given CSS file
		if (dojo.query('link[type="text/css"][href="' + path + '"]').length == 0) {
			dojoDomConstruct.create("link", {
				href: path,
				media: "screen",
				rel: "stylesheet",
				type: "text/css"
			}, dojo.query("head")[0]);
		}
	};
	
	clazz.loadJs = function(/*String*/ path) {
		// summary:
		//		Loads a given JS file
		if (dojo.query('script[type="text/javascript"][src="' + path + '"]').length == 0) {
			dojoDomConstruct.create("script", {
				type: "text/javascript",
				src: path
			}, dojo.query("head")[0]);
		}
	};
	
	return clazz;
});
