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

ARG PHP_VERSION=${PHP_VERSION}

FROM laradock/workspace:2.2-${PHP_VERSION}

LABEL maintainer="Mahmoud Zalt <mahmoud@zalt.me>"

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

RUN groupadd -g ${PGID} laradock && \
    useradd -u ${PUID} -g laradock -m laradock -G docker_env && \
    usermod -p "*" laradock

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

USER root

######################################################
# Install Drupal
######################################################
RUN git clone -b 8.7.x https://github.com/drupal/drupal.git /var/www/drupal
RUN git clone -b master https://github.com/for0231/isp.git /var/www/drupal
WORKDIR /var/www/drupal
ENV COMPOSER_PROCESS_TIMEOUT 1200
RUN composer install

# Install Drupal modules
RUN composer require \
  drupal/address \
  drupal/ajax_links_api \
  drupal/block_class \
  drupal/bootstrap \
  drupal/bootstrap_barrio \
  drupal/bootstrap_layouts \
  drupal/bootstrap_library \
  drupal/commerce \
  drupal/commerce_recurring \
  drupal/commerce_alipay \
  drupal/commerce_autosku \
  drupal/commerce_paypal \
  drupal/conditional_fields \
  drupal/console \
  drupal/config_rewrite \
  drupal/custom_formatters \
  drush/drush \
  drupal/drush_language \
  drupal/ds \
  drupal/default_content \
  drupal/devel \
  drupal/entity_print \
  drupal/eva \
  drupal/facets \
  drupal/features \
  drupal/field_formatter_class \
  drupal/field_group \
  drupal/field_widget_class \
  drupal/inline_entity_form \
  drupal/libraries \
  drupal/login_destination \
  drupal/migrate_source_csv \
  drupal/migrate_tools \
  drupal/page_manager \
  drupal/panelizer \
  drupal/panels \
  drupal/quicktabs \
  drupal/reference_table_formatter \
  drupal/rules \
  drupal/search_api_solr \
  drupal/superfish \
  drupal/token \
  drupal/views_slideshow \
  kgaut/potx

# Patch: Allow Tours to be taken by users that cannot access the Toolbar
# https://www.drupal.org/project/drupal/issues/2069073
#RUN wget https://www.drupal.org/files/issues/2069073-38.patch && \
#  git apply 2069073-38.patch && \
#  rm 2069073-38.patch

# Patch: View output is not used for entityreference options
# https://www.drupal.org/node/2174633
#RUN wget https://www.drupal.org/files/issues/2174633-143-entity-reference.patch && \
#  git apply 2174633-143-entity-reference.patch && \
#  rm 2174633-143-entity-reference.patch

# Patch: Can't create comments when comment is a base field
# https://www.drupal.org/project/drupal/issues/2855068
RUN wget https://www.drupal.org/files/issues/2855068-8_0.patch && \
  git apply 2855068-8_0.patch && \
  rm 2855068-8_0.patch

# Patch: Allow updating modules with new service dependencies
# https://www.drupal.org/project/drupal/issues/2863986
RUN wget https://www.drupal.org/files/issues/2863986-2-49.patch && \
  git apply 2863986-2-49.patch && \
  rm 2863986-2-49.patch

# Patch: Allow blocks to be added to entity displays in Field UI
# https://www.drupal.org/project/drupal/issues/2878685
#RUN wget https://www.drupal.org/files/issues/2878685-block-field_ui-36.patch && \
#  git apply 2878685-block-field_ui-36.patch && \
#  rm 2878685-block-field_ui-36.patch

# Patch: Enable block contextual link
# https://www.drupal.org/project/drupal/issues/2940015
RUN wget https://www.drupal.org/files/issues/2940015-block-contextual-link-2.patch && \
  git apply 2940015-block-contextual-link-2.patch && \
  rm 2940015-block-contextual-link-2.patch

# If PHP filter is empty, module should return TRUE and not execute code
# https://www.drupal.org/project/php/issues/2678430
#RUN cd modules/contrib/php && \
#  wget https://www.drupal.org/files/issues/php_condition_check_empty-2678430-13.patch && \
#  patch -p1 < php_condition_check_empty-2678430-13.patch && \
#  rm php_condition_check_empty-2678430-13.patch

RUN cd modules/contrib/login_destination && \
  wget https://www.drupal.org/files/issues/2018-04-19/login_destination-set-options-on-null-error-2947616-21.patch && \
  git apply login_destination-set-options-on-null-error-2947616-21.patch && \
  rm login_destination-set-options-on-null-error-2947616-21.patch
# Install charts
#RUN composer require drupal/charts && \
#  /usr/bin/cd modules/contrib/charts/modules/charts_c3 && \
#  composer install

# Install field_widget_class
# field_widget_class may be add business_core module
# use the command to remove drupal/business_core module
RUN composer remove drupal/field_widget_class
# Patch: No hook alter to override Field Widget wrappers created by WidgetBase::form
RUN wget https://www.drupal.org/files/issues/2018-06-04/2872162-field-widget-hook-10.patch && \
  git apply 2872162-field-widget-hook-10.patch && \
  rm 2872162-field-widget-hook-10.patch

#### Module Patch
# Patch: PHP Fatal error: Declaration of Drupal\ds\Plugin\views\Entity\Render\TranslationLanguageRenderer::getLangcode(Drupal\views\ResultRow $row) must be compatible with XXXXX
RUN cd modules/contrib/ds && \
  wget https://www.drupal.org/files/issues/2018-10-20/3008022-1.patch && \
  git apply -v 3008022-1.patch && \
  rm 3008022-1.patch


# Install Drupal site
RUN mkdir -p /var/www/localhost/htdocs/sites/default/files && \
  chmod a+rw /var/www/localhost/htdocs/sites/default -R && \
  cp /var/www/localhost/htdocs/sites/default/default.settings.php /var/www/localhost/htdocs/sites/default/settings.php && \
  cp /var/www/localhost/htdocs/sites/default/default.services.yml /var/www/localhost/htdocs/sites/default/services.yml && \
  chmod a+rw /var/www/localhost/htdocs/sites/default/settings.php && \
  chmod a+rw /var/www/localhost/htdocs/sites/default/services.yml && \
  chown -R apache:apache /var/www/localhost/htdocs/

RUN mkdir -p /var/www/private && \
  chown -R apache:apache /var/www/private && \
  echo "\$settings['file_private_path'] = '/var/www/private';" >> /var/www/localhost/htdocs/sites/default/settings.php



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
COPY ./.inputrc /root/.inputrc
COPY ./.inputrc /home/laradock/.inputrc

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

# Make sure that ~/.composer belongs to laradock
RUN chown -R laradock:laradock /home/laradock/.composer

USER laradock

# Check if global install need to be ran
ARG COMPOSER_GLOBAL_INSTALL=false
ENV COMPOSER_GLOBAL_INSTALL ${COMPOSER_GLOBAL_INSTALL}

RUN if [ ${COMPOSER_GLOBAL_INSTALL} = true ]; then \
    # run the install
    composer global install \
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
# SOAP:
###########################################################################

USER root

ARG INSTALL_SOAP=false
ARG PHP_VERSION=${PHP_VERSION}

RUN if [ ${INSTALL_SOAP} = true ]; then \
  # Install the PHP SOAP extension
  apt-get -y install libxml2-dev php${PHP_VERSION}-soap \
;fi

###########################################################################
# LDAP:
###########################################################################

ARG INSTALL_LDAP=false
ARG PHP_VERSION=${PHP_VERSION}

RUN if [ ${INSTALL_LDAP} = true ]; then \
    apt-get install -y libldap2-dev && \
    apt-get install -y php${PHP_VERSION}-ldap \
;fi

###########################################################################
# IMAP:
###########################################################################

ARG INSTALL_IMAP=false
ARG PHP_VERSION=${PHP_VERSION}

RUN if [ ${INSTALL_IMAP} = true ]; then \
    apt-get install -y php${PHP_VERSION}-imap \
;fi

###########################################################################
# xDebug:
###########################################################################

USER root

ARG INSTALL_XDEBUG=false
ARG PHP_VERSION=${PHP_VERSION}

RUN if [ ${INSTALL_XDEBUG} = true ]; then \
    # Load the xdebug extension only with phpunit commands
    apt-get install -y --force-yes php${PHP_VERSION}-xdebug && \
    sed -i 's/^;//g' /etc/php/${PHP_VERSION}/cli/conf.d/20-xdebug.ini && \
    echo "alias phpunit='php -dzend_extension=xdebug.so /var/www/vendor/bin/phpunit'" >> ~/.bashrc \
;fi

# ADD for REMOTE debugging
COPY ./xdebug.ini /etc/php/${PHP_VERSION}/cli/conf.d/xdebug.ini

###########################################################################
# Blackfire:
###########################################################################

ARG INSTALL_BLACKFIRE=false
ARG BLACKFIRE_CLIENT_ID
ENV BLACKFIRE_CLIENT_ID ${BLACKFIRE_CLIENT_ID}
ARG BLACKFIRE_CLIENT_TOKEN
ENV BLACKFIRE_CLIENT_TOKEN ${BLACKFIRE_CLIENT_TOKEN}

RUN if [ ${INSTALL_XDEBUG} = false -a ${INSTALL_BLACKFIRE} = true ]; then \
    curl -L https://packagecloud.io/gpg.key | apt-key add - && \
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
ARG PHP_VERSION=${PHP_VERSION}

RUN if [ ${INSTALL_MONGO} = true ]; then \
    # Install the mongodb extension
    pecl -q install mongodb && \
    echo "extension=mongodb.so" >> /etc/php/${PHP_VERSION}/mods-available/mongodb.ini && \
    ln -s /etc/php/${PHP_VERSION}/mods-available/mongodb.ini /etc/php/${PHP_VERSION}/cli/conf.d/30-mongodb.ini \
;fi

###########################################################################
# AMQP:
###########################################################################

ARG INSTALL_AMQP=false
ARG PHP_VERSION=${PHP_VERSION}

RUN if [ ${INSTALL_AMQP} = true ]; then \
    apt-get install librabbitmq-dev -y && \
    pecl -q install amqp && \
    echo "extension=amqp.so" >> /etc/php/${PHP_VERSION}/mods-available/amqp.ini && \
    ln -s /etc/php/${PHP_VERSION}/mods-available/amqp.ini /etc/php/${PHP_VERSION}/cli/conf.d/30-amqp.ini \
;fi

###########################################################################
# PHP REDIS EXTENSION
###########################################################################

ARG INSTALL_PHPREDIS=false
ARG PHP_VERSION=${PHP_VERSION}

RUN if [ ${INSTALL_PHPREDIS} = true ]; then \
    # Install Php Redis extension
    printf "\n" | pecl -q install -o -f redis && \
    echo "extension=redis.so" >> /etc/php/${PHP_VERSION}/mods-available/redis.ini && \
    phpenmod redis \
;fi

###########################################################################
# Swoole EXTENSION
###########################################################################

ARG INSTALL_SWOOLE=false
ARG PHP_VERSION=${PHP_VERSION}

RUN if [ ${INSTALL_SWOOLE} = true ]; then \
    # Install Php Swoole Extension
    pecl -q install swoole && \
    echo "extension=swoole.so" >> /etc/php/${PHP_VERSION}/mods-available/swoole.ini && \
    ln -s /etc/php/${PHP_VERSION}/mods-available/swoole.ini /etc/php/${PHP_VERSION}/cli/conf.d/20-swoole.ini \
;fi

###########################################################################
# Drush:
###########################################################################

USER root

ARG INSTALL_DRUSH=false

RUN if [ ${INSTALL_DRUSH} = true ]; then \
    apt-get -y install mysql-client && \
    # Install Drush 8 with the phar file.
    curl -fsSL -o /usr/local/bin/drush https://github.com/drush-ops/drush/releases/download/${DRUSH_VERSION}/drush.phar | bash && \
    chmod +x /usr/local/bin/drush && \
    drush core-status \
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
ARG NODE_VERSION=stable
ENV NODE_VERSION ${NODE_VERSION}
ARG INSTALL_NODE=false
ARG NPM_REGISTRY
ENV NPM_REGISTRY ${NPM_REGISTRY}
ENV NVM_DIR /home/laradock/.nvm

RUN if [ ${INSTALL_NODE} = true ]; then \
    # Install nvm (A Node Version Manager)
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash && \
        . $NVM_DIR/nvm.sh && \
        nvm install ${NODE_VERSION} && \
        nvm use ${NODE_VERSION} && \
        nvm alias ${NODE_VERSION} && \
        if [ ${NPM_REGISTRY} ]; then \
        npm config set registry ${NPM_REGISTRY} \
        ;fi && \
        npm install -g gulp bower vue-cli \
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
ENV PATH $PATH:$NVM_DIR/versions/node/v${NODE_VERSION}/bin

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

###########################################################################
# PHP Aerospike:
###########################################################################

USER root

ARG INSTALL_AEROSPIKE=false
ARG PHP_VERSION=${PHP_VERSION}

RUN if [ ${INSTALL_AEROSPIKE} = true ]; then \
    # Fix dependencies for PHPUnit within aerospike extension
    apt-get -y install sudo wget && \
    # Install the php aerospike extension
    curl -L -o /tmp/aerospike-client-php.tar.gz ${AEROSPIKE_PHP_REPOSITORY} \
    && mkdir -p aerospike-client-php \
    && tar -C aerospike-client-php -zxvf /tmp/aerospike-client-php.tar.gz --strip 1 \
    && ( \
        cd aerospike-client-php/src \
        && phpize \
        && ./build.sh \
        && make install \
    ) \
    && rm /tmp/aerospike-client-php.tar.gz \
    && echo 'extension=aerospike.so' >> /etc/php/${PHP_VERSION}/cli/conf.d/aerospike.ini \
    && echo 'aerospike.udf.lua_system_path=/usr/local/aerospike/lua' >> /etc/php/${PHP_VERSION}/cli/conf.d/aerospike.ini \
    && echo 'aerospike.udf.lua_user_path=/usr/local/aerospike/usr-lua' >> /etc/php/${PHP_VERSION}/cli/conf.d/aerospike.ini \
;fi

###########################################################################
# PHP V8JS:
###########################################################################

USER root

ARG INSTALL_V8JS=false
ARG PHP_VERSION=${PHP_VERSION}

RUN if [ ${INSTALL_V8JS} = true ]; then \
    # Install the php V8JS extension
    add-apt-repository -y ppa:pinepain/libv8-archived \
    && apt-get update -yqq \
    && apt-get install -y php${PHP_VERSION}-xml php${PHP_VERSION}-dev php-pear libv8-5.4 \
    && pecl install v8js \
    && echo "extension=v8js.so" >> /etc/php/${PHP_VERSION}/cli/php.ini \
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

USER root

ARG COMPOSER_REPO_PACKAGIST
ENV COMPOSER_REPO_PACKAGIST ${COMPOSER_REPO_PACKAGIST}

RUN if [ ${COMPOSER_REPO_PACKAGIST} ]; then \
    composer config -g repo.packagist composer ${COMPOSER_REPO_PACKAGIST} \
;fi

ARG INSTALL_LARAVEL_INSTALLER=false

RUN if [ ${INSTALL_LARAVEL_INSTALLER} = true ]; then \
    # Install the Laravel Installer
	composer global require "laravel/installer" \
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
ARG PHP_VERSION=${PHP_VERSION}

RUN set -eux; if [ ${INSTALL_MSSQL} = true ]; then \
    ###########################################################################
    #  The following steps were taken from
    #  https://github.com/Microsoft/msphpsql/wiki/Install-and-configuration
    ###########################################################################
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/16.04/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update -yqq && \
    ACCEPT_EULA=Y apt-get install -yqq msodbcsql=13.0.1.0-1 mssql-tools=14.0.2.0-1 && \
    apt-get install -yqq unixodbc-dev-utf16 && \
    ln -sfn /opt/mssql-tools/bin/sqlcmd-13.0.1.0 /usr/bin/sqlcmd && \
    ln -sfn /opt/mssql-tools/bin/bcp-13.0.1.0 /usr/bin/bcp && \
    ACCEPT_EULA=Y apt-get install -yqq \
        unixodbc \
        unixodbc-dev \
        libgss3 \
        odbcinst \
        msodbcsql \
        locales && \
    echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
    locale-gen && \
    pecl install sqlsrv-4.3.0 pdo_sqlsrv-4.3.0 && \
    apt-get install -y locales && \
    echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
    locale-gen && \
    echo "extension=sqlsrv.so"     > /etc/php/${PHP_VERSION}/cli/conf.d/20-sqlsrv.ini && \
    echo "extension=pdo_sqlsrv.so" > /etc/php/${PHP_VERSION}/cli/conf.d/20-pdo_sqlsrv.ini \
    && php -m | grep -q 'sqlsrv' \
    && php -m | grep -q 'pdo_sqlsrv' \
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
    apt-get install -y --force-yes jpegoptim optipng pngquant gifsicle && \
    if [ ${INSTALL_NODE} = true ]; then \
        . ~/.bashrc && npm install -g svgo \
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
  && pip install --upgrade pip  \
  && pip install --upgrade virtualenv \
;fi

###########################################################################
# ImageMagick:
###########################################################################

USER root

ARG INSTALL_IMAGEMAGICK=false

RUN if [ ${INSTALL_IMAGEMAGICK} = true ]; then \
    apt-get install -y --force-yes imagemagick php-imagick \
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
    apt-get -y install postgresql-client \
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
# Check PHP version:
###########################################################################

ARG PHP_VERSION=${PHP_VERSION}

RUN php -v | head -n 1 | grep -q "PHP ${PHP_VERSION}."

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

