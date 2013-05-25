<?php
/**
 * NextCMS
 * 
 * @author		Nguyen Huu Phuoc <thenextcms@gmail.com>
 * @copyright	Copyright (c) 2011 - 2012, Nguyen Huu Phuoc
 * @license		http://nextcms.org/license.txt	(GNU GPL version 2 or later)
 * @link		http://nextcms.org
 * @category	modules
 * @package		tag
 * @subpackage	hooks
 * @since		1.0
 * @version		2012-08-24
 */

defined('APP_VALID_REQUEST') || die('You cannot access the script directly.');

class Tag_Hooks_Tagprovider_Hook extends Core_Base_Extension_Hook
{
	public function __construct()
	{
		parent::__construct();
		Core_Base_Hook_Registry::getInstance()->register('Core_Layout_Admin_ShowMenu_tag', array($this, 'menu'), true);
		if (Zend_Layout::getMvcInstance() && 'admin' == Zend_Layout::getMvcInstance()->getLayout()) {
			$this->view->style()->appendStylesheet($this->view->APP_STATIC_URL . '/modules/tag/hooks/tagprovider/styles.css');
		}
	}
	
	/**
	 * This method is called after installing the hook from the back-end
	 *
	 * @return void
	 */
	public function install()
	{
		$this->_cleanCssCaching();
	}
	
	/**
	 * This method is called after uninstalling the hook from the back-end
	 *
	 * @return void
	 */
	public function uninstall()
	{
		$this->_cleanCssCaching();
	}
	
	/**
	 * Cleans the CSS caching. It should be called when the hook is installed/uninstalled
	 * 
	 * @return void
	 */
	private function _cleanCssCaching()
	{
		Core_Services_Db::connect('slave');
		if ('true' == Core_Services_Config::get('core', 'compress_css', 'false')) {
			$view = Zend_Controller_Action_HelperBroker::getStaticHelper('viewRenderer')->view;
			$view->style()->cleanCaching();
		}
	}
	
	/**
	 * Shows the menu item in the back-end
	 * 
	 * @return void
	 */
	public function menuAction()
	{
	}
	
	/**
	 * Searches for tags
	 * 
	 * @return void
	 */
	public function searchAction()
	{
		Core_Services_Db::connect('slave');
		
		$request  = $this->getRequest();
		$q		  = $request->getParam('q');
		$default  = array(
			'keyword'  => null,
			'page'	   => 1,
			'per_page' => 50,
			'language' => Core_Services_Config::get('core', 'localization_default_language', 'en_US'),
		);
		$criteria = $q ? Zend_Json::decode(base64_decode(rawurldecode($q))) : array();
		$criteria = array_merge($default, $criteria);
		$offset	  = ($criteria['page'] > 0) ? ($criteria['page'] - 1) * $criteria['per_page'] : 0;
		$tags	  = Tag_Services_Tag::find($criteria, $offset, $criteria['per_page']);
		$total	  = Tag_Services_Tag::count($criteria);
		
		$paginator = new Zend_Paginator(new Core_Base_Paginator_Adapter($tags, $total));
		$paginator->setCurrentPageNumber($criteria['page'])
				  ->setItemCountPerPage($criteria['per_page']);
		
		$this->view->assign(array(
			'tags'		=> $tags,
			'paginator' => $paginator,
		));
	}
	
	/**
	 * Shows the toolbox
	 * 
	 * @return void
	 */
	public function showAction()
	{
		$this->view->assign(array(
			'language'	=> Core_Services_Config::get('core', 'localization_default_language', 'en_US'),
			'languages' => Zend_Json::decode(Core_Services_Config::get('core', 'localization_languages', '{"en_US":"English"}')),
		));
	}
}
