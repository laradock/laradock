---
title: Publishing on Github Pages
sidebar: mydoc_sidebar
permalink: mydoc_publishing_github_pages.html
summary: "You can publish your project on Github Pages, which is a free web hosting service provided by Github. All you need is to put your content into a Github repo branch called gh-pages and make this your default branch in your repo. With a Jekyll site, you just commit your entire project into the gh-pages branch and Github Pages will build the site for you."
folder: mydoc
---

## Set up your Github repo

1. Make sure you have Git installed. You can download and install [Git for Windows here](https://git-scm.com/download/win) and [Git for Mac here](https://git-scm.com/download/mac). If you're on a Mac, chances are you might already have git installed. You can check by opening up a terminal and typing `which git`.{{end}}
1. Go to [Github.com](http://github.com) and sign up for an account.
2. Click the **+** button in the upper-right corner and select **New repository**.
3. Name the repository something like **mydoctheme**.
4. Type a description..
5. Select the **Initialize this repository with a README** check box.
6. Add a license if desired.
7. Leave the other options at the defaults and click **Create repository**.
8. Click the **Settings** button.
9. Go to your repository's home page, and click the branch drop-down menu.
10. Create a new branch called **gh-pages**.  
11. Click **Settings** and change the default branch to **gh-pages**.
11. Go back to your repository's homepage. With the gh-pages branch selected, copy the **https clone url**:
12. Open a terminal, browse to a convenient location for your project, and type `git clone https://github.com/tomjohnson1492/myreponame.git`, replacing the `https://github.com/tomjohnson1492/myreponame.git` with your repository's https clone URL that you copied.
13. Move the jekyll theme files into this new folder that you just created in the previous step.
14. Open the \_config.yml file and add the following:

   ```
   url: tomjohnson1492.github.io
   baseurl: /myreponame
   ```

   Change the url to your github account name, and the baseurl to your repo name.

## Install Bundler

Bundler is a package manager for Ruby that will install all dependencies you might need to build your site locally. I recommend installing Bundler through homebrew. (Sorry, these instructions apply to Mac only.)

1. Install [homebrew](http://brew.sh/):

   ```
   /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
   ```
2. Install Bundler:

   ```
   gem install bundler
   ```


## Add the github pages gem

1. In terminal, browse to your Jekyll project directory.
2. Type `bundle init`. This creates a Gemfile and Gemfile.lock in your project.
3. Type `open gemfile`. This opens the gemfile in your default text editor.
4. Add the following in the gemfile (replacing the existing contents):

   ```
   source 'https://rubygems.org'
   gem 'github-pages'
   ```

5. Run `bundle install`.
14. Add the new jekyll files to git: `git add --all`.
15. Commit the files: `git commit -m "committing my jekyll theme"`.
16. Push the files up to your github repo: `git push`.

Github Pages will now automatically build your site. Wait a minute or two, and then visit tomjohnson1492.github.io/yourreponame, replacing this path with your github account and branch.

## Customize your URL

You can also customize your Github URL. More instructions on this later....

{% include links.html %}
