# syntax=docker/dockerfile:1
#
#--------------------------------------------------------------------------
# Laradock — Production Image
#--------------------------------------------------------------------------
#
# Turns the SAME stack you dev with into a hardened, shippable image:
# code baked in (no bind mount), composer deps resolved, opcache frozen,
# no xdebug, production php.ini. Any PHP app — Laravel, Symfony, WordPress,
# Moodle, Drupal, plain PHP.
#
# Easiest build:  ./laradock ship
# Manual build (from your PROJECT root, where composer.json / index.php lives):
#   cp laradock/production/dockerignore.sample .dockerignore
#   docker build -f laradock/production/Dockerfile -t myapp:latest .
#
# Self-contained: the only thing it needs from the build context is your app
# code, so it builds no matter where the laradock folder sits.
#

ARG PHP_VERSION=8.3
# ponytail: default to Laradock's public base = the same extensions dev's base
# ships. Enabled extras in dev (redis, pdo_pgsql, gd...)? add them at "extensions"
# below, or point BASE_IMAGE at your locally-built laradock php-fpm image.
ARG BASE_IMAGE=laradock/php-fpm:latest-${PHP_VERSION}

FROM ${BASE_IMAGE}
LABEL org.opencontainers.image.source="https://github.com/laradock/laradock"
LABEL org.opencontainers.image.description="Laradock production PHP-FPM image"

# --- production PHP config (errors off) ---
COPY <<'EOF' /usr/local/etc/php/conf.d/zz-laradock-prod.ini
expose_php = Off
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /proc/self/fd/2
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
memory_limit = 256M
max_execution_time = 60
upload_max_filesize = 32M
post_max_size = 32M
realpath_cache_size = 4096K
realpath_cache_ttl = 600
EOF

# --- production opcache: the big win is validate_timestamps=0 (never stat files;
#     a deploy is a new image, so the code never changes under a live container) ---
COPY <<'EOF' /usr/local/etc/php/conf.d/zz-laradock-opcache.ini
opcache.enable = 1
opcache.enable_cli = 0
opcache.memory_consumption = 256
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 30000
opcache.validate_timestamps = 0
opcache.revalidate_freq = 0
opcache.save_comments = 1
opcache.fast_shutdown = 1
EOF

# composer binary — only used if your project has a composer.json
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# bake app + resolved vendor in (immutable image = reproducible deploy)
COPY --chown=www-data:www-data . /var/www
RUN if [ -f composer.json ]; then \
      composer install --no-dev --optimize-autoloader \
        --no-interaction --no-progress --prefer-dist; \
    fi

# extensions: add any you enabled in dev but the base lacks, e.g.:
# RUN docker-php-ext-install pdo_pgsql pcntl \
#  && pecl install redis && docker-php-ext-enable redis

USER www-data
EXPOSE 9000

# ponytail: php-fpm speaks FastCGI not HTTP — liveness = is the master alive.
# Upgrade path: cgi-fcgi ping a /ping pool for a real request-level check.
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD pgrep php-fpm >/dev/null || exit 1

CMD ["php-fpm"]
