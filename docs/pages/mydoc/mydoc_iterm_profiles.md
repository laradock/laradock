---
title: iTerm profiles
tags: [publishing]
keywords: iterm, terminal, build shortcuts, mac
last_updated: July 3, 2016
summary: "You can set up profiles in iTerm to facilitate the build process with just a few clicks. This can make it a lot easier to quickly build multiple outputs."
sidebar: mydoc_sidebar
permalink: mydoc_iterm_profiles.html
folder: mydoc
---

## About iTerm profiles

When you're working with tech docs, a lot of times you have builds that push files onto different servers, or that build the content for different environments. It can be a hassle to type out these commands each time. Instead, it's easier to configure iTerm with profiles that initiate the scripts.

## Set up profiles

1. Open iTerm and go to **Profiles > Open Profiles.**
2. Click **Edit Profiles**.
3. Click the + button in the lower-left corner to create a new profile.
4. In the **Name** field, type a name describing the output, such as `Doc theme -- designers`.
5. In the **Send text at start** field, type the command for the build script, such as this:

   ```
   JEKYLL_ENV=production jekyll serve
   ```
    Leave the Login shell option selected.

6. In the Working Directory section, select **Directory** and enter the directory for your project, such as **/Users/tjohnson/projects/documentation-theme-jekyll**.
7. Close the profiles panel.

Here's an example:

{% include image.html file="itermexample.png" caption="iTerm profile example" %}

## Launching a profile

1. In iTerm, make sure the Toolbar is shown. Go to **View > Toggle Toolbar**.
2. Click the **New** button and select your profile.

{% include tip.html content="When you're done with the session, make sure to click <b>Ctrl+C</b>." %}

{% include links.html %}
