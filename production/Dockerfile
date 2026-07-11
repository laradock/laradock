# syntax=docker/dockerfile:1
#
#--------------------------------------------------------------------------
# Laradock — Production Image (self-contained web container)
#--------------------------------------------------------------------------
#
# ONE image that serves HTTP on $PORT (nginx + php-fpm inside), so it runs
# anywhere a container runs: a server, Kubernetes, or any single-container
# cloud (Cloud Run, ECS, App Runner, Azure Container Apps, Fly, Render,
# Railway, DigitalOcean, Heroku). Any PHP app — Laravel, Symfony, WordPress,
# Moodle, plain PHP.
#
# Build:  ./laradock ship        (or: docker build -f production/Dockerfile -t myapp .)
# Run:    docker run -p 8080:8080 myapp   ->   http://localhost:8080
#
# Workers/scheduler/migrations reuse THIS image with a command override, e.g.
#   docker run myapp php artisan queue:work
# (any command passed is exec'd instead of the web server — see entrypoint.)
#

ARG PHP_VERSION=8.3
# ponytail: default to Laradock's public base = same extensions dev's base ships.
ARG BASE_IMAGE=laradock/php-fpm:latest-${PHP_VERSION}

FROM ${BASE_IMAGE}
LABEL org.opencontainers.image.source="https://github.com/laradock/laradock"
LABEL org.opencontainers.image.description="Laradock production image (nginx + php-fpm, serves \$PORT)"

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

# --- production opcache: validate_timestamps=0 (code never changes under a live container) ---
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

# --- nginx + supervisor so one container serves HTTP directly ---
RUN set -eux; \
    apt-get update -yqq; \
    apt-get install -yqq --no-install-recommends nginx supervisor gettext-base curl; \
    rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default

# nginx site (a template; ${PORT}/${WEBROOT} are filled at boot, nginx's own $vars are kept literal)
COPY <<'EOF' /etc/nginx/templates/site.conf.template
server {
    listen ${PORT} default_server;
    root ${WEBROOT};
    index index.php index.html;
    client_max_body_size 32m;

    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;

    location / { try_files $uri $uri/ /index.php?$query_string; }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        fastcgi_read_timeout 60;
    }
    location ~ /\.(?!well-known).* { deny all; }
}
EOF

# supervisor runs php-fpm + nginx together, logs to the container's stdout/stderr
COPY <<'EOF' /etc/supervisor/conf.d/app.conf
[supervisord]
nodaemon=true
user=root
logfile=/dev/null
logfile_maxbytes=0

[program:php-fpm]
command=php-fpm -F
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:nginx]
command=nginx -g "daemon off;"
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
EOF

# entrypoint: a passed command (worker/scheduler/migrate) runs as-is; otherwise serve HTTP on $PORT
COPY <<'EOF' /usr/local/bin/laradock-entrypoint.sh
#!/bin/sh
set -e
if [ "$#" -gt 0 ]; then exec "$@"; fi
: "${PORT:=8080}"; : "${WEBROOT:=/var/www/public}"
export PORT WEBROOT
envsubst '${PORT} ${WEBROOT}' < /etc/nginx/templates/site.conf.template > /etc/nginx/conf.d/default.conf
exec supervisord -c /etc/supervisor/conf.d/app.conf
EOF
RUN chmod +x /usr/local/bin/laradock-entrypoint.sh

# composer binary — only used if your project has a composer.json
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY --chown=www-data:www-data . /var/www
RUN if [ -f composer.json ]; then \
      composer install --no-dev --optimize-autoloader \
        --no-interaction --no-progress --prefer-dist; \
    fi

# extensions: add any you enabled in dev but the base lacks, e.g.:
# RUN docker-php-ext-install pdo_pgsql pcntl \
#  && pecl install redis && docker-php-ext-enable redis

ENV PORT=8080 WEBROOT=/var/www/public
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null || exit 1

ENTRYPOINT ["/usr/local/bin/laradock-entrypoint.sh"]
