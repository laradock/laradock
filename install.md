# Laradock using the lepp for Multiple Projects

This Docker Compose .env.example stack consists the following:

* PHP 8.0
* Nginx
* Redis
* PostgreSQL
* Adminer

extensions:
* imap
* rabbitmq

The current setup is created for laravel 8/9

##  Installation

* Clone this repository on your local computer
* In the same folder clone the the other laravel projects, your folder structure should look like this:
  - laradock
  - project-1
  - project-2

* Run
```bash 
cp sample.env .env`
```
* cp nginx/sites/laravel.conf.example to nginx/sites/*.conf for your laravel projects
* in .env change
`DATA_PATH_HOST=~/.laradock/data` to `DATA_PATH_HOST=~/.laradock/{your-project-name}` (we change the name to separate this from a future laradock project we might use. name it how you want)
* Run 
```bash 
docker-compose up -d nginx postgres redis rabbitmq workspace adminer
```
* Run
```bash 
docker-compose exec workspace bash
```
* cd into.your.laravel.projects
* Run (in all projects)
```bash
composer install
```
* Run (in all projects)
```bash
php artisan migrate:fresh --seed`
```
