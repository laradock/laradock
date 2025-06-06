#
#--------------------------------------------------------------------------
# Image Setup
#--------------------------------------------------------------------------
#
# To edit the 'workspace' base Image, visit its repository on Github
#    https://github.com/Laradock/workspace
#
# To change its version, see the available Tags on the Docker Hub:
#    https://hub.docker.com/r/laradock/workspace/tags/
#
# Note: Base Image name format {image-tag}-{php-version}
#

ARG LARADOCK_PHP_VERSION
ARG BASE_IMAGE_TAG_PREFIX=latest
FROM laradock/workspace:${BASE_IMAGE_TAG_PREFIX}-${LARADOCK_PHP_VERSION}

LABEL maintainer="Mahmoud Zalt <mahmoud@zalt.me>"

ARG LARADOCK_PHP_VERSION

# Set Environment Variables
ENV DEBIAN_FRONTEND noninteractive

# Start as root
USER root

###########################################################################
# If you're in China, or you need to change sources, will be set CHANGE_SOURCE to true in .env.
###########################################################################

ARG CHANGE_SOURCE=false
RUN if [ ${CHANGE_SOURCE} = true ]; then \
    # Change application source from ubuntu.com to tuna.tsinghua.edu.cn source
    sed -i "s@http://.*archive.ubuntu.com@https://mirrors.tuna.tsinghua.edu.cn@g" /etc/apt/sources.list; \
    sed -i "s@http://.*security.ubuntu.com@https://mirrors.tuna.tsinghua.edu.cn@g" /etc/apt/sources.list; \
  fi;

###########################################################################
# Laradock non-root user:
###########################################################################

# Add a non-root user to prevent files being created with root permissions on host machine.
ARG PUID=1000
ENV PUID ${PUID}
ARG PGID=1000
ENV PGID ${PGID}

# Set apt-get options:
ARG WORKSPACE_ALLOW_RELEASE_INFO_CHANGE=false
ENV WORKSPACE_ALLOW_RELEASE_INFO_CHANGE ${WORKSPACE_ALLOW_RELEASE_INFO_CHANGE}

# always run apt update when start and after add new source list, then clean up at end.
RUN set -xe; \
    if [ ${WORKSPACE_ALLOW_RELEASE_INFO_CHANGE} = true ]; then \
      APT_GET_UPDATE_OPTIONS="--allow-releaseinfo-change"; \
    else \
      APT_GET_UPDATE_OPTIONS=""; \
    fi; \
    apt-get update -yqq ${APT_GET_UPDATE_OPTIONS} && \
    pecl channel-update pecl.php.net && \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ] && [ $(php -r "echo PHP_MINOR_VERSION;") != "0" ]; then \
      groupmod --new-name laradock ubuntu; \
      usermod --login laradock ubuntu --move-home --home /home/laradock; \
    else \
      groupadd -g ${PGID} laradock; \
      useradd -l -u ${PUID} -g laradock -m laradock -G docker_env; \
    fi; \
    usermod -p "*" laradock -s /bin/bash && \
    apt-get install -yqq \
      apt-utils \
      #
      #--------------------------------------------------------------------------
      # Mandatory Software's Installation
      #--------------------------------------------------------------------------
      #
      # Mandatory Software's such as ("php-cli", "git", "vim", ....) are
      # installed on the base image 'laradock/workspace' image. If you want
      # to add more Software's or remove existing one, you need to edit the
      # base image (https://github.com/Laradock/workspace).
      #
      # next lines are here because there is no auto build on dockerhub see https://github.com/laradock/laradock/pull/1903#issuecomment-463142846
      libzip-dev zip unzip \
      # Install the zip extension
      php${LARADOCK_PHP_VERSION}-zip \
      # nasm
      nasm && \
      php -m | grep -q 'zip'

#
#--------------------------------------------------------------------------
# Optional Software's Installation
#--------------------------------------------------------------------------
#
# Optional Software's will only be installed if you set them to `true`
# in the `docker-compose.yml` before the build.
# Example:
#   - INSTALL_NODE=false
#   - ...
#

###########################################################################
# Set Timezone
###########################################################################

ARG TZ=UTC
ENV TZ ${TZ}

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

###########################################################################
# User Aliases
###########################################################################

USER root

COPY ./aliases.sh /root/aliases.sh
COPY ./aliases.sh /home/laradock/aliases.sh

RUN sed -i 's/\r//' /root/aliases.sh && \
    sed -i 's/\r//' /home/laradock/aliases.sh && \
    chown laradock:laradock /home/laradock/aliases.sh && \
    echo "" >> ~/.bashrc && \
    echo "# Load Custom Aliases" >> ~/.bashrc && \
    echo "source ~/aliases.sh" >> ~/.bashrc && \
    echo "" >> ~/.bashrc

USER laradock

RUN echo "" >> ~/.bashrc && \
    echo "# Load Custom Aliases" >> ~/.bashrc && \
    echo "source ~/aliases.sh" >> ~/.bashrc && \
    echo "" >> ~/.bashrc

###########################################################################
# Composer:
###########################################################################

USER root

# Add the composer.json
COPY ./composer.json /home/laradock/.composer/composer.json

# Add the auth.json for magento 2 credentials
COPY ./auth.json /home/laradock/.composer/auth.json

# Make sure that ~/.composer belongs to laradock
RUN chown -R laradock:laradock /home/laradock/.composer

# Export composer vendor path
RUN echo "" >> ~/.bashrc && \
    echo 'export PATH="$HOME/.composer/vendor/bin:$PATH"' >> ~/.bashrc

# Update composer
ARG COMPOSER_VERSION=2
ENV COMPOSER_VERSION ${COMPOSER_VERSION}
RUN set -eux; \
      if [ "$COMPOSER_VERSION" = "1" ] || [ "$COMPOSER_VERSION" = "2" ] || [ "$COMPOSER_VERSION" = "2.2" ]; then \
          composer self-update --${COMPOSER_VERSION}; \
      else \
          composer self-update ${COMPOSER_VERSION}; \
      fi

USER laradock

# Check if global install need to be ran
ARG COMPOSER_GLOBAL_INSTALL=false
ENV COMPOSER_GLOBAL_INSTALL ${COMPOSER_GLOBAL_INSTALL}

RUN if [ ${COMPOSER_GLOBAL_INSTALL} = true ]; then \
    # run the install
    composer global install \
;fi

# Check if auth file is disabled
ARG COMPOSER_AUTH_JSON=false
ENV COMPOSER_AUTH_JSON ${COMPOSER_AUTH_JSON}

RUN if [ ${COMPOSER_AUTH_JSON} = false ]; then \
    # remove the file
    rm /home/laradock/.composer/auth.json \
;fi

ARG COMPOSER_REPO_PACKAGIST
ENV COMPOSER_REPO_PACKAGIST ${COMPOSER_REPO_PACKAGIST}

RUN if [ ${COMPOSER_REPO_PACKAGIST} ]; then \
    composer config -g repo.packagist composer ${COMPOSER_REPO_PACKAGIST} \
;fi

# Export composer vendor path
RUN echo "" >> ~/.bashrc && \
    echo 'export PATH="~/.composer/vendor/bin:$PATH"' >> ~/.bashrc

###########################################################################
# Non-root user : PHPUnit path
###########################################################################

# add ./vendor/bin to non-root user's bashrc (needed for phpunit)
USER laradock

RUN echo "" >> ~/.bashrc && \
    echo 'export PATH="/var/www/vendor/bin:$PATH"' >> ~/.bashrc

###########################################################################
# Crontab
###########################################################################

USER root

COPY ./crontab /etc/cron.d

RUN chmod -R 644 /etc/cron.d

###########################################################################
# Certificate Authorities
###########################################################################

USER root

COPY ./ca-certificates/* /usr/local/share/ca-certificates/
RUN update-ca-certificates

###########################################################################
# Drush:
###########################################################################

# Deprecated install of Drush 8 and earlier versions.
# Drush 9 and up require Drush to be listed as a composer dependency of your site.

USER root

ARG INSTALL_DRUSH=false
ARG DRUSH_VERSION
ENV DRUSH_VERSION ${DRUSH_VERSION}

RUN if [ ${INSTALL_DRUSH} = true ]; then \
    apt-get -qq -y install mysql-client && \
    # Install Drush with the phar file.
    curl -fsSL -o /usr/local/bin/drush https://github.com/drush-ops/drush/releases/download/${DRUSH_VERSION}/drush.phar | bash && \
    chmod +x /usr/local/bin/drush && \
    drush core-status \
;fi

###########################################################################
# WP CLI:
###########################################################################

# The command line interface for WordPress

USER root

ARG INSTALL_WP_CLI=false

RUN if [ ${INSTALL_WP_CLI} = true ]; then \
    curl -fsSL -o /usr/local/bin/wp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar | bash && \
    chmod +x /usr/local/bin/wp \
;fi

###########################################################################
USER root

ARG INSTALL_BZ2=false
ARG INSTALL_GMP=false
ARG INSTALL_GNUPG=false
ARG INSTALL_SSH2=false
ARG INSTALL_SOAP=false
ARG INSTALL_XSL=false
ARG PHP_VERSION=${LARADOCK_PHP_VERSION}

RUN set -eux; \
    ###########################################################################
    # BZ2:
    ###########################################################################
    if [ ${INSTALL_BZ2} = true ]; then \
      apt-get -yqq install php${LARADOCK_PHP_VERSION}-bz2; \
    fi; \
    ###########################################################################
    # GMP (GNU Multiple Precision):
    ###########################################################################
    if [ ${INSTALL_GMP} = true ]; then \
      # Install the PHP GMP extension
      apt-get -yqq install php${LARADOCK_PHP_VERSION}-gmp; \
    fi; \
    ###########################################################################
    # GnuPG:
    ###########################################################################
    if [ ${INSTALL_GNUPG} = true ]; then \
        apt-get -yqq install php${LARADOCK_PHP_VERSION}-gnupg; \
    fi; \
    ###########################################################################
    # SSH2:
    ###########################################################################
    if [ ${INSTALL_SSH2} = true ]; then \
      # Install the PHP SSH2 extension
      apt-get -yqq install libssh2-1-dev php${LARADOCK_PHP_VERSION}-ssh2; \
    fi; \
    ###########################################################################
    # SOAP:
    ###########################################################################
    if [ ${INSTALL_SOAP} = true ]; then \
      # Install the PHP SOAP extension
      apt-get -yqq install libxml2-dev php${LARADOCK_PHP_VERSION}-soap; \
    fi; \
    ###########################################################################
    # XSL:
    ###########################################################################
    if [ ${INSTALL_XSL} = true ]; then \
      # Install the PHP XSL extension
      apt-get -yqq install libxslt-dev php${LARADOCK_PHP_VERSION}-xsl; \
    fi

###########################################################################

ARG INSTALL_LDAP=false
ARG INSTALL_SMB=false
ARG INSTALL_IMAP=false
ARG INSTALL_SUBVERSION=false

RUN set -eux; \
    ###########################################################################
    # LDAP:
    ###########################################################################
    if [ ${INSTALL_LDAP} = true ]; then \
        apt-get install -yqq libldap2-dev php${LARADOCK_PHP_VERSION}-ldap; \
    fi; \
    ###########################################################################
    # SMB:
    ###########################################################################
    if [ ${INSTALL_SMB} = true ]; then \
        apt-get install -yqq smbclient libsmbclient-dev php${LARADOCK_PHP_VERSION}-smbclient coreutils && \
        if [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ]; then \
            pecl install smbclient; \
        else \
            pecl install smbclient-1.1.2; \
        fi && \
        echo "extension=smbclient.so" >> /etc/php/${LARADOCK_PHP_VERSION}/cli/php.ini; \
    fi; \
    ###########################################################################
    # IMAP:
    ###########################################################################
    if [ ${INSTALL_IMAP} = true ]; then \
        apt-get install -yqq php${LARADOCK_PHP_VERSION}-imap; \
    fi; \
    ###########################################################################
    # Subversion:
    ###########################################################################
    if [ ${INSTALL_SUBVERSION} = true ]; then \
        apt-get install -yqq subversion; \
    fi

###########################################################################
# xDebug:
###########################################################################

USER root

ARG INSTALL_XDEBUG=false
ARG XDEBUG_PORT=9003

RUN if [ ${INSTALL_XDEBUG} = true ]; then \
  # Install the xdebug extension
  # https://xdebug.org/docs/compat
  apt-get install -yqq pkg-config php-xml php${LARADOCK_PHP_VERSION}-xml && \
  if [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ] || { [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ] && { [ $(php -r "echo PHP_MINOR_VERSION;") = "4" ] || [ $(php -r "echo PHP_MINOR_VERSION;") = "3" ] ;} ;}; then \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ]; then \
      pecl install xdebug-3.4.1; \
    else \
      pecl install xdebug-3.1.6; \
    fi; \
  else \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
      pecl install xdebug-2.5.5; \
    else \
      if [ $(php -r "echo PHP_MINOR_VERSION;") = "0" ]; then \
        pecl install xdebug-2.9.0; \
      else \
        pecl install xdebug-2.9.8; \
      fi \
    fi \
  fi && \
  echo "zend_extension=xdebug.so" >> /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-xdebug.ini \
;fi

# ADD for REMOTE debugging
COPY ./xdebug.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini

RUN if [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ] || { [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ] && { [ $(php -r "echo PHP_MINOR_VERSION;") = "4" ] || [ $(php -r "echo PHP_MINOR_VERSION;") = "3" ] ;} ;}; then \
  sed -i "s/xdebug.remote_host=/xdebug.client_host=/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini && \
  sed -i "s/xdebug.remote_connect_back=0/xdebug.discover_client_host=false/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini && \
  sed -i "s/xdebug.remote_port=9000/xdebug.client_port=${XDEBUG_PORT}/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini && \
  sed -i "s/xdebug.profiler_enable=0/; xdebug.profiler_enable=0/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini && \
  sed -i "s/xdebug.profiler_output_dir=/xdebug.output_dir=/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini && \
  sed -i "s/xdebug.remote_mode=req/; xdebug.remote_mode=req/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini && \
  sed -i "s/xdebug.remote_autostart=0/xdebug.start_with_request=yes/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini && \
  sed -i "s/xdebug.remote_enable=0/xdebug.mode=debug/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini \
;else \
  sed -i "s/xdebug.remote_autostart=0/xdebug.remote_autostart=1/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini && \
  sed -i "s/xdebug.remote_enable=0/xdebug.remote_enable=1/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini \
;fi
RUN sed -i "s/xdebug.cli_color=0/xdebug.cli_color=1/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini

###########################################################################
# pcov:
###########################################################################

USER root

ARG INSTALL_PCOV=false

RUN if [ ${INSTALL_PCOV} = true ]; then \
  if [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ]  || { [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ] && [ $(php -r "echo PHP_MINOR_VERSION;") != "0" ]; }; then \
    pecl install pcov && \
    echo "extension=pcov.so" >> /etc/php/${LARADOCK_PHP_VERSION}/cli/php.ini && \
    echo "pcov.enabled" >> /etc/php/${LARADOCK_PHP_VERSION}/cli/php.ini \
  ;fi \
;fi


###########################################################################
# Phpdbg:
###########################################################################

USER root

ARG INSTALL_PHPDBG=false

RUN if [ ${INSTALL_PHPDBG} = true ]; then \
    # Load the xdebug extension only with phpunit commands
    apt-get install -y --force-yes php${LARADOCK_PHP_VERSION}-phpdbg \
;fi

###########################################################################
# Blackfire:
###########################################################################

ARG INSTALL_BLACKFIRE=false
ARG BLACKFIRE_CLIENT_ID
ENV BLACKFIRE_CLIENT_ID ${BLACKFIRE_CLIENT_ID}
ARG BLACKFIRE_CLIENT_TOKEN
ENV BLACKFIRE_CLIENT_TOKEN ${BLACKFIRE_CLIENT_TOKEN}

RUN if [ ${INSTALL_XDEBUG} = false -a ${INSTALL_BLACKFIRE} = true ]; then \
    curl -L https://packages.blackfire.io/gpg.key | apt-key add - && \
    echo "deb http://packages.blackfire.io/debian any main" | tee /etc/apt/sources.list.d/blackfire.list && \
    apt-get update -yqq && \
    apt-get install blackfire-agent \
;fi

###########################################################################
# ssh:
###########################################################################

ARG INSTALL_WORKSPACE_SSH=false

COPY insecure_id_rsa /tmp/id_rsa
COPY insecure_id_rsa.pub /tmp/id_rsa.pub

RUN if [ ${INSTALL_WORKSPACE_SSH} = true ]; then \
    rm -f /etc/service/sshd/down && \
    cat /tmp/id_rsa.pub >> /root/.ssh/authorized_keys \
        && cat /tmp/id_rsa.pub >> /root/.ssh/id_rsa.pub \
        && cat /tmp/id_rsa >> /root/.ssh/id_rsa \
        && rm -f /tmp/id_rsa* \
        && chmod 644 /root/.ssh/authorized_keys /root/.ssh/id_rsa.pub \
    && chmod 400 /root/.ssh/id_rsa \
    && cp -rf /root/.ssh /home/laradock \
    && chown -R laradock:laradock /home/laradock/.ssh \
;fi

###########################################################################
# MongoDB:
###########################################################################

ARG INSTALL_MONGO=false

RUN if [ ${INSTALL_MONGO} = true ]; then \
    # Install the mongodb extension
    apt-get install -yqq pkg-config && \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
      pecl install mongo; \
      echo "extension=mongo.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/mongo.ini; \
      ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/mongo.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-mongo.ini; \
      php -m | grep -oiE '^mongo$'; \
    else \
      if [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ]; then \
        if [ $(php -r "echo PHP_MINOR_VERSION;") = "0" ] || [ $(php -r "echo PHP_MINOR_VERSION;") = "1" ]; then \
          pecl install mongodb-1.9.2; \
        else \
          if [ $(php -r "echo PHP_MINOR_VERSION;") = "4" ]; then \
            pecl install mongodb-1.20.1; \
          else \
            pecl install mongodb-1.16.2; \
          fi; \
        fi; \
      else \
        if [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ] && [ $(php -r "echo PHP_MINOR_VERSION;") = "0" ]; then \
            pecl install mongodb-1.20.1; \
        else \
            pecl install mongodb; \
        fi; \
      fi; \
      echo "extension=mongodb.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/mongodb.ini; \
      ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/mongodb.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-mongodb.ini; \
      php -m | grep -oiE '^mongodb$'; \
    fi; \
fi

###########################################################################
# AMQP:
###########################################################################

ARG INSTALL_AMQP=false

RUN if [ ${INSTALL_AMQP} = true ]; then \
    apt-get install -yqq librabbitmq-dev && \
    if [ ${LARADOCK_PHP_VERSION} = "7.3" ] \
      || [ ${LARADOCK_PHP_VERSION} = "7.2" ] \
      || [ ${LARADOCK_PHP_VERSION} = "7.1" ] \
      || [ ${LARADOCK_PHP_VERSION} = "7.0" ] \
      || [ ${LARADOCK_PHP_VERSION} = "5.6" ]; then \
      printf "\n" | pecl install amqp-1.11.0; \
    else \
      printf "\n" | pecl install amqp; \
    fi && \
    echo "extension=amqp.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/amqp.ini && \
    ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/amqp.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-amqp.ini && \
    php -m | grep -oiE '^amqp$' \
;fi

###########################################################################
# CASSANDRA:
###########################################################################

ARG INSTALL_CASSANDRA=false

RUN if [ ${INSTALL_CASSANDRA} = true ]; then \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ]; then \
      echo "PHP Driver for Cassandra is not supported for PHP 8.0."; \
    else \
      apt-get install libgmp-dev -yqq && \
      curl https://downloads.datastax.com/cpp-driver/ubuntu/18.04/dependencies/libuv/v1.35.0/libuv1-dev_1.35.0-1_amd64.deb -o libuv1-dev.deb && \
      curl https://downloads.datastax.com/cpp-driver/ubuntu/18.04/dependencies/libuv/v1.35.0/libuv1_1.35.0-1_amd64.deb -o libuv1.deb && \
      curl https://downloads.datastax.com/cpp-driver/ubuntu/18.04/cassandra/v2.16.0/cassandra-cpp-driver-dev_2.16.0-1_amd64.deb -o cassandra-cpp-driver-dev.deb && \
      curl https://downloads.datastax.com/cpp-driver/ubuntu/18.04/cassandra/v2.16.0/cassandra-cpp-driver_2.16.0-1_amd64.deb -o cassandra-cpp-driver.deb && \
      dpkg -i libuv1.deb && \
      dpkg -i libuv1-dev.deb && \
      dpkg -i cassandra-cpp-driver.deb && \
      dpkg -i cassandra-cpp-driver-dev.deb && \
      rm libuv1.deb libuv1-dev.deb cassandra-cpp-driver-dev.deb cassandra-cpp-driver.deb && \
      cd /usr/src && \
      git clone https://github.com/datastax/php-driver.git && \
      cd /usr/src/php-driver/ext && \
      phpize && \
      mkdir /usr/src/php-driver/build && \
      cd /usr/src/php-driver/build && \
      ../ext/configure > /dev/null && \
      make clean >/dev/null && \
      make >/dev/null 2>&1 && \
      make install && \
      echo "extension=cassandra.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/cassandra.ini && \
      ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/cassandra.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-cassandra.ini; \
    fi \
;fi

###########################################################################
# Gearman:
###########################################################################

ARG INSTALL_GEARMAN=false

RUN if [ ${INSTALL_GEARMAN} = true ]; then \
    add-apt-repository -y ppa:ondrej/pkg-gearman && \
    apt-get update && \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ]; then \
      apt-get install php${LARADOCK_PHP_VERSION}-gearman -y  \
    ; else \
      apt-get install php-gearman -y  \
    ;fi \
;fi

###########################################################################
# PHP REDIS EXTENSION
###########################################################################

ARG INSTALL_PHPREDIS=false

RUN if [ ${INSTALL_PHPREDIS} = true ]; then \
    apt-get update \
    && apt-get install -yqq php${LARADOCK_PHP_VERSION}-redis \
;fi

###########################################################################
# Swoole EXTENSION
###########################################################################

ARG INSTALL_SWOOLE=false

RUN set -eux; \
    if [ ${INSTALL_SWOOLE} = true ]; then \
      # Install Php Swoole Extension
      if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
        echo '' | pecl -q install swoole-2.0.10; \
      elif [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ] && [ $(php -r "echo PHP_MINOR_VERSION;") = "0" ]; then \
        echo '' | pecl -q install swoole-4.3.5; \
      elif [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ] && [ $(php -r "echo PHP_MINOR_VERSION;") = "1" ]; then \
        echo '' | pecl -q install swoole-4.5.11; \
      elif [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ]; then \
        echo '' | pecl -q install swoole-4.8.12; \
      elif [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ] && [ $(php -r "echo PHP_MINOR_VERSION;") = "0" ]; then \
        echo '' | pecl -q install swoole-5.1.2; \
      else \
        apt-get install -yqq libbrotli-dev && \
        echo '' | pecl -q  install swoole; \
      fi; \
      echo "extension=swoole.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/swoole.ini; \
      ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/swoole.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-swoole.ini; \
      php -m | grep -q 'swoole'; \
    fi



###########################################################################
# xlswriter:
###########################################################################

ARG INSTALL_XLSWRITER=false
RUN set -eux; \
    if [ ${INSTALL_XLSWRITER} = true ]; then \
      # Install Php xlswriter Extension
      if [ $(php -r "echo PHP_MAJOR_VERSION;") != "5" ]; then \
        echo '' | pecl -q install xlswriter && \
        echo "extension=xlswriter.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/xlswriter.ini && \
        ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/xlswriter.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-xlswriter.ini && \
        php -m | grep -q 'xlswriter'; \
      else \
        echo "PHP Extension for xlswriter is not supported for PHP 5.0"; \
      fi \
    ;fi


###########################################################################
# Taint EXTENSION
###########################################################################

ARG INSTALL_TAINT=false

RUN if [ "${INSTALL_TAINT}" = true ]; then \
    # Install Php TAINT Extension
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ]; then \
      pecl install taint && \
      echo "extension=taint.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/taint.ini && \
      ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/taint.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-taint.ini && \
      php -m | grep -q 'taint'; \
    fi \
;fi

###########################################################################
# Libpng16 EXTENSION
###########################################################################

ARG INSTALL_LIBPNG=false

RUN if [ ${INSTALL_LIBPNG} = true ]; then \
    apt-get -yqq install libpng16-16 \
;fi

###########################################################################
# Inotify EXTENSION:
###########################################################################

ARG INSTALL_INOTIFY=false

RUN if [ ${INSTALL_INOTIFY} = true ]; then \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
      pecl -q install inotify-0.1.6 && \
      echo "extension=inotify.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/inotify.ini && \
      ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/inotify.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-inotify.ini; \
    else \
      pecl -q install inotify && \
      echo "extension=inotify.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/inotify.ini && \
      ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/inotify.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-inotify.ini \
    ;fi \
;fi

###########################################################################
# AST EXTENSION
###########################################################################

ARG INSTALL_AST=false
ARG AST_VERSION=1.0.10
ENV AST_VERSION ${AST_VERSION}

RUN if [ ${INSTALL_AST} = true ]; then \
    # AST extension requires PHP 7.0.0 or newer
    if [ $(php -r "echo PHP_MAJOR_VERSION;") != "5" ]; then \
        # Install AST extension
        printf "\n" | pecl -q install ast-${AST_VERSION} && \
        echo "extension=ast.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/ast.ini && \
        phpenmod -v ${LARADOCK_PHP_VERSION} -s cli ast \
    ;fi \
;fi

###########################################################################
# fswatch
###########################################################################

ARG INSTALL_FSWATCH=false

RUN if [ ${INSTALL_FSWATCH} = true ]; then \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 47FE03C1 \
    && add-apt-repository -y ppa:hadret/fswatch \
    || apt-get update -yqq \
    && apt-get -y install fswatch \
;fi

###########################################################################

# GraphViz extension
###########################################################################

ARG INSTALL_GRAPHVIZ=false

RUN if [ ${INSTALL_GRAPHVIZ} = true ]; then \
    apt-get install -yqq graphviz \
;fi

# IonCube Loader
###########################################################################

ARG INSTALL_IONCUBE=false

RUN if [ ${INSTALL_IONCUBE} = true ]; then \
    if [ ${LARADOCK_PHP_VERSION} != "8.4" ] \
      && [ ${LARADOCK_PHP_VERSION} != "8.0" ]; then \
      # Install the php ioncube loader
      curl -L -o /tmp/ioncube_loaders_lin_x86-64.tar.gz https://downloads.ioncube.com/loader_downloads/ioncube_loaders_lin_x86-64.tar.gz \
      && tar zxpf /tmp/ioncube_loaders_lin_x86-64.tar.gz -C /tmp \
      && mv /tmp/ioncube/ioncube_loader_lin_${LARADOCK_PHP_VERSION}.so $(php -r "echo ini_get('extension_dir');")/ioncube_loader.so \
      && echo "zend_extension=ioncube_loader.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/ioncube.ini \
      && ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/ioncube.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/0ioncube.ini \
      && rm -rf /tmp/ioncube* \
      && php -m | grep -oiE '^ionCube Loader$' \
    ;fi \
;fi

###########################################################################
# Drupal Console:
###########################################################################

USER root

ARG INSTALL_DRUPAL_CONSOLE=false

RUN if [ ${INSTALL_DRUPAL_CONSOLE} = true ]; then \
    apt-get -y install mysql-client && \
    curl https://github.com/hechoendrupal/drupal-console-launcher/releases/download/1.9.7/drupal.phar -L -o drupal.phar && \
    mv drupal.phar /usr/local/bin/drupal && \
    chmod +x /usr/local/bin/drupal \
;fi

USER laradock

###########################################################################
# Node / NVM:
###########################################################################

# Check if NVM needs to be installed
ARG NODE_VERSION=node
ENV NODE_VERSION ${NODE_VERSION}
ARG INSTALL_NODE=false
ARG INSTALL_NPM_GULP=false
ARG INSTALL_NPM_BOWER=false
ARG INSTALL_NPM_VUE_CLI=false
ARG INSTALL_NPM_ANGULAR_CLI=false
ARG INSTALL_NPM_CHECK_UPDATES_CLI=false
ARG NPM_REGISTRY
ENV NPM_REGISTRY ${NPM_REGISTRY}
ARG NPM_FETCH_RETRIES
ENV NPM_FETCH_RETRIES ${NPM_FETCH_RETRIES}
ARG NPM_FETCH_RETRY_FACTOR
ENV NPM_FETCH_RETRY_FACTOR ${NPM_FETCH_RETRY_FACTOR}
ARG NPM_FETCH_RETRY_MINTIMEOUT
ENV NPM_FETCH_RETRY_MINTIMEOUT ${NPM_FETCH_RETRY_MINTIMEOUT}
ARG NPM_FETCH_RETRY_MAXTIMEOUT
ENV NPM_FETCH_RETRY_MAXTIMEOUT ${NPM_FETCH_RETRY_MAXTIMEOUT}
ENV NVM_DIR /home/laradock/.nvm
ARG NVM_NODEJS_ORG_MIRROR
ENV NVM_NODEJS_ORG_MIRROR ${NVM_NODEJS_ORG_MIRROR}

RUN if [ ${INSTALL_NODE} = true ]; then \
    # Install nvm (A Node Version Manager)
    mkdir -p $NVM_DIR && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash \
        && . $NVM_DIR/nvm.sh \
        && nvm install ${NODE_VERSION} \
        && nvm use ${NODE_VERSION} \
        && nvm alias ${NODE_VERSION} \
        && npm cache clear --force \
        && npm config set fetch-retries ${NPM_FETCH_RETRIES} \
        && npm config set fetch-retry-factor ${NPM_FETCH_RETRY_FACTOR} \
        && npm config set fetch-retry-mintimeout ${NPM_FETCH_RETRY_MINTIMEOUT} \
        && npm config set fetch-retry-maxtimeout ${NPM_FETCH_RETRY_MAXTIMEOUT} \
        && if [ ${NPM_REGISTRY} ]; then \
        npm config set registry ${NPM_REGISTRY} \
        ;fi \
        && if [ ${INSTALL_NPM_GULP} = true ]; then \
        npm install -g gulp \
        ;fi \
        && if [ ${INSTALL_NPM_BOWER} = true ]; then \
        npm install -g bower \
        ;fi \
        && if [ ${INSTALL_NPM_VUE_CLI} = true ]; then \
        npm install -g @vue/cli \
        ;fi \
        && if [ ${INSTALL_NPM_ANGULAR_CLI} = true ]; then \
        npm install -g @angular/cli \
        ;fi \
        && if [ ${INSTALL_NPM_CHECK_UPDATES_CLI} = true ]; then \
        npm install -g npm-check-updates \
        ;fi \
;fi

# Wouldn't execute when added to the RUN statement in the above block
# Source NVM when loading bash since ~/.profile isn't loaded on non-login shell
RUN if [ ${INSTALL_NODE} = true ]; then \
    echo "" >> ~/.bashrc && \
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc && \
    echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm' >> ~/.bashrc \
;fi

# Add NVM binaries to root's .bashrc
USER root

RUN if [ ${INSTALL_NODE} = true ]; then \
    echo "" >> ~/.bashrc && \
    echo 'export NVM_DIR="/home/laradock/.nvm"' >> ~/.bashrc && \
    echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm' >> ~/.bashrc \
;fi

# Make it so the node modules can be executed with 'docker-compose exec'
# We'll create symbolic links into '/usr/local/bin'.
RUN if [ ${INSTALL_NODE} = true ]; then \
    find $NVM_DIR -type f -name node -exec ln -s {} /usr/local/bin/node \; && \
    NODE_MODS_DIR="$NVM_DIR/versions/node/$(node -v)/lib/node_modules" && \
    ln -s $NODE_MODS_DIR/bower/bin/bower /usr/local/bin/bower && \
    ln -s $NODE_MODS_DIR/gulp/bin/gulp.js /usr/local/bin/gulp && \
    ln -s $NODE_MODS_DIR/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s $NODE_MODS_DIR/npm/bin/npx-cli.js /usr/local/bin/npx && \
    ln -s $NODE_MODS_DIR/vue-cli/bin/vue /usr/local/bin/vue && \
    ln -s $NODE_MODS_DIR/vue-cli/bin/vue-init /usr/local/bin/vue-init && \
    ln -s $NODE_MODS_DIR/vue-cli/bin/vue-list /usr/local/bin/vue-list \
;fi

RUN if [ ${NPM_REGISTRY} ]; then \
    . ~/.bashrc && npm config set registry ${NPM_REGISTRY} \
;fi

# Mount .npmrc into home folder
COPY ./.npmrc /root/.npmrc
COPY ./.npmrc /home/laradock/.npmrc


###########################################################################
# PNPM:
###########################################################################

USER root

ARG INSTALL_PNPM=false
ENV PNPM_HOME="/home/laradock/.local/share/pnpm"
ENV PATH $PATH:/home/laradock/.local/share/pnpm

RUN if [ ${INSTALL_PNPM} = true ]; then \
    echo "" >> ~/.bashrc && \
    echo 'export PNPM_HOME="/home/laradock/.local/share/pnpm"' >> ~/.bashrc && \
    echo 'export PATH="$PNPM_HOME:$PATH"' >> ~/.bashrc && \
    npm install -g pnpm \
;fi


###########################################################################
# YARN:
###########################################################################

USER laradock

ARG INSTALL_YARN=false
ARG YARN_VERSION=latest
ENV YARN_VERSION ${YARN_VERSION}

RUN if [ ${INSTALL_YARN} = true ]; then \
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && \
    if [ ${YARN_VERSION} = "latest" ]; then \
        curl -o- -L https://yarnpkg.com/install.sh | bash; \
    else \
        curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version ${YARN_VERSION}; \
    fi && \
    echo "" >> ~/.bashrc && \
    echo 'export PATH="$HOME/.yarn/bin:$PATH"' >> ~/.bashrc \
;fi

# Add YARN binaries to root's .bashrc
USER root

RUN if [ ${INSTALL_YARN} = true ]; then \
    echo "" >> ~/.bashrc && \
    echo 'export YARN_DIR="/home/laradock/.yarn"' >> ~/.bashrc && \
    echo 'export PATH="$YARN_DIR/bin:$PATH"' >> ~/.bashrc \
;fi

# Add PATH for YARN
ENV PATH $PATH:/home/laradock/.yarn/bin

###########################################################################
# PHP Aerospike:
###########################################################################

USER root

ARG INSTALL_AEROSPIKE=false

RUN set -xe; \
  if [ ${INSTALL_AEROSPIKE} = true ]; then \
    # Fix dependencies for PHPUnit within aerospike extension
    apt-get -y install sudo wget && \
    # Install the php aerospike extension
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
      curl -L -o /tmp/aerospike-client-php.tar.gz https://github.com/aerospike/aerospike-client-php5/archive/master.tar.gz; \
    else \
      curl -L -o /tmp/aerospike-client-php.tar.gz https://github.com/aerospike/aerospike-client-php/archive/master.tar.gz; \
    fi \
    && mkdir -p /tmp/aerospike-client-php \
    && tar -C /tmp/aerospike-client-php -zxvf /tmp/aerospike-client-php.tar.gz --strip 1 \
    && \
      if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
        ( \
          cd /tmp/aerospike-client-php/src/aerospike \
          && phpize \
          && ./build.sh \
          && make install \
        ) \
      else \
        if [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ]; then \
          ( \
              cd /tmp/aerospike-client-php/src \
              && phpize \
              && ./build.sh \
              && make install \
          ) \
        else \
          echo "AEROSPIKE does not support PHP 8.0" \
        ;fi \
      ;fi \
    && rm /tmp/aerospike-client-php.tar.gz \
    && echo 'extension=aerospike.so' >> /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/aerospike.ini \
    && echo 'aerospike.udf.lua_system_path=/usr/local/aerospike/lua' >> /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/aerospike.ini \
    && echo 'aerospike.udf.lua_user_path=/usr/local/aerospike/usr-lua' >> /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/aerospike.ini \
  ;fi

###########################################################################
# PHP OCI8:
###########################################################################

USER root
ARG INSTALL_OCI8=false
ARG ORACLE_INSTANT_CLIENT_MIRROR=https://github.com/the-paulus/oracle-instantclient/raw/master/
ARG ORACLE_INSTANT_CLIENT_ARCH=x86_64
ARG ORACLE_INSTANT_CLIENT_MAJOR=18
ARG ORACLE_INSTANT_CLIENT_MINOR=3

ENV ORACLE_INSTANT_CLIENT_VERSION=${ORACLE_INSTANT_CLIENT_MAJOR}_${ORACLE_INSTANT_CLIENT_MINOR}
ENV LD_LIBRARY_PATH="/opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}"
ENV OCI_HOME="/opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}"
ENV OCI_LIB_DIR="/opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}"
ENV OCI_INCLUDE_DIR="/opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/sdk/include"
ENV OCI_VERSION=${ORACLE_INSTANT_CLIENT_MAJOR}

RUN if [ ${INSTALL_OCI8} = true ]; then \
  # Install wget
  apt-get update && apt-get install --no-install-recommends -y wget \
  # Install Oracle Instantclient
  && mkdir /opt/oracle \
      && cd /opt/oracle \
      && wget ${ORACLE_INSTANT_CLIENT_MIRROR}instantclient-basic-linux.${ORACLE_INSTANT_CLIENT_ARCH}-${ORACLE_INSTANT_CLIENT_VERSION}.zip \
      && wget ${ORACLE_INSTANT_CLIENT_MIRROR}instantclient-sdk-linux.${ORACLE_INSTANT_CLIENT_ARCH}-${ORACLE_INSTANT_CLIENT_VERSION}.zip \
      && unzip /opt/oracle/instantclient-basic-linux.${ORACLE_INSTANT_CLIENT_ARCH}-${ORACLE_INSTANT_CLIENT_VERSION}.zip -d /opt/oracle \
      && unzip /opt/oracle/instantclient-sdk-linux.${ORACLE_INSTANT_CLIENT_ARCH}-${ORACLE_INSTANT_CLIENT_VERSION}.zip -d /opt/oracle \
      && if [ ${OCI_VERSION} -lt 18 ] ; then ln -s /opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/libclntsh.so.${ORACLE_INSTANT_CLIENT_MAJOR}.${ORACLE_INSTANT_CLIENT_MINOR} /opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/libclntsh.so ; fi\
      && if [ ${OCI_VERSION} -lt 18 ] ; then ln -s /opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/libclntshcore.so.${ORACLE_INSTANT_CLIENT_MAJOR}.${ORACLE_INSTANT_CLIENT_MINOR} /opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/libclntshcore.so ; fi \
      && if [ ${OCI_VERSION} -lt 18 ] ; then ln -s /opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/libocci.so.${ORACLE_INSTANT_CLIENT_MAJOR}.${ORACLE_INSTANT_CLIENT_MINOR} /opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/libocci.so ; fi \
      && rm -rf /opt/oracle/*.zip \
  # Install PHP extensions deps
  && apt-get update \
      && apt-get install --no-install-recommends -y \
          libaio-dev && \
  # Install PHP extensions
  if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
  echo 'instantclient,/opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/' | pecl install oci8-2.0.12; \
  elif [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ]; then \
  echo 'instantclient,/opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/' | pecl install oci8-2.2.0; \
  elif [ $(php -r "echo PHP_VERSION_ID - PHP_RELEASE_VERSION;") = "80000" ]; then \
    echo "instantclient,/opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/" | pecl install oci8-3.0.1; \
  elif [ $(php -r "echo PHP_MAJOR_VERSION . PHP_MINOR_VERSION;") = "81" ]; then \
    echo "instantclient,/opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/" | pecl install oci8-3.2.1; \
  else \
    echo "instantclient,/opt/oracle/instantclient_${ORACLE_INSTANT_CLIENT_VERSION}/" | pecl install oci8; \
  fi \
  && echo "extension=oci8.so" >> /etc/php/${LARADOCK_PHP_VERSION}/cli/php.ini \
  && php -m | grep -q 'oci8' \
;fi

###########################################################################
# PHP V8JS:
###########################################################################

USER root

ARG INSTALL_V8JS=false

RUN set -xe; \
  if [ ${INSTALL_V8JS} = true ]; then \
    add-apt-repository -y ppa:pinepain/libv8-archived \
    && apt-get update -yqq \
    && apt-get install -y libv8-5.4 && \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
      pecl install v8js-0.6.4; \
    else \
      pecl install v8js; \
    fi \
    && echo "extension=v8js.so" >> /etc/php/${LARADOCK_PHP_VERSION}/cli/php.ini \
    && php -m | grep -q 'v8js' \
  ;fi

###########################################################################
# Laravel Envoy:
###########################################################################

USER laradock

ARG INSTALL_LARAVEL_ENVOY=false

RUN if [ ${INSTALL_LARAVEL_ENVOY} = true ]; then \
    # Install the Laravel Envoy
    composer global config --no-plugins allow-plugins.kylekatarnls/update-helper true && \
    composer global require laravel/envoy \
;fi

###########################################################################
# Laravel Installer:
###########################################################################

USER laradock

ARG INSTALL_LARAVEL_INSTALLER=false

RUN if [ ${INSTALL_LARAVEL_INSTALLER} = true ]; then \
    # Install the Laravel Installer
  composer global require "laravel/installer" \
;fi

USER root

ARG COMPOSER_REPO_PACKAGIST
ENV COMPOSER_REPO_PACKAGIST ${COMPOSER_REPO_PACKAGIST}

RUN if [ ${COMPOSER_REPO_PACKAGIST} ]; then \
    composer config -g repo.packagist composer ${COMPOSER_REPO_PACKAGIST} \
;fi

###########################################################################
# Deployer:
###########################################################################

USER root

ARG INSTALL_DEPLOYER=false

RUN if [ ${INSTALL_DEPLOYER} = true ]; then \
    # Install the Deployer
    # Using Phar as currently there is no support for laravel 4 from composer version
    # Waiting to be resolved on https://github.com/deployphp/deployer/issues/1552
    curl -LO https://deployer.org/deployer.phar && \
    mv deployer.phar /usr/local/bin/dep && \
    chmod +x /usr/local/bin/dep \
;fi

###########################################################################
# Prestissimo:
###########################################################################
ARG INSTALL_PRESTISSIMO=false

RUN if [ ${INSTALL_PRESTISSIMO} = true ]; then \
    if [ $(php -r "echo COMPOSER_VERSION;") = "1" ]; then \
      # Install Prestissimo
      composer global require "hirak/prestissimo" \
    ;fi \
;fi

###########################################################################
# Linuxbrew:
###########################################################################

USER root

ARG INSTALL_LINUXBREW=false

RUN if [ ${INSTALL_LINUXBREW} = true ]; then \
    # Preparation
    apt-get upgrade -y && \
    apt-get install -y build-essential make cmake scons curl git \
      ruby autoconf automake autoconf-archive \
      gettext libtool flex bison \
      libbz2-dev libcurl4-openssl-dev \
      libexpat-dev libncurses-dev && \
    # Install the Linuxbrew
    git clone --depth=1 https://github.com/Homebrew/linuxbrew.git ~/.linuxbrew && \
    echo "" >> ~/.bashrc && \
    echo 'export PKG_CONFIG_PATH"=/usr/local/lib/pkgconfig:/usr/local/lib64/pkgconfig:/usr/lib64/pkgconfig:/usr/lib/pkgconfig:/usr/lib/x86_64-linux-gnu/pkgconfig:/usr/lib64/pkgconfig:/usr/share/pkgconfig:$PKG_CONFIG_PATH"' >> ~/.bashrc && \
    # Setup linuxbrew
    echo 'export LINUXBREWHOME="$HOME/.linuxbrew"' >> ~/.bashrc && \
    echo 'export PATH="$LINUXBREWHOME/bin:$PATH"' >> ~/.bashrc && \
    echo 'export MANPATH="$LINUXBREWHOME/man:$MANPATH"' >> ~/.bashrc && \
    echo 'export PKG_CONFIG_PATH="$LINUXBREWHOME/lib64/pkgconfig:$LINUXBREWHOME/lib/pkgconfig:$PKG_CONFIG_PATH"' >> ~/.bashrc && \
    echo 'export LD_LIBRARY_PATH="$LINUXBREWHOME/lib64:$LINUXBREWHOME/lib:$LD_LIBRARY_PATH"' >> ~/.bashrc \
;fi

###########################################################################
# SQL SERVER:
###########################################################################

ARG INSTALL_MSSQL=false

RUN set -eux; \
  if [ ${INSTALL_MSSQL} = true ]; then \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
      apt-get install -yqq php5.6-sybase freetds-bin freetds-common libsybdb5 \
      && php -m | grep -oiE '^mssql$' \
      && php -m | grep -oiE '^pdo_dblib$' \
    ;else \
      ###########################################################################
      #  The following steps were taken from
      #  https://github.com/Microsoft/msphpsql/wiki/Install-and-configuration
      ###########################################################################
      curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
      curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
      apt-get update -yqq && \
      ACCEPT_EULA=Y apt-get install -yqq msodbcsql18 mssql-tools18 unixodbc unixodbc-dev libgss3 odbcinst locales && \
      ln -sfn /opt/mssql-tools/bin/sqlcmd /usr/bin/sqlcmd && \
      ln -sfn /opt/mssql-tools/bin/bcp /usr/bin/bcp && \
      echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
      locale-gen \
      && if [ $(php -r "echo PHP_VERSION_ID - PHP_RELEASE_VERSION;") = "70000" ]; then \
        pecl install pdo_sqlsrv-5.3.0 sqlsrv-5.3.0 \
      ;elif [ $(php -r "echo PHP_VERSION_ID - PHP_RELEASE_VERSION;") = "70100" ]; then \
        pecl install pdo_sqlsrv-5.6.1 sqlsrv-5.6.1 \
      ;elif [ $(php -r "echo PHP_VERSION_ID - PHP_RELEASE_VERSION;") = "70200" ]; then \
        pecl install pdo_sqlsrv-5.8.1 sqlsrv-5.8.1 \
      ;elif [ $(php -r "echo PHP_VERSION_ID - PHP_RELEASE_VERSION;") = "70300" ]; then \
        pecl install pdo_sqlsrv-5.9.0 sqlsrv-5.9.0 \
      ;elif [ $(php -r "echo PHP_VERSION_ID - PHP_RELEASE_VERSION;") = "70400" ]; then \
        pecl install pdo_sqlsrv-5.10.1 sqlsrv-5.10.1 \
      ;elif [ $(php -r "echo PHP_VERSION_ID - PHP_RELEASE_VERSION;") = "80000" ]; then \
        pecl install pdo_sqlsrv-5.11.1 sqlsrv-5.11.1 \
      ;else \
        pecl install pdo_sqlsrv sqlsrv \
      ;fi && \
      echo "extension=pdo_sqlsrv.so" > /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-pdo_sqlsrv.ini && \
      echo "extension=sqlsrv.so"     > /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-sqlsrv.ini && \
      php -m | grep -oiE '^pdo_sqlsrv$' && \
      php -m | grep -oiE '^sqlsrv$' \
    ;fi \
  ;fi

###########################################################################
# Minio:
###########################################################################

USER root

COPY mc/config.json /root/.mc/config.json

ARG INSTALL_MC=false

RUN if [ ${INSTALL_MC} = true ]; then\
    curl -fsSL -o /usr/local/bin/mc https://dl.minio.io/client/mc/release/linux-amd64/mc && \
    chmod +x /usr/local/bin/mc \
;fi

###########################################################################
# Image optimizers:
###########################################################################

USER root

ARG INSTALL_IMAGE_OPTIMIZERS=false

RUN if [ ${INSTALL_IMAGE_OPTIMIZERS} = true ]; then \
    apt-get install -y jpegoptim optipng pngquant gifsicle && \
    if [ ${INSTALL_NODE} = true ]; then \
        exec bash && . ~/.bashrc && npm install -g svgo \
    ;fi\
;fi

USER laradock

###########################################################################
# Symfony:
###########################################################################

USER root

ARG INSTALL_SYMFONY=false

RUN if [ ${INSTALL_SYMFONY} = true ]; then \
  mkdir -p /usr/local/bin \
  && apt-get -y install sudo wget \
  && wget --quiet https://get.symfony.com/cli/installer -O - | bash \
  && mv /root/.symfony5/bin/symfony /usr/local/bin/symfony \
  && chmod a+x /usr/local/bin/symfony \
;fi

###########################################################################
# PYTHON2:
###########################################################################

ARG INSTALL_PYTHON=false

RUN if [ ${INSTALL_PYTHON} = true ]; then \
  apt-get -y install python python-dev build-essential  \
  && curl https://bootstrap.pypa.io/pip/2.7/get-pip.py -o get-pip.py  \
  && python get-pip.py  \
  && rm get-pip.py  \
  && python -m pip install --upgrade pip  \
  && python -m pip install --upgrade virtualenv \
;fi

###########################################################################
# PYTHON3:
###########################################################################

ARG INSTALL_PYTHON3=false

RUN if [ ${INSTALL_PYTHON3} = true ]; then \
  apt-get -y install python3 python3-dev build-essential  \
  && curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py  \
  && python3 get-pip.py  \
  && rm get-pip.py  \
  && python3 -m pip install --upgrade --force-reinstall pip  \
  && python3 -m pip install --upgrade virtualenv \
;fi

###########################################################################
# POWERLINE:
###########################################################################

USER root
ARG INSTALL_POWERLINE=false

RUN if [ ${INSTALL_POWERLINE} = true ]; then \
    if [ ${INSTALL_PYTHON} = true ]; then \
    python -m pip install --upgrade powerline-status && \
    echo "" >> /etc/bash.bashrc && \
    echo ". /usr/local/lib/python2.7/dist-packages/powerline/bindings/bash/powerline.sh" >> /etc/bash.bashrc \
  ;fi \
;fi

###########################################################################
# SUPERVISOR:
###########################################################################
ARG INSTALL_SUPERVISOR=false

RUN if [ ${INSTALL_SUPERVISOR} = true ]; then \
    if [ ${INSTALL_PYTHON} = true ]; then \
    python -m pip install --upgrade supervisor && \
    echo_supervisord_conf > /etc/supervisord.conf && \
    sed -i 's/\;\[include\]/\[include\]/g' /etc/supervisord.conf && \
    sed -i 's/\;files\s.*/files = supervisord.d\/*.conf/g' /etc/supervisord.conf \
  ;fi \
;fi

USER laradock

###########################################################################
# ImageMagick:
###########################################################################

USER root

ARG INSTALL_IMAGEMAGICK=false
ARG IMAGEMAGICK_VERSION=latest
ENV IMAGEMAGICK_VERSION ${IMAGEMAGICK_VERSION}

RUN if [ ${INSTALL_IMAGEMAGICK} = true ]; then \
    apt-get install -y libmagickwand-dev imagemagick && \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ]; then \
      apt-get install -y git && \
      cd /tmp && \
      if [ ${IMAGEMAGICK_VERSION} = "latest" ]; then \
        if [ ${LARADOCK_PHP_VERSION} = "8.4" ]; then \
          git clone --branch develop https://github.com/Imagick/imagick; \
        else \
          git clone https://github.com/Imagick/imagick; \
        fi; \
      else \
        git clone --branch ${IMAGEMAGICK_VERSION} https://github.com/Imagick/imagick; \
      fi && \
      cd imagick && \
      phpize && \
      ./configure && \
      make && \
      make install && \
      rm -r /tmp/imagick; \
    else \
      pecl install imagick; \
    fi && \
    echo "extension=imagick.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/imagick.ini && \
    ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/imagick.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-imagick.ini && \
    php -m | grep -q 'imagick' \
;fi

###########################################################################
# Terraform:
###########################################################################

USER root

ARG INSTALL_TERRAFORM=false

RUN if [ ${INSTALL_TERRAFORM} = true ]; then \
    apt-get -yqq install sudo wget unzip \
    && wget https://releases.hashicorp.com/terraform/0.10.6/terraform_0.10.6_linux_amd64.zip \
    && unzip terraform_0.10.6_linux_amd64.zip \
    && mv terraform /usr/local/bin \
    && rm terraform_0.10.6_linux_amd64.zip \
;fi

###########################################################################
# Memcached Dependecies:
###########################################################################

ARG INSTALL_MEMCACHED=false

RUN if [ ${INSTALL_MEMCACHED} = true ]; then \
  apt-get -y install php${LARADOCK_PHP_VERSION}-igbinary \
  && apt-get -y install php${LARADOCK_PHP_VERSION}-memcached \
;fi

###########################################################################
# pgsql client
###########################################################################

USER root

ARG INSTALL_PG_CLIENT=false
ARG PG_CLIENT_VERSION

RUN if [ ${INSTALL_PG_CLIENT} = true ]; then \
    # Install the pgsql client
    apt-get -yqq install wget \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get -y install postgresql-client-${PG_CLIENT_VERSION} \
;fi

###########################################################################
# Dusk Dependencies:
###########################################################################

USER root

ARG CHROME_DRIVER_VERSION=stable
ENV CHROME_DRIVER_VERSION ${CHROME_DRIVER_VERSION}
ARG INSTALL_DUSK_DEPS=false

RUN if [ ${INSTALL_DUSK_DEPS} = true ]; then \
  apt-get -y install zip wget unzip xdg-utils \
    libxpm4 libxrender1 libgtk2.0-0 libnss3 libgconf-2-4 xvfb \
    gtk2-engines-pixbuf xfonts-cyrillic xfonts-100dpi xfonts-75dpi \
    xfonts-base xfonts-scalable x11-apps \
    fonts-ipafont \
  && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
  && dpkg -i --force-depends google-chrome-stable_current_amd64.deb \
  && apt-get -y -f install \
  && dpkg -i --force-depends google-chrome-stable_current_amd64.deb \
  && rm google-chrome-stable_current_amd64.deb \
  && wget https://chromedriver.storage.googleapis.com/${CHROME_DRIVER_VERSION}/chromedriver_linux64.zip \
  && unzip chromedriver_linux64.zip \
  && mv chromedriver /usr/local/bin/ \
  && rm chromedriver_linux64.zip \
;fi

###########################################################################
# Phalcon:
###########################################################################

ARG INSTALL_PHALCON=false
ARG LARADOCK_PHALCON_VERSION
ENV LARADOCK_PHALCON_VERSION ${LARADOCK_PHALCON_VERSION}

RUN if [ $INSTALL_PHALCON = true ]; then \
      apt-get update -yqq \
      && pecl channel-update pecl.php.net \
      && apt-get install -yqq libpcre3-dev; \
      pecl install phalcon-${LARADOCK_PHALCON_VERSION}; \
      echo "extension=phalcon.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/phalcon.ini; \
      ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/phalcon.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/50-phalcon.ini; \
      php -m | grep -q 'phalcon' \
  ;fi

###########################################################################
# APCU:
###########################################################################

ARG INSTALL_APCU=false

RUN if [ ${INSTALL_APCU} = true ]; then \
  if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
    pecl install apcu-4.0.11; \
  else \
    pecl install apcu; \
  fi && \
  echo "extension=apcu.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/apcu.ini; \
  ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/apcu.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/50-apcu.ini; \
  php -m | grep -q 'apcu' \
;fi

###########################################################################
USER root

ARG INSTALL_MYSQL_CLIENT=false
ARG INSTALL_PING=false
ARG INSTALL_SSHPASS=false
ARG INSTALL_DOCKER_CLIENT=false

RUN set -eux; \
  ###########################################################################
  # MySQL Client:
  ###########################################################################
  if [ ${INSTALL_MYSQL_CLIENT} = true ]; then \
    apt-get -yqq install mysql-client; \
  fi; \
  ###########################################################################
  # ping:
  ###########################################################################
  if [ ${INSTALL_PING} = true ]; then \
    apt-get -yqq install inetutils-ping; \
  fi; \
  ###########################################################################
  # sshpass:
  ###########################################################################
  if [ ${INSTALL_SSHPASS} = true ]; then \
    apt-get -yqq install sshpass; \
  fi; \
  ###########################################################################
  # Docker Client:
  ###########################################################################
  if [ ${INSTALL_DOCKER_CLIENT} = true ]; then \
    curl -sS https://download.docker.com/linux/static/stable/x86_64/docker-20.10.3.tgz -o /tmp/docker.tar.gz; \
    tar -xzf /tmp/docker.tar.gz -C /tmp/; \
    cp /tmp/docker/docker* /usr/local/bin; \
    chmod +x /usr/local/bin/docker*; \
  fi

###########################################################################
USER root

ARG INSTALL_YAML=false
ARG INSTALL_RDKAFKA=false
ARG INSTALL_FFMPEG=false

RUN set -eux; \
  ###########################################################################
  # YAML: extension for PHP-CLI
  ###########################################################################
  if [ ${INSTALL_YAML} = true ]; then \
    apt-get install -yqq libyaml-dev; \
    if   [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
        echo '' | pecl install -a yaml-1.3.2; \
    elif [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ] && [ $(php -r "echo PHP_MINOR_VERSION;") = "0" ]; then \
        echo '' | pecl install yaml-2.0.4; \
    else \
        echo '' | pecl install yaml; \
    fi; \
    echo "extension=yaml.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/yaml.ini; \
    ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/yaml.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/35-yaml.ini; \
  fi; \
  ###########################################################################
  # RDKAFKA:
  ###########################################################################
  if [ ${INSTALL_RDKAFKA} = true ]; then \
    apt-get install -yqq librdkafka-dev; \
    pecl install rdkafka; \
    echo "extension=rdkafka.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/rdkafka.ini; \
    ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/rdkafka.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-rdkafka.ini; \
    php -m | grep -q 'rdkafka'; \
  fi; \
  ###########################################################################
  # FFMpeg:
  ###########################################################################
  if [ ${INSTALL_FFMPEG} = true ]; then \
    apt-get -yqq install ffmpeg; \
  fi

###########################################################################
# BBC Audio Waveform Image Generator:
###########################################################################

USER root

ARG INSTALL_AUDIOWAVEFORM=false

RUN if [ ${INSTALL_AUDIOWAVEFORM} = true ]; then \
  apt-get -y install wget make cmake gcc g++ libmad0-dev libid3tag0-dev libsndfile1-dev libgd-dev libboost-filesystem-dev libboost-program-options-dev libboost-regex-dev \
  && cd /tmp \
  && git clone https://github.com/bbc/audiowaveform.git \
  && cd audiowaveform \
  && git clone --depth=1 https://github.com/google/googletest.git -b release-1.11.0 \
  && mkdir build \
  && cd build \
  && cmake .. \
  && make \
  && make install \
;fi

#####################################
# poppler-utils:
#####################################
USER root

ARG INSTALL_POPPLER_UTILS=false

RUN if [ ${INSTALL_POPPLER_UTILS} = true ]; then \
  apt-get -y install poppler-utils antiword \
;fi

#####################################
# wkhtmltopdf:
#####################################

USER root

ARG INSTALL_WKHTMLTOPDF=false
ARG WKHTMLTOPDF_VERSION=0.12.6.1-3

RUN if [ ${INSTALL_WKHTMLTOPDF} = true ]; then \
   ARCH=$(arch | sed s/aarch64/arm64/ | sed s/x86_64/amd64/) \
   && apt-get install -y \
   libxrender1 \
   libfontconfig1 \
   libx11-dev \
   libjpeg62 \
   libxtst6 \
   fontconfig \
   libjpeg-turbo8-dev \
   xfonts-base \
   xfonts-75dpi \
   wget \
   && wget "https://github.com/wkhtmltopdf/packaging/releases/download/${WKHTMLTOPDF_VERSION}/wkhtmltox_${WKHTMLTOPDF_VERSION}.jammy_${ARCH}.deb" \
   && dpkg -i "wkhtmltox_${WKHTMLTOPDF_VERSION}.jammy_${ARCH}.deb" \
   && apt -f install \
;fi

###########################################################################
# Mailparse extension:
###########################################################################

ARG INSTALL_MAILPARSE=false

RUN if [ ${INSTALL_MAILPARSE} = true ]; then \
    apt-get install -yqq php-mailparse \
;fi

###########################################################################
# GNU Parallel:
###########################################################################

USER root

ARG INSTALL_GNU_PARALLEL=false

RUN if [ ${INSTALL_GNU_PARALLEL} = true ]; then \
  apt-get -yqq install parallel \
;fi

###########################################################################
# Bash Git Prompt
###########################################################################

ARG INSTALL_GIT_PROMPT=false

COPY git-prompt.sh /tmp/git-prompt

RUN if [ ${INSTALL_GIT_PROMPT} = true ]; then \
    git clone https://github.com/magicmonty/bash-git-prompt.git /root/.bash-git-prompt --depth=1 && \
    cat /tmp/git-prompt >> /root/.bashrc && \
    rm /tmp/git-prompt \
;fi

###########################################################################
# XMLRPC:
###########################################################################

ARG INSTALL_XMLRPC=false

RUN if [ ${INSTALL_XMLRPC} = true ]; then \
    apt-get install -yqq php${LARADOCK_PHP_VERSION}-xmlrpc \
;fi

###########################################################################
# Lnav:
###########################################################################

ARG INSTALL_LNAV=false

RUN if [ ${INSTALL_LNAV} = true ]; then \
    apt-get install -yqq lnav \
;fi

###########################################################################
# Protoc:
###########################################################################

ARG INSTALL_PROTOC=false
ARG PROTOC_VERSION

RUN if [ ${INSTALL_PROTOC} = true ]; then \
  apt-get -yqq install sudo wget unzip && \
  if [ ${PROTOC_VERSION} = "latest" ]; then \
    REAL_PROTOC_VERSION=$(curl -s https://api.github.com/repos/protocolbuffers/protobuf/releases/latest | \
      sed -nr 's/.*"tag_name":\s?"v(.+?)".*/\1/p'); \
  else \
    REAL_PROTOC_VERSION=${PROTOC_VERSION}; \
  fi && \
  PROTOC_ZIP=protoc-${REAL_PROTOC_VERSION}-linux-x86_64.zip; \
  wget https://github.com/protocolbuffers/protobuf/releases/download/v${REAL_PROTOC_VERSION}/${PROTOC_ZIP} && \
  unzip -q -o ${PROTOC_ZIP} -d /usr/local bin/protoc && \
  unzip -q -o ${PROTOC_ZIP} -d /usr/local 'include/*' && \
  rm -f ${PROTOC_ZIP} && \
  chmod +x /usr/local/bin/protoc && \
  chmod -R +r /usr/local/include/google \
;fi

###########################################################################
# Check PHP version:
###########################################################################

RUN set -xe; php -v | head -n 1 | grep -q "PHP ${LARADOCK_PHP_VERSION}."

###########################################################################
# Oh My ZSH!
###########################################################################

USER root

ARG SHELL_OH_MY_ZSH=false
RUN if [ ${SHELL_OH_MY_ZSH} = true ]; then \
    apt install -y zsh \
;fi

ARG SHELL_OH_MY_ZSH_AUTOSUGESTIONS=false
ARG SHELL_OH_MY_ZSH_ALIASES=false

USER laradock
RUN if [ ${SHELL_OH_MY_ZSH} = true ]; then \
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh) --keep-zshrc" && \
    sed -i -r 's/^plugins=\(.*?\)$/plugins=(laravel composer)/' /home/laradock/.zshrc && \
    echo '\n\
bindkey "^[OB" down-line-or-search\n\
bindkey "^[OC" forward-char\n\
bindkey "^[OD" backward-char\n\
bindkey "^[OF" end-of-line\n\
bindkey "^[OH" beginning-of-line\n\
bindkey "^[[1~" beginning-of-line\n\
bindkey "^[[3~" delete-char\n\
bindkey "^[[4~" end-of-line\n\
bindkey "^[[5~" up-line-or-history\n\
bindkey "^[[6~" down-line-or-history\n\
bindkey "^?" backward-delete-char\n' >> /home/laradock/.zshrc && \
  if [ ${SHELL_OH_MY_ZSH_AUTOSUGESTIONS} = true ]; then \
    sh -c "git clone https://github.com/zsh-users/zsh-autosuggestions /home/laradock/.oh-my-zsh/custom/plugins/zsh-autosuggestions" && \
    sed -i 's~plugins=(~plugins=(zsh-autosuggestions ~g' /home/laradock/.zshrc && \
    sed -i '1iZSH_AUTOSUGGEST_BUFFER_MAX_SIZE=20' /home/laradock/.zshrc && \
    sed -i '1iZSH_AUTOSUGGEST_STRATEGY=(history completion)' /home/laradock/.zshrc && \
    sed -i '1iZSH_AUTOSUGGEST_USE_ASYNC=1' /home/laradock/.zshrc && \
    sed -i '1iTERM=xterm-256color' /home/laradock/.zshrc \
  ;fi && \
  if [ ${SHELL_OH_MY_ZSH_ALIASES} = true ]; then \
    echo "" >> /home/laradock/.zshrc && \
    echo "# Load Custom Aliases" >> /home/laradock/.zshrc && \
    echo "source /home/laradock/aliases.sh" >> /home/laradock/.zshrc && \
    echo "" >> /home/laradock/.zshrc \
  ;fi \
;fi

USER root

###########################################################################
# ZSH User Aliases
###########################################################################

USER root

COPY ./aliases.sh /root/aliases.sh
COPY ./aliases.sh /home/laradock/aliases.sh

RUN if [ ${SHELL_OH_MY_ZSH} = true ]; then \
    sed -i 's/\r//' /root/aliases.sh && \
    sed -i 's/\r//' /home/laradock/aliases.sh && \
    chown laradock:laradock /home/laradock/aliases.sh && \
    echo "" >> ~/.zshrc && \
    echo "# Load Custom Aliases" >> ~/.zshrc && \
    echo "source ~/aliases.sh" >> ~/.zshrc && \
    echo "" >> ~/.zshrc \
;fi

USER laradock

RUN if [ ${SHELL_OH_MY_ZSH} = true ]; then \
    echo "" >> ~/.zshrc && \
    echo "# Load Custom Aliases" >> ~/.zshrc && \
    echo "source ~/aliases.sh" >> ~/.zshrc && \
    echo "" >> ~/.zshrc \
;fi

USER root


###########################################################################
# PHP DECIMAL:
###########################################################################

USER root

ARG INSTALL_PHPDECIMAL=false

RUN if [ ${INSTALL_PHPDECIMAL} = true ]; then \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
      echo 'decimal not support PHP 5.6'; \
    else \
      apt-get install -yqq libmpdec-dev \
      && pecl install decimal \
      && echo "extension=decimal.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/decimal.ini \
      && ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/decimal.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-decimal.ini \
      && php -m | grep -q 'decimal' \
    ;fi \
;fi

###########################################################################
# zookeeper
###########################################################################
ARG INSTALL_ZOOKEEPER=false

RUN set -eux; \
    if [ ${INSTALL_ZOOKEEPER} = true ]; then \
    apt install -yqq libzookeeper-mt-dev; \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "8" ]; then \
      curl -L -o /tmp/php-zookeeper.tar.gz https://github.com/php-zookeeper/php-zookeeper/archive/master.tar.gz; \
      mkdir -p /tmp/php-zookeeper; \
      tar -C /tmp/php-zookeeper -zxvf /tmp/php-zookeeper.tar.gz --strip 1; \
      cd /tmp/php-zookeeper; \
      phpize && ./configure && make && make install;\
    else \
      if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
        pecl install zookeeper-0.5.0; \
      else \
        pecl install zookeeper-0.7.2; \
      fi; \
    fi; \
    echo "extension=zookeeper.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/zookeeper.ini; \
    ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/zookeeper.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-zookeeper.ini; \
    php -m | grep -q 'zookeeper'; \
    fi

###########################################################################
# PHP SSDB:
###########################################################################

USER root

ARG INSTALL_SSDB=false

RUN set -xe; \
    if [ ${INSTALL_SSDB} = true ] && [ $(php -r "echo PHP_MAJOR_VERSION;") != "8" ]; then \
    apt-get -y install sudo wget && \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ]; then \
      curl -L -o /tmp/ssdb-client-php.tar.gz https://github.com/jonnywang/phpssdb/archive/php7.tar.gz; \
    else \
      curl -L -o /tmp/ssdb-client-php.tar.gz https://github.com/jonnywang/phpssdb/archive/master.tar.gz; \
    fi \
    && mkdir -p /tmp/ssdb-client-php \
    && tar -C /tmp/ssdb-client-php -zxvf /tmp/ssdb-client-php.tar.gz --strip 1 \
    && cd /tmp/ssdb-client-php \
    && phpize \
    && ./configure \
    && make \
    && make install \
    && rm /tmp/ssdb-client-php.tar.gz \
    && docker-php-ext-enable ssdb \
;fi

#####################################
# trader:
#####################################

USER root

ARG INSTALL_TRADER=false

RUN if [ ${INSTALL_TRADER} = true ]; then \
    pecl install trader \
    && echo "extension=trader.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/trader.ini \
    && ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/trader.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-trader.ini \
;fi

#
#--------------------------------------------------------------------------
# zmq
#--------------------------------------------------------------------------
#

USER root

ARG INSTALL_ZMQ=false

RUN if [ ${INSTALL_ZMQ} = true ]; then \
    apt-get install --yes git libzmq3-dev \
    && git clone https://github.com/zeromq/php-zmq.git \
    && cd php-zmq \
    && phpize \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -fr php-zmq \
    && echo "extension=zmq.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/zmq.ini \
    && ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/zmq.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-zmq.ini \
;fi

############################################################################
## Event:
############################################################################
USER root

ARG INSTALL_EVENT=false

RUN set -eux; \
  if [ ${INSTALL_EVENT} = true ]; then \
      curl -L -o  /tmp/libevent.tar.gz https://github.com/libevent/libevent/releases/download/release-2.1.12-stable/libevent-2.1.12-stable.tar.gz   &&\
      mkdir -p /tmp/libevent-php &&\
      tar -C /tmp/libevent-php -zxvf /tmp/libevent.tar.gz --strip 1 &&\
      cd /tmp/libevent-php &&\
      ./configure --prefix=/usr/local/libevent-2.1.12  &&\
      make &&\
      make install &&\
      rm /tmp/libevent.tar.gz &&\
      if [ ! -f /etc/php/${LARADOCK_PHP_VERSION}/mods-available/sockets.ini ]; then\
        echo "extension=sockets.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/sockets.ini; \
      fi &&\
      ln -sf /etc/php/${LARADOCK_PHP_VERSION}/mods-available/sockets.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-sockets.ini && \
      curl -L -o /tmp/event.tar.gz http://pecl.php.net/get/event-3.0.6.tgz &&\
      mkdir -p /tmp/event-php &&\
      tar -C /tmp/event-php -zxvf /tmp/event.tar.gz --strip 1 &&\
      cd /tmp/event-php &&\
      phpize &&\
      ./configure  --with-event-libevent-dir=/usr/local/libevent-2.1.12/ &&\
      make &&\
      make install &&\
      rm /tmp/event.tar.gz &&\
      echo "extension=event.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/event.ini && \
      ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/event.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-event.ini && \
      php -m  | grep -q 'event' \
;fi

###########################################################################
# DNS utilities:
###########################################################################

USER root

ARG INSTALL_DNSUTILS=false

RUN if [ ${INSTALL_DNSUTILS} = true ]; then \
    apt-get update && apt-get install -y dnsutils \
;fi

###########################################################################
# Java Development Kit:
###########################################################################

ARG INSTALL_JDK=false

RUN if [ ${INSTALL_JDK} = true ]; then \
    apt-get update \
    && apt-get install -y default-jdk ca-certificates-java \
    && update-ca-certificates -f \
;fi

###########################################################################
# Github CLI:
###########################################################################

ARG INSTALL_GITHUB_CLI=false

RUN if [ ${INSTALL_GITHUB_CLI} = true ]; then \
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt update \
    && apt install gh -y \
;fi


#
#--------------------------------------------------------------------------
# Final Touch
#--------------------------------------------------------------------------
#

USER root

# Clean up
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    rm -f /var/log/lastlog /var/log/faillog

# Set default work directory
WORKDIR /var/www