FROM webdevops/apache:ubuntu-18.04

LABEL maintainer="Eric Pfeiffer <computerfr33k@users.noreply.github.com>"

ARG PHP_UPSTREAM_CONTAINER=php-fpm
ARG PHP_UPSTREAM_PORT=9000
ARG PHP_UPSTREAM_TIMEOUT=60
ARG DOCUMENT_ROOT=/var/www/

ENV WEB_PHP_SOCKET=${PHP_UPSTREAM_CONTAINER}:${PHP_UPSTREAM_PORT}

ENV WEB_DOCUMENT_ROOT=${DOCUMENT_ROOT}

ENV WEB_PHP_TIMEOUT=${PHP_UPSTREAM_TIMEOUT}

EXPOSE 80 443

WORKDIR /var/www/

COPY vhost.conf /etc/apache2/sites-enabled/vhost.conf

### SSL

RUN mkdir /etc/apache2/ssl 2> /dev/null
RUN openssl genrsa -out "/etc/apache2/ssl/hallolex.key" 2048 \
    && openssl req -new -key "/etc/apache2/ssl/hallolex.key" -out "/etc/apache2/ssl/hallolex.csr" -subj "/CN=hallolex.localhost/O=HalloLex/C=NL" \
    && openssl x509 -req -days 365 -in "/etc/apache2/ssl/hallolex.csr" -signkey "/etc/apache2/ssl/hallolex.key" -out "/etc/apache2/ssl/hallolex.crt"
RUN openssl genrsa -out "/etc/apache2/ssl/personalprotein.key" 2048 \
    && openssl req -new -key "/etc/apache2/ssl/personalprotein.key" -out "/etc/apache2/ssl/personalprotein.csr" -subj "/CN=personalprotein.localhost/O=PersonalProtein/C=NL" \
    && openssl x509 -req -days 365 -in "/etc/apache2/ssl/personalprotein.csr" -signkey "/etc/apache2/ssl/personalprotein.key" -out "/etc/apache2/ssl/personalprotein.crt"
RUN openssl genrsa -out "/etc/apache2/ssl/crawler.key" 2048 \
    && openssl req -new -key "/etc/apache2/ssl/crawler.key" -out "/etc/apache2/ssl/crawler.csr" -subj "/CN=crawler.localhost/O=Crawler/C=NL" \
    && openssl x509 -req -days 365 -in "/etc/apache2/ssl/crawler.csr" -signkey "/etc/apache2/ssl/crawler.key" -out "/etc/apache2/ssl/crawler.crt"

# RUN a2enmod rewrite && a2enmod headers && a2enmod proxy proxy_html proxy_http xml2enc
# RUN a2enmod ssl
# RUN service apache2 restart

# chrome://flags/#allow-insecure-localhost

ENTRYPOINT ["/opt/docker/bin/entrypoint.sh"]

CMD ["supervisord"]
