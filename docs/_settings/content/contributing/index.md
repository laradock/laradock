---
title: Contributing
type: index
weight: 6
---


Your contribution is more than welcome.

## Got a Question or Problem?

If you have questions about how to use LaraDock, please direct your questions to the discussion on [Gitter](https://gitter.im/LaraDock/laradock). If you believe your question could help others, then consider opening an [Issue](https://github.com/laradock/laradock/issues) (it will be labeled as Question).

## Found an Issue?
If you find a bug in the source code or a mistake in the documentation, you can help us by
submitting an [Issue](https://github.com/laradock/laradock/issues). Even better you can submit a Pull Request with a fix.

## Want a Feature?
You can request a new feature by submitting an [Issue](https://github.com/laradock/laradock/issues) (it will be labeled as Feature Suggestion). If you would like to implement a new feature then consider submitting a Pull Request.


## Edit the documentation

Laradock uses [Hugo](https://gohugo.io/) as website generator tool, with the [Material Docs theme](http://themes.gohugo.io/theme/material-docs/). You might need to check their docs quickly.


1. Install [Hugo](https://gohugo.io/) on your machine.
2. Clone laradock.
3. Go to `/docs`.
4. Delete everything except the `_settings` folder & the `CNAME` file.
5. Open `docs/_settings` from your terminal and run `hugo serve` to host the website locally.
6. Open the `docs/_settings/content` and search for the folder of the section you want to edit.
7. In each secion there's an `index.md` file, that's the file you need to edit.
8. To edit the sidebar (in case you are adding new section) go to `docs/_settings/config.toml` and add the section there.
9. After done editing, run the this command `hugo` to generate the updated site inside the `docs` folder.
10. Go back to the project root directory, commit and push..





## Coding Guidelines

## Support new Software

* Create folder with the software name.

* Add a `Dockerfile`, write your code there.

* You may add additional files in the software folder.

* Add the software to the `docker-compose.yml` file.

* Make sure you follow our commenting style.

* Add the software in the `Readme`.

## Edit existing Software

* Open the software (container) folder.

* Edit the files you want to update.

* **Note:** If you want to edit the base image of the `Workspace` or the `php-fpm` Containers, 
you need to edit their Docker-files from their GitHub repositories. For more info read their Dockerfiles comment on the LaraDock repository.

* Make sure to update the `Readme` in case you made any changes.

## Issue/PR Submission Guidelines

## Submitting an Issue
Before you submit your issue search the archive, maybe your question was already answered.

If your issue appears to be a bug, and hasn't been reported, open a new issue.
Help us to maximize the effort we can spend fixing issues and adding new
features, by not reporting duplicate issues.


## Before Submitting a Pull Request (PR)

Always Test everything and make sure its working:

- Pull the latest updates (or fork of you don’t have permission)
- Before editing anything:
    - Test building the container (docker-compose build --no-cache container-name) build with no cache first.
    - Test running the container with some other containers in real app and see of everything is working fine.
- Now edit the container (edit section by section and test rebuilding the container after every edited section)
    - Testing building the container (docker-compose build container-name) with no errors.
    - Test it in real App.


## Submitting a PR
Consider the following guidelines:

* Search [GitHub](https://github.com/laradock/laradock/pulls) for an open or closed Pull Request that relates to your submission. You don't want to duplicate effort.

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






## After your PR is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

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
## Happy Coding :)
