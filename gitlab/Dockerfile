FROM gitlab/gitlab-ce:latest

LABEL maintainer="ahkui <ahkui@outlook.com>"

VOLUME ["/etc/gitlab", "/var/opt/gitlab", "/var/log/gitlab"]

RUN update-permissions

CMD ["/usr/local/bin/wrapper"]