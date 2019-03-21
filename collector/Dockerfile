FROM debian:jessie

MAINTAINER Marcin Kolos <m.kolos@canetsystems.com>

ENV DEBIAN_FRONTEND=noninteractive

ARG DPS_COMPANY

ARG DPS_APT_KEY

RUN echo "deb http://${DPS_COMPANY}:${DPS_APT_KEY}@repo.canet.pl/jessie/dps-testing jessie main" > /etc/apt/sources.list.d/dps.list

RUN for server in $(shuf -e ha.pool.sks-keyservers.net \
                                hkp://p80.pool.sks-keyservers.net:80 \
                                keyserver.ubuntu.com \
                                hkp://keyserver.ubuntu.com:80 \
                                keyserver.pgp.com \
                                pgp.mit.edu) ; do \
            gpg --keyserver "$server" --recv-keys 57863FF3 && break || : ; \
        done; \
    gpg -a --export 57863FF3| apt-key add -

RUN apt-get update && \
	apt-get install -y supervisor mc telnet cron \
    php5 \
    php5-cli php5-snmp php5-mysql php5-gd \
    snmp libsnmp-base \
    php5-rrd php5-curl pwgen mrtg rrdtool \
    librrds-perl \
    zendframework \
    net-tools

COPY ./conf/supervisor/cron.conf /etc/supervisor/conf.d/cron.conf
COPY ./conf/supervisor/dps-mrtg.conf /etc/supervisor/conf.d/dps-mrtg.conf
COPY ./conf/cron.d/dps-mon /etc/cron.d/dps-mon
COPY ./conf/dps-mrtg.init.d /etc/init.d/dps-mrtg

COPY ./dps/bin/ /usr/bin/
COPY ./dps/webui/ /usr/share/dps/
COPY ./conf/ /etc/dps/

RUN rm -f /usr/share/dps/application/configs/application.ini
RUN ln -s /etc/dps/application.ini /usr/share/dps/application/configs/application.ini

COPY ./dps/lib/libdps.php /usr/lib/dps/libdps.php

RUN chmod 0644 /etc/cron.d/dps*
RUN chmod 0755 /etc/init.d/dps-mrtg

RUN adduser --system --disabled-password --gecos '' dps

ENTRYPOINT ["/usr/bin/supervisord"]