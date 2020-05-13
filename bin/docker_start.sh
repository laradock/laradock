#!/usr/bin/env sh
#cd laradock
sudo usermod -a -G docker noud
sudo systemctl restart docker

docker-compose up -d apache2 php-fpm workspace

docker-compose up -d mailhog

docker-compose up -d mysql phpmyadmin

docker-compose up -d redis redis-webui

docker-compose up -d elasticsearch
docker run -p 1358:1358 -d appbaseio/dejavu

docker-compose up -d docker-web-ui