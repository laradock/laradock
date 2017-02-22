---
title: Troubleshooting
tags: [troubleshooting]
keywords: trouble, problems, support, error messages, problems, failure, error, #fail
last_updated: July 3, 2016
summary: "This page lists common errors and the steps needed to troubleshoot them."
sidebar: mydoc_sidebar
permalink: mydoc_troubleshooting.html
folder: mydoc
---

## Issues building the site

### Address already in use

When you try to build the site, you get this error in iTerm:

```
jekyll 2.5.3 | Error:  Address already in use - bind(2)
```
This happens if a server is already in use. To fix this, edit your config file and change the port to a unique number.

If the previous server wasn't shut down properly, you can kill the server process using these commands:

`ps aux | grep jekyll`

Find the PID (for example, it  looks like "22298").

Then type `kill -9 22298` where "22298" is the PID.

Alternatively, type the following to stop all Jekyll servers:

```
kill -9 $(ps aux | grep '[j]ekyll' | awk '{print $2}')
```

### shell file not executable

If you run into permissions errors trying to run a shell script file (such as mydoc_multibuild_web.sh), you may need to change the file permissions to make the sh file executable. Browse to the directory containing the shell script and run the following:

```
chmod +x build_writer.sh
```

## shell file not runnable

If you're using a PC, rename your shell files with a .bat extension.

### "page 0" cross references in the PDF

If you see "page 0" cross-references in the PDF, the URL doesn't exist. Check to make sure you actually included this page in the build.

If it's not a page but rather a file, you need to add a `noCrossRef` class to the file so that your print stylesheet excludes the counter from it. Add `class="noCrossRef"` as an attribute to the link. In the css/printstyles.css file, there is a style that should remove the counter from anchor elements with this class.

### The PDF is blank

Check the prince-list.txt file in the output to see if it contains links. If not, you have something wrong with the logic in the prince-list.txt file. Check the conditions.html file in your \_includes to see if the audience specified in your configuration file aligns with the buildAudience in the conditions.html file

### Sidebar not appearing

If you build your site but the sidebar doesn't appear, check the following:

Look in \_includes/custom/sidebarconfigs.html and make sure the conditional values there match up with values you're using in each page's frontmatter.

Make sure each TOC item has an output property that specifies web or pdf.

Understanding how the theme works can be helpful in troubleshooting. The \_includes/sidebar.html file loops through the values in the \_data/sidebar.yml file. There are `if` statements that check whether the conditions (as specified in the conditions.html file) are met. If the sidebar.yml item doesn't have the right output, then it won't get displayed in the sidebar. It would instead get skipped.

### Sidebar isn't collapsed

If the sidebar levels aren't collapsed, usually your JavaScript is broken somewhere. Open the JavaScript Console and look to see where the problem is. If one script breaks, then other scripts will break too, so troubleshooting it is a little tricky.

### Search isn't working

If the search isn't working, check the JSON validity in the search.json file in your output folder. Usually something is invalid. Identify the problematic line, fix the file, or put `search: exclude` in the frontmatter of the file to exclude it from search.

{% include links.html %}
