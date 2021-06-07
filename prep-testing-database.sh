#!/usr/bin/env bash
docker-compose exec --user=laradock workspace php artisan migrate:fresh --env=testing
docker-compose exec --user=laradock workspace php artisan db:seed --env=testing