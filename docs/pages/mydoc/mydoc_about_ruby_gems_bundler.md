---
title: About Ruby, Gems, Bundler, and other prerequisites
tags: [getting_started, troubleshooting]
keywords:
summary: "Ruby is a programming language you must have on your computer in order to build Jekyll locally. Ruby has various gems (or plugins) that provide various functionality. Each Jekyll project usually requires certain gems."
sidebar: mydoc_sidebar
permalink: mydoc_about_ruby_gems_etc.html
folder: mydoc
---

## About Ruby

Jekyll runs on Ruby, a programming language. You have to have Ruby on your computer in order to run Ruby-based programs like Jekyll. Ruby is installed on the Mac by default, but you must add it to Windows.

## About Ruby Gems

Ruby has a number of plugins referred to as "gems." Just because you have Ruby doesn't mean you have all the necessary Ruby gems that your program needs to run. Gems provide additional functionality for Ruby programs. There are thousands of [Rubygems](https://rubygems.org/) available for you to use.

Some gems depend on other gems for functionality. For example, the Jekyll gem might depend on 20 other gems that must also be installed.

Each gem has a version associated with it, and not all gem versions are compatible with each other.

## Rubygem package managers

[Bundler](http://bundler.io/) is a gem package manager for Ruby, which means it goes out and gets all the gems you need for your Ruby programs. If you tell Bundler you need the [jekyll gem](https://rubygems.org/gems/jekyll), it will retrieve all the dependencies on the jekyll gem as well -- automatically.

Not only does Bundler retrieve the right gem dependencies, but it's smart enough to retrieve the right versions of each gem. For example, if you get the [github-pages](https://rubygems.org/gems/github-pages) gem, it will retrieve all of these other gems:

```
github-pages-health-check = 1.1.0
jekyll = 3.0.3
jekyll-coffeescript = 1.0.1
jekyll-feed = 0.4.0
jekyll-gist = 1.4.0
jekyll-github-metadata = 1.9.0
jekyll-mentions = 1.1.2
jekyll-paginate = 1.1.0
jekyll-redirect-from = 0.10.0
jekyll-sass-converter = 1.3.0
jekyll-seo-tag = 1.3.2
jekyll-sitemap = 0.10.0
jekyll-textile-converter = 0.1.0
jemoji = 0.6.2
kramdown = 1.10.0
liquid = 3.0.6
mercenary ~> 0.3
rdiscount = 2.1.8
redcarpet = 3.3.3
RedCloth = 4.2.9
rouge = 1.10.1
terminal-table ~> 1.
```

See how Bundler retrieved version 3.0.3 of the jekyll gem, even though (as of this writing) the latest version of the jekyll gem is 3.1.2? That's because github-pages is only compatible up to jekyll 3.0.3. Bundler handles all of this dependency and version compatibility for you.

 Trying to keep track of which gems and versions are appropriate for your project can be a nightmare. This is the problem Bundler solves. As explained on [Bundler.io](http://bundler.io/):

> Bundler provides a consistent environment for Ruby projects by tracking and installing the exact gems and versions that are needed.
>
> Bundler is an exit from dependency hell, and ensures that the gems you need are present in development, staging, and production. Starting work on a project is as simple as bundle install.

## Gemfiles

Bundler looks in a project's "Gemfile" (no file extension) to see which gems are required by the project. The Gemfile lists the source and then any gems, like this:

```
source "https://rubygems.org"

gem 'github-pages'
gem 'jekyll'
```

The source indicates the site where Bundler will retrieve the gems: [https://rubygems.org](https://rubygems.org).

The gems it retrieves are listed separately on each line.

Here no versions are specified. Sometimes gemfiles will specify the versions like this:

```
gem 'kramdown', '1.0'
```

This means Bundler should get version 1.0 of the kramdown gem.

To specify a subset of versions, the Gemfile looks like this:

```
gem 'jekyll', '~> 2.3'
```
The `~>` sign means greater than or equal to the *last digit before the last period in the number*.

Here it will get any gem equal to 2.3 but less than 3.0.

If it adds another digit, the scope is affected:

```
gem `jekyll`, `~>2.3.1'
```

This means to get any gem equal to 2.3.1 but less than 2.4.

If it looks like this:

```
gem 'jekyll', '~> 3.0', '>= 3.0.3'
```

This will get any Jekyll gem between versions 3.0 and up to 3.0.3.

See this [Stack Overflow post](http://stackoverflow.com/questions/5170547/what-does-tilde-greater-than-mean-in-ruby-gem-dependencies) for more details.

## Gemfile.lock

After Bundler retrieves and installs the gems, it makes a detailed list of all the gems and versions it has installed for your project. The snapshot of all gems + versions installed is stored in your Gemfile.lock file, which might look like this:

```
GEM
  remote: https://rubygems.org/
  specs:
    RedCloth (4.2.9)
    activesupport (4.2.5.1)
      i18n (~> 0.7)
      json (~> 1.7, >= 1.7.7)
      minitest (~> 5.1)
      thread_safe (~> 0.3, >= 0.3.4)
      tzinfo (~> 1.1)
    addressable (2.3.8)
    coffee-script (2.4.1)
      coffee-script-source
      execjs
    coffee-script-source (1.10.0)
    colorator (0.1)
    ethon (0.8.1)
      ffi (>= 1.3.0)
    execjs (2.6.0)
    faraday (0.9.2)
      multipart-post (>= 1.2, < 3)
    ffi (1.9.10)
    gemoji (2.1.0)
    github-pages (52)
      RedCloth (= 4.2.9)
      github-pages-health-check (= 1.0.1)
      jekyll (= 3.0.3)
      jekyll-coffeescript (= 1.0.1)
      jekyll-feed (= 0.4.0)
      jekyll-gist (= 1.4.0)
      jekyll-mentions (= 1.0.1)
      jekyll-paginate (= 1.1.0)
      jekyll-redirect-from (= 0.9.1)
      jekyll-sass-converter (= 1.3.0)
      jekyll-seo-tag (= 1.3.1)
      jekyll-sitemap (= 0.10.0)
      jekyll-textile-converter (= 0.1.0)
      jemoji (= 0.5.1)
      kramdown (= 1.9.0)
      liquid (= 3.0.6)
      mercenary (~> 0.3)
      rdiscount (= 2.1.8)
      redcarpet (= 3.3.3)
      rouge (= 1.10.1)
      terminal-table (~> 1.4)
    github-pages-health-check (1.0.1)
      addressable (~> 2.3)
      net-dns (~> 0.8)
      octokit (~> 4.0)
      public_suffix (~> 1.4)
      typhoeus (~> 0.7)
    html-pipeline (2.3.0)
      activesupport (>= 2, < 5)
      nokogiri (>= 1.4)
    i18n (0.7.0)
    jekyll (3.0.3)
      colorator (~> 0.1)
      jekyll-sass-converter (~> 1.0)
      jekyll-watch (~> 1.1)
      kramdown (~> 1.3)
      liquid (~> 3.0)
      mercenary (~> 0.3.3)
      rouge (~> 1.7)
      safe_yaml (~> 1.0)
    jekyll-coffeescript (1.0.1)
      coffee-script (~> 2.2)
    jekyll-feed (0.4.0)
    jekyll-gist (1.4.0)
      octokit (~> 4.2)
    jekyll-mentions (1.0.1)
      html-pipeline (~> 2.3)
      jekyll (~> 3.0)
    jekyll-paginate (1.1.0)
    jekyll-redirect-from (0.9.1)
      jekyll (>= 2.0)
    jekyll-sass-converter (1.3.0)
      sass (~> 3.2)
    jekyll-seo-tag (1.3.1)
      jekyll (~> 3.0)
    jekyll-sitemap (0.10.0)
    jekyll-textile-converter (0.1.0)
      RedCloth (~> 4.0)
    jekyll-watch (1.3.1)
      listen (~> 3.0)
    jemoji (0.5.1)
      gemoji (~> 2.0)
      html-pipeline (~> 2.2)
      jekyll (>= 2.0)
    json (1.8.3)
    kramdown (1.9.0)
    liquid (3.0.6)
    listen (3.0.6)
      rb-fsevent (>= 0.9.3)
      rb-inotify (>= 0.9.7)
    mercenary (0.3.5)
    mini_portile2 (2.0.0)
    minitest (5.8.4)
    multipart-post (2.0.0)
    net-dns (0.8.0)
    nokogiri (1.6.7.2)
      mini_portile2 (~> 2.0.0.rc2)
    octokit (4.2.0)
      sawyer (~> 0.6.0, >= 0.5.3)
    public_suffix (1.5.3)
    rb-fsevent (0.9.7)
    rb-inotify (0.9.7)
      ffi (>= 0.5.0)
    rdiscount (2.1.8)
    redcarpet (3.3.3)
    rouge (1.10.1)
    safe_yaml (1.0.4)
    sass (3.4.21)
    sawyer (0.6.0)
      addressable (~> 2.3.5)
      faraday (~> 0.8, < 0.10)
    terminal-table (1.5.2)
    thread_safe (0.3.5)
    typhoeus (0.8.0)
      ethon (>= 0.8.0)
    tzinfo (1.2.2)
      thread_safe (~> 0.1)

PLATFORMS
  ruby

DEPENDENCIES
  github-pages
  jekyll

BUNDLED WITH
   1.11.2
```

You can always delete the Gemlock file and run Bundle install again to get the latest versions. You can also run `bundle update`, which will ignore the Gemlock file to get the latest versions of each gem.

To learn more about Bundler, see [Bundler's Purpose and Rationale](http://bundler.io/rationale.html).

{% include links.html %}
