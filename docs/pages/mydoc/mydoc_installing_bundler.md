---
title: Installing Bundler
published: false
sidebar: mydoc_sidebar
permalink: mydoc_installing_bundler.html
folder: mydoc
---

If you get permissions errors when trying to install Bundler, follow these steps:

if you get a permissions error when trying to install bundler, then do this:
Install Brew:
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
Install rbenv, a Ruby Version Mgmt Tool:
brew install rbenv

Initialize rbenv:
rbenv init

Log out of terminal or iTerm, and then back in
Install bundler:
gem install bundler
Now you can use Bundler to get any project dependencies you need. Usually you would add a gemfile to your project and then use Bundler to install the gems and all the dependencies you need.
Create a gemfile:
bundle init

Open the gemfile:
open gemfile

Paste in the gems you want bundler to get for you:
source 'https://rubygems.org'
gem 'github-pages'
gem 'pygments.rb'
gem 'redcarpet'
gem 'jekyll'

Run Bundler:
bundle install
Execute Bundler against your project:
bundle exec jekyll serve
(Instead of jekyll serve, run one of the other build commands.)

{% include links.html %}
