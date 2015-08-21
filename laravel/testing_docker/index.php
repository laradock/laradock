<?php

echo 'Let\'s Start.. ';

try{
	$pdo = new \PDO(
	    'mysql:host=localdock;dbname=laravel', // you need to create the database manually when you boot the mysql docker container 
	    'root',
	    'pass'
	);

	echo 'I am connected to the DB. ';

}catch(Exception $e){
	echo $e;
}

	echo 'Everything is cool.';

phpinfo();
