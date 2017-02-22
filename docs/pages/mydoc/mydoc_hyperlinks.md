---
title: Links
audience: writer, designer
tags: [formatting, navigation]
keywords: links, hyperlinks, cross references, related links, relationship tables
summary: "When creating links, you can use standard HTML or Markdown formatting. However, you can also implement an automated approach to linking that makes linking much less error-prone (meaning less chances of broken links in your output) and requiring less effort."
last_updated: July 3, 2016
sidebar: mydoc_sidebar
permalink: mydoc_hyperlinks.html
folder: mydoc
---

## Create an external link

When linking to an external site, use Markdown formatting because it's simplest:

```
[Google](http://google.com)
```

## Linking to internal pages

When linking to internal pages, you can manually link to the pages like this:

```
[Icons](mydoc_icons.html)
```

However, if you change the file name, you'll have to update all of your links. It's much easier to use Automated links, as described in the next section.

## Automated links {#automatedlinks}

This method for automated links creates a master list of all links in a Markdown reference format based on entries in your sidebar table of contents.

With this Automated links method, make sure all your pages are referenced in a sidebar or topnav data file (inside \_data > sidebars). If they're not in a sidebar or top nav (such as links to headings on a page), list them in the `other.yml` file (which is in the \_data/sidebars folder).

The links.html file (in \_includes) will iterate through all your sidebars and create a list of reference-style markdown links based on the `url` properties in the sidebar items. 

{% include note.html content="For the automated links method to work, each of your pages must have a `permalink` property in the frontmatter. The `permalink` property must match the file name. For example, if the file name is `somefile.html`, your permalink property would be `somefile.html`. See [Pages][mydoc_pages] for more details." %}

To implement managed links:

1.  In your \_config.yml file, list each sidebar in the `sidebars` property &mdash; including the other.yml file too:
    
    ```yaml
    sidebars:
    - home_sidebar
    - mydoc_sidebar
    - product1_sidebar
    - product2_sidebar
    - other
    ```
    
2.  At the bottom of each topic where you plan to include links, include the links.html file:

    ```
    {% raw %}{% include links.html %}{% endraw %}
    ```
    
3.  To link to a topic, use reference-style Markdown links, with the referent using the file name (without the file extension). For example:

    ```
    See the [Icon][mydoc_icons] file.
    ```

    Here's the result:

    See the [Icon][mydoc_icons] file.

    If the link doesn't render, check to make sure the page is correctly listed in the sidebar.

## Automated links to headings on pages {#bookmarklinks}

If you're linking to the specific heading from another page, first give the heading an ID:

```
## Some heading {#someheading}
```

Then add a property into the other.yml file in your \_data/sidebars folder:

```yaml
    - title: Some link bookmark
      url: /mydoc_pages.html#someIdTag
```

And reference it like this:

```
This is [Some link][mydoc_pages.html#someIdTag].
```

**Result:**

This is [Some link][mydoc_pages.html#someIdTag].

It's a little strange having the `.html#` in a reference like this, but it works.

{% include links.html %}
