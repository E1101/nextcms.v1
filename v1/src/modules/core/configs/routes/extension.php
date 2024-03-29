<?php
/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		core
 * @subpackage	configs
 * @since		1.0
 * @version		2012-09-14
 */

defined('APP_VALID_REQUEST') || die('You cannot access the script directly.');

/**
 * Define routes for helper actions related to extensions
 * 
 * @return array
 */
return array(
	/* ========== BACKEND ACTIONS =========================================== */
	// Render extension action
	'core_extension_render' => array(
		'type'	   => 'Zend_Controller_Router_Route_Static',
		'route'	   => '{adminPrefix}/core/extension/render',
		'defaults' => array(
			'module'	 => 'core',
			'controller' => 'extension',
			'action'	 => 'render',
			'allowed'	 => true,
		),
	),
);
