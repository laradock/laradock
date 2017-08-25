FROM alpine:3.5

MAINTAINER Eric Pfeiffer <computerfr33k@users.noreply.github.com>

ENV caddy_version=0.10.5
ARG plugins=http.git

LABEL caddy_version="$caddy_version" architecture="amd64"

RUN apk update \
    && apk upgrade \
    && apk add --no-cache openssh-client git tar curl

RUN curl --silent --show-error --fail --location \
        --header "Accept: application/tar+gzip, application/x-gzip, application/octet-stream" -o - \
        "https://caddyserver.com/download/linux/amd64?plugins=${plugins}" \
        | tar --no-same-owner -C /usr/bin/ -xz caddy \
    && mv /usr/bin/caddy /usr/bin/caddy \
    && chmod 0755 /usr/bin/caddy

EXPOSE 80 443 2015

WORKDIR /var/www/public

CMD ["/usr/bin/caddy", "-conf", "/etc/Caddyfile"]
