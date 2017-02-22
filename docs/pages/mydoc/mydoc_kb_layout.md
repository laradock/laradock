---
title: Knowledge-base layout
tags: [special_layouts]
keywords: knowledge base, support portal, grid, doc portal
last_updated: July 3, 2016
summary: "This shows a sample layout for a knowledge base. Each square could link to a tag archive page. In this example, font icons from Font Awesome are used for the graphics, and the layout is pulled from the Modern Business theme. ."
sidebar: mydoc_sidebar
permalink: mydoc_kb_layout.html
toc: false
folder: mydoc
---

Here's the sample knowledge-base style layout:

<div class="row">
         <div class="col-lg-12">
             <h2 class="page-header">Knowledge Base Categories</h2>
         </div>
         <div class="col-md-3 col-sm-6">
             <div class="panel panel-default text-center">
                 <div class="panel-heading">
                     <span class="fa-stack fa-5x">
                           <i class="fa fa-circle fa-stack-2x text-primary"></i>
                           <i class="fa fa-tree fa-stack-1x fa-inverse"></i>
                     </span>
                 </div>
                 <div class="panel-body">
                     <h4>Getting started</h4>
                     <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
                     <a href="tag_getting_started.html" class="btn btn-primary">Learn More</a>
                 </div>
             </div>
         </div>
         <div class="col-md-3 col-sm-6">
             <div class="panel panel-default text-center">
                 <div class="panel-heading">
                     <span class="fa-stack fa-5x">
                           <i class="fa fa-circle fa-stack-2x text-primary"></i>
                           <i class="fa fa-car fa-stack-1x fa-inverse"></i>
                     </span>
                 </div>
                 <div class="panel-body">
                     <h4>Navigation</h4>
                     <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
                     <a href="tag_navigation.html" class="btn btn-primary">Learn More</a>
                 </div>
             </div>
         </div>
         <div class="col-md-3 col-sm-6">
             <div class="panel panel-default text-center">
                 <div class="panel-heading">
                     <span class="fa-stack fa-5x">
                           <i class="fa fa-circle fa-stack-2x text-primary"></i>
                           <i class="fa fa-support fa-stack-1x fa-inverse"></i>
                     </span>
                 </div>
                 <div class="panel-body">
                     <h4>Single sourcing</h4>
                     <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
                     <a href="tag_single_sourcing.html" class="btn btn-primary">Learn More</a>
                 </div>
             </div>
         </div>
         <div class="col-md-3 col-sm-6">
             <div class="panel panel-default text-center">
                 <div class="panel-heading">
                     <span class="fa-stack fa-5x">
                           <i class="fa fa-circle fa-stack-2x text-primary"></i>
                           <i class="fa fa-database fa-stack-1x fa-inverse"></i>
                     </span>
                 </div>
                 <div class="panel-body">
                     <h4>Formatting</h4>
                     <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
                     <a href="tag_formatting.html" class="btn btn-primary">Learn More</a>
                 </div>
             </div>
         </div>
</div>


## Generating a list of all pages with a certain tag

If you don't want to link to a tag archive index, but instead want to list all pages that have a certain tag, you could use this code:

```html
{% raw %}Getting started pages:
<ul>
{% assign sorted_pages = (site.pages | sort: 'title') %}
{% for page in sorted_pages %}
{% for tag in page.tags %}
{% if tag == "getting_started" %}
<li><a href="{{ page.url | remove: "/" }}">{{page.title}}</a></li>
{% endif %}
{% endfor %}
{% endfor %}
</ul>{% endraw %}
```

Here's the result:

Getting started pages:

<ul>
{% assign sorted_pages = (site.pages | sort: 'title') %}
{% for page in sorted_pages %}
{% for tag in page.tags %}
{% if tag == "getting_started" %}
<li><a href="{{ page.url | remove: "/"}}">{{page.title}}</a></li>
{% endif %}
{% endfor %}
{% endfor %}
</ul>

{% include links.html %}
