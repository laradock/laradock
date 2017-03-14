#### Install Docker
```
Login Digital Ocean
Add Droplet
1 Click Install docker
Choose Droplet
reset ROOT password
check email
```

#### SSH to your Server

```
ssh root@ipaddress
```
you will be prompt of that password.
type the password you receive in your email

then it will ask to you to change a new password
just change it to the custom root password you want

After SSH
you can check that docker command is working by typing 

```
$root@midascode:~# docker
```

#### Set Up Your Laravel Project

```
$root@midascode:~# apt-get install git
$root@midascode:~# git clone https://github.com/laravel/laravel
$root@midascode:~# cd laravel
$root@midascode:~/laravel/ git submodule add https://github.com/LaraDock/laradock.git
$root@midascode:~/laravel/ cd laradock
```

#### Install docker-compose command

```
$root@midascode:~/laravel/laradock# curl -L https://github.com/docker/compose/releases/download/1.8.0/run.sh > /usr/local/bin/docker-compose
$root@midascode:~/chmod +x /usr/local/bin/docker-compose
```

#### Create Your LaraDock Containers

```
$root@midascode:~/laravel/laradock# docker-compose up -d nginx mysql
```

#### Go to Your Workspace

```
docker-compose exec workspace bash
```

#### Install laravel Dependencies, Add .env , generate Key and give proper permission certain folder

```
$ root@0e77851d27d3:/var/www# composer install
$ root@0e77851d27d3:/var/www# cp .env.example .env
$ root@0e77851d27d3:/var/www# php artisan key:generate
$ root@0e77851d27d3:/var/www# exit
$root@midascode:~/laravel/laradock# cd ..
$root@midascode:~/laravel# sudo chmod -R 777 storage bootstrap/cache
```

you can then view your laravel site at your ipaddress
for example
```
192.168.1.1 
```

You will see there Laravel Default Welcome Page

but if you need to view on your custom domain name
which you would.

#### Using Your Own Domain Name
login to your DNS provider
Godaddy, Namecheap what ever...
And Point the Custom Domain Name Server to

```
ns1.digitalocean.com
ns2.digitalocean.com
ns3.digitalocean.com
```
In Your Digital Ocean Account go to 
```
https://cloud.digitalocean.com/networking/domains
```
add your domain name and choose the server ip you provision earlier

#### Serve Site With NGINX (HTTP ONLY)
Go back to command line
```
$root@midascode:~/laravel/laradock# cd nginx
$root@midascode:~/laravel/laradock/nginx# vim laravel.conf
```
remove default_server
```

    listen 80 default_server;
    listen [::]:80 default_server ipv6only=on;

```
 and add server_name (your custom domain)
```
    listen 80;
    listen [::]:80 ipv6only=on;
    server_name yourdomain.com;
```

#### Rebuild Your Nginx
```
$root@midascode:~/laravel/laradock/nginx# docker-compose down
$root@midascode:~/laravel/laradock/nginx# docker-compose build nginx
```

#### Re Run Your Containers MYSQL and NGINX
```
$root@midascode:~/laravel/laradock/nginx# docker-compose up -d nginx mysql
```

###### View Your Site with HTTP ONLY (http://yourdomain.com)

#### Run Site on SSL with Let's Encrypt Certificate

###### Note: You need to Use Caddy here Instead of Nginx

###### To go Caddy Folders and Edit CaddyFile

```
$root@midascode:~/laravel/laradock# cd caddy
$root@midascode:~/laravel/laradock/caddy# vim Caddyfile
```

Remove 0.0.0.0:80 

```
0.0.0.0:80
root /var/www/public
``` 
and replace with your https://yourdomain.com

```
https://yourdomain.com
root /var/www/public
```
uncomment tls 

```
#tls self-signed
```
and replace self-signed with your email address

```
tls midascodebreaker@gmai.com
```
This is needed Prior to Creating Let's Encypt 

####  Run Your  Caddy Container without the -d flag and Generate SSL with Let's Encrypt

```
$root@midascode:~/laravel/laradock/caddy# docker-compose up  caddy
```

you will be prompt here to enter your email... you may enter it or not
```
Attaching to laradock_mysql_1, laradock_caddy_1
caddy_1               | Activating privacy features...
caddy_1               | Your sites will be served over HTTPS automatically using Let's Encrypt.
caddy_1               | By continuing, you agree to the Let's Encrypt Subscriber Agreement at:
caddy_1               |   https://letsencrypt.org/documents/LE-SA-v1.0.1-July-27-2015.pdf
caddy_1               | Activating privacy features... done.
caddy_1               | https://yourdomain.com
caddy_1               | http://yourdomain.com
```

After it finish Press Ctrl + C to exit ...

#### Stop All Containers and ReRun Caddy and Other Containers on Background

```
$root@midascode:~/laravel/laradock/caddy# docker-compose down
$root@midascode:~/laravel/laradock/caddy# docker-compose up -d mysql caddy
```
View your Site in the Browser Securely Using HTTPS (https://yourdomain.com)

##### Note that Certificate will be Automatically Renew By Caddy

>References: 
>
- [https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)
- [https://www.digitalocean.com/products/one-click-apps/docker/](https://www.digitalocean.com/products/one-click-apps/docker/)
- [https://docs.docker.com/engine/installation/linux/ubuntulinux/](https://docs.docker.com/engine/installation/linux/ubuntulinux/)
- [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)
- [https://caddyserver.com/docs/automatic-https](https://caddyserver.com/docs/automatic-https)
- [https://caddyserver.com/docs/tls](https://caddyserver.com/docs/tls)
- [https://caddyserver.com/docs/caddyfile](https://caddyserver.com/docs/caddyfile)











