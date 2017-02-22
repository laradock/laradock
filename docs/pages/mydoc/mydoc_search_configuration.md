---
title: Search configuration
tags: [publishing, navigation]
keywords: search, json, configuration, findability
last_updated: July 3, 2016
summary: "The search feature uses JavaScript to look for keyword matches in a JSON file. The results show instant matches, but it doesn't provide a search results page like Google. Also, sometimes invalid formatting can break the JSON file."
sidebar: mydoc_sidebar
permalink: mydoc_search_configuration.html
folder: mydoc
---

## About search
The search is configured through the search.json file in the root directory. The search is a simple search that looks at content in pages. It looks at titles, summaries, keywords, and tags.

However, the search doesn't work like google &mdash; you can't hit return and see a list of results on the search results page, with the keywords in bold. Instead, this search shows a list of page titles that contain keyword matches. It's fast, but simple.

## Excluding pages from search

By default, every page is included in the search. Depending on the type of content you're including, you may find that some pages will break the JSON formatting. If that happens, then the search will no longer work.

If you want to exclude a page from search add `search: exclude` in the page's frontmatter.

## Troubleshooting search

You should exclude any files from search that you don't want appearing in the search results. For example, if you have a tooltips.json file or prince-list.txt, don't include it, as the formatting will break the JSON format.

If any formatting in the search.json file is invalid (in the build), search won't work. You'll know that search isn't working if no results appear when you start typing in the search box.

If this happens, go directly to the search.json file in your browser, and then copy the content. Go to a [JSON validator](http://jsonlint.com/) and paste in the content. Look for the line causing trouble. Edit the file to either exclude the page from search or fix the syntax so that it doesn't invalidate the JSON. (Note that tabs in the body will invalidate JSON.)

The search.json file already tries to strip out content that would otherwise make the JSON invalid.

## Including the body field in search
I've found that include the `body` field in the search creates too many problems, and so I've removed `body` from the search. You can see the results of including the `body` by adding this along with the other fields in search.json:

{% raw %}
```json
      "body": "{{ page.content | strip_html | strip_newlines | replace: '\', '\\\\' | replace: '"', '\\"' | replace: '	', '    '  }}",
```
{% endraw %}

Note that the last replace, `| replace: '^t', '    ' `, looks for any tab character and replaces it with four spaces. (Tab characters invalidate JSON.) If you run into other problematic formatting, you can use regex expressions to find and replace the content. See [Regular Expressions](http://www.ultraedit.com/support/tutorials_power_tips/ultraedit/regular_expressions.html) for details on finding and replacing code.

It's possible that the formatting may not account for all the scenarios that would invalidate the JSON. (Sometimes it's an extra comma after the last item that makes it invalid.)

Note that including the body in the search creates other problems as well. The search results show the most immediate matches in the JSON file. If several topics have matches for the keyword in the body, these matches might appear before other files that have matches in the title, summary, or keywords. This is because this simple search does not provide any weighting mechanisms for the content.

## Customizing search results

At some point, you may want to customize the search results more. Here's a little more detail that will be helpful. The search.json file retrieves various page values:

```json
{% raw %}---
title: search
layout: none
search: exclude
---

[
{% for page in site.pages %}
{% unless page.search == "exclude" %}
{
"title": "{{ page.title | escape }}",
"tags": "{{ page.tags }}",
"keywords": "{{page.keywords}}",
"url": "{{ page.url | remove: "/"}}",
"summary": "{{page.summary | strip }}"
},
{% endunless %}
{% endfor %}

{% for post in site.posts %}

{
"title": "{{ post.title | escape }}",
"tags": "{{ post.tags }}",
"keywords": "{{post.keywords}}",
"url": "{{ post.url }}",
"summary": "{{post.summary | strip }}"
}
{% unless forloop.last %},{% endunless %}
{% endfor %}

]
{% endraw %}
```

The \_includes/topnav.html file then makes use of these values:

```html
<li>
    <!--start search-->
    <div id="search-demo-container">
        <input type="text" id="search-input" placeholder="{{site.data.strings.search_placeholder_text}}">
        <ul id="results-container"></ul>
    </div>
    <script src="{{ "js/jekyll-search.js" }}" type="text/javascript"></script>
    <script type="text/javascript">
            SimpleJekyllSearch.init({
                searchInput: document.getElementById('search-input'),
                resultsContainer: document.getElementById('results-container'),
                dataSource: '{{ "search.json" }}',
                searchResultTemplate: '<li><a href="{url}" title="{{page.title | replace: "'", "\"}}">{title}</a></li>',
    noResultsText: '{{site.data.strings.search_no_results_text}}',
            limit: 10,
            fuzzy: true,
    })
    </script>
    <!--end search-->
</li>
```

Where you see `{url}` and `{title}`, the search is retrieving the values for these as specified in the search.json file.

## More robust search

For more robust search, consider integrating either [Algolia](http://algolia.com) or [Swifttype](http://swiftype.com).

{% include links.html %}
