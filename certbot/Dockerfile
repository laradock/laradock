FROM phusion/baseimage:bionic-1.0.0

LABEL maintainer="Nyongesa Ignatius <ignatius.freelancer@gmail.com>"
LABEL website="Bytedots Technologies <https://bytedots.com>"

COPY run-certbot.sh /root/certbot/run-certbot.sh

RUN apt-get update
RUN apt-get install -y letsencrypt

ENTRYPOINT bash -c "bash /root/certbot/run-certbot.sh && sleep infinity"
