---
title: YAML tutorial in the context of Jekyll
tags: [formatting]
keywords: search
summary: "YAML is a format that relies on white spacing to separate out the various elements of content. Jekyll lets you use Liquid with YAML as a way to parse through the data. Storing items for your table of contents is one of the most common uses of YAML with Jekyll."
sidebar: mydoc_sidebar
permalink: mydoc_yaml_tutorial.html
folder: mydoc
---

<style>
.result {
background-color: #f0f0f0;
border: 1px solid #dedede;
padding: 10px;
margin-top: 10px;
margin-bottom: 10px;
}
</style>

## Overview
One of the most interesting features of Jekyll is the ability to separate out data elements from formatting elements using a combination of YAML and Liquid. This setup is most common when you're trying to create a table of contents.

Not many Jekyll themes actually have a robust table of contents, which is critical when you are creating any kind of documentation or reference material that has a lot of pages.

Here's the basic approach in creating a table of contents. You store your data items in a YAML file using YAML syntax. (I'll go over more about YAML syntax in a later section.) You then create your HTML structure in another file, such as sidebar.html. You might leverage one of the many different table of content frameworks (such as [Navgoco](https://github.com/tefra/navgoco)) that have been created for this HTML structure.

Then, using Liquid syntax for loops and conditions, you access all of those values from the data file and splice them into HTML formatting. This will become more clear as we go through some examples.

## YAML overview

Rather than just jump into YAML at the most advanced level, I'm going to start from ground zero with an introduction to YAML and how you access basic values in your data files using Jekyll.

Note that you don't actually have to use Jekyll when using YAML. YAML is used in a lot of other systems and is a format completely independent of Jekyll. However, because Jekyll uses Liquid, it gives you a lot of power to parse through your YAML data and make use of it.

YAML itself doesn't do anything on its own &mdash; it's just a way of storing your data in a specific structure that other utilities can parse.

## YAML basics
You can read about YAML from a lot of different sources. Here are some basic characteristics of YAML:

* YAML ("YAML Ain't Markup Language") doesn't use markup tags. This means you won't see any kind of angle brackets. It uses white space as a way to form the structure. This makes YAML much more human readable.
*  Because YAML does use white space for the structure, YAML is extremely picky about the exactness of spaces. If you have just one extra space somewhere, it can cause the whole file to be invalid.
* For each new level in YAML, you indent two spaces. Each level provides a different access point for the content. You use dot notation to access each new level.
* Because tabs are not universally implemented the same way in editors, a tab might not equate to two spaces. In general, it's best to manually type two spaces to create a new level in YAML.
* YAML has several types of elements. The most common are mappings and lists. A mapping is simply a key-value pair. A list is a sequence of items. List start with hyphens.
* Items at each level can have various properties. You can create conditions based on the properties.
* You can use "for" loops to iterate through a list.

I realize a lot of this vague and general; however, it will become a lot more clear as we go through some concrete examples.

In the \_data/mydoc folder, there's a file called samplelist.yml. All of these examples come from that file.

## Example 1: Simple mapping

**YAML:**

```yaml
name:
  husband: Tom
  wife: Shannon
```

**Markdown + Liquid:**

```liquid
{% raw %}<p>Husband's name: {{site.data.samplelist.name.husband}}</p>
<p>Wife's name: {{site.data.samplelist.name.wife}}</p>{% endraw %}
```

Notice that in order to access the data file, you use `site.data.samplelist`. `mydoc` is the folder, and `samplelist` is the name of the YAML file.

**Result:**

<div class="result">
<p>Husband's name: {{site.data.samplelist.name.husband}}</p>
<p>Wife's name: {{site.data.samplelist.name.wife}}</p>
</div>

## Example 2: Line breaks

**YAML:**

```yaml
feedback: >
  This is my feedback to you.
  Even if I include linebreaks here,
  all of the linebreaks will be removed when the value is inserted.

block: |
    This pipe does something a little different.
    It preserves the breaks.
    This is really helpful for code samples,
    since you can format the code samples with
       the appropriate
```

**Markdown:**

```liquid
{% raw %}<p><b>Feedback</b></p>
<p>{{site.data.samplelist.feedback}}</p>

<p><b>Block</b></p>
<p>{{site.data.samplelist.block}}</p>{% endraw %}
```

**Result:**

<div class="result">
<p><b>Feedback</b></p>
<p>{{site.data.samplelist.feedback}}</p>

<p><b>Block</b></p>
<p>{{site.data.samplelist.block}}</p>
</div>

The right angle bracket `>` allows you to put the value on the next lines (which must be indented). Even if you create a line break, the output will remove all of those line breaks, creating one paragraph.

The pipe `|` functions like the angle bracket in that it allows you to put the values for the mapping on the next lines (which again must be indented). However, the pipe does preserve all of the line breaks that you use. This makes the pipe method ideal for storing code samples.

## Example 3: Simple list

**YAML**:

```yaml
bikes:
  - title: mountain bikes
  - title: road bikes
  - title: hybrid bikes
```

**Markdown + Liquid:**


```liquid
{% raw %}<ul>
{% for item in site.data.samplelist.bikes %}
<li>{{item.title}}</li>
{% endfor %}
</ul>{% endraw %}
```

**Result:**

<div class="result">
<ul>
{% for item in site.data.samplelist.bikes %}
<li>{{item.title}}</li>
{% endfor %}
</ul>
</div>

Here we use a "for" loop to get each item in the bikes list. By using `.title` we only get the `title` property from each list item.

## Example 4: List items

**YAML:**

```yaml
salesteams:
- title: Regions
 subfolderitems:
   - location: US
   - location: Spain
   - location: France
```

**Markdown + Liquid:**

{% raw %}
```
{% for item in site.data.samplelist.salesteams %}
<h3>{{item.title}}</h3>
<ul>
{% for entry in item.subitems %}
<li>{{entry.location}}</li>
{% endfor %}
</ul>
{% endfor %}
```
{% endraw %}

**Result:**

<div class="result">
{% for item in site.data.samplelist.salesteams %}
<h3>{{item.title}}</h3>
<ul>
{% for entry in item.subfolderitems %}
<li>{{entry.location}}</li>
{% endfor %}
</ul>
{% endfor %}
</div>

Hopefully you can start to see how to wrap more complex formatting around the YAML content. When you use a "for" loop, you choose the variable of what to call the list items. The variable you choose to use becomes how you access the properties of each list item. In this case, I decided to use the variable `item`. In order to get each property of the list item, I used `item.subitems`.

Each list item starts with the hyphen `–`.  You cannot directly access the list item by referring to a mapping. You only loop through the list items. If you wanted to access the list item, you would have to use something like `[1]`, which is how you access the position in an array. You cannot access a list item like you can access a mapping key.

## Example 5: Table of contents

**YAML:**

```yaml
toc:
  - title: Group 1
    subfolderitems:
      - page: Thing 1
      - page: Thing 2
      - page: Thing 3
  - title: Group 2
    subfolderitems:
      - page: Piece 1
      - page: Piece 2
      - page: Piece 3
  - title: Group 3
    subfolderitems:
      - page: Widget 1
      - page: Widget 2 it's
      - page: Widget 3
```

**Markdown + Liquid:**

{% raw %}
```liquid
{% for item in site.data.samplelist.toc %}
<h3>{{item.title}}</h3>
<ul>
{% for entry in item.subfolderitems %}
<li>{{entry.page}}</li>
{% endfor %}
</ul>
{% endfor %}
```
{% endraw %}

**Result:**

<div class="result">
{% for item in site.data.samplelist.toc %}
<h3>{{item.title}}</h3>
<ul>
{% for entry in item.subfolderitems %}
<li>{{entry.page}}</li>
{% endfor %}
</ul>
{% endfor %}
</div>

This example is similar to the previous one, but it's more developed as a real table of contents.

## Example 6: Variables

**YAML:**

```yaml
something: &hello Greetings earthling!
myref: *hello
```

**Markdown:**

{% raw %}
```liquid
{{ site.data.samplelist.myref }}
```
{% endraw %}

**Result:**

<div class="result">
{{ site.data.samplelist.myref }}
</div>

This example is notably different. Here I'm showing how to reuse content in YAML file. If you have the same value that you want to repeat in other mappings, you can create a variable using the `&` symbol. Then when you want to refer to that variable's value, you use an asterisk `*` followed by the name of the variable.

In this case the variable is `&hello` and its value is `Greetings earthling!` In order to reuse that same value, you just type `*hello`.

I don't use variables much, but that's not to say they couldn't be highly useful. For example, let's say you put name of the product in parentheses after each title (because you have various products that you're providing documentation for in the same site). You could create a variable for that product name so that if you change how you're referring to it, you wouldn't have to change all instances of it in your YAML file.

## Example 7: Positions in lists

**YAML:**

```yaml
about:
 - zero
 - one
 - two
 - three
```

**Markdown:**

```
{% raw %}{{ site.data.samplelist.about[0] }}{% endraw %}
```

**Result:**
<div class="result">
{{ site.data.samplelist.about[0] }}
</div>

You can see that I'm accessing one of the items in the list using `[0]`. This refers to the position in the array where a list item is. Like most programming languages, you start counting at zero, not one.

I wanted to include this example because it points to the challenge in getting a value from a specific list item. You can't just call out a specific item in a list like you can with a mapping. This is why you usually iterate through the list items using a "for" loop.

## Example 8: Properties from list items at specific positions

**YAML:**

```yaml
numbercolors:
 - zero:
   properties: red
 - one:
   properties: yellow
 - two:
   properties: green
 - three:
   properties: blue
```

**Markdown + Liquid:**

{% raw %}
```liquid
{{ site.data.samplelist.numbercolors[0].properties }}
```
{% endraw %}

**Result:**
<div class="result">
{{ site.data.samplelist.numbercolors[0].properties }}
</div>

This example is similar as before; however, in this case were getting a specific property from the list item in the zero position.

## Example 9: Conditions

**YAML:**

```yaml
mypages:
- section1: Section 1
  audience: developers
  product: acme
  url: facebook.com
- section2: Section 2
  audience: writers
  product: acme
  url: google.com
- section3: Section 3
  audience: developers
  product: acme
  url: amazon.com
- section4: Section 4
  audience: writers
  product: gizmo
  url: apple.com
- section5: Section 5
  audience: writers
  product: acme
  url: microsoft.com
```

**Markdown + Liquid:**


```liquid
{% raw %}<ul>
{% for sec in site.data.samplelist.mypages %}
{% if sec.audience == "writers" %}
<li>{{sec.url}}</li>
{% endif %}
{% endfor %}
</ul>
{% endraw %}
```


**Result:**
<div class="result">
<ul>
{% for sec in site.data.samplelist.mypages %}
{% if sec.audience == "writers" %}
<li>{{sec.url}}</li>
{% endif %}
{% endfor %}
</ul>
</div>

This example shows how you can use conditions in order to selectively get the YAML content. In your table of contents, you might have a lot of different pages. However, you might only want to get the pages for a particular audience. Conditions lets you get only the items that meet those audience attributes.

Now let's adjust the condition just a little. Let's add a second condition so that the `audience` property has to be `writers` and the `product` property has to be gizmo. This is how you would write it:


```liquid
{% raw %}<ul>
{% for sec in site.data.samplelist.mypages %}
{% if sec.audience == "writers" and sec.product == "gizmo" %}
<li>{{sec.url}}</li>
{% endif %}
{% endfor %}
</ul>{% endraw %}
```


And here is the result:

<div class="result">
<ul>
{% for sec in site.data.samplelist.mypages %}
{% if sec.audience == "writers" and sec.product == "gizmo" %}
<li>{{sec.url}}</li>
{% endif %}
{% endfor %}
</ul>
</div>

## More resources

For more examples and explanations, see this helpful post on tournemille.com: [How to create data-driven navigation in Jekyll](http://www.tournemille.com/blog/How-to-create-data-driven-navigation-in-Jekyll).

{% include links.html %}
