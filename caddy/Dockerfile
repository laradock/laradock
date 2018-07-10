FROM zuohuadong/caddy:alpine

LABEL maintainer="Huadong Zuo <admin@zuohuadong.cn>"

ARG plugins="cors filemanager git"

## ARG plugins="cors cgi cloudflare azure linode"

RUN caddyplug install ${plugins}

RUN apk add --no-cache file git autoconf automake libtool gettext gettext-dev make g++ texinfo curl

RUN cd / \
    && git clone https://github.com/emcrisostomo/fswatch.git \
    && cd /fswatch \
    && ./autogen.sh \
    && ./configure \
    && make -j \
    && cp /fswatch/fswatch/src/fswatch /usr/bin \
    && echo "#!/bin/sh\nfswatch -d /etc/caddy | xargs -0 -n 1 -I {} pkill -USR1 caddy" >> /start.sh \
    && chmod +x /start.sh

EXPOSE 80 443 2015

WORKDIR /var/www

CMD ["sh","-c","/start.sh & /usr/bin/caddy -conf /etc/caddy/Caddyfile -agree"]
