#!/bin/sh

phpmd() {
    docker-compose run workspace ./vendor/bin/phpmd app text ./phpmd-ruleset.xml
    docker-compose run workspace ./vendor/bin/phpmd tests text ./phpmd-ruleset.xml
    docker-compose run workspace ./vendor/bin/phpmd routes text ./phpmd-ruleset.xml
    docker-compose run workspace ./vendor/bin/phpmd packages text ./phpmd-ruleset.xml
    docker-compose run workspace ./vendor/bin/phpmd config text ./phpmd-ruleset.xml
}

pdepend() {
    docker-compose run workspace ./vendor/bin/pdepend --summary-xml=summary.xml --jdepend-chart=public/img/jdepend.svg --overview-pyramid=public/img/pyramid.svg app
    docker-compose run workspace ./vendor/bin/pdepend --summary-xml=summary-packages.xml --jdepend-chart=public/img/jdepend-packages.svg --overview-pyramid=public/img/pyramid-packages.svg packages
}

psr() {
    docker-compose run workspace ./vendor/bin/php-cs-fixer fix --config=.php_cs.dist -v --using-cache=no
}

phpunit() {
    docker-compose run workspace ./vendor/bin/phpunit
}

$1
