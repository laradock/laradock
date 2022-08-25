FROM adminer:4

LABEL maintainer="Patrick Artounian <partounian@gmail.com>"

# Add volume for sessions to allow session persistence
VOLUME /sessions

#####################################
# SQL SERVER:
#####################################
USER root

ARG INSTALL_MSSQL=false
ENV INSTALL_MSSQL ${INSTALL_MSSQL}

RUN if [ ${INSTALL_MSSQL} = true ]; then \
  set -xe \
  && apk update \
  && apk add --no-cache --virtual .php-build-dependencies unixodbc-dev freetds-dev \
  && apk add --virtual .php-runtime-dependencies unixodbc freetds \
  && docker-php-ext-configure pdo_odbc --with-pdo-odbc=unixODBC,/usr \
  && docker-php-ext-install pdo_odbc pdo_dblib \
  && apk del .php-build-dependencies \
  && rm -rf /var/cache/apk/* \
;fi

USER adminer

# We expose Adminer on port 8080 (Adminer's default)
EXPOSE 8080
