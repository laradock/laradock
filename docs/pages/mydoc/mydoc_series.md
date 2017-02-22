---
title: Series
tags: [content_types]
keywords: series, connected articles, tutorials, hello world
last_updated: July 3, 2016
summary: "You can automatically link together topics belonging to the same series. This helps users know the context within a particular process."
sidebar: mydoc_sidebar
permalink: mydoc_series.html
folder: mydoc
---

## Using series for pages

You create a series by looking for all pages within a tag namespace that contain certain frontmatter. Here's a <a href="mydoc_seriesdemo1.html">demo</a>.

## 1. Create the series button

First create an include that contains your series button:

{% raw %}
```html
<div class="seriesContext">
    <div class="btn-group">
        <button type="button" data-toggle="dropdown" class="btn btn-primary dropdown-toggle">Series Demo <span class="caret"></span></button>
        <ol class="dropdown-menu">
            {% assign pages = site.pages | sort:"weight"  %}
            {% for p in pages %}
            {% if p.series == "ACME series" %}
            {% if p.url == page.url %}
            <li class="active"> → {{p.weight}}. {{p.title}}</li>
            {% else %}
            <li>
                <a href="{{p.url | remove: "/"}}">{{p.weight}}. {{p.title}}</a>
            </li>
            {% endif %}
            {% endif %}
            {% endfor %}
        </ol>
    </div>
</div>
```
{% endraw %}

Change "ACME series" to the name of your series.

Save this in your \_includes/custom folder as something like series\_acme.html.

{% include warning.html content="With pages, there isn't a universal namespace created from tags or categories like there is with Jekyll posts. As a result, you have to loop through all pages. If you have a lot of pages in your site (e.g., 1,000+), then this looping will create a slow build time. If this is the case, you will need to rethink the approach to looping here." %}

## 2. Create the "next" include

Now create another include for the Next button at the bottom of the page. Copy the following code, changing the series name to your series'name:

{% raw %}
```html
<p>{% assign series_pages = site.tags.series_acme %}
    {% for p in pages %}
    {% if p.series == "ACME series" %}
    {% assign nextTopic = page.weight | plus: "1"  %}
    {% if p.weight == nextTopic  %}
    <a href="{{p.url}}"><button type="button" class="btn btn-primary">Next: {{p.weight}}  {{p.title}}</button></a>
    {% endif %}
    {% endif %}
    {% endfor %}
</p>
```
{% endraw %}

Change "acme" to the name of your series.

Save this in your \_includes/custom/mydoc folder as series\_acme\_next.html.

## 3. Add the correct frontmatter to each of your series pages

Now add the following frontmatter to each page in the series:

```json
series: "ACME series"
weight: 1.0
```

With weights, Jekyll will treat 10 as coming after 1. If you have more than 10 items, consider changing `plus: "1.0"` to `plus: "0.1"`.

Additionally, if your page names are prefaced with numbers, such as "1. Download the code," then the {% raw %}`{{p.weight}}`{% endraw %} will create a duplicate number. In that case, just remove the {% raw %}`{{p.weight}}`{% endraw %} from both code samples here.

## 4. Add links to the series button and next button on each page.

On each series page, add a link to the series button at the top and a link to the next button at the bottom.

{% raw %}
```liquid
<!-- your frontmatter goes here -->

{% include custom/series_acme.html %}

<!-- your page content goes here ... -->

{% include custom/series_acme_next.html %}
```
{% endraw %}

## Changing the series drop-down color

The Bootstrap menu uses the `primary` class for styling. If you change this class in your theme, the Bootstrap menu should automatically change color as well. You can also just use another Bootstrap class in your button code. Instead of `btn-primary`, use `btn-info` or `btn-warning`. See [Labels][mydoc_labels] for more Bootstrap button classes.

## Using a collection with your series

Instead of copying and pasting the button includes on each of your series, you could also create a collection and define a layout for the collection that has the include code. For more information on creating collections, see [Collections][mydoc_collections] for more details.

{% include links.html %}
