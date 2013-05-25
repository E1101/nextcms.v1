<?php
/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		util
 * @subpackage	hooks
 * @since		1.0
 * @version		2012-08-26
 */

defined('APP_VALID_REQUEST') || die('You cannot access the script directly.');

/**
 * Information of the Emoticon hook
 * 
 * @return array
 */
return array(
	'name'  => 'emoticon',
	'title' => array(
		'translationKey' => '_about.title',
		'description' 	=> 'Emoticon',
	),
	'description' => array(
		'translationKey' => '_about.description',
		'description'    => 'Replace special characters with emoticons',
	),
	'thumbnail' => '/modules/util/hooks/emoticon/emoticon.png',
	'website'   => null,
	'author'    => 'Nguyen Huu Phuoc',
	'email' 	=> 'thenextcms@gmail.com',
	'version' 	 => '1.0',
	'appVersion' => '1.0+',
	'license'	 => 'http://nextcms.org/license.txt',
	'requirements' => array(
		'phpExtensions' => '',
		'php'			=> '5.2.4+',
		'dbAdapters'	=> '',
	),
	'options' => array(
		'skin' => 'small',
		'maps' => array(
			// See http://en.wikipedia.org/wiki/List_of_emoticons
			'angel'		  => array('O:)', 'O:-)'),
			'confused'	  => array('o.O', 'O.o'),
			'cry'		  => array(":'("),
			'devil'		  => array('3:)', '3:-)'),
			'embarrassed' => array('>:X', ':-X', ':X', ':-#', ':#', ':$'),
			'glasses'	  => array('8-)', '8)', 'B-)', 'B)'),
			'grin'		  => array(':-D', ':D', '=D'),
			'kiss'		  => array(':-*', ':*'),
			'laugh'		  => array('>:D'),
			'raspberry'   => array('>:P', 'X-P', 'x-p'),
			'sad'		  => array(':-(', ':(', ':[', '=('),
			'sleeping'	  => array('ZZzzz...'),	
			'smile'		  => array(':-)', ':)', ':]', '=)'),
			'surprise'	  => array('>:o', '>:O', ':-O', ':O'),
			'tongue'	  => array(':-P', ':P', ':-p', ':p', '=P'),
			'unsure'	  => array(':-/', ':\\', ':-\\'),
			'wink'		  => array(';-)', ';)'),
		),
	),
	'filter'  => true,
	'install' => array(
		'queries'	=> array(),
		'callbacks' => array(),
	),
	'uninstall' => array(
		'queries'	=> array(),
		'callbacks' => array(),
	),
);
