ARG POSTGIS_VERSION=latest
FROM postgis/postgis:${POSTGIS_VERSION}

LABEL maintainer="Mahmoud Zalt <mahmoud@zalt.me>"

ARG INSTALL_PGSQL_HTTP_FOR_POSTGIS13=false

RUN if [ ${INSTALL_PGSQL_HTTP_FOR_POSTGIS13} = true ]; then \
    apt-get clean \
    && apt-get update -yqq \
    && apt-get install -y \
        git \
        make \
        gcc \
        libcurl4-openssl-dev \
        postgresql-server-dev-13 \
        postgresql-13-cron \
    && git clone --recursive https://github.com/pramsey/pgsql-http.git \
    && cd pgsql-http/ \
    && make \
    && make install \
    && apt-get clean \
;fi

CMD ["postgres"]

EXPOSE 5432
