FROM webdevops/apache:ubuntu-16.04

MAINTAINER Eric Pfeiffer <computerfr33k@users.noreply.github.com>

ARG PHP_SOCKET="php-fpm:9000"

ENV WEB_PHP_SOCKET=$PHP_SOCKET

ENV WEB_DOCUMENT_ROOT=/var/www/laravel/public

EXPOSE 80 443

WORKDIR /var/www/laravel/public

ENTRYPOINT ["/opt/docker/bin/entrypoint.sh"]

CMD ["supervisord"]
