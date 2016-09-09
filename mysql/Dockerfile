FROM mysql:latest

MAINTAINER Mahmoud Zalt <mahmoud@zalt.me>

ARG MAX_ALLOWED_PACKET=1M
ENV MAX_ALLOWED_PACKET ${MAX_ALLOWED_PACKET}

# Set MAX_ALLOWED_PACKET to /etc/mysql/my.cnf
RUN sed -i "s/^\[mysqld\]$/\[mysqld\]\nmax_allowed_packet = ${MAX_ALLOWED_PACKET}/g" /etc/mysql/my.cnf

CMD ["mysqld"]

EXPOSE 3306
