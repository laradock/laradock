FROM golang

MAINTAINER Huadong Zuo <admin@zuohuadong.cn>

ARG plugins="git"

## If you come frome china, please ues it.

# RUN echo "172.217.6.127 golang.org" >> /etc/hosts

RUN go get github.com/abiosoft/caddyplug/caddyplug \
    && caddyplug install-caddy \
    && caddyplug install git
RUN caddy --version

EXPOSE 80 443 2015

WORKDIR /var/www/public

CMD ["/usr/bin/caddy", "-conf", "/etc/Caddyfile"]
