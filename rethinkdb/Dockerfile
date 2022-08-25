FROM rethinkdb:latest

LABEL maintainer="Cristian Mello <cristianc.mello@gmail.com>"

VOLUME /data/rethinkdb_data

#Necessary for the backup rethinkdb
RUN apt-get -y update \
    && apt-get -y upgrade \
    && apt-get -y install python-pip \
    && pip install rethinkdb \
    && rm -rf /var/lib/apt/lists/*

RUN cp /etc/rethinkdb/default.conf.sample /etc/rethinkdb/instances.d/instance1.conf

CMD ["rethinkdb", "--bind", "all"]

EXPOSE 8080
