#
#--------------------------------------------------------------------------
# Image Setup
#--------------------------------------------------------------------------
#

ARG LARADOCK_PHP_VERSION
FROM php:${LARADOCK_PHP_VERSION}-alpine

LABEL maintainer="Mahmoud Zalt <mahmoud@zalt.me>"

ARG LARADOCK_PHP_VERSION

# If you're in China, or you need to change sources, will be set CHANGE_SOURCE to true in .env.

ARG CHANGE_SOURCE=false
RUN if [ ${CHANGE_SOURCE} = true ]; then \
    # Change application source from dl-cdn.alpinelinux.org to aliyun source
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/' /etc/apk/repositories \
;fi

RUN apk --update add wget \
  curl \
  git \
  build-base \
  libmemcached-dev \
  libmcrypt-dev \
  libxml2-dev \
  pcre-dev \
  zlib-dev \
  autoconf \
  cyrus-sasl-dev \
  libgsasl-dev \
  oniguruma-dev \
  openssl \
  openssl-dev \
  supervisor

RUN docker-php-ext-install mysqli mbstring pdo pdo_mysql tokenizer xml pcntl
RUN if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
  pecl channel-update pecl.php.net && pecl install memcached-2.2.0 mcrypt-1.0.1 mongodb && docker-php-ext-enable memcached mongodb \
;else \
  pecl channel-update pecl.php.net && pecl install memcached mcrypt-1.0.1 mongodb && docker-php-ext-enable memcached mongodb \
;fi

# Add a non-root user:
ARG PUID=1000
ENV PUID ${PUID}
ARG PGID=1000
ENV PGID ${PGID}

RUN addgroup -g ${PGID} laradock && \
    adduser -D -G laradock -u ${PUID} laradock

#Install BZ2:
ARG INSTALL_BZ2=false
RUN if [ ${INSTALL_BZ2} = true ]; then \
  apk --update add bzip2-dev; \
  docker-php-ext-install bz2; \
fi

#Install GD package:
ARG INSTALL_GD=false
RUN if [ ${INSTALL_GD} = true ]; then \
   apk add --update --no-cache freetype-dev libjpeg-turbo-dev jpeg-dev libpng-dev; \
   docker-php-ext-configure gd --with-freetype-dir=/usr/lib/ --with-jpeg-dir=/usr/lib/ --with-png-dir=/usr/lib/ && \
   docker-php-ext-install gd \
;fi

#Install ImageMagick:
ARG INSTALL_IMAGEMAGICK=false
RUN if [ ${INSTALL_IMAGEMAGICK} = true ]; then \
  apk add --update imagemagick-dev imagemagick; \
  pecl install imagick; \
  docker-php-ext-enable imagick \
;fi

#Install GMP package:
ARG INSTALL_GMP=false
RUN if [ ${INSTALL_GMP} = true ]; then \
   apk add --update --no-cache gmp gmp-dev \
   && docker-php-ext-install gmp \
;fi

#Install SOAP package:
ARG INSTALL_SOAP=false
RUN if [ ${INSTALL_SOAP} = true ]; then \
    docker-php-ext-install soap \
;fi

#Install BCMath package:
ARG INSTALL_BCMATH=false
RUN if [ ${INSTALL_BCMATH} = true ]; then \
    docker-php-ext-install bcmath \
;fi

###########################################################################
# PHP OCI8:
###########################################################################

ARG INSTALL_OCI8=false

ENV LD_LIBRARY_PATH="/usr/local/instantclient"
ENV ORACLE_HOME="/usr/local/instantclient"

RUN if [ ${INSTALL_OCI8} = true ] && [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ]; then \
    apk add make php7-pear php7-dev gcc musl-dev libnsl libaio poppler-utils libzip-dev zip unzip libaio-dev freetds-dev && \
    ## Download and unarchive Instant Client v11
      curl -o /tmp/basic.zip https://raw.githubusercontent.com/bumpx/oracle-instantclient/master/instantclient-basic-linux.x64-11.2.0.4.0.zip && \
      curl -o /tmp/sdk.zip https://raw.githubusercontent.com/bumpx/oracle-instantclient/master/instantclient-sdk-linux.x64-11.2.0.4.0.zip && \
      curl -o /tmp/sqlplus.zip https://raw.githubusercontent.com/bumpx/oracle-instantclient/master/instantclient-sqlplus-linux.x64-11.2.0.4.0.zip && \
      unzip -d /usr/local/ /tmp/basic.zip && \
      unzip -d /usr/local/ /tmp/sdk.zip && \
      unzip -d /usr/local/ /tmp/sqlplus.zip \
    ## Links are required for older SDKs
      && ln -s /usr/local/instantclient_11_2 ${ORACLE_HOME} && \
      ln -s ${ORACLE_HOME}/libclntsh.so.* ${ORACLE_HOME}/libclntsh.so && \
      ln -s ${ORACLE_HOME}/libocci.so.* ${ORACLE_HOME}/libocci.so && \
      ln -s ${ORACLE_HOME}/lib* /usr/lib && \
      ln -s ${ORACLE_HOME}/sqlplus /usr/bin/sqlplus &&\
      ln -s /usr/lib/libnsl.so.2.0.0  /usr/lib/libnsl.so.1 && \
    ## Build OCI8 with PECL
      echo "instantclient,${ORACLE_HOME}" | pecl install oci8 && \
      echo 'extension=oci8.so' > /etc/php7/conf.d/30-oci8.ini \
    #  Clean up
    apk del php7-pear php7-dev gcc musl-dev && \
    rm -rf /tmp/*.zip /tmp/pear/ && \
    docker-php-ext-configure pdo_oci --with-pdo-oci=instantclient,/usr/local/instantclient \
        && docker-php-ext-configure pdo_dblib --with-libdir=/lib \
        && docker-php-ext-install pdo_oci \
        && docker-php-ext-enable oci8 \
        && docker-php-ext-install zip && \
          # Install the zip extension
          docker-php-ext-configure zip && \
          php -m | grep -q 'zip' \
;fi

# Install PostgreSQL drivers:
ARG INSTALL_PGSQL=false
RUN if [ ${INSTALL_PGSQL} = true ]; then \
    apk --update add postgresql-dev \
        && docker-php-ext-install pdo_pgsql \
;fi

# Install ZipArchive:
ARG INSTALL_ZIP_ARCHIVE=false
RUN set -eux; \
  if [ ${INSTALL_ZIP_ARCHIVE} = true ]; then \
    apk --update add libzip-dev && \
    if [ ${LARADOCK_PHP_VERSION} = "7.3" ] || [ ${LARADOCK_PHP_VERSION} = "7.4" ] || [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ]; then \
      docker-php-ext-configure zip; \
    else \
      docker-php-ext-configure zip --with-libzip; \
    fi && \
    # Install the zip extension
    docker-php-ext-install zip \
;fi

# Install MySQL Client:
ARG INSTALL_MYSQL_CLIENT=false
RUN if [ ${INSTALL_MYSQL_CLIENT} = true ]; then \
      apk --update add mysql-client \
;fi

# Install FFMPEG:
ARG INSTALL_FFMPEG=false
RUN if [ ${INSTALL_FFMPEG} = true ]; then \
    apk --update add ffmpeg \
;fi

# Install BBC Audio Waveform Image Generator:
ARG INSTALL_AUDIOWAVEFORM=false
RUN if [ ${INSTALL_AUDIOWAVEFORM} = true ]; then \
   apk add git make cmake gcc g++ libmad-dev libid3tag-dev libsndfile-dev gd-dev boost-dev libgd libpng-dev zlib-dev \
   && apk add autoconf automake libtool gettext \
   && wget https://github.com/xiph/flac/archive/1.3.3.tar.gz \
   && tar xzf 1.3.3.tar.gz \
   && cd flac-1.3.3 \
   && ./autogen.sh \
   && ./configure --enable-shared=no \
   && make \
   && make install \
   && cd .. \
   && git clone https://github.com/bbc/audiowaveform.git \
   && cd audiowaveform \
   && wget https://github.com/google/googletest/archive/release-1.10.0.tar.gz \
   && tar xzf release-1.10.0.tar.gz \
   && ln -s googletest-release-1.10.0/googletest googletest \
   && ln -s googletest-release-1.10.0/googlemock googlemock \
   && mkdir build \
   && cd build \
   && cmake .. \
   && make \
   && make install \
;fi


# Install AMQP:
ARG INSTALL_AMQP=false

RUN if [ ${INSTALL_AMQP} = true ]; then \
    apk --update add rabbitmq-c rabbitmq-c-dev && \
    pecl install amqp && \
    docker-php-ext-enable amqp && \
    docker-php-ext-install sockets \
;fi

# Install Gearman:
ARG INSTALL_GEARMAN=false

RUN if [ ${INSTALL_GEARMAN} = true ]; then \
    sed -i "\$ahttp://dl-cdn.alpinelinux.org/alpine/edge/main" /etc/apk/repositories && \
    sed -i "\$ahttp://dl-cdn.alpinelinux.org/alpine/edge/community" /etc/apk/repositories && \
    sed -i "\$ahttp://dl-cdn.alpinelinux.org/alpine/edge/testing" /etc/apk/repositories && \
    apk --update add php7-gearman && \
    sh -c 'echo "extension=/usr/lib/php7/modules/gearman.so" > /usr/local/etc/php/conf.d/gearman.ini' \
;fi

# Install Cassandra drivers:
ARG INSTALL_CASSANDRA=false
RUN if [ ${INSTALL_CASSANDRA} = true ]; then \
  apk --update add cassandra-cpp-driver \
  ;fi

WORKDIR /usr/src
RUN if [ ${INSTALL_CASSANDRA} = true ]; then \
  git clone https://github.com/datastax/php-driver.git \
  && cd php-driver/ext \
  && phpize \
  && mkdir -p /usr/src/php-driver/build \
  && cd /usr/src/php-driver/build \
  && ../ext/configure --with-php-config=/usr/bin/php-config7.1 > /dev/null \
  && make clean >/dev/null \
  && make >/dev/null 2>&1 \
  && make install \
  && docker-php-ext-enable cassandra \
;fi

# Install Phalcon ext
ARG INSTALL_PHALCON=false
ARG PHALCON_VERSION
ENV PHALCON_VERSION ${PHALCON_VERSION}

RUN if [ $INSTALL_PHALCON = true ]; then \
    apk --update add unzip gcc make re2c bash\
    && git clone https://github.com/jbboehr/php-psr.git \
    && cd php-psr \
    && phpize \
    && ./configure \
    && make \
    && make test \
    && make install \
    && curl -L -o /tmp/cphalcon.zip https://github.com/phalcon/cphalcon/archive/v${PHALCON_VERSION}.zip \
    && unzip -d /tmp/ /tmp/cphalcon.zip \
    && cd /tmp/cphalcon-${PHALCON_VERSION}/build \
    && ./install \
    && rm -rf /tmp/cphalcon* \
;fi

ARG INSTALL_GHOSTSCRIPT=false
RUN if [ $INSTALL_GHOSTSCRIPT = true ]; then \
    apk --update add ghostscript \
;fi

# Install Redis package:
ARG INSTALL_REDIS=false
RUN if [ ${INSTALL_REDIS} = true ]; then \
    # Install Redis Extension
    printf "\n" | pecl install -o -f redis \
    &&  rm -rf /tmp/pear \
    &&  docker-php-ext-enable redis \
;fi

###########################################################################
# Swoole EXTENSION
###########################################################################

ARG INSTALL_SWOOLE=false

RUN if [ ${INSTALL_SWOOLE} = true ]; then \
    # Install Php Swoole Extension
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
      pecl -q install swoole-2.0.10; \
    else \
      if [ $(php -r "echo PHP_MINOR_VERSION;") = "0" ]; then \
        pecl install swoole-2.2.0; \
      else \
        pecl install swoole; \
      fi \
    fi \
    && docker-php-ext-enable swoole \
;fi

###########################################################################
# Taint EXTENSION
###########################################################################

ARG INSTALL_TAINT=false

RUN if [ ${INSTALL_TAINT} = true ]; then \
    # Install Php TAINT Extension
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ]; then \
      pecl install taint; \
    fi && \
    docker-php-ext-enable taint \
;fi

###########################################################################
# Imap EXTENSION
###########################################################################

ARG INSTALL_IMAP=false

RUN if [ ${INSTALL_IMAP} = true ]; then \
    apk add --update imap-dev openssl-dev && \
    docker-php-ext-configure imap --with-imap --with-imap-ssl && \
    docker-php-ext-install imap \
;fi

###########################################################################
# XMLRPC:
###########################################################################

ARG INSTALL_XMLRPC=false

RUN if [ ${INSTALL_XMLRPC} = true ]; then \
    docker-php-ext-install xmlrpc \
;fi

#
#--------------------------------------------------------------------------
# Optional Supervisord Configuration
#--------------------------------------------------------------------------
#
# Modify the ./supervisor.conf file to match your App's requirements.
# Make sure you rebuild your container with every change.
#

COPY supervisord.conf /etc/supervisord.conf

ENTRYPOINT ["/usr/bin/supervisord", "-n", "-c",  "/etc/supervisord.conf"]

#
#--------------------------------------------------------------------------
# Optional Software's Installation
#--------------------------------------------------------------------------
#
# If you need to modify this image, feel free to do it right here.
#
    # -- Your awesome modifications go here -- #

#
#--------------------------------------------------------------------------
# Check PHP version
#--------------------------------------------------------------------------
#

RUN php -v | head -n 1 | grep -q "PHP ${PHP_VERSION}."

#
#--------------------------------------------------------------------------
# Final Touch
#--------------------------------------------------------------------------
#

# Clean up
RUN rm /var/cache/apk/* \
    && mkdir -p /var/www

WORKDIR /etc/supervisor/conf.d/
