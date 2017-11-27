FROM nginx:alpine

MAINTAINER Mahmoud Zalt <mahmoud@zalt.me>

ADD nginx.conf /etc/nginx/

ARG PHP_UPSTREAM_CONTAINER=php-fpm
ARG PHP_UPSTREAM_PORT=9000

RUN apk update \
    && apk upgrade \
    && apk add --no-cache bash \
    && adduser -D -H -u 1000 -s /bin/bash www-data

# install openssl
RUN apk add --no-cache openssl

# create a folder for the keys
RUN mkdir /etc/nginx/ssl 2> /dev/null

# generate the keys for localhost
RUN openssl genrsa -out "/etc/nginx/ssl/localhost.key" 2048 \
    && openssl req -new -key "/etc/nginx/ssl/localhost.key" -out "/etc/nginx/ssl/localhost.csr" -subj "/CN=localhost/O=HeyOrca/C=CA" \
    && openssl x509 -req -days 365 -in "/etc/nginx/ssl/localhost.csr" -signkey "/etc/nginx/ssl/localhost.key" -out "/etc/nginx/ssl/localhost.crt"

# Set upstream conf and remove the default conf
RUN echo "upstream php-upstream { server ${PHP_UPSTREAM_CONTAINER}:${PHP_UPSTREAM_PORT}; }" > /etc/nginx/conf.d/upstream.conf \
    && rm /etc/nginx/conf.d/default.conf

CMD ["nginx"]

EXPOSE 80 443
