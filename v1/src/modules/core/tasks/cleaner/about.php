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
 * @subpackage	tasks
 * @since		1.0
 * @version		2011-12-21
 */

defined('APP_VALID_REQUEST') || die('You cannot access the script directly.');

/**
 * Information of the Cleaner task
 * 
 * @return array
 */
return array(
	'name'  => 'cleaner',
	'title' => array(
		'translationKey' => '_about.title',
		'description' 	=> 'System Cleaner',
	),
	'description' => array(
		'translationKey' => '_about.description',
		'description'    => 'Clean the system, such as deleting the access logs, errors',
	),
	'thumbnail' => '/modules/core/tasks/cleaner/cleaner32.png',
	'website'   => null,
	'author'    => 'Nguyen Huu Phuoc',
	'email' 	=> 'thenextcms@gmail.com',
	'version' 	 => '1.0',
	'appVersion' => '1.0+',
	'license'	 => 'http://nextcms.org/license.txt',
	'requirements' => array(
		'phpExtensions' => '',
		'php'			=> '5.2.4+',
		'dbAdapters'	=> 'mysql,pdo_mysql',
	),
	'timeMask' => '0 0 * * *',
	'options'  => array(),
	'install'  => array(
		'queries'	=> array(),
		'callbacks' => array(),
	),
	'uninstall' => array(
		'queries'	=> array(),
		'callbacks' => array(),
	),
);
