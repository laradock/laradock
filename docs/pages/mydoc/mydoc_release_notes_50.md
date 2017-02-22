---
title: Release notes 5.0
tags: [getting_started]
keywords: release notes, announcements, what's new, new features
last_updated: July 3, 2016
summary: "Version 5.0 of the Documentation theme for Jekyll changes some fundamental ways the theme works to provide product-specific sidebars, intended to accommodate a site where multiple products are grouped together on the same site rather than generated out as separate outputs."
sidebar: mydoc_sidebar
permalink: mydoc_release_notes_50.html
folder: mydoc
---

## Unique sidebars for each product

In previous versions of the theme, I built the theme to generate different outputs for different scenarios based on various filtering attributes that might include product, version, platform, and audience variants.

However, this model results in siloed outputs and lots of separate file directories to manage. Instead of having 30 separate sites for your content (or however many variants you might have been producing), in this version of the theme I've moved towards a strategy of having one site with multiple products.

For each product, you can associate a unique sidebar with each of the product's pages. This allows you to have all your documentation on one site, but with separate navigation that is tailored to a view of that product.

You can still output to both web and PDF. And if you really need multiple site outputs, you can still do so by using multiple configuration files that trigger different builds. But my conclusion after using the multiple site output model for some years is that it's a bad practice for tech comm.

## Permalinks

With this theme, since you'll be publishing to one site, I've implement permalinks instead of relative links. Using permalinks means the way you store pages is much more flexible. You can store topics in folders and subfolders, etc., to any degree. But note that with permalinks you can't view the content offline (outside of Jekyll's preview server) nor on a separate site other than the one specified in the configuration file. Permalinks are how Jekyll was designed to work, and the sites just work better that way.

## Kramdown and Rouge

I also switched from redcarpet and Pygments to Kramdown and Rouge to align with the current direction of Jekyll 3.0. Kramdown is a Markdown filter (it's slightly different from Github-flavored Markdown). Rouge is a syntax highlighter. Pygments had some dependencies on Python, which made it more cumbersome for Windows users.

## Blog feature

I included a blog feature with this version of the theme. You can write posts and view them through the News link. There's also an archive for blog posts that sorts posts by year.

Additionally, the tagging system works across both the blog and pages, so your tags allow users to move laterally across the site based on topics they're interested in. When you view a tag archive, the sidebar shows a list of tags.

## Updated documentation

I updated the documentation for  the theme. The switch from the multi-site outputs to the single-site with multiple sidebars required updating a lot of different parts of the documentation and code.

## Fixed errors

Previously I had some errors with the HTML that showed up in w3c HTML validator analyses. This caused some small problems in certain browsers or systems less tolerant of the errors. I fixed all of the errors.

## Accessing the old theme

If you want to access the old theme, you can still find it [here](https://github.com/tomjohnson1492/jekylldoctheme-separate-outputs).

{% include links.html %}
