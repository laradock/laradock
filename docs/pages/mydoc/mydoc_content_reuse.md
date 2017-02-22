---
title: Content reuse
tags: [single_sourcing]
keywords: includes, conref, dita, transclusion, transclude, inclusion, reference
last_updated: July 3, 2016
summary: "You can reuse chunks of content by storing these files in the includes folder. You then choose to include the file where you need it. This works similar to conref in DITA, except that you can include the file in any content type."
sidebar: mydoc_sidebar
permalink: mydoc_content_reuse.html
folder: mydoc
---

## About content reuse
You can embed content from one file inside another using includes. Put the file containing content you want to reuse (e.g., mypage.html) inside the \_includes/custom folder and then use a tag like this: 

{% raw %}
```
{% include custom/mypage.html %}
```
{% endraw %}

With content in your \_includes folder, you don't add any frontmatter to these pages because they will be included on other pages already containing frontmatter.

Also, when you include a file, all of the file's contents get included. You can't specify that you only want a specific part of the file included. However, you can use parameters with includes. See the following Jekyll cast for more info about using parameters with includes:

<iframe width="640" height="480" src="https://www.youtube.com/embed/kzpGqdEMbIs" frameborder="0" allowfullscreen></iframe>

## Page-level variables

You can also create custom variables in your frontmatter like this:

{% raw %}
```yaml
---
title: Page-level variables
permalink: page_level_variables/
thing1: Joe
thing2: Dave
---
```
{% endraw %}

You can then access the values in those custom variables using the `page` namespace, like this:

{% raw %}
```
thing1: {{page.thing1}}
thing2: {{page.thing2}}
```
{% endraw %}


I use includes all the time. Most of the includes in the \_includes directory are pulled into the theme layouts. For those includes that change, I put them inside custom and then inside a specific project folder.

{% include links.html %}
