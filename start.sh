#!/bin/sh
cp base-env .env
docker-compose up -d nginx postgres redis campus-frontend
sleep 1
docker-compose exec --user=laradock workspace bash -c 'cd internal-october && composer install --no-progress --optimize-autoloader'
docker-compose exec --user=laradock workspace bash -c 'cd internal-october && php artisan october:up'
docker-compose exec --user=laradock workspace bash -c 'cd curriculum && composer install --no-progress --optimize-autoloader'
docker-compose exec --user=laradock workspace bash -c 'cd api && composer install --no-progress --optimize-autoloader'
