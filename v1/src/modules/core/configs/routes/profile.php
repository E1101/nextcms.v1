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
 * @version		2012-09-11
 */

defined('APP_VALID_REQUEST') || die('You cannot access the script directly.');

/**
 * Define routes for managing user's profile
 * 
 * @return array
 */
return array(
	/* ========== BACKEND ACTIONS =========================================== */
	// Edit user's profile
	'core_profile_edit' => array(
		'type'	   => 'Zend_Controller_Router_Route_Static',
		'route'	   => '{adminPrefix}/core/profile/edit',
		'defaults' => array(
			'module'	 => 'core',
			'controller' => 'profile',
			'action'	 => 'edit',
			'allowed'	 => true,
		),
	),
);
