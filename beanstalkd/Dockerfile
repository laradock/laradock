FROM phusion/baseimage:latest

MAINTAINER Mahmoud Zalt <mahmoud@zalt.me>

ENV DEBIAN_FRONTEND noninteractive
ENV PATH /usr/local/rvm/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

ARG CHANGE_SOURCE=false
ENV CHANGE_SOURCE ${CHANGE_SOURCE}
RUN if [ ${CHANGE_SOURCE} = true ]; then \
    sed -i 's/archive.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list \
;fi

RUN apt-get update
RUN apt-get install -y beanstalkd
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

VOLUME /var/lib/beanstalkd/data

EXPOSE 11300

CMD ["/usr/bin/beanstalkd"]
