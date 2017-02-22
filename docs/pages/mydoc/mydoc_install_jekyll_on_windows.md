---
title: Install Jekyll on Windows
permalink: mydoc_install_jekyll_on_windows.html
keywords: jekyll on windows, pc, ruby, ruby dev kit
sidebar: mydoc_sidebar
folder: mydoc
---

{% include tip.html content="For a better terminal emulator on Windows, use [Git Bash](https://git-for-windows.github.io/). Git Bash gives you Linux-like control on Windows." %}

## Install Ruby

First you must install Ruby because Jekyll is a Ruby-based program and needs Ruby to run.

1. Go to [RubyInstaller for Windows](http://rubyinstaller.org/downloads/).
2. Under **RubyInstallers**, download and install one of the Ruby installers (usually one of the first two options).
3. Double-click the downloaded file and proceed through the wizard to install it.

## Install Ruby Development Kit

Some extensions Jekyll uses require you to natively build the code using the Ruby Development Kit.

1. Go to [RubyInstaller for Windows](http://rubyinstaller.org/downloads/).
2. Under the **Development Kit** section near the bottom, download one of the **For use with Ruby 2.0 and above...** options (either the 32-bit or 64-bit version).
3. Move your downloaded file onto your **C** drive in a folder called something like **RubyDevKit**.
4. Extract the compressed folder's contents into the folder.
5. Browse to the **RubyDevKit** location on your C drive using your Command Line Prompt.

   To see the contents of your current directory, type <code>dir</code>. To move into a directory, type <code>cd foldername</code>, where "foldername" is the name of the folder you want to enter. To move up a directory, type <code>cd ../</code> one or more times depending on how many levels you want to move up. To move into your user's directory, type <code>/users</code>. The <code>/</code> at the beginning of the path automatically starts you at the root.

6. Type `ruby dk.rb init`
7. Type `ruby dk.rb install`

If you get stuck, see the [official instructions for installing Ruby Dev Kit](https://github.com/oneclick/rubyinstaller/wiki/Development-Kit).

<h2 id="bundler">Install the Jekyll gem</h2>

At this point you should have Ruby and Rubygem on your machine.

Now use `gem` to install Jekyll:

```
gem install jekyll
```

You can now use Jekyll to create new Jekyll sites following the quick-start instructions on [Jekyllrb.com](http://jekyllrb.com).

## Installing dependencies through Bundler

Some Jekyll themes will require certain Ruby gem dependencies. These dependencies are stored in something called a Gemfile, which is packaged with the Jekyll theme. You can install these dependencies through Bundler. (Although you don't need to install Bundler for this Documentation theme, it's a good idea to do so.)

[Bundler](http://bundler.io/) is a package manager for RubyGems. You can use it to get all the gems (or Ruby plugins) that you need for your Jekyll project.

You install Bundler by using the gem command with RubyGems:


## Install Bundler

1. Install Bundler: `gem install bundler`
2. Initialize Bundler: `bundle init`

   This will create a new Gemfile.

3. Open the Gemfile in a text editor.

   Typically you can open files from the Command Prompt by just typing the filename, but because Gemfile doesn't have a file extension, no program will automatically open it. You may need to use your File Explorer and browse to the directory, and then open the Gemfile in a text editor such as Notepad.

4. Remove the existing contents. Then paste in the following:

   ```
   source "https://rubygems.org"

   gem 'wdm'
   gem 'jekyll'
   ```
   The [wdm gem](https://rubygems.org/gems/wdm/versions/0.1.1) allows for the polling of the directory and rebuilding of the Jekyll site when you make changes. This gem is needed for Windows users, not Mac users.

6. Save and close the file.
7. Type `bundle install`.

   Bundle retrieves all the needed gems and gem dependencies and downloads them to your computer. At this time, Bundle also takes a snapshot of all the gems used in your project and creates a Gemfile.lock file to store this information.

## Git Clients for Windows

Although you can use the default command prompt with Windows, it's recommended that you use [Git Bash](https://git-for-windows.github.io/) instead. The Git Bash client will allow you to run shell scripts and execute other Unix commands. 

## Serve the Jekyll Documentation theme

1. Browse to the directory where you downloaded the Documentation theme for Jekyll.
2. Type `jekyll serve`
3. Go to the preview address in the browser. (Make sure you include the `/` at the end.)

   Unfortunately, the Command Prompt doesn't allow you to easily copy and paste the URL, so you'll have to type it manually.

## Resolving Github Metadata errors {#githuberror}

After making an edit, Jekyll auto-rebuilds the site. If you have the Gemfile in the theme with the github-pages gem, you may see the following error:

```
GitHub Metadata: No GitHub API authentication could be found. Some fields may be missing or have incorrect data.
```

If so, you will need to take some additional steps to resolve it. (Note that this error only appears if you have the github-pages gem in your gemfile.) The resolution involves adding a Github token and a cert file.

See this post on [Knight Codes](http://knightcodes.com/miscellaneous/2016/09/13/fix-github-metadata-error.html) for instructions on how to fix the error. You basically generate a personal token on Github and set it as a system variable. You also download a certification file and set it as a system variable. This resolves the issue.

{% include links.html %}
