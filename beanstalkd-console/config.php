<?php
$GLOBALS['config'] = [
    /**
     * List of servers available for all users
     */
    'servers' => ['beanstalkd:11300' => 'beanstalkd:11300'],
    /**
     * Saved samples jobs are kept in this file, must be writable
     */
    'storage' => dirname(__FILE__) . DIRECTORY_SEPARATOR . 'storage.json',
    /**
     * Optional Basic Authentication
     */
    'auth'    => [
        'enabled'  => false,
        'username' => 'admin',
        'password' => 'password',
    ],
    /**
     * Version number
     */
    'version' => '1.7.10',
];
