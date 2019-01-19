docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker images)
rm -rf ~/.laradock