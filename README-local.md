### Step
1. modify `docker-compose.yml`
    change `extra_hosts` in `php-fpm` as your own host name
2. change `env-local` name
    `env-local` -> `.env`
3. modify `.env`
    - change code path:`APP_CODE_PATH_HOST`
    - change your own docker host IP:`DOCKER_HOST_IP`
4. add your conf in `laradock/nginx/sites`
    - example:
    ```
    server {

        listen 80;
        listen [::]:80;

        server_name fd.y4l3.com;
        root /var/www/xinan-fd/public;
        index index.php index.html index.htm;

        location / {
            try_files $uri $uri/ /index.php$is_args$args;
        }

        location ~ \/api\/.*$ {
            root /var/www/xinan-fd/public;
            rewrite ^/api/(.*) /index.php?$query_string last;
        }

        location ~ \.php$ {
            try_files $uri /index.php =404;
            fastcgi_pass php-upstream;
            fastcgi_index index.php;
            fastcgi_buffers 16 16k;
            fastcgi_buffer_size 32k;
            fastcgi_param  APP_ENV development;
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

        error_log /var/log/nginx/xinan_fd_error.log;
        access_log /var/log/nginx/xinan_fd_access.log;
    }
    ```
4. build docker container
    - `cd` in `laradock` path
    - build docker container `docker-compose up -d nginx redis php-fpm workspace mysql`
5. clone you project code in the path `APP_CODE_PATH_HOST`
6. start docker container `docker-compose start nginx redis php-fpm workspace mysql`