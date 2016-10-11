FROM ubuntu:14.04
MAINTAINER Pavel Litvyak <pvlltvk@gmail.com>

ENV DEBIAN_FRONTEND noninteractive

RUN locale-gen en_US.UTF-8
ENV LANG       en_US.UTF-8
ENV LC_ALL     en_US.UTF-8

RUN apt-get update

#
#---------------------------------------------------
# First Setting up locale to include utf8 charset
#---------------------------------------------------
#
#
#
RUN apt-get install -y language-pack-en-base
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8


RUN apt-get install -y software-properties-common && \
    add-apt-repository -y ppa:ondrej/php && \
    apt-get update

RUN apt-get -y install php7.0 php7.0-gd php7.0-ldap \
    php7.0-sqlite php7.0-pgsql php-pear php7.0-mysql \
    php7.0-mcrypt php7.0-xmlrpc php7.0-fpm php7.0-cli php7.0-curl \
    php7.0-json php7.0-odbc php7.0-tidy php7.0-zip php7.0-imap \
    php7.0-memcached php7.0-redis php7.0-intl php7.0-pgsql \
    php7.0-mongodb php7.0-sybase

#
#--------------------------------------------------------------------------
# Final Touch
#--------------------------------------------------------------------------
#



ADD ./laravel.pool.conf /etc/php/7.0/fpm/pool.d/www.conf


RUN rm -r /var/lib/apt/lists/*

RUN usermod -u 1000 www-data

WORKDIR /var/www/laravel

CMD ["php-fpm"]

EXPOSE 9000
