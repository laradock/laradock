FROM alpine:latest

RUN set -x \
    && addgroup -g 1000 -S www-data \
    && adduser -u 1000 -D -S -G www-data www-data

# Install essentials
RUN apk add --no-cache curl ca-certificates

# Add testing repository
RUN echo "@testing http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories
RUN apk upgrade

# Install common PHP extensions
RUN apk add --no-cache \
    php7-ctype@testing \
    php7-curl@testing \
    php7-dom@testing \
    php7-gd@testing \
    php7-iconv@testing \
    php7-json@testing \
    php7-mbstring@testing \
    php7-mcrypt@testing \
    php7-memcached@testing \
    php7-mongodb@testing \
    #php7-mysqlnd@testing \
    php7-openssl@testing \
    php7-opcache@testing \
    php7-pdo_mysql@testing \
    php7-pdo_pgsql@testing \
    php7-pdo_sqlite@testing \
    php7-posix@testing \
    php7-session@testing \
    php7-sqlite3@testing \
    php7-xml@testing \
    php7-xmlreader@testing \
    php7-zlib@testing

# Install PHP
RUN apk add --no-cache php7@testing php7-phar@testing
RUN ln -s /usr/bin/php7 /usr/bin/php

# Install Composer
RUN curl -s http://getcomposer.org/installer | /usr/bin/php7 \
    && mv composer.phar /usr/local/bin/composer

# Install Node.js and Gulp
RUN apk add --no-cache nodejs
RUN npm install --global gulp-cli

# Install shell & tools
RUN apk add --no-cache bash

# Set shell variables
ENV LANGUAGE=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8
ENV LC_CTYPE=UTF-8
ENV LANG=en_US.UTF-8
ENV TERM xterm

# Install optional software
ARG COMPOSER_INSTALL="" 

#RUN if ! [[ -z $COMPOSER_INSTALL ]]; then set -x & \
#        composer global require ${COMPOSER_INSTALL}; \
#    fi

WORKDIR /var/www/laravel
CMD ["bash"]
