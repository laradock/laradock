docker-build:
	docker-compose up --build -d nginx php-fpm mariadb phpmyadmin workspace

docker-laravel-up:
	docker-compose up -d nginx php-fpm mariadb phpmyadmin workspace

laravel-workspace:
	docker-compose exec --user=laradock workspace bash

laravel-workspace-root:
	docker-compose exec workspace bash

laravel-db:
	docker-compose exec --user=laradock mariadb bash

laravel-db-root:
	docker-compose exec --user=root mariadb bash

docker-stop:
	docker-compose stop

sdo_admin-test:
	docker-compose exec --user=laradock workspace vendor/bin/phpunit

sdo_admin-assets-install:
	docker-compose exec --user=laradock workspace bash -c 'yarn install'

sdo_admin-assets-rebuild:
	docker-compose exec --user=laradock workspace bash -c 'npm rebuild node-sass --force'

sdo_admin-assets-dev:
	docker-compose exec --user=laradock workspace bash -c 'yarn run dev'

sdo_admin-assets-production:
	docker-compose exec --user=laradock workspace bash -c 'yarn run production'

sdo_admin-assets-watch:
	docker-compose exec --user=laradock workspace bash -c 'yarn run watch'

