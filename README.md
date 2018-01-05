# Setup

Clone this repository with the following command:

`git clone --recursive https://github.com/kironuniversity/kirondev.git`

Afterwards execute:

`sh init.sh`

to bring up the environment for the first time.

# Usage

### Basics

You should use `sh start.sh`  to bring up the project instead of using docker-compose directly. It will run necesary database migrations if needed and overwrite and update the base environment file. To stop the environement you can use `docker-compose stop` or `sh stop.sh`.

### Lastpass 

See `scripts/load-lpass.sh` for an example usage of the lastpass-cli.

# General Information
A huge part of this dev environment is based on [laradock](http://laradock.io/) ([GitHub](https://github.com/laradock/laradock)).
The actual code and some containers are loaded via submodules. Thats why you have to use the --recursive option on git clone.

# Managing Domains / Sites

###  1. Create new SSL certificate

You will need to generate a valid ssl certifictae, there is a script which does this for you in the scripts folder:

`sh scripts/generate_cert.sh newdomain`

It will create the according key and cert file in nginx/certs.

### 2. Nginx config

Copy one of the existing nginx files in `nginx/config` and name it `newdomain.conf`. Use `campus-frontend.conf` as source  for a simple proxy setup and `api.conf` for an php app.


### 3. Add to init.sh

Add your new domain to the array in `init.sh`.

# Links
Forks: [How to update a fork / laradock](https://www.atlassian.com/git/articles/git-forks-and-upstreams)

Submodules:

- [Great introduction to submodules](http://www.vogella.com/tutorials/GitSubmodules/article.html)
- [Working with submodules by GitHub](https://github.com/blog/2104-working-with-submodules)
- [More detailed explanation of submoduleson the git page](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Stackoverflow: let submodule track latest chages](https://stackoverflow.com/questions/9189575/git-submodule-tracking-latest)
- [Stackoverflow: Submodules HEAD detached from master](https://stackoverflow.com/questions/18770545/why-is-my-git-submodule-head-detached-from-master)

SSL setup: 

 - [Complete explanation](https://gist.github.com/jed/6147872)