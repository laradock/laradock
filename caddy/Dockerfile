FROM zuohuadong/caddy:alpine

LABEL maintainer="Huadong Zuo <admin@zuohuadong.cn>"

ARG plugins="cors filemanager git"

## ARG plugins="cors cgi cloudflare azure linode"

RUN caddyplug install ${plugins}

RUN apk add --no-cache inotify-tools \
    && echo -e "#!/bin/sh\nwhile inotifywait -e modify /etc/caddy; do\n\tpkill caddy\ndone " >> /start.sh \
    && chmod +x /start.sh

EXPOSE 80 443 2015

WORKDIR /var/www

CMD ["sh","-c","/start.sh & /usr/bin/caddy -conf /etc/caddy/Caddyfile -agree"]
