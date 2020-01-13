FROM grafana/grafana:latest
USER root
RUN chown -R root:root /etc/grafana
RUN chmod -R a+r /etc/grafana
RUN chown -R grafana:grafana /var/lib/grafana
RUN chown -R grafana:grafana /usr/share/grafana
EXPOSE 3000
