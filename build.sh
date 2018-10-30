#!/bin/bash

####################################################
#                   Build for drupal               #
####################################################

docker-compose build workspace nginx mariadb phpmyadmin

docker rm -f laradock_workspace_1
docker run -d --name laradock_workspace_1 laradock_workspace
if [ -d ./drupal.old ]; then
  sudo rm -rf ./drupal.old
fi
if [ -d ./drupal ]; then
  mv ./drupal ./drupal.old
fi
sudo docker cp laradock_workspace_1:/var/www/drupal drupal
docker stop laradock_workspace_1
docker rm laradock_workspace_1

sudo chown -R $USER ./drupal
sudo chmod -R g+w ./drupal