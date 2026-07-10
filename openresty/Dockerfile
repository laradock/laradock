# OpenResty, using the maintained upstream prebuilt image.
#
# This used to compile OpenResty from source pinned to OpenResty 1.19.3.2 and
# OpenSSL 1.1.1k (EOL since Sept 2023). We now track the official prebuilt image,
# which ships a current OpenSSL 3.x and is kept up to date upstream.
#
# Note: the old source build also bundled a few third-party modules
# (brotli, cache_purge, substitutions, dav-ext, nginx-ct). The prebuilt image
# does not include those. If you need them, build from the upstream
# docker-openresty source Dockerfile instead.
ARG OPENRESTY_VERSION=1.27.1.2-alpine
FROM openresty/openresty:${OPENRESTY_VERSION}

LABEL maintainer="Laradock <team@laradock.io>"

ARG CHANGE_SOURCE=false
RUN if [ ${CHANGE_SOURCE} = true ]; then \
    # Change application source from dl-cdn.alpinelinux.org to aliyun source
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/' /etc/apk/repositories \
;fi

# Create the www-data user referenced by nginx.conf, add runtime deps used by
# startup.sh (bash, openssl) and log rotation, and drop the image's default vhost.
RUN set -x \
    && (addgroup -g 82 -S www-data 2>/dev/null || true) \
    && (adduser -u 82 -D -S -G www-data www-data 2>/dev/null || true) \
    && apk add --no-cache bash openssl logrotate \
    && mkdir -p /etc/nginx/conf.d/ /etc/nginx/sites-available /etc/nginx/ssl /var/run/openresty/ \
    && rm -f /etc/nginx/conf.d/default.conf

ARG PHP_UPSTREAM_CONTAINER=php-fpm
ARG PHP_UPSTREAM_PORT=9000

# Create 'messages' file used from 'logrotate'
RUN touch /var/log/messages

# Copy 'logrotate' config file
COPY logrotate/nginx /etc/logrotate.d/

# Set upstream conf (included by nginx.conf via /etc/nginx/conf.d/*.conf)
RUN echo "upstream php-upstream { server ${PHP_UPSTREAM_CONTAINER}:${PHP_UPSTREAM_PORT}; }" > /etc/nginx/conf.d/upstream.conf

# Copy nginx configuration to the path the prebuilt image actually loads
COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

COPY ./startup.sh /opt/startup.sh
RUN sed -i 's/\r//g' /opt/startup.sh
CMD ["/bin/bash", "/opt/startup.sh"]

EXPOSE 80 81 443
