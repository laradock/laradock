<?php
$settings['memcache']['servers'] = ['memcached:11211' => 'default'];
$settings['memcache']['bins'] = ['default' => 'default'];
$settings['memcache']['key_prefix'] = '';

$settings['cache']['default'] = 'cache.backend.memcache';

#$settings['memcache_storage']['key_prefix'] = '';
#$settings['memcache_storage']['memcached_servers'] = ['127.0.0.1:11211' => 'default'];

#$settings['cache']['default'] = 'cache.backend.memcache_storage';

