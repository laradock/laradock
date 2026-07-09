ARG FRANKENPHP_VERSION=1-php8
FROM dunglas/frankenphp:${FRANKENPHP_VERSION}

LABEL maintainer="Laradock"

# FrankenPHP ships mlocati's install-php-extensions helper. Install the
# extensions a typical Laravel app needs; add more here as required.
RUN install-php-extensions \
    pdo_mysql \
    pdo_pgsql \
    redis \
    intl \
    zip \
    gd \
    bcmath \
    pcntl \
    opcache

WORKDIR /app
