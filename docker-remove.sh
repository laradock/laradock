#!/usr/bin/env sh

#####  WARNING !!!  ###########################
# YOU HAVE ALREADY KNOW WHAT YOU'RE DOING !   #
# ------------------------------------------- #
# This will remove all your docker container  #
# without mercy !                             #
# ------------------------------------------- #

##### Remove all docker "laradock" #####
sudo docker ps -a | grep "laradock" | awk '{print $2}' | xargs sudo docker rmi -f

##### Remove all docker container #####
# WARNING! This will remove:
#	- all stopped containers
#	- all volumes not used by at least one container
#	- all networks not used by at least one container
#	- all images without at least one container associated to them

# sudo docker system prune -a