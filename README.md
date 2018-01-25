# Setup

Clone this repository with the following command:

`git clone --recursive --jobs 8 https://github.com/kironuniversity/kirondev.git`

Afterwards execute:
`cd kirondev`
`script/setup` 

to setup the environment for the first time.

# Usage

The script structure is mostly taken from GitHubs [scripts to rule them all](https://github.com/github/scripts-to-rule-them-all).

### Basics

You should use `script/server`  to bring up the project instead of using docker-compose directly. To stop the environement you can use `docker-compose stop` or `script/stop`.

To update all projects to the latest master you should use `script/update`, it will also update the environment, the database and the php dependencies. If you just want to get your database and dependencies up to date use `script/boostrap`. If you need to load and environment update run `script/setenv`, but be careful this will overwrite your .env in the kirondev folder.

If there are bigger changes affecting docker images use `script/rebuild` to update the whole environment including images and volumes. **Be careful changes might get lost here**.

### Shell access to service containers and pods

For convenient shell access to the containers you can use:

`script/console service [environment]`

where **service** is the docker-compose or kubernetes service you want to connect to including some shortcuts like db, campus or graphql. If you don't provide any service it will connect you to the workspace container. If you don't use the script make sure to use the laradock user to connect to the workspace container and sh instead of bash for alpine based containers.

**environment** is local by default, which connects to the docker-compose containers, but you may specify uat, stg or prod to access the kubernetes clusters if kubectl is configured already. In case there are several pods for the given service, it will connect to the first one returned by `kubectl get pods`.


### Getting logs

For convenient shell access to the logs you can use:

`script/logs service [environment]`

**service** is the docker-compose or kubernetes service you want to get the logs from.

**environment** is local by default, but you may specify uat, stg or prod to access the kube logs if kubectl is configured already. In case there are several pods for the given service, it will iterate over them and show the logs for all.

**If you call the script without any arguments it will list available services and environments.**


## DevOps

# General Information
A huge part of this dev environment is based on [laradock](http://laradock.io/) ([GitHub](https://github.com/laradock/laradock)).
The actual code and some containers are loaded via submodules. Thats why you have to use the --recursive option on git clone.

# Managing Domains / Sites

###  1. Create new SSL certificate

You will need to generate a valid ssl certifictae, there is a script which does this for you in the scripts folder:

`script/generate_cert newdomain`

It will create the according key and cert file in nginx/certs.

### 2. Nginx config

Copy one of the existing nginx files in `nginx/config` and name it `newdomain.conf`. Use `campus-frontend.conf` as source  for a simple proxy setup and `api.conf` for an php app.


### 3. Add to init.sh

Add your new domain to the array in `script/setup.sh`.

# Links
Forks: [How to update a fork / laradock](https://www.atlassian.com/git/articles/git-forks-and-upstreams)

Submodules:

- [Great introduction to submodules](http://www.vogella.com/tutorials/GitSubmodules/article.html)
- [Working with submodules by GitHub](https://github.com/blog/2104-working-with-submodules)
- [More detailed explanation of submoduleson the git page](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Stackoverflow: let submodule track latest chages](https://stackoverflow.com/questions/9189575/git-submodule-tracking-latest)
- [Stackoverflow: Submodules HEAD detached from master](https://stackoverflow.com/questions/18770545/why-is-my-git-submodule-head-detached-from-master)

SSL setup: [Mostly taken from here](https://gist.github.com/jed/6147872)

Script file structure form GitHub: [https://github.com/github/scripts-to-rule-them-all](https://github.com/github/scripts-to-rule-them-all)

 
