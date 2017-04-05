#### Install Docker

- Visit [DigitalOcean](https://cloud.digitalocean.com/login) and login.
- Click the `Create Droplet` button.
- Open the `One-click apps` tab.
- Select Docker with your preferred version.
- Continue creating the droplet as you normally would.
- If needed, check your e-mail for the droplet root password.

#### SSH to your Server

Find the IP address of the droplet in the DigitalOcean interface. Use it to connect to the server.

```
ssh root@ipaddress
```

You may be prompted for a password. Type the one you found within your e-mailbox. It'll then ask you to change the password.

You can now check if Docker is available:

```
$root@server:~# docker
```

#### Set Up Your Laravel Project

```
$root@server:~# apt-get install git
$root@server:~# git clone https://github.com/laravel/laravel
$root@server:~# cd laravel
$root@server:~/laravel/ git submodule add https://github.com/LaraDock/laradock.git
$root@server:~/laravel/ cd laradock
```

#### Install docker-compose command

```
$root@server:~/laravel/laradock# curl -L https://github.com/docker/compose/releases/download/1.8.0/run.sh > /usr/local/bin/docker-compose
$root@server:~/chmod +x /usr/local/bin/docker-compose
```

#### Create Your LaraDock Containers

```
$root@server:~/laravel/laradock# docker-compose up -d nginx mysql
```

Note that more containers are available, find them in the [docs](http://laradock.io/introduction/#supported-software-containers) or the `docker-compose.yml` file.

#### Go to Your Workspace

```
docker-compose exec workspace bash
```

#### Install and configure Laravel

Let's install Laravel's dependencies, add the `.env` file, generate the key and give proper permissions to the cache folder.

```
$ root@workspace:/var/www# composer install
$ root@workspace:/var/www# cp .env.example .env
$ root@workspace:/var/www# php artisan key:generate
$ root@workspace:/var/www# exit
$root@server:~/laravel/laradock# cd ..
$root@server:~/laravel# sudo chmod -R 777 storage bootstrap/cache
```

You can then view your Laravel site by visiting the IP address of your server in your browser. For example: 

```
http://192.168.1.1
```

It should show you the Laravel default welcome page.

However, we want it to show up using your custom domain name, as well.

#### Using Your Own Domain Name

Login to your DNS provider, such as Godaddy, Namecheap.

Point the Custom Domain Name Server to:

```
ns1.digitalocean.com
ns2.digitalocean.com
ns3.digitalocean.com
```

Within DigitalOcean, you'll need to change some settings, too.

Visit: https://cloud.digitalocean.com/networking/domains

Add your domain name and choose the server IP you'd provision earlier.

#### Serving Site With NGINX (HTTP ONLY)

Go back to command line.

```
$root@server:~/laravel/laradock# cd nginx
$root@server:~/laravel/laradock/nginx# vim laravel.conf
```

Remove `default_server`

```
    listen 80 default_server;
    listen [::]:80 default_server ipv6only=on;
```

And add `server_name` (your custom domain)

```
    listen 80;
    listen [::]:80 ipv6only=on;
    server_name yourdomain.com;
```

#### Rebuild Your Nginx

```
$root@server:~/laravel/laradock/nginx# docker-compose down
$root@server:~/laravel/laradock/nginx# docker-compose build nginx
```

#### Re Run Your Containers MYSQL and NGINX

```
$root@server:~/laravel/laradock/nginx# docker-compose up -d nginx mysql
```

**View Your Site with HTTP ONLY (http://yourdomain.com)**

#### Run Site on SSL with Let's Encrypt Certificate

**Note: You need to Use Caddy here Instead of Nginx**

To go Caddy Folders and Edit CaddyFile

```
$root@server:~/laravel/laradock# cd caddy
$root@server:~/laravel/laradock/caddy# vim Caddyfile
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
tls serverbreaker@gmai.com
```

This is needed Prior to Creating Let's Encypt 

#### Run Your Caddy Container without the -d flag and Generate SSL with Let's Encrypt

```
$root@server:~/laravel/laradock/caddy# docker-compose up  caddy
```

You'll be prompt here to enter your email... you may enter it or not

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

After it finishes, press `Ctrl` + `C` to exit.

#### Stop All Containers and ReRun Caddy and Other Containers on Background

```
$root@server:~/laravel/laradock/caddy# docker-compose down
$root@server:~/laravel/laradock/caddy# docker-compose up -d mysql caddy
```

View your Site in the Browser Securely Using HTTPS (https://yourdomain.com)

**Note that Certificate will be Automatically Renew By Caddy**

>References: 
>
- [https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)
- [https://www.digitalocean.com/products/one-click-apps/docker/](https://www.digitalocean.com/products/one-click-apps/docker/)
- [https://docs.docker.com/engine/installation/linux/ubuntulinux/](https://docs.docker.com/engine/installation/linux/ubuntulinux/)
- [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)
- [https://caddyserver.com/docs/automatic-https](https://caddyserver.com/docs/automatic-https)
- [https://caddyserver.com/docs/tls](https://caddyserver.com/docs/tls)
- [https://caddyserver.com/docs/caddyfile](https://caddyserver.com/docs/caddyfile)
