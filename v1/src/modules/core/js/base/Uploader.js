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
	"dojo/_base/declare",
	"dojo/sniff",
	"dojo/parser",
	"dojox/form/Uploader",
	"dojox/form/uploader/plugins/HTML5"
], function(dojoDeclare, dojoSniff) {
	var clazz = dojoDeclare("core.js.base.Uploader", dojox.form.Uploader, {});
	if (dojoSniff("ie")) {
		require([
			"dojox/form/uploader/plugins/Flash",
			"core/js/base/uploader/Flash"
		], function() {
			clazz = dojoDeclare("core.js.base.Uploader", dojox.form.Uploader, {});
		});
	}
	return clazz;
});
