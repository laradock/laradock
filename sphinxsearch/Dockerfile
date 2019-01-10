# Dockerfile for Sphinx SE
FROM debian:stretch

ENV SPHINX_VERSION 3.1.1-612d99f
ENV SPHINX_VERSION_SHORT 3.1.1

# install dependencies
RUN apt-get update && apt-get install -y \
        default-libmysqlclient-dev \
        libpq-dev \
        wget

# set timezone
# @see http://unix.stackexchange.com/a/76711
RUN cp /usr/share/zoneinfo/CET /etc/localtime && dpkg-reconfigure --frontend noninteractive tzdata

# set up and expose directories
RUN mkdir -pv /opt/sphinx/log /opt/sphinx/index
VOLUME /opt/sphinx/index
VOLUME /opt/sphinx/log

# http://sphinxsearch.com/files/sphinx-3.0.1-7fec4f6-linux-amd64.tar.gz
RUN wget http://sphinxsearch.com/files/sphinx-${SPHINX_VERSION}-linux-amd64.tar.gz -O /tmp/sphinxsearch.tar.gz
RUN cd /opt/sphinx && tar -xf /tmp/sphinxsearch.tar.gz
RUN rm /tmp/sphinxsearch.tar.gz

# point to sphinx binaries
ENV PATH "${PATH}:/opt/sphinx/sphinx-${SPHINX_VERSION_SHORT}/bin"
RUN indexer -v

# redirect logs to stdout
RUN ln -sv /dev/stdout /opt/sphinx/log/query.log
RUN ln -sv /dev/stdout /opt/sphinx/log/searchd.log

#RUN mkdir -pv /opt/sphinx/index/binlog

# expose TCP port
EXPOSE 36307
EXPOSE 36308

VOLUME /opt/sphinx/conf

#CMD indexer --config /opt/sphinx/conf/sphinx.conf elements
#CMD indexer --all --rotate --config /opt/sphinx/conf/sphinx.conf
CMD searchd --nodetach --config /opt/sphinx/conf/sphinx.conf
