#!/usr/bin/env sh
#cd laradock
docker-compose up -d workspace

docker-compose up -d mailhog

docker-compose up -d mysql phpmyadmin

docker-compose up -d redis redis-webui

docker run -p 1358:1358 -d appbaseio/dejavu

docker-compose up -d docker-web-ui
