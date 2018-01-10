#!/bin/bash

# dock清理,清楚所有数据
dcleandockfunction()
{
  echo '停止laradock'
  laradock=`docker-compose ps -q`
  if [ -n "$laradock" ]; then
   docker-compose down
  fi

  echo '停止所有的容器'
  container=`docker ps -a -q`
    if [ -n "$container" ]; then
      docker stop $(docker ps -a -q)
    fi

  echo '删除所有的容器'
  processes=`docker ps -a -q`
    if [ -n "$processes" ]; then
      docker rm $(docker ps -a -q)
    fi

  echo '删除所有镜像'
  images=`docker images -q`
    if [ -n "$images" ]; then
      docker rmi $(docker images -q)
    fi

  echo '删除所有数据卷'
  volume=`docker volume ls -q`
    if [ -n "$volume" ]; then
      docker volume rm $(docker volume ls -q)
    fi

    echo '删除laradock的数据'
    rm -rf ~/.laradock

}

dcleandockfunction
