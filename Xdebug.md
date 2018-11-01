
# Debug with PHPStorm in Laradock
## 1. clone for0231/laradock or laradock/laradock from github.
If you clone from for0231/laradock, it could transform to product environment docker, or use the original laradock.
## 2. Setting Development environment
Command: `git apply -v xdebug.patch`
Note: `xdebug.remote_connect_back = 0`; 
Then env-example dockerhost variable, set to local ip, the example is `192.168.3.43` is my osx ip address. 
You must set yours.
`cp env-example .env` and build the laradock with `docker-compose build workspace php-fpm`;  

Then it's configuration for laradock is complete.

## 3. configuration for phpstorm.
Setting for PHPStorm: Language & Frameworks > PHP > Server; Add a laradock for server host; Remember you Host, Port, and
xdebug method. The most important for the absolute path in the web server, this is /var/www/drupal, You can write it directly by input.

Then modify nothing, like Debug DBGp proxy IDE key, or Add Configuration near by phone tag.