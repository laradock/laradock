ARG ROADRUNNER_VERSION=2025.1.15
ARG LARADOCK_PHP_VERSION=8.4

# Pull the rr binary from the official RoadRunner image.
FROM ghcr.io/roadrunner-server/roadrunner:${ROADRUNNER_VERSION} AS roadrunner

FROM php:${LARADOCK_PHP_VERSION}-cli-alpine

LABEL maintainer="Laradock"

ARG CHANGE_SOURCE=false
RUN if [ ${CHANGE_SOURCE} = true ]; then \
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/' /etc/apk/repositories \
;fi

COPY --from=roadrunner /usr/bin/rr /usr/local/bin/rr

# RoadRunner's PHP workers use sockets; opcache keeps them fast.
RUN set -eux; \
    apk add --no-cache --virtual .build-deps $PHPIZE_DEPS linux-headers; \
    docker-php-ext-install sockets opcache; \
    apk del .build-deps

WORKDIR /var/www

# Serves the mounted Laravel app via its .rr.yaml (e.g. Laravel Octane).
CMD ["rr", "serve"]
