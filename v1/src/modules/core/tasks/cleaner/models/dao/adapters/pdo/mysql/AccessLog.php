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
 * @version		2011-10-18
 */

defined('APP_VALID_REQUEST') || die('You cannot access the script directly.');

class Core_Tasks_Cleaner_Models_Dao_Adapters_Pdo_Mysql_AccessLog extends Core_Base_Models_Dao
	implements Core_Tasks_Cleaner_Models_Dao_Interface_AccessLog
{
	/**
	 * @see Core_Base_Models_Dao::convert()
	 */
	public function convert($entity)
	{
		return new Core_Models_AccessLog($entity);
	}

	/**
	 * @see Core_Tasks_Cleaner_Models_Dao_Interface_AccessLog::deleteAccessLogs()
	 */
	public function deleteAccessLogs($days)
	{
		$date = date('Y-m-d', strtotime('-' . $days . ' days'));
		$this->_conn->delete($this->_prefix . 'core_access_log',
							array(
								'accessed_date < ?' => $date,
							));
	}
}
