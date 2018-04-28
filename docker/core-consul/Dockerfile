FROM dockerframework/core-base:latest

# ================================================================================================
#  Inspiration: Docker Alpine (https://github.com/bhuisgen/docker-alpine)
#               Boris HUISGEN <bhuisgen@hbis.fr>
# ================================================================================================
#  Core Contributors:
#   - Mahmoud Zalt @mahmoudz
#   - Bo-Yi Wu @appleboy
#   - Philippe Trépanier @philtrep
#   - Mike Erickson @mikeerickson
#   - Dwi Fahni Denni @zeroc0d3
#   - Thor Erik @thorerik
#   - Winfried van Loon @winfried-van-loon
#   - TJ Miller @sixlive
#   - Yu-Lung Shao (Allen) @bestlong
#   - Milan Urukalo @urukalo
#   - Vince Chu @vwchu
#   - Huadong Zuo @zuohuadong
# ================================================================================================

MAINTAINER "Laradock Team <mahmoud@zalt.me>"

ENV CONSUL_VERSION=1.0.7 \
    CONSULTEMPLATE_VERSION=0.19.4

RUN mkdir -p /var/lib/consul && \
    addgroup -g 500 -S consul && \
    adduser -u 500 -S -D -g "" -G consul -s /sbin/nologin -h /var/lib/consul consul && \
    chown -R consul:consul /var/lib/consul

RUN apk add --update zip && \
    curl -sSL https://releases.hashicorp.com/consul/${CONSUL_VERSION}/consul_${CONSUL_VERSION}_linux_amd64.zip -o /tmp/consul.zip && \
    unzip /tmp/consul.zip -d /bin && \
    rm /tmp/consul.zip && \
    curl -sSL https://releases.hashicorp.com/consul-template/${CONSULTEMPLATE_VERSION}/consul-template_${CONSULTEMPLATE_VERSION}_linux_amd64.zip -o /tmp/consul-template.zip && \
    unzip /tmp/consul-template.zip -d /bin && \
    rm /tmp/consul-template.zip && \
    apk del zip && \
    rm -rf /var/cache/apk/*

COPY rootfs/ /

ENTRYPOINT ["/init"]
CMD []

EXPOSE 3000 3000/udp 8300 8301 8301/udp 8302 8302/udp 8500 8501 8600 8600/udp 9000 9000/udp 9001 9001/udp
VOLUME ["/var/lib/consul"]

HEALTHCHECK CMD /etc/consul.d/check || exit 1
