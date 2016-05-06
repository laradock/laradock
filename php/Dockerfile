FROM php:7.0-fpm

MAINTAINER Mahmoud Zalt <mahmoud@zalt.me>

ADD ./laravel.ini /usr/local/etc/php/conf.d
ADD ./laravel.pool.conf /usr/local/etc/php-fpm.d/

# Install extensions using the helper script provided by the base image
RUN docker-php-ext-install \
    pdo_mysql

RUN usermod -u 1000 www-data

CMD ["php-fpm"]

EXPOSE 9000
