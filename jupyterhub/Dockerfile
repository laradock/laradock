FROM python
LABEL maintainer="ahkui <ahkui@outlook.com>"

ENV JUPYTERHUB_USER_DATA ${JUPYTERHUB_USER_DATA}
ENV JUPYTERHUB_POSTGRES_DB ${JUPYTERHUB_POSTGRES_DB}
ENV JUPYTERHUB_POSTGRES_USER ${JUPYTERHUB_POSTGRES_USER}
ENV JUPYTERHUB_POSTGRES_HOST ${JUPYTERHUB_POSTGRES_HOST}
ENV JUPYTERHUB_POSTGRES_PASSWORD ${JUPYTERHUB_POSTGRES_PASSWORD}
ENV JUPYTERHUB_OAUTH_CALLBACK_URL ${JUPYTERHUB_OAUTH_CALLBACK_URL}
ENV JUPYTERHUB_OAUTH_CLIENT_ID ${JUPYTERHUB_OAUTH_CLIENT_ID}
ENV JUPYTERHUB_OAUTH_CLIENT_SECRET ${JUPYTERHUB_OAUTH_CLIENT_SECRET}
ENV JUPYTERHUB_LOCAL_NOTEBOOK_IMAGE ${JUPYTERHUB_LOCAL_NOTEBOOK_IMAGE}

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -

RUN apt update -yqq && \
    apt-get install -y nodejs
    
RUN npm install -g configurable-http-proxy

RUN pip install jupyterhub
RUN pip install oauthenticator
RUN pip install dockerspawner
RUN pip install psycopg2 psycopg2-binary

CMD ["sh", "-c", "jupyterhub upgrade-db && jupyterhub -f /jupyterhub_config.py"]
