FROM webdevops/apache:alpine

LABEL maintainer="Eric Pfeiffer <computerfr33k@users.noreply.github.com>"

ARG DOCUMENT_ROOT=/var/www/
ARG PHP_UPSTREAM_CONTAINER=php-fpm
ARG PHP_UPSTREAM_PORT=9000
ARG PHP_UPSTREAM_TIMEOUT=60
ARG APACHE_INSTALL_HTTP2=false

ENV WEB_PHP_SOCKET=${PHP_UPSTREAM_CONTAINER}:${PHP_UPSTREAM_PORT}
ENV WEB_DOCUMENT_ROOT=${DOCUMENT_ROOT}
ENV APACHE_HTTP2=${APACHE_INSTALL_HTTP2}
ENV WEB_PHP_TIMEOUT=${PHP_UPSTREAM_TIMEOUT}

ENV LOG_STDOUT=/var/log/apache2/access.log
ENV LOG_STDERR=/var/log/apache2/error.log

# Keep Apache's ServerRoot and dynamic modules outside the /var/www bind mount.
RUN set -eux; \
    ln -sfn /usr/lib/apache2 /etc/apache2/modules; \
    sed -i 's|^ServerRoot /var/www$|ServerRoot /etc/apache2|' /etc/apache2/httpd.conf; \
    grep -q '^DocumentRoot "/var/www/localhost/htdocs"' /etc/apache2/httpd.conf; \
    sed -i 's|^DocumentRoot "/var/www/localhost/htdocs"|DocumentRoot "/var/www"|' /etc/apache2/httpd.conf

# The base image's entrypoint expands the WEB_* values in this config at startup.
COPY vhost.conf /opt/docker/etc/httpd/conf.d/99-laradock-vhosts.conf
COPY startup.sh /opt/docker/provision/entrypoint.d/50-laradock-tls.sh

RUN if [ "${APACHE_INSTALL_HTTP2}" = true ]; then \
      apk add --no-cache apache2-http2 openssl; \
      sed -i 's|^#LoadModule http2_module|LoadModule http2_module|' /etc/apache2/httpd.conf; \
      printf '%s\n' 'Protocols h2 http/1.1' > /opt/docker/etc/httpd/conf.d/20-http2.conf; \
    fi

EXPOSE 80 443

ARG APACHE_FOR_MAC_M1=false
RUN if [ ${APACHE_FOR_MAC_M1} = true ]; then \
    wget -O "/usr/local/bin/go-replace" "https://github.com/webdevops/goreplace/releases/download/1.1.2/gr-arm64-linux" && \
    chmod +x "/usr/local/bin/go-replace" && \
    "/usr/local/bin/go-replace" --version \
;fi
