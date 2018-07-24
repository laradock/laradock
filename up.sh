#!/bin/bash -ex

docker-compose up -d mongo nginx

docker-compose exec workspace bash -c "php artisan migrate";
docker-compose exec workspace bash -c "php artisan passport:install --force";
docker exec -it laradock_nginx_1 bash -c "cd /var/www/axio-frontend && ./bin/build.sh";
