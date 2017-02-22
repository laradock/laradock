---
title: Alerts
tags: [formatting]
keywords: notes, tips, cautions, warnings, admonitions
last_updated: July 3, 2016
summary: "You can insert notes, tips, warnings, and important alerts in your content. These notes make use of Bootstrap styling and are available through data references such as site.data.alerts.note."
sidebar: mydoc_sidebar
permalink: mydoc_alerts.html
folder: mydoc
---

## About alerts

Alerts are little warnings, info, or other messages that you have called out in special formatting. In order to use these alerts or callouts, reference the appropriate value stored in the alerts.yml file as described in the following sections.

## Alerts

Similar to [inserting images][mydoc_images], you insert alerts through various includes that have been developed. These includes provide templates through which you pass parameters to easily populate the right HTML code.

```
{%raw%}{% include note.html content="This is my note. All the content I type here is treated as a single paragraph." %}{% endraw%}
```

Here's the result:

{% include note.html content="This is my note. All the content I type here is treated as a single paragraph." %}

With alerts, there's just one include property:

| Property | description |
|-------|--------|
| content | The content for the alert. |

If you need multiple paragraphs, enter `<br/><br/>` tags. This is because block level tags aren't allowed here, as Kramdown is processing the content as Markdown despite the fact that the content is surrounded by HTML tags. Here's an example with a break:

```
{%raw%}{% include note.html content="This is my note. All the content I type here is treated as a single paragraph. <br/><br/> Now I'm typing on a  new line." %}{% endraw%}
```

Here's the result:

{% include note.html content="This is my note. All the content I type here is treated as a single paragraph. <br/><br/> Now I'm typing on a  new line." %}

## Types of alerts available

There are four types of alerts you can leverage:

* note.html
* tip.html
* warning.html
* important.html

They function the same except they have a different color, icon, and alert word. You include the different types by selecting the include template you want. Here are samples of each alert:

{% include note.html content="This is my note." %}

{% include tip.html content="This is my tip." %}

{% include warning.html content="This is my warning." %}

{% include important.html content="This is my important info." %}

These alerts leverage includes stored in the \_include folder. The `content` option is a parameter that you pass to the include. In the include, the parameter is passed like this:

```
{% raw %}<div markdown="span" class="alert alert-info" role="alert"><i class="fa fa-info-circle"></i> <b>Note:</b> {{include.content}}{% endraw %}</div>
```

The content in `content="This is my note."` gets inserted into the `{% raw %}{{include.content}}}{% endraw %}` part of the template. You can follow this same pattern to build additional includes. See this [Jekyll screencast on includes](http://jekyll.tips/jekyll-casts/includes/) or [this screencast](https://www.youtube.com/watch?v=TJcn_PJ2100) for more information.

## Callouts

There's another type of callout available called callouts. This format is typically used for longer callout that spans more than one or two paragraphs, but really it's just a stylistic preference whether to use an alert or callout.

Here's the syntax for a callout:

```
{% raw %}{% include callout.html content="This is my callout. It has a border on the left whose color you define by passing a type parameter. I typically use this style of callout when I have more information that I want to share, often spanning multiple paragraphs. " type="primary" %} {% endraw %}
```

Here's the result:

{% include callout.html content="This is my callout. It has a border on the left whose color you define by passing a type parameter. I typically use this style of callout when I have more information that I want to share, often spanning multiple paragraphs." type="primary" %}

The available properties for callouts are as follows:

| Property | description |
|-------|--------|
| content | The content for the callout. |
| type | The style for the callout. Options are `danger`, `default`, `primary`, `success`, `info`, and `warning`.|

The types just define the color of the left border. Each of these callout types get inserted as a class name in the callout template. These class names correspond with styles in Bootstrap. These classes are common Bootstrap class names whose style attributes differ depending on your Bootstrap theme and style definitions.

Here's an example of each different type of callout:

{% include callout.html content="This is my **danger** type callout. It has a border on the left whose color you define by passing a type parameter." type="danger" %}

{% include callout.html content="This is my **default** type callout. It has a border on the left whose color you define by passing a type parameter." type="default" %}

{% include callout.html content="This is my **primary** type callout. It has a border on the left whose color you define by passing a type parameter." type="primary" %}

{% include callout.html content="This is my **success** type callout. It has a border on the left whose color you define by passing a type parameter." type="success" %}

{% include callout.html content="This is my **info** type callout. It has a border on the left whose color you define by passing a type parameter." type="info" %}

{% include callout.html content="This is my **warning** type callout. It has a border on the left whose color you define by passing a type parameter." type="warning" %}

Now that in contrast to alerts, callouts don't include the alert word (note, tip, warning, or important). You have to manually include it inside `content` if you want it.

To include paragraph breaks, use `<br/><br/>` inside the callout:

```
{% raw %}{% include callout.html content="**Important information**: This is my callout. It has a border on the left whose color you define by passing a type parameter. I typically use this style of callout when I have more information that I want to share, often spanning multiple paragraphs. <br/><br/>Here I am starting a new paragraph, because I have lots of information to share. You may wonder why I'm using line breaks instead of paragraph tags. This is because Kramdown processes the Markdown here as a span rather than a div (for whatever reason). Be grateful that you can be using Markdown at all inside of HTML. That's usually not allowed in Markdown syntax, but it's allowed here." type="primary" %} {% endraw %}
```

Here's the result:

{% include callout.html content="**Important information**: This is my callout. It has a border on the left whose color you define by passing a type parameter. I typically use this style of callout when I have more information that I want to share, often spanning multiple paragraphs. <br/><br/>Here I am starting a new paragraph, because I have lots of information to share. You may wonder why I'm using line breaks instead of paragraph tags. This is because Kramdown processes the Markdown here as a span rather than a div (for whatever reason). Be grateful that you can be using Markdown at all inside of HTML. That's usually not allowed in Markdown syntax, but it's allowed here." type="primary" %}

## Use Liquid variables inside parameters with includes

Suppose you have a product name or some other property that you're storing as a variable in your configuration file (\_config.yml), and you want to use this variable in the `content` parameter for your alert or callout. You will get an error if you use Liquid syntax inside a include parameter. For example, this syntax will produce an error:

```
{%raw%}{% include note.html content="The {{site.company}} is pleased to announce an upcoming release." %}{%endraw%}
```

The error will say something like this:

```
Liquid Exception: Invalid syntax for include tag. File contains invalid characters or sequences: ... Valid syntax: {%raw%}{% include file.ext param='value' param2='value' %}{%endraw%}
```

To use variables in your include parameters, you must use the "variable parameter" approach. First you use a `capture` tag to capture some content. Then you reference this captured tag in your include. Here's an example.

In my site configuration file (\_congfig.yml), I have a property called `company_name`.

```yaml
company_name: Your company
```

I want to use this variable in my note include.

First, before the note I capture the content for my note's include like this:

```liquid
{%raw%}{% capture company_note %}The {{site.company_name}} company is pleased to announce an upcoming release.{% endcapture %}{%endraw%}
```

Now reference the `company_note` in your `include` parameter like this:

```
{%raw%}{% include note.html content=company_note}{%endraw%}
```

Here's the result:

{% capture company_note %}The {{site.company_name}} is pleased to announce an upcoming release.{% endcapture %}
{% include note.html content=company_note %}

Note the omission of quotation marks with variable parameters.

Also note that instead of storing the variable in your site's configuration file, you could also put the variable in your page's frontmatter. Then instead of using `{%raw%}{{site.company_name}}{%endraw%}` you would use `{%raw%}{{page.company_name}}{%endraw%}`.

## Markdown inside of callouts and alerts

You can use Markdown inside of callouts and alerts, even though this content actually gets inserted inside of HTML in the include. This is one of the advantages of kramdown Markdown. The include template has an attribute of `markdown="span"` that allows for the processor to parse Markdown inside of HTML.

## Validity checking

If you have some of the syntax wrong with an alert or callout, you'll see an error when Jekyll tries to build your site. The error may look like this:

```
{% raw %}Liquid Exception: Invalid syntax for include tag: content="This is my **info** type callout. It has a border on the left whose color you define by passing a type parameter. type="info" Valid syntax: {% include file.ext param='value' param2='value' %} in mydoc/mydoc_alerts.md {% endraw %}
```

These errors are a good thing, because it lets you know there's an error in your syntax. Without the errors, you may not realize that you coded something incorrectly until you see the lack of alert or callout styling in your output.

In this case, the quotation marks aren't set correctly. I forgot the closing quotation mark for the content parameter include.

## Blast a warning to users on every page

If you want to blast a warning to users on every page, add the alert or callout to the \_layouts/page.html page right below the frontmatter. Every page using the page layout (all, by defaut) will show this message.

{% include links.html %}
