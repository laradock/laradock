FROM certbot/dns-cloudflare

LABEL maintainer="Alaa Alghazouli <alaa.alghazouli.90@gmail.com>"

COPY cloudflare.ini.template /root/cloudflare.ini.template
COPY run-certbot.sh /root/run-certbot.sh
COPY copy-certs.sh /root/copy-certs.sh

RUN apk update && \
    apk add --no-cache bash curl tzdata bind-tools gettext docker-cli && \
    chmod 600 /root/cloudflare.ini.template && \
    chmod +x /root/run-certbot.sh /root/copy-certs.sh

ENTRYPOINT ["/root/run-certbot.sh"]
