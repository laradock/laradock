FROM ubuntu:16.04

MAINTAINER Mahmoud Zalt <mahmoud@zalt.me>

RUN DEBIAN_FRONTEND=noninteractive
RUN locale-gen en_US.UTF-8
ENV LANGUAGE=en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

# Install some essential libraries
RUN apt-get update && apt-get install -y \
    software-properties-common \
    python-software-properties \
    autoconf \
    file \
    g++ \
    gcc \
    libc-dev \
    make \
    pkg-config

# Install PHP-CLI 7
RUN add-apt-repository -y ppa:ondrej/php
RUN apt-get update && apt-get install -y \
    php7.0-cli \
    php7.0-common \
    php7.0-curl \
    php7.0-json \
    php7.0-mbstring \
    php7.0-mcrypt \
    php7.0-mysql

# Install some Tools
RUN apt-get install -y \
    git \
    curl \
    vim \
    nano

# Setup the Composer installer
RUN curl -s http://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/ \
    && alias composer='/usr/local/bin/composer.phar'

# Clean up
RUN rm -r /var/lib/apt/lists/*

ENTRYPOINT ["top", "-b"]

WORKDIR /var/www/laravel

