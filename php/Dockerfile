# You can change the PHP version from here. After changing the PHP version, check the Memcached section below because it replies on PHP 7.
FROM php:7.0-fpm 

MAINTAINER Mahmoud Zalt <mahmoud@zalt.me>

ADD ./laravel.ini /usr/local/etc/php/conf.d
ADD ./laravel.pool.conf /usr/local/etc/php-fpm.d/

RUN apt-get update && apt-get install \
	libpq-dev -y \
    curl \
    libmemcached-dev

# Install extensions using the helper script provided by the base image
RUN docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql

# Install Memcached for php 7
RUN curl -L -o /tmp/memcached.tar.gz "https://github.com/php-memcached-dev/php-memcached/archive/php7.tar.gz" \
    && mkdir -p /usr/src/php/ext/memcached \
    && tar -C /usr/src/php/ext/memcached -zxvf /tmp/memcached.tar.gz --strip 1 \
    && docker-php-ext-configure memcached \
    && docker-php-ext-install memcached \
    && rm /tmp/memcached.tar.gz

RUN usermod -u 1000 www-data

WORKDIR /var/www/laravel

CMD ["php-fpm"]

EXPOSE 9000
