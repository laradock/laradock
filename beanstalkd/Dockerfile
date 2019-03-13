FROM alpine
LABEL maintainer="Mahmoud Zalt <mahmoud@zalt.me>"

RUN apk add --no-cache beanstalkd

EXPOSE 11300
ENTRYPOINT ["/usr/bin/beanstalkd"]
