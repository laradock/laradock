ARG LARADOCK_PHP_VERSION
FROM php:${LARADOCK_PHP_VERSION}-cli-alpine

LABEL maintainer="Laradock"

# If you're in China, or need to change sources, set CHANGE_SOURCE to true in .env.
ARG CHANGE_SOURCE=false
RUN if [ ${CHANGE_SOURCE} = true ]; then \
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/' /etc/apk/repositories \
;fi

# Laravel Reverb runs an event loop and (optionally) scales over Redis; it needs
# pcntl, posix and sockets, plus the redis extension for horizontal scaling.
RUN set -eux; \
    apk add --no-cache --virtual .build-deps $PHPIZE_DEPS linux-headers; \
    docker-php-ext-install pcntl posix sockets; \
    pecl install redis; \
    docker-php-ext-enable redis; \
    apk del .build-deps

WORKDIR /var/www

# Start the Reverb WebSocket server from the mounted Laravel application.
CMD ["php", "artisan", "reverb:start", "--host=0.0.0.0", "--port=8080"]
