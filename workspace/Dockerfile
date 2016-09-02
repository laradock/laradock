FROM laradock/workspace:1.2

WORKDIR /var/www/laravel

ENTRYPOINT ["/opt/docker/bin/entrypoint.sh"]

CMD ["supervisord"]

COPY conf/ /opt/docker/

RUN /opt/docker/bin/provision run --tag bootstrap --role laradock-workspace \
    && /opt/docker/bin/bootstrap.sh
