---
title: Contributing
type: index
weight: 6
---


Your contribution is more than welcome.

## I have a Question/Problem

If you have questions about how to use Laradock, please direct your questions to the discussion on [Gitter](https://gitter.im/Laradock/laradock). If you believe your question could help others, then consider opening an [Issue](https://github.com/laradock/laradock/issues) (it will be labeled as `Question`) And you can still seek help on Gitter for it.

## I found an Issue
If have an issue or you found a typo in the documentation, you can help us by
opnening an [Issue](https://github.com/laradock/laradock/issues). 

**Steps to do before opening an Issue:**

1. Before you submit your issue search the archive, maybe your question was already answered couple hours ago (search in the closed Issues as well).

2. Decide if the Issue belongs to this project or to [Docker](https://github.com/docker) itself! or even the tool you are using such as Nginx or MongoDB...

If your issue appears to be a bug, and hasn't been reported, then open a new issue.

*This Help us to maximize the effort we can spend fixing issues and adding new
features, by not reporting duplicate issues.*


## I want a Feature
You can request a new feature by submitting an [Issue](https://github.com/laradock/laradock/issues) (it will be labeled as `Feature Suggestion`). If you would like to implement a new feature then consider submitting a Pull Request yourself.





## I want to update the Documentation (Site)

Laradock uses [Hugo](https://gohugo.io/) as website generator tool, with the [Material Docs theme](http://themes.gohugo.io/theme/material-docs/). You might need to check their docs quickly.


1. Install [Hugo](https://gohugo.io/) on your machine (easy thing).
2. Open the `DOCUMENTATION/_settings/content` and search for the markdown file you want to edit (every folder represents a section in the menu).
3. Delete the `/docs` folder from the root.
4. When you finish editing, go to `DOCUMENTATION/_settings/` and run the `hugo` command to generate the HTML docs (inside new `/docs` folder).

### To Host the website locally
Go to `DOCUMENTATION/_settings` in your terminal and run `hugo serve` to host the website locally.

### Edit the sidebar
To add a new section to the sidebar or edit existing one, you need to edit this file `DOCUMENTATION/_settings/config.toml`.




## How to support new Software (Add new Container)

* Create folder with the software name.

* Add a `Dockerfile`, write your code there.

* You may add additional files in the software folder.

* Add the software to the `docker-compose.yml` file.

* Make sure you follow our commenting style.

* Add the software in the `Documentation`.

## Edit existing Software (Edit a Container)

* Open the software (container) folder.

* Edit the files you want to update.

* **Note:** If you want to edit the base image of the `Workspace` or the `php-fpm` Containers, 
you need to edit their Docker-files from their GitHub repositories. For more info read their Dockerfiles comment on the Laradock repository.

* Make sure to update the `Documentation` in case you made any changes.


## Pull Request

### 1. Before Submitting a Pull Request (PR)

Always Test everything and make sure its working:

- Pull the latest updates (or fork of you don’t have permission)
- Before editing anything:
    - Test building the container (docker-compose build --no-cache container-name) build with no cache first.
    - Test running the container with some other containers in real app and see of everything is working fine.
- Now edit the container (edit section by section and test rebuilding the container after every edited section)
    - Testing building the container (docker-compose build container-name) with no errors.
    - Test it in a real App if possible.


### 2. Submitting a PR
Consider the following guidelines:

* Search [GitHub](https://github.com/laradock/laradock/pulls) for an open or closed Pull Request that relates to your submission. You don't want to duplicate efforts.

* Make your changes in a new git branch:

     ```shell
     git checkout -b my-fix-branch master
     ```
* Commit your changes using a descriptive commit message.

* Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```

* In GitHub, send a pull request to `laradock:master`.
* If we suggest changes then:
  * Make the required updates.
  * Commit your changes to your branch (e.g. `my-fix-branch`).
  * Push the changes to your GitHub repository (this will update your Pull Request).

> If the PR gets too outdated we may ask you to rebase and force push to update the PR:

```shell
git rebase master -i
git push origin my-fix-branch -f
```

*WARNING. Squashing or reverting commits and forced push thereafter may remove GitHub comments on code that were previously made by you and others in your commits.*


### 3. After your PR is merged

After your pull request is merged, you can safely delete your branch and pull the changes from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-fix-branch
    ```

* Check out the master branch:

    ```shell
    git checkout master -f
    ```

* Delete the local branch:

    ```shell
    git branch -D my-fix-branch
    ```

* Update your master with the latest upstream version:

    ```shell
    git pull --ff upstream master
    ```





<br>
#### Happy Coding :)
