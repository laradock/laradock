FROM zuohuadong/caddy:alpine

LABEL maintainer="Huadong Zuo <admin@zuohuadong.cn>"

ARG plugins="cors"

## ARG plugins="cors cgi cloudflare azure linode"


RUN caddyplug install ${plugins}

RUN apk add --no-cache file git autoconf automake libtool gettext gettext-dev make g++ texinfo curl

RUN git clone https://github.com/emcrisostomo/fswatch.git

RUN cd fswatch && ./autogen.sh && ./configure && make -j && ldconfig && cp fswatch/src/fswatch /usr/bin

EXPOSE 80 443 2015

WORKDIR /var/www

CMD ["sh","-c","sh -c 'fswatch -d /etc/caddy | xargs -0 -n 1 -I {} pkill -USR1 caddy' & /usr/bin/caddy -conf /etc/caddy/Caddyfile -agree"]
