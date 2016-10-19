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
    php7.0-json php7.0-odbc php7.0-tidy php7.0-imap \
    php7.0-redis php7.0-intl php7.0-pgsql \
    php7.0-sybase sendmail supervisor \
    && mkdir /run/php



#####################################
# MongoDB:
#####################################

ARG INSTALL_MONGO=false
RUN if [ ${INSTALL_MONGO} = true ]; then \
    # Install the mongodb extension
    apt-get -y install php7.0-mongodb \
;fi

#####################################
# ZipArchive:
#####################################

ARG INSTALL_ZIP_ARCHIVE=false
RUN if [ ${INSTALL_ZIP_ARCHIVE} = true ]; then \
    # Install the zip extension
    pecl install zip \
;fi

#####################################
# PHP Memcached:
#####################################

ARG INSTALL_MEMCACHED=false
RUN if [ ${INSTALL_MEMCACHED} = true ]; then \
    # Install the php memcached extension
    pecl install memcache \
;fi


#
#--------------------------------------------------------------------------
# Final Touch
#--------------------------------------------------------------------------
#

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN sed -i -e 's/listen = \/run\/php\/php7.0-fpm.sock/listen = 0.0.0.0:9000/g' /etc/php/7.0/fpm/pool.d/www.conf \
    && sed -i -e 's/;daemonize = yes/daemonize = no/g' /etc/php/7.0/fpm/php-fpm.conf

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN usermod -u 1000 www-data

WORKDIR /var/www/laravel

CMD ["/usr/bin/supervisord"]

EXPOSE 9000
