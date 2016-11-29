FROM alpine:3.4

MAINTAINER Eric Pfeiffer <computerfr33k@users.noreply.github.com>

ENV caddy_version=0.9.3

LABEL caddy_version="$caddy_version" architecture="amd64"

RUN apk update \
    && apk upgrade \
    && apk add tar curl

RUN curl --silent --show-error --fail --location \
        --header "Accept: application/tar+gzip, application/x-gzip, application/octet-stream" -o - \
        "https://github.com/mholt/caddy/releases/download/v$caddy_version/caddy_linux_amd64.tar.gz" \
        | tar --no-same-owner -C /usr/bin/ -xz caddy_linux_amd64 \
    && mv /usr/bin/caddy_linux_amd64 /usr/bin/caddy \
    && chmod 0755 /usr/bin/caddy

EXPOSE 80 443 2015

WORKDIR /var/www/public

CMD ["/usr/bin/caddy", "-conf", "/etc/Caddyfile"]
