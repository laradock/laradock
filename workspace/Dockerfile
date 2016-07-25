#
#--------------------------------------------------------------------------
# Image Setup
#--------------------------------------------------------------------------
#

FROM phusion/baseimage:latest

MAINTAINER Mahmoud Zalt <mahmoud@zalt.me>

RUN DEBIAN_FRONTEND=noninteractive
RUN locale-gen en_US.UTF-8

ENV LANGUAGE=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8
ENV LC_CTYPE=UTF-8
ENV LANG=en_US.UTF-8
ENV TERM xterm

# Add the "PHP 7" ppa
RUN apt-get install -y software-properties-common && \
    add-apt-repository -y ppa:ondrej/php

#
#--------------------------------------------------------------------------
# Software's Installation
#--------------------------------------------------------------------------
#

# Install "PHP Extentions", "libraries", "Software's"
RUN apt-get update && \
    apt-get install -y --force-yes \
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
        pkg-config \
        php-dev \
        libcurl4-openssl-dev \
        libedit-dev \
        libssl-dev \
        libxml2-dev \
        xz-utils \
        libsqlite3-dev \
        sqlite3 \
        git \
        curl \
        vim \
        nano \
    && apt-get clean

# Composer: Install composer and add its bin to the PATH.
RUN curl -s http://getcomposer.org/installer | php && \
    echo "export PATH=${PATH}:/var/www/laravel/vendor/bin" >> ~/.bashrc && \
    mv composer.phar /usr/local/bin/composer

ARG INSTALL_PRESTISSIMO=true
ENV INSTALL_PRESTISSIMO ${INSTALL_PRESTISSIMO}
RUN if [ ${INSTALL_PRESTISSIMO} = true ]; then \
    # Prestissimo: Install Prestissimo (A Composer parallel install plugin)
    composer global require "hirak/prestissimo:^0.3" \
;fi

ARG INSTALL_MONGO=true
ENV INSTALL_MONGO ${INSTALL_MONGO}
RUN if [ ${INSTALL_MONGO} = true ]; then \
    # MongoDB: Install the mongodb extension
    pecl install mongodb && \
        echo "extension=mongodb.so" >> /etc/php/7.0/cli/php.ini \
;fi

ARG INSTALL_XDEBUG=true
ENV INSTALL_XDEBUG ${INSTALL_XDEBUG}
RUN if [ ${INSTALL_XDEBUG} = true ]; then \
    # XDebug: Load the xdebug extension only with phpunit commands
    apt-get install -y --force-yes php7.0-xdebug && \
        sed -i 's/^/;/g' /etc/php/7.0/cli/conf.d/20-xdebug.ini && \
        echo "alias phpunit='php -dzend_extension=xdebug.so /var/www/laravel/vendor/bin/phpunit'" >> ~/.bashrc \
;fi

ARG INSTALL_NODE=true
ENV INSTALL_NODE ${INSTALL_NODE}
RUN if [ ${INSTALL_NODE} = true ]; then \
    # Node: Install nvm (A Node Version Manager) and use it to install NodeJS
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash \
;fi
ENV if [ ${INSTALL_NODE} = true ]; then \
    # I had to split this condifiton link this because when I get it inside the above if statment is refuses to work!
    NVM_DIR=/root/.nvm \
    RUN . ~/.nvm/nvm.sh && \
        nvm install stable && \
        nvm use stable && \
        nvm alias stable && \
        npm install -g gulp bower \
;fi

#
#--------------------------------------------------------------------------
# Final Touch
#--------------------------------------------------------------------------
#

# Source the bash
RUN . ~/.bashrc

# Clean up
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /var/www/laravel

