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

ARG PHP_VER=5.6
RUN apt-get -y install php${PHP_VER} php${PHP_VER}-gd php${PHP_VER}-ldap \
    php${PHP_VER}-sqlite php${PHP_VER}-pgsql php-pear php${PHP_VER}-mysql \
    php${PHP_VER}-mcrypt php${PHP_VER}-xmlrpc php${PHP_VER}-fpm php${PHP_VER}-cli php${PHP_VER}-curl \
    php${PHP_VER}-json php${PHP_VER}-odbc php${PHP_VER}-tidy php${PHP_VER}-imap \
    php${PHP_VER}-redis php${PHP_VER}-intl php${PHP_VER}-pgsql \
    php${PHP_VER}-sybase sendmail supervisor \
    && mkdir /run/php



#####################################
# MongoDB:
#####################################

ARG INSTALL_MONGO=false
RUN if [ ${INSTALL_MONGO} = true ]; then \
    # Install the mongodb extension
    apt-get -y install php${PHP_VER}-mongodb \
;fi

#####################################
# ZipArchive:
#####################################

ARG INSTALL_ZIP_ARCHIVE=false
RUN if [ ${INSTALL_ZIP_ARCHIVE} = true ]; then \
    # Install the zip extension
    apt-get -y install php${PHP_VER}-zip \
;fi

#####################################
# PHP Memcached:
#####################################

ARG INSTALL_MEMCACHED=false
RUN if [ ${INSTALL_MEMCACHED} = true ]; then \
    # Install the php memcached extension
    apt-get -y install php${PHP_VER}-memcached \
;fi


#
#--------------------------------------------------------------------------
# Final Touch
#--------------------------------------------------------------------------
#

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN sed -i -e 's/listen = \/run\/php\/php'"${PHP_VER}"'-fpm.sock/listen = 0.0.0.0:9000/g' /etc/php/${PHP_VER}/fpm/pool.d/www.conf \
    && sed -i -e 's/;daemonize = yes/daemonize = no/g' /etc/php/${PHP_VER}/fpm/php-fpm.conf

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN usermod -u 1000 www-data

WORKDIR /var/www/laravel

CMD ["/usr/bin/supervisord"]

EXPOSE 9000
