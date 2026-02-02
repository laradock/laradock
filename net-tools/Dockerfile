FROM alpine:latest

RUN apk update && apk add bind-tools net-tools curl
RUN rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

CMD ["tail", "-F", "-n0", "/etc/hosts"]