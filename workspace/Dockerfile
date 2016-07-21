FROM phusion/baseimage:latest

MAINTAINER Mahmoud Zalt <mahmoud@zalt.me>

RUN DEBIAN_FRONTEND=noninteractive
RUN locale-gen en_US.UTF-8

ENV LANGUAGE=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8
ENV LC_CTYPE=UTF-8
ENV LANG=en_US.UTF-8
ENV TERM xterm

# Install "software-properties-common" (for the "add-apt-repository")
RUN apt-get update && apt-get install -y \
    software-properties-common

# Add the "PHP 7" ppa
RUN add-apt-repository -y \
    ppa:ondrej/php

# Install PHP-CLI 7, some PHP extentions and some useful Tools with APT
RUN apt-get update && apt-get install -y --force-yes \
        php7.0-cli \
        php7.0-common \
        php7.0-curl \
        php7.0-json \
        php7.0-xml \
        php7.0-mbstring \
        php7.0-mcrypt \
        php7.0-mysql \
        php7.0-pgsql \
        php7.0-sqlite \
        php7.0-sqlite3 \
        php7.0-zip \
        php7.0-memcached \
        php7.0-gd \
        php7.0-xdebug \
        php-dev \
        libcurl4-openssl-dev \
        libedit-dev \
        libssl-dev \
        libxml2-dev \
        xz-utils \
        sqlite3 \
        libsqlite3-dev \
        git \
        curl \
        vim \
        nano \
        pkg-config

# Clean up, to free some space
RUN apt-get clean

# remove load xdebug extension (only load on phpunit command)
RUN sed -i 's/^/;/g' /etc/php/7.0/cli/conf.d/20-xdebug.ini

# Add bin folder of composer to PATH.
RUN echo "export PATH=${PATH}:/var/www/laravel/vendor/bin" >> ~/.bashrc

# Install Composer
RUN curl -s http://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer

# Load xdebug Zend extension with phpunit command
RUN echo "alias phpunit='php -dzend_extension=xdebug.so /var/www/laravel/vendor/bin/phpunit'" >> ~/.bashrc

# Install mongodb extension
RUN pecl install mongodb
RUN echo "extension=mongodb.so" >> /etc/php/7.0/cli/php.ini

# Install nvm (Node Version Manager)
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash

ENV NVM_DIR=/root/.nvm

# Install stable node
RUN . ~/.nvm/nvm.sh \
    && nvm install stable \
    && nvm use stable \
    && nvm alias stable \
    && npm install -g gulp bower

# Source the bash
RUN . ~/.bashrc

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /var/www/laravel

# Install optional software
ARG INSTALL_PRESTISSIMO=false
RUN if [ "$INSTALL_PRESTISSIMO" = true ] ; then \
        composer global require "hirak/prestissimo:^0.3"; \
    fi
