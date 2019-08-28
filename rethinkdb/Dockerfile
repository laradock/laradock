FROM debian:stretch-slim

LABEL maintainer="Cristian Mello <cristianc.mello@gmail.com>"

VOLUME /data/rethinkdb_data

WORKDIR /data

RUN apt-get update \
    && apt-get install -y wget gnupg2 apt-transport-https \
    && wget http://mirrors.kernel.org/ubuntu/pool/main/p/protobuf/libprotobuf9v5_2.6.1-1.3_amd64.deb \
    && dpkg -i libprotobuf9v5_2.6.1-1.3_amd64.deb \
    && echo "deb http://download.rethinkdb.com/apt stretch main" | tee /etc/apt/sources.list.d/rethinkdb.list \
    && wget -qO- https://download.rethinkdb.com/apt/pubkey.gpg | apt-key add - \
    && apt-get update \
    && apt-get install -y rethinkdb \
    && rm -rf /var/lib/apt/lists/*

CMD ["rethinkdb", "--bind", "all"]

EXPOSE 28015 29015 8080
