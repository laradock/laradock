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
FROM laradock/workspace:2.6.1-${LARADOCK_PHP_VERSION}

LABEL maintainer="Mahmoud Zalt <mahmoud@zalt.me>"

ARG LARADOCK_PHP_VERSION

# Set Environment Variables
ENV DEBIAN_FRONTEND noninteractive

# If you're in China, or you need to change sources, will be set CHANGE_SOURCE to true in .env.

ARG CHANGE_SOURCE=false
RUN if [ ${CHANGE_SOURCE} = true ]; then \
    # Change application source from deb.debian.org to aliyun source
    sed -i 's/deb.debian.org/mirrors.tuna.tsinghua.edu.cn/' /etc/apt/sources.list && \
    sed -i 's/security.debian.org/mirrors.tuna.tsinghua.edu.cn/' /etc/apt/sources.list && \
    sed -i 's/security-cdn.debian.org/mirrors.tuna.tsinghua.edu.cn/' /etc/apt/sources.list \
;fi

# Start as root
USER root

###########################################################################
# Laradock non-root user:
###########################################################################

# Add a non-root user to prevent files being created with root permissions on host machine.
ARG PUID=1000
ENV PUID ${PUID}
ARG PGID=1000
ENV PGID ${PGID}

ARG CHANGE_SOURCE=false
ARG UBUNTU_SOURCE
COPY ./sources.sh /tmp/sources.sh

RUN if [ ${CHANGE_SOURCE} = true ]; then \
    /bin/sh -c /tmp/sources.sh && \
    rm -rf /tmp/sources.sh \
;fi

# always run apt update when start and after add new source list, then clean up at end.
RUN set -xe; \
    apt-get update -yqq && \
    pecl channel-update pecl.php.net && \
    groupadd -g ${PGID} laradock && \
    useradd -u ${PUID} -g laradock -m laradock -G docker_env && \
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
      # next lines are here becase there is no auto build on dockerhub see https://github.com/laradock/laradock/pull/1903#issuecomment-463142846
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

USER laradock

# Check if global install need to be ran
ARG COMPOSER_GLOBAL_INSTALL=false
ENV COMPOSER_GLOBAL_INSTALL ${COMPOSER_GLOBAL_INSTALL}

RUN if [ ${COMPOSER_GLOBAL_INSTALL} = true ]; then \
    # run the install
    composer global install \
;fi

# Check if auth file is disabled
ARG COMPOSER_AUTH=false
ENV COMPOSER_AUTH ${COMPOSER_AUTH}

RUN if [ ${COMPOSER_AUTH} = false ]; then \
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
# Drush:
###########################################################################

# Deprecated install of Drush 8 and earlier versions.
# Drush 9 and up require Drush to be listed as a composer dependency of your site.

USER root

ARG INSTALL_DRUSH=false
ARG DRUSH_VERSION
ENV DRUSH_VERSION ${DRUSH_VERSION}

RUN if [ ${INSTALL_DRUSH} = true ]; then \
    apt-get -y install mysql-client && \
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
# BZ2:
###########################################################################

ARG INSTALL_BZ2=false
RUN if [ ${INSTALL_BZ2} = true ]; then \
  apt-get -y install php${LARADOCK_PHP_VERSION}-bz2 \
;fi

###########################################################################
# GMP (GNU Multiple Precision):
###########################################################################

USER root

ARG INSTALL_GMP=false
ARG PHP_VERSION=${LARADOCK_PHP_VERSION}

RUN if [ ${INSTALL_GMP} = true ]; then \
  # Install the PHP GMP extension
  apt-get -y install php${LARADOCK_PHP_VERSION}-gmp \
;fi

###########################################################################
# SSH2:
###########################################################################

USER root

ARG INSTALL_SSH2=false

RUN if [ ${INSTALL_SSH2} = true ]; then \
  # Install the PHP SSH2 extension
  apt-get -y install libssh2-1-dev php${LARADOCK_PHP_VERSION}-ssh2 \
;fi

###########################################################################
# SOAP:
###########################################################################

USER root

ARG INSTALL_SOAP=false

RUN if [ ${INSTALL_SOAP} = true ]; then \
  # Install the PHP SOAP extension
  apt-get -y install libxml2-dev php${LARADOCK_PHP_VERSION}-soap \
;fi

###########################################################################
# XSL:
###########################################################################

USER root

ARG INSTALL_XSL=false

RUN if [ ${INSTALL_XSL} = true ]; then \
  # Install the PHP XSL extension
  apt-get -y install libxslt-dev php${LARADOCK_PHP_VERSION}-xsl \
;fi


###########################################################################
# LDAP:
###########################################################################

ARG INSTALL_LDAP=false

RUN if [ ${INSTALL_LDAP} = true ]; then \
    apt-get install -y libldap2-dev && \
    apt-get install -y php${LARADOCK_PHP_VERSION}-ldap \
;fi

###########################################################################
# SMB:
###########################################################################

ARG INSTALL_SMB=false

RUN if [ ${INSTALL_SMB} = true ]; then \
    apt-get install -y smbclient php-smbclient coreutils \
;fi

###########################################################################
# IMAP:
###########################################################################

ARG INSTALL_IMAP=false

RUN if [ ${INSTALL_IMAP} = true ]; then \
    apt-get install -y php${LARADOCK_PHP_VERSION}-imap \
;fi

###########################################################################
# Subversion:
###########################################################################

USER root

ARG INSTALL_SUBVERSION=false

RUN if [ ${INSTALL_SUBVERSION} = true ]; then \
    apt-get install -y subversion \
;fi


###########################################################################
# xDebug:
###########################################################################

USER root

ARG INSTALL_XDEBUG=false

RUN if [ ${INSTALL_XDEBUG} = true ]; then \
    # Load the xdebug extension only with phpunit commands
    apt-get install -y php${LARADOCK_PHP_VERSION}-xdebug && \
    sed -i 's/^;//g' /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-xdebug.ini \
;fi

# ADD for REMOTE debugging
COPY ./xdebug.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini

RUN sed -i "s/xdebug.remote_autostart=0/xdebug.remote_autostart=1/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini && \
    sed -i "s/xdebug.remote_enable=0/xdebug.remote_enable=1/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini && \
    sed -i "s/xdebug.cli_color=0/xdebug.cli_color=1/" /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/xdebug.ini

###########################################################################
# pcov:
###########################################################################

USER root

ARG INSTALL_PCOV=false

RUN if [ ${INSTALL_PCOV} = true ]; then \
  if [ $(php -r "echo PHP_MAJOR_VERSION;") = "7" ]; then \
    if [ $(php -r "echo PHP_MINOR_VERSION;") != "0" ]; then \
      pecl install pcov && \
      echo "extension=pcov.so" >> /etc/php/${LARADOCK_PHP_VERSION}/cli/php.ini && \
      echo "pcov.enabled" >> /etc/php/${LARADOCK_PHP_VERSION}/cli/php.ini \
    ;fi \
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
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
      pecl install mongo && \
      echo "extension=mongo.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/mongo.ini && \
      ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/mongo.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-mongo.ini \
    ;fi && \
    pecl install mongodb && \
    echo "extension=mongodb.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/mongodb.ini && \
    ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/mongodb.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-mongodb.ini \
;fi

###########################################################################
# AMQP:
###########################################################################

ARG INSTALL_AMQP=false

RUN if [ ${INSTALL_AMQP} = true ]; then \
    apt-get install librabbitmq-dev -y && \
    pecl -q install amqp && \
    echo "extension=amqp.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/amqp.ini && \
    ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/amqp.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-amqp.ini \
;fi

###########################################################################
# CASSANDRA:
###########################################################################

ARG INSTALL_CASSANDRA=false

RUN if [ ${INSTALL_CASSANDRA} = true ]; then \
    apt-get install libgmp-dev -y && \
    curl https://downloads.datastax.com/cpp-driver/ubuntu/18.04/dependencies/libuv/v1.28.0/libuv1-dev_1.28.0-1_amd64.deb -o libuv1-dev.deb && \
    curl https://downloads.datastax.com/cpp-driver/ubuntu/18.04/dependencies/libuv/v1.28.0/libuv1_1.28.0-1_amd64.deb -o libuv1.deb && \
    curl https://downloads.datastax.com/cpp-driver/ubuntu/18.04/cassandra/v2.12.0/cassandra-cpp-driver-dev_2.12.0-1_amd64.deb -o cassandra-cpp-driver-dev.deb && \
    curl https://downloads.datastax.com/cpp-driver/ubuntu/18.04/cassandra/v2.12.0/cassandra-cpp-driver_2.12.0-1_amd64.deb -o cassandra-cpp-driver.deb && \
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
    ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/cassandra.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-cassandra.ini \
;fi

###########################################################################
# Gearman:
###########################################################################

ARG INSTALL_GEARMAN=false

RUN if [ ${INSTALL_GEARMAN} = true ]; then \
    add-apt-repository -y ppa:ondrej/pkg-gearman && \
    apt-get update && \
    apt-get install php-gearman -y  \
;fi

###########################################################################
# PHP REDIS EXTENSION
###########################################################################

ARG INSTALL_PHPREDIS=false

RUN if [ ${INSTALL_PHPREDIS} = true ]; then \
    apt-get update -yqq && \
    apt-get install -yqq php-redis \
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
    fi && \
    echo "extension=swoole.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/swoole.ini && \
    ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/swoole.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-swoole.ini \
    && php -m | grep -q 'swoole' \
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
    apt-get update && \
    apt-get install libpng16-16 \
;fi

###########################################################################
# Inotify EXTENSION:
###########################################################################

ARG INSTALL_INOTIFY=false

RUN if [ ${INSTALL_INOTIFY} = true ]; then \
    pecl -q install inotify && \
    echo "extension=inotify.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/inotify.ini && \
    ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/inotify.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-inotify.ini \
;fi

###########################################################################
# AST EXTENSION
###########################################################################

ARG INSTALL_AST=false
ARG AST_VERSION=1.0.3
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
# IonCube Loader
###########################################################################

ARG INSTALL_IONCUBE=false

RUN if [ ${INSTALL_IONCUBE} = true ]; then \
    # Install the php ioncube loader
    curl -L -o /tmp/ioncube_loaders_lin_x86-64.tar.gz https://downloads.ioncube.com/loader_downloads/ioncube_loaders_lin_x86-64.tar.gz \
    && tar zxpf /tmp/ioncube_loaders_lin_x86-64.tar.gz -C /tmp \
    && mv /tmp/ioncube/ioncube_loader_lin_${LARADOCK_PHP_VERSION}.so $(php -r "echo ini_get('extension_dir');")/ioncube_loader.so \
    && echo "zend_extension=ioncube_loader.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/0ioncube.ini \
    && rm -rf /tmp/ioncube* \
;fi

###########################################################################
# Drupal Console:
###########################################################################

USER root

ARG INSTALL_DRUPAL_CONSOLE=false

RUN if [ ${INSTALL_DRUPAL_CONSOLE} = true ]; then \
    apt-get -y install mysql-client && \
    curl https://drupalconsole.com/installer -L -o drupal.phar && \
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
ARG NPM_REGISTRY
ENV NPM_REGISTRY ${NPM_REGISTRY}
ENV NVM_DIR /home/laradock/.nvm
ARG NVM_NODEJS_ORG_MIRROR
ENV NVM_NODEJS_ORG_MIRROR ${NVM_NODEJS_ORG_MIRROR}

RUN if [ ${INSTALL_NODE} = true ]; then \
    # Install nvm (A Node Version Manager)
    mkdir -p $NVM_DIR && \
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash \
        && . $NVM_DIR/nvm.sh \
        && nvm install ${NODE_VERSION} \
        && nvm use ${NODE_VERSION} \
        && nvm alias ${NODE_VERSION} \
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
        && ln -s `npm bin --global` /home/laradock/.node-bin \
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

# Add PATH for node
ENV PATH $PATH:/home/laradock/.node-bin

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
        ( \
            cd /tmp/aerospike-client-php/src \
            && phpize \
            && ./build.sh \
            && make install \
        ) \
      fi \
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

ENV LD_LIBRARY_PATH="/opt/oracle/instantclient_12_1"
ENV OCI_HOME="/opt/oracle/instantclient_12_1"
ENV OCI_LIB_DIR="/opt/oracle/instantclient_12_1"
ENV OCI_INCLUDE_DIR="/opt/oracle/instantclient_12_1/sdk/include"
ENV OCI_VERSION=12

RUN if [ ${INSTALL_OCI8} = true ]; then \
  # Install wget
  apt-get update && apt-get install --no-install-recommends -y wget \
  # Install Oracle Instantclient
  && mkdir /opt/oracle \
      && cd /opt/oracle \
      && wget https://github.com/diogomascarenha/oracle-instantclient/raw/master/instantclient-basic-linux.x64-12.1.0.2.0.zip \
      && wget https://github.com/diogomascarenha/oracle-instantclient/raw/master/instantclient-sdk-linux.x64-12.1.0.2.0.zip \
      && unzip /opt/oracle/instantclient-basic-linux.x64-12.1.0.2.0.zip -d /opt/oracle \
      && unzip /opt/oracle/instantclient-sdk-linux.x64-12.1.0.2.0.zip -d /opt/oracle \
      && ln -s /opt/oracle/instantclient_12_1/libclntsh.so.12.1 /opt/oracle/instantclient_12_1/libclntsh.so \
      && ln -s /opt/oracle/instantclient_12_1/libclntshcore.so.12.1 /opt/oracle/instantclient_12_1/libclntshcore.so \
      && ln -s /opt/oracle/instantclient_12_1/libocci.so.12.1 /opt/oracle/instantclient_12_1/libocci.so \
      && rm -rf /opt/oracle/*.zip \
  # Install PHP extensions deps
  && apt-get update \
      && apt-get install --no-install-recommends -y \
          libaio-dev && \
  # Install PHP extensions
  if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
    echo 'instantclient,/opt/oracle/instantclient_12_1/' | pecl install oci8-2.0.10; \
  else \
    echo 'instantclient,/opt/oracle/instantclient_12_1/' | pecl install oci8; \
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
    composer global require "laravel/envoy=~1.0" \
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
USER laradock

ARG INSTALL_PRESTISSIMO=false

RUN if [ ${INSTALL_PRESTISSIMO} = true ]; then \
    # Install Prestissimo
    composer global require "hirak/prestissimo" \
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
      apt-get -y install php5.6-sybase freetds-bin freetds-common libsybdb5 \
      && php -m | grep -q 'mssql' \
      && php -m | grep -q 'pdo_dblib' \
    ;else \
      ###########################################################################
      #  The following steps were taken from
      #  https://github.com/Microsoft/msphpsql/wiki/Install-and-configuration
      ###########################################################################
      curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
      curl https://packages.microsoft.com/config/ubuntu/16.04/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
      apt-get update -yqq && \
      ACCEPT_EULA=Y apt-get install -y msodbcsql17 mssql-tools unixodbc unixodbc-dev libgss3 odbcinst locales && \
      ln -sfn /opt/mssql-tools/bin/sqlcmd /usr/bin/sqlcmd && \
      ln -sfn /opt/mssql-tools/bin/bcp /usr/bin/bcp && \
      echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
      locale-gen && \
      if [ $(php -r "echo PHP_MINOR_VERSION;") = "0" ]; then \
        pecl install sqlsrv-5.3.0 pdo_sqlsrv-5.3.0 \
      ;else \
        pecl install sqlsrv pdo_sqlsrv \
      ;fi && \
      echo "extension=sqlsrv.so"     > /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-sqlsrv.ini && \
      echo "extension=pdo_sqlsrv.so" > /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/20-pdo_sqlsrv.ini \
      && php -m | grep -q 'sqlsrv' \
      && php -m | grep -q 'pdo_sqlsrv' \
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
  && curl -LsS https://symfony.com/installer -o /usr/local/bin/symfony \
  && chmod a+x /usr/local/bin/symfony \
  #  Symfony 3 alias
  && echo 'alias dev="php bin/console -e=dev"' >> ~/.bashrc \
  && echo 'alias prod="php bin/console -e=prod"' >> ~/.bashrc \
  #  Symfony 2 alias
  #  && echo 'alias dev="php app/console -e=dev"' >> ~/.bashrc \
  #  && echo 'alias prod="php app/console -e=prod"' >> ~/.bashrc \
;fi

###########################################################################
# PYTHON:
###########################################################################

ARG INSTALL_PYTHON=false

RUN if [ ${INSTALL_PYTHON} = true ]; then \
  apt-get -y install python python-pip python-dev build-essential  \
  && python -m pip install --upgrade pip  \
  && python -m pip install --upgrade virtualenv \
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

RUN if [ ${INSTALL_IMAGEMAGICK} = true ]; then \
    apt-get install -y imagemagick php-imagick \
;fi

###########################################################################
# Terraform:
###########################################################################

USER root

ARG INSTALL_TERRAFORM=false

RUN if [ ${INSTALL_TERRAFORM} = true ]; then \
    apt-get -y install sudo wget unzip \
    && wget https://releases.hashicorp.com/terraform/0.10.6/terraform_0.10.6_linux_amd64.zip \
    && unzip terraform_0.10.6_linux_amd64.zip \
    && mv terraform /usr/local/bin \
    && rm terraform_0.10.6_linux_amd64.zip \
;fi
###########################################################################
# pgsql client
###########################################################################

USER root

ARG INSTALL_PG_CLIENT=false

RUN if [ ${INSTALL_PG_CLIENT} = true ]; then \
    # Install the pgsql client
    apt-get install wget \
    && add-apt-repository "deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main" \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && apt-get update \
    && apt-get -y install postgresql-client-10 \
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
    apt-get update && apt-get install -y unzip libpcre3-dev gcc make re2c \
    && curl -L -o /tmp/cphalcon.zip https://github.com/phalcon/cphalcon/archive/v${LARADOCK_PHALCON_VERSION}.zip \
    && unzip -d /tmp/ /tmp/cphalcon.zip \
    && cd /tmp/cphalcon-${LARADOCK_PHALCON_VERSION}/build \
    && ./install \
    && echo "extension=phalcon.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/phalcon.ini \
    && ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/phalcon.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/30-phalcon.ini \
    && rm -rf /tmp/cphalcon* \
;fi

###########################################################################
# MySQL Client:
###########################################################################

USER root

ARG INSTALL_MYSQL_CLIENT=false

RUN if [ ${INSTALL_MYSQL_CLIENT} = true ]; then \
    apt-get update -yqq && \
    apt-get -y install mysql-client \
;fi

###########################################################################
# ping:
###########################################################################

USER root

ARG INSTALL_PING=false

RUN if [ ${INSTALL_PING} = true ]; then \
    apt-get update -yqq && \
    apt-get -y install inetutils-ping \
;fi

###########################################################################
# sshpass:
###########################################################################

USER root

ARG INSTALL_SSHPASS=false

RUN if [ ${INSTALL_SSHPASS} = true ]; then \
    apt-get update -yqq && \
    apt-get -y install sshpass \
;fi

###########################################################################
# YAML: extension for PHP-CLI
###########################################################################

USER root

ARG INSTALL_YAML=false

RUN if [ ${INSTALL_YAML} = true ]; then \
    apt-get install libyaml-dev -y ; \
    if [ $(php -r "echo PHP_MAJOR_VERSION;") = "5" ]; then \
        pecl install -a yaml-1.3.2; \
    else \
        pecl install yaml; \
    fi && \
    echo "extension=yaml.so" >> /etc/php/${LARADOCK_PHP_VERSION}/mods-available/yaml.ini && \
    ln -s /etc/php/${LARADOCK_PHP_VERSION}/mods-available/yaml.ini /etc/php/${LARADOCK_PHP_VERSION}/cli/conf.d/35-yaml.ini \
;fi

###########################################################################
# FFMpeg:
###########################################################################

USER root

ARG INSTALL_FFMPEG=false

RUN if [ ${INSTALL_FFMPEG} = true ]; then \
  apt-get -y install ffmpeg \
;fi

#####################################
# wkhtmltopdf:
#####################################

USER root

ARG INSTALL_WKHTMLTOPDF=false

RUN if [ ${INSTALL_WKHTMLTOPDF} = true ]; then \
   apt-get install -y \
   libxrender1 \
   libfontconfig1 \
   libx11-dev \
   libjpeg62 \
   libxtst6 \
   wget \
   && wget https://github.com/h4cc/wkhtmltopdf-amd64/blob/master/bin/wkhtmltopdf-amd64?raw=true -O /usr/local/bin/wkhtmltopdf \
   && chmod +x /usr/local/bin/wkhtmltopdf \
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
  apt-get -y install parallel \
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
# Check PHP version:
###########################################################################

RUN set -xe; php -v | head -n 1 | grep -q "PHP ${LARADOCK_PHP_VERSION}."

#
#--------------------------------------------------------------------------
# Final Touch
#--------------------------------------------------------------------------
#

USER root

# Clean up
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    rm /var/log/lastlog /var/log/faillog

# Set default work directory
WORKDIR /var/www
