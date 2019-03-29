FROM golang:alpine

LABEL maintainer="Huadong Zuo <admin@zuohuadong.cn>"

RUN apk add --no-cache \
    openssh \
    git \
    build-base \
    && mkdir -p $GOPATH/src/golang.org/x/ \
    && cd $GOPATH/src/golang.org/x/ \
    && git clone https://github.com/golang/sys.git sys \
    && go get github.com/abiosoft/caddyplug/caddyplug \
    && caddyplug install-caddy \
    apk del build-base

ARG plugins="cors"

## ARG plugins="cors cgi cloudflare azure linode"

RUN caddyplug install ${plugins}

RUN apk add --no-cache inotify-tools \
    && echo -e "#!/bin/sh\nwhile inotifywait -e modify /etc/caddy; do\n\tpkill caddy\ndone " >> /start.sh \
    && chmod +x /start.sh

EXPOSE 80 443

WORKDIR /var/www/public

CMD ["sh","-c","/start.sh & /usr/bin/caddy -conf /etc/caddy/Caddyfile -agree"]
