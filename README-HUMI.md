# Humi Platform Setup

- Clone the repo at the same level as your application repositories
- Verify the /nginx/conf files point to the correct folders /var/www/APP_FOLDER/public
  - Add these server_name's to your /etc/hosts for 127.0.0.1
- Verify mysql 8.0 support with `default_authentication_plugin=mysql_native_password` in /mysql/my.cnf 
- cp env-example .env
- run `./dock.sh up` or `docker-compose up -d nginx mysql redis workspace `
- Access the docker mysql database using root/root at 127.0.0.1
- Create the humi, admin, and humi_v1 databases
- Update your local env files with the following keywords
  - database host: mysql
  - redis host: redis

see ./dock.sh for other relevant commands/learning

```bash
  ./dock workspace - exec bash into workspace 
  
      (docker-compose exec --user=laradock workspace bash)
      
  ./dock up - start all containers 
  
      (docker-compose up -d nginx mysql redis workspace )
      
  ./dock down - stop all containers 
  
      (docker-compose stop, docker stop $(docker ps -aq), docker rm $(docker ps -aq))
      
  ./dock kill - destroy all containers 
  
      (docker system prune -a)
      
  ./dock build service - build container by name 
  
      (docker-compose build $2)
      
```
