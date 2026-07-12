# Contributions

Source: https://laradock.io/docs/contributing

Welcome, Laradock is entirely community-driven, and that means it runs on people like you. Maybe you found a bug, want a new container supported, or you're ready to submit your first pull request, whatever brought you here, this page walks through how to do it well. Pick the section below that matches what you're trying to do.

![Docker Image](https://laradock.io/img/laradock/laradock-abstract-thin.jpg)

<div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1.5rem 0'}}>
  <a className="button button--primary button--lg" href="https://github.com/laradock/laradock/issues/new">Report a Bug</a>
  <a className="button button--secondary button--lg" href="https://github.com/laradock/laradock/issues/new">Request a Feature</a>
  <a className="button button--secondary button--lg" href="https://github.com/laradock/laradock/pulls">Open a Pull Request</a>
  <a className="button button--secondary button--lg" href="https://gitpod.io/#https://github.com/laradock/laradock">Open in Gitpod</a>
</div>

## Have a Question

Have a question, found a problem, or need something? **mahmoud@zalt.me**

Or open an [Issue](https://github.com/laradock/laradock/issues) on GitHub (it will be labeled as `Question`) so others can benefit from the answer.



## Found an Issue

If you have an issue or you found a typo in the documentation, you can help us by
opening an [Issue](https://github.com/laradock/laradock/issues).

**Steps to do before opening an Issue:**

1. Before you submit your issue search the archive, maybe your question was already answered couple hours ago (search in the closed Issues as well).

2. Decide if the Issue belongs to this project or to [Docker](https://github.com/docker) itself! or even the tool you are using such as Nginx or MongoDB...

If your issue appears to be a bug, and hasn't been reported, then open a new issue.

*This helps us maximize the effort we can spend fixing issues and adding new
features, by not reporting duplicate issues.*



## Want a Feature
You can request a new feature by submitting an [Issue](https://github.com/laradock/laradock/issues) (it will be labeled as `Feature Suggestion`). If you would like to implement a new feature then consider submitting a Pull Request yourself.



## Update the Documentation (Site)

Laradock uses [Docusaurus](https://docusaurus.io/) as its documentation site generator.

Navigate to the `DOCUMENTATION/docs` directory to locate and edit the Markdown files for each section of the documentation.

:::note
Each folder under `docs` is a sidebar section, ordered by the `sidebar_position` field in each file's frontmatter. The site is auto-generated and deployed to the `gh-pages` branch by GitHub Actions whenever changes are pushed to `master`.
:::

### Host the Documentation Locally

1. Make your changes in the `DOCUMENTATION/docs` directory.
2. Navigate to `DOCUMENTATION/`.
3. Run the following command to start a local Docusaurus server:
   ```
    npm run start
   ```
4. Visit [http://localhost:3000/](http://localhost:3000/) to view the documentation site locally.

This setup will allow you to preview your changes in real time.



## Support new Software (Add new Container)

* Fork the repo and clone the code.

* Create folder as the software name (example: `mysql` - `nginx`).

* Add your `Dockerfile` in the folder "you may add additional files as well".

* Add the container definition as `compose.yml` inside your folder, and register it with an `include` entry in the root `docker-compose.yml`.

* Make sure you follow the same code/comments style.

* Add the environment variables, pre-filled with working defaults, as `defaults.env` inside your folder (only truly shared variables belong in `.env.example`).

* **MOST IMPORTANTLY** update the `Documentation`, add as much information.

* Submit a Pull Request, to the `master` branch.



## Edit supported Software (Edit a Container)

* Fork the repo and clone the code.

* Open the software (container) folder (example: `mysql` - `nginx`).

* Edit the files.

* Make sure to update the `Documentation` in case you made any changes.

* Submit a Pull Request, to the `master` branch.




## Edit Base Image

* Open any dockerfile, copy the base image name (example: `FROM phusion/baseimage:latest`).

* Search for the image in the [Docker Hub](https://hub.docker.com/search/) and find the source..

*Most of the images in Laradock are official images; these projects live in other repositories and are maintained by other organizations.*

:::note
Laradock has two base images, mainly made to speed up the build time on your machine. Each lives in its own repository:

* [`laradock/workspace`](https://github.com/laradock/workspace), the all-in-one dev shell.
* [`laradock/php-fpm`](https://github.com/laradock/php-fpm), the PHP runtime.

See each repo's `AGENTS.md` for how it builds.
:::

* Find the dockerfiles, edit them and submit a Pull Request.

* When updating a Laradock base image (`Workspace` or `php-fpm`), ask a project maintainer "Admin" to build a new image after your PR is merged.

:::note
After the base image is updated, every dockerfile that uses that image, needs to update his base image tag to get the updated code.
:::







## Submit Pull Request Instructions

### 1. Before Submitting a Pull Request (PR)

Always Test everything and make sure its working:

- Pull the latest updates (or fork if you don’t have permission)
- Before editing anything:
    - Test building the container (docker compose build --no-cache container-name) build with no cache first.
    - Test running the container with some other containers in a real app and see if everything is working fine.
- Now edit the container (edit section by section and test rebuilding the container after every edited section)
    - Testing building the container (docker compose build container-name) with no errors.
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

:::note
If the PR gets too outdated we may ask you to rebase and force push to update the PR:

```shell
git rebase master -i
git push origin my-fix-branch -f
```
:::

:::warning
Squashing or reverting commits and forced push thereafter may remove GitHub comments on code that were previously made by you and others in your commits.
:::


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





## Happy Coding :)
