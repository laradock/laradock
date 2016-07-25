FROM alpine:3.4

MAINTAINER Eric Pfeiffer <computerfr33k@users.noreply.github.com>

LABEL caddy_version="0.9.0" architecture="amd64"

RUN apk update \
    && apk upgrade \
    && apk add tar curl

RUN curl --silent --show-error --fail --location \
      --header "Accept: application/tar+gzip, application/x-gzip, application/octet-stream" -o - \
      "https://github.com/mholt/caddy/releases/download/v0.9.0/caddy_linux_amd64.tar.gz" \
    | tar --no-same-owner -C /usr/bin/ -xz caddy_linux_amd64 \
 && mv /usr/bin/caddy_linux_amd64 /usr/bin/caddy \
 && chmod 0755 /usr/bin/caddy \
 && /usr/bin/caddy -version

EXPOSE 80 443 2015

WORKDIR /var/www/laravel/public

ENTRYPOINT ["caddy"]

CMD ["-conf", "/etc/Caddyfile"]
