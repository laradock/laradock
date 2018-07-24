#!/bin/bash -ex

docker-compose up -d mongo nginx

docker-compose exec workspace bash -c "cd /var/www/axio-api && php artisan migrate && php artisan passport:install --force";
docker-compose exec --user=laradock workspace bash --login -c "cd /var/www/axio-frontend && ./bin/build.sh";
