FROM python:slim

LABEL maintainer="melchabcede@gmail.com"

RUN pip install --upgrade --no-cache-dir awsebcli
RUN apt-get -yqq update && apt-get -yqq install git-all

# copy ssh keys into docker container
COPY ssh_keys/* /root/.ssh/
RUN chmod 700 /root/.ssh && chmod 600 /root/.ssh/*

# Set default work directory
WORKDIR /var/www
