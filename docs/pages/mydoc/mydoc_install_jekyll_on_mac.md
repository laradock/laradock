---
title: Install Jekyll on Mac
tags: [getting_started, troubleshooting]
keywords:
summary: "Installation of Jekyll on Mac is usually less problematic than on Windows. However, you may run into permissions issues with Ruby that you must overcome. You should also use Bundler to be sure that you have all the required gems and other utilities on your computer to make the project run. "
sidebar: mydoc_sidebar
permalink: mydoc_install_jekyll_on_mac.html
folder: mydoc
---

## Ruby and RubyGems

Ruby and [RubyGems](https://rubygems.org/pages/download) are usually installed by default on Macs. Open your Terminal and type `which ruby` and  `which gem` to confirm that you have Ruby and Rubygems. You should get a response indicating the location of Ruby and Rubygems.

If you get responses that look like this:

```
/usr/local/bin/ruby
```

and

```
/usr/local/bin/gem
```

Great! Skip down to the [Bundler](#bundler) section.

However, if your location is something like `/Users/MacBookPro/.rvm/rubies/ruby-2.2.1/bin/gem`, which points to your system location of Rubygems, you will likely run into permissions errors when trying to get a gem. A sample permissions error (triggered when you try to install the jekyll gem such as `gem install jekyll`) might look like this for Rubygems:

```
 >ERROR:  While executing gem ... (Gem::FilePermissionError)
  You don't have write permissions for the /Library/Ruby/Gems/2.0.0 directory.
```  

Instead of changing the write permissions on your operating system's version of Ruby and Rubygems (which could pose security issues), you can install another instance of Ruby (one that is writable) to get around this.

## Install Homebrew

Homebrew is a package manager for the Mac, and you can use it to install an alternative instance of Ruby code. To install Homebrew, run this command:

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

If you already had Homebrew installed on your computer, be sure to update it:

```
brew update
```

## Install Ruby through Homebrew

Now use Homebrew to install Ruby:

```
brew install ruby
```

Log out of terminal, and then then log back in.

When you type `which ruby` and `which gem`, you should get responses like this:

```
/usr/local/bin/ruby
```

And this:

```
/usr/local/bin/gem
```

Now Ruby and Rubygems are installed under your username, so these directories are writeable.

Note that if you don't see these paths, try restarting your computer or try installing rbenv, which is a Ruby version management tool. If you still have issues getting a writeable version of Ruby, you need to resolve them before installing Bundler.

<h2 id="bundler">Install the Jekyll gem</h2>

At this point you should have a writeable version of Ruby and Rubygem on your machine.

Now use `gem` to install Jekyll:

```
gem install jekyll
```

You can now use Jekyll to create new Jekyll sites following the quick-start instructions on [Jekyllrb.com](http://jekyllrb.com).

## Installing dependencies through Bundler

Some Jekyll themes will require certain Ruby gem dependencies. These dependencies are stored in something called a Gemfile, which is packaged with the Jekyll theme. You can install these dependencies through Bundler. (Although you don't need to install Bundler for this Documentation theme, it's a good idea to do so.)

[Bundler](http://bundler.io/) is a package manager for RubyGems. You can use it to get all the gems (or Ruby plugins) that you need for your Jekyll project.

You install Bundler by using the gem command with RubyGems:

```
gem install bundler
```

If you're prompted to switch to superuser mode (`sudo`) to get the correct permissions to install Bundler in that directory, avoid doing this. All other applications that need to use Bundler will likely not have the needed permissions to run.

Bundler goes out and retreives all the gems that are specified in a Jekyll project's Gemfile. If you have a gem that depends on other gems to work, Bundler will go out and retrieve all of the dependencies as well. (To learn more about Bundler, see [About Ruby Gems][mydoc_about_ruby_gems_etc].

The vanilla Jekyll site you create through `jekyll new my-awesome-site` doesn't have a Gemfile, but many other themes (including the Documentation theme for Jekyll) do have a Gemfile.

## Serve the Jekyll Documentation theme

1. Browse to the directory where you downloaded the Documentation theme for Jekyll.
2. Type `jekyll serve`
3. Go to the preview address in the browser. (Make sure you include the `/` at the end.)

## Resolve "No Github API authentication" errors {#githuberror}

After making an edit, Jekyll auto-rebuilds the site. If you have the Gemfile in the theme with the github-pages gem, you may see the following error:

```
GitHub Metadata: No GitHub API authentication could be found. Some fields may be missing or have incorrect data.
```

If you see this error, you will need to take some additional steps to resolve it. (Note that this error only appears if you have the github-pages gem in your gemfile.) The resolution involves adding a Github token and a cert file.

{% include note.html content="These instructions apply to Mac OS X, but they're highly similar to Windows. These instructions are adapted from a post on [Knight Codes](http://knightcodes.com/miscellaneous/2016/09/13/fix-github-metadata-error.html). If you're on Windows, see the Knight Codes post for details instead of following along below." %}

To resolve the "No Github API authentication" error:

1.  Follow Github's instructions to [create a personal access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/).
2.  Open the **.bash_profile** file in your user directory:

    ```
    open ~/.bash_profile
    ```

    The file will open in your default terminal editor. If you don't have a .bash_profile file, you can just create a file with this name. Note that files that begin with `.` are hidden, so if you're looking in your user directory for the file, use `ls -a` to see hidden files.

3.  In your **.bash_profile** file, reference your token as a system variable like this:

    ```
    export JEKYLL_GITHUB_TOKEN=abc123abc123abc123abc123abc123abc123abc123abc123
    ```

    Replace `abc123...` with your own token that you generated in step 1.

4.  Go to **[https://curl.haxx.se/ca/cacert.pem][https://curl.haxx.se/ca/cacert.pem]. Right-click the page, select **Save as**, and save the file on your computer (save it somewhere safe, where you won't delete it). Name the file **cacert**.
5.  Open your **.bash_profile** file again and add this line, replacing `Users/johndoe/projects/` with the path to your cacert.pem file:

    ```
    export SSL_CERT_FILE=/Users/johndoe/projects/cacert.pem
    ```

6.  Close and restart your terminal.

Browse to your jekyll project and run `bundle exec jekyll serve`. Make an edit to a file and observe that no Github API errors appear when Jekyll rebuilds the project.

{% include links.html %}

