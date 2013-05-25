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
	var clazz = dojoDeclare("core.js.Constant", null, {});
	
	// The root URL. There are some cases I need the root URL value, such as showing the images.
	// This constant should be used in the back-end only and has to be set at the top of page.
	// For example, at the top of the layout script:
	//	| 	dojo.require("core.js.Constant");
	//	| 	core.js.Constant.ROOT_URL = "<?php echo $this->APP_ROOT_URL; ?>";
	clazz.ROOT_URL = "";
	
	clazz.normalizeUrl = function(url) {
		// summary:
		//		Normalizes an url
		if (!url) {
			return "";	// String
		}
		if ("http://" == url.substr(0, 7) || "https://" == url.substr(0, 8)) {
			return url;		// String
		}
		var rootUrl = clazz.ROOT_URL;
		rootUrl		= rootUrl.replace(new RegExp("[/]+$", "g"), "");
		url			= url.replace(new RegExp("^[/]+", "g"), "");
		return rootUrl + "/" + url;		// String
	};
	
	return clazz;
});
