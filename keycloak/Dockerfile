ARG KEYCLOAK_VERSION=latest
FROM jboss/keycloak:${KEYCLOAK_VERSION}

LABEL maintainer="Dzango Technologies <info@dzango.com>"

ENTRYPOINT [ "/opt/jboss/tools/docker-entrypoint.sh" ]

CMD ["-b", "0.0.0.0"]
