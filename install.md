# Laradock using the lepp for Multiple Projects

This Docker Compose stack consists of the following:

* PHP
* Apache
* Redis
* PostgreSQL

extensions:
* imap
* rabbitmq

The current setup is created for laravel 8/9

##  Installation

* Clone this repository on your local computer
* In the same folder clone the the other laravel projects
* Run `cp sample.env .env` and change following variables

`PHP_VERSION=8.0`
`WORKSPACE_INSTALL_IMAP=true`
`PHP_FPM_INSTALL_IMAP=true`
`WORKSPACE_INSTALL_AMQP=true`
`PHP_FPM_INSTALL_AMQP=true`

* create nginx/sites/*.conf for your laravel projects
```#server {
#    listen 80;
#    server_name laravel.com.co;
#    return 301 https://laravel.com.co$request_uri;
#}

server {

    listen 80;
    listen [::]:80;

    # For https
    # listen 443 ssl;
    # listen [::]:443 ssl ipv6only=on;
    # ssl_certificate /etc/nginx/ssl/default.crt;
    # ssl_certificate_key /etc/nginx/ssl/default.key;

    server_name laravel.test;
    root /var/www/laravel/public;
    index index.php index.html index.htm;

    location / {
         try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        try_files $uri /index.php =404;
        fastcgi_pass php-upstream;
        fastcgi_index index.php;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        #fixes timeouts
        fastcgi_read_timeout 600;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt/;
        log_not_found off;
    }

    error_log /var/log/nginx/laravel_error.log;
    access_log /var/log/nginx/laravel_access.log;
}
```

* Run `docker-compose up -d nginx postgres redis rabbitmq workspace`
* Run `docker-compose exec workspace bash`
* `cd into.your.laravel.projects`
* Run `composer install` in all projects
* Run `php artisan migrate:fresh --seed` in all projects
* Run `chown laradock:1000 storage/logs -R && chmod g+s storage/logs/ -R` in all projects
