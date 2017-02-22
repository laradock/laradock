---
title: Supported features
tags:
  - getting_started
keywords: "features, capabilities, scalability, multichannel output, dita, hats, comparison, benefits"
last_updated: "July 16, 2016"
summary: "If you're not sure whether Jekyll and this theme will support your requirements, this list provides a semi-comprehensive overview of available features."
published: true
sidebar: mydoc_sidebar
permalink: mydoc_supported_features.html
folder: mydoc
---

Before you get into exploring Jekyll as a potential platform for help content, you may be wondering if it supports some basic features needed to fulfill your tech doc requirements. The following table shows what is supported in Jekyll and this theme.

## Supported features

Features | Supported | Notes
--------|-----------|-----------
Content re-use | Yes | Supports re-use through Liquid. You can re-use variables, snippets of code, entire pages, and more. In DITA speak, this includes conref and keyref.
Markdown | Yes | You can author content using Markdown syntax. This is a wiki-like syntax for HTML that you can probably pick up in 10 minutes. Where Markdown falls short, you can use HTML. Where HTML falls short, you use Liquid, which is a scripting that allows you to incorporate more advanced logic.
Responsive design | Yes | Uses Bootstrap framework for responsive design.
Translation | Yes | I haven't done a translation project yet (just a pilot test). Here's the basic approach: Export the HTML pages and send them to a translation agency. Then create a new project for that language and insert the translated pages. Everything will be translated.
Collaboration |  Yes | You collaborate with Jekyll projects the same way that developers collaborate with software projects. (You don't need a CMS.) Because you're working with text file formats, you can use any version control software (Git, Mercurial, Perforce, Bitbucket, etc.) as a CMS for your files.
Scalability | Yes | Your site can scale to any size. It's up to you to determine how you will design the information architecture for your thousands of pages. You can choose what you display at first, second, third, fourth, and more levels, etc. Note that when your project has thousands of pages, the build time will be longer (maybe 1 minute per thousand pages?). It really depends on how many for loops you have iterating through the pages.
Lightweight architecture | Yes | You don't need a LAMP stack (Linux, Apache, MySQL, PHP) architecture to get your site running. All of the building is done on your own machine, and you then push the static HTML files onto a server.
Skinnability | Yes | You can skin your Jekyll site to look identical to pretty much any other site online. If you have a UX team, they can really skin and design the site using all the tools familiar to the modern designer -- JavaScript, HTML5, CSS, jQuery, and more. Jekyll is built on the modern web development stack rather than the XML stack (XSLT, XPath, XQuery).
Support | Yes | The community for your Jekyll site isn't so much other tech writers (as is the case with DITA) but rather the wider web development community. [Jekyll Talk](http://talk.jekyllrb.com) is a great resource. So is Stack Overflow.
Blogging features | Yes | There is a simple blogging feature. This appears as "news" and is intended to promote news that applies across products.
Versioning | Yes | Jekyll doesn't version your files. You upload your files to a version control system such as Github. Your files are versioned there.
PC platform | Yes | Jekyll runs on Windows. Although the experience working on the command line is better on a Mac, Windows also works, especially now that Jekyll 3.0 dropped dependencies on Python, which wasn't available by default on Windows.
jQuery plugins | Yes | You can use any jQuery plugins you and other JavaScript, CMS, or templating tools. However, note that if you use Ruby plugins, you can't directly host the source files on Github Pages because Github Pages doesn't allow Ruby plugins. Instead, you can just push your output to any web server. If you're not planning to use Github Pages, there are no restrictions on any plugins of any sort. Jekyll makes it super easy to integrate every kind of plugin imaginable. This theme doesn't actually use any plugins, so you can publish on Github if you want.
Bootstrap integration | Yes | This theme is built on [Bootstrap](http://getbootstrap.com/). If you don't know what Bootstrap is, basically this means there are hundreds of pre-built components, styles, and other elements that you can simply drop into your site. For example, the responsive quality of the site comes about from the Bootstrap code base.
Fast-loading pages| Yes | This is one of the Jekyll's strengths. Because the files are static, they loading extremely fast, approximately 0.5 seconds per page. You can't beat this for performance. (A typically database-driven site like WordPress averages about 2.5 + seconds loading time per page.) Because the pages are all static, it means they are also extremely secure. You won't get hacked like you might with a WordPress site.
Themes | Yes | You can have different themes for different outputs. If you know CSS, theming both the web and print outputs is pretty easy.
Open source | Yes | This theme is entirely open source. Every piece of code is open, viewable, and editable. Note that this openness comes at a price &mdash; it's easy to make changes that break the theme or otherwise cause errors.
Offline viewing | Yes | This theme uses relative linking throughout, so you can view the content offline and on any webserver without configuring urls and baseurls in your configuration file.


## Features not available

The following features are not available.

Features | Supported | Notes
--------|-----------|-----------
CMS interface | No | Unlike with WordPress, you don't log into an interface and navigate to your files. You work with text files and preview the site dynamically in your browser. Don't worry -- this is part of the simplicy that makes Jekyll awesome. I recommend using WebStorm as your text editor.
WYSIWYG interface | No | I use WebStorm to author content, because I like working in text file formats. But you can use any Markdown editor you want (e.g., Lightpaper for Mac, Marked) to author your content.
Different outputs | No | This theme provides a single website output that contains documentation for multiple products. Unlike previous iterations of the theme, it's not intended to support different outputs from the same content. However, you can easily set things up to do this by simply creating multiple configuration files and running different builds for each configuration file.
Robust search | No | The search feature is a simplistic JSON search. For more robust search, you should integrate Swiftype or Algolia. However, those services aren't currently integrated into the theme.
Standardized templates | No | You can create pages with any structure you want. The theme does not enforce topic types such as a task or concept as the DITA specification does.
Integration with Swagger | No | You can link to a SwaggerUI output, but there is no built-in integration of SwaggerUI into this documentation theme.
Templates for endpoints | No | Although static site generators work well with API documentation, there aren't any built-in templates specific to endpoints in this theme. You could construct your own, though.
eBook output | No | There isn't an eBook output for the content.

{% include links.html %}
