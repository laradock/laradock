#!/usr/bin/env bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

(
cd "$SCRIPT_DIR" \
&& docker-compose exec --user=laradock workspace php artisan migrate:fresh --env=testing \
&& docker-compose exec --user=laradock workspace php artisan db:seed --env=testing
)
