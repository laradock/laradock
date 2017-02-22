---
title: Conditional logic
tags: [single_sourcing]
keywords: if else logic, conditions, conditional attributes, conditional filtering
last_updated: July 3, 2016
summary: "You can implement advanced conditional logic that includes if statements, or statements, unless, and more. This conditional logic facilitates single sourcing scenarios in which you're outputting the same content for different audiences."
sidebar: mydoc_sidebar
permalink: mydoc_conditional_logic.html
folder: mydoc
---

## About Liquid and conditional statements
If you want to create different outputs for different audiences, you can do all of this using a combination of Jekyll's Liquid markup and values in your configuration file. This is how I previously configured the theme. I had different configuration files for each output. Each configuration file specified different values for product, audience, version, and so on. Then I had different build processes that would leverage the different configuration files. It seemed like a perfect implementation of DITA-like techniques with Jekyll.

But I soon found that having lots of separate outputs for a project was undesirable. If you have 10 different outputs that have different nuances for different audiences, it's hard to manage and maintain. In this latest version of the theme, I consolidated all information into the same output to explicitly do away with the multi-output approach.

As such, the conditional logic won't have as much play as it previously did. Instead of conditions, you'll probably want to incorporate [navtabs](mydoc_navtabs) to split up the information.

However, you can still of course use conditional logic as needed.

{% include tip.html content="Definitely check out [Liquid's documentation](http://docs.shopify.com/themes/liquid-documentation/basics) for more details about how to use operators and other liquid markup. The notes here are a small, somewhat superficial sample from the site." %}

## Where to store filtering values

You can filter content based on values that you have set either in your page's frontmatter, a config file, or in a file in your \_data folder. If you set the attribute in your config file, you need to restart the Jekyll server to see the changes. If you set the value in a file in your \_data folder or page frontmatter, you don't need to restart the server when you make changes.

## Conditional logic based on config file value

Here's an example of conditional logic based on a value in the page's frontmatter. Suppose you have the following in your frontmatter:

```
platform: mac
```

On a page in my site (it can be HTML or markdown), you can conditionalize content using the following:

{% raw %}
```liquid
{% if page.platform == "mac" %}
Here's some info about the Mac.
{% elsif page.platform == "windows" %}
Here's some info about Windows ...
{% endif %}
```
{% endraw %}

This uses simple `if-elsif` logic to determine what is shown (note the spelling of `elsif`). The `else` statement handles all other conditions not handled by the `if` statements.

Here's an example of `if-else` logic inside a list:

{% raw %}
```liquid
To bake a casserole:

1. Gather the ingredients.
{% if page.audience == "writer" %}
2. Add in a pound of meat.
{% elsif page.audience == "designer" %}
3. Add in an extra can of beans.
{% endif %}
3. Bake in oven for 45 min.
```
{% endraw %}

You don't need the `elsif` or `else`. You could just use an `if` (but be sure to close it with `endif`).

## Or operator

You can use more advanced Liquid markup for conditional logic, such as an `or` command. See [Shopify's Liquid documentation](http://docs.shopify.com/themes/liquid-documentation/basics/operators) for more details.

For example, here's an example using `or`:

{% raw %}
```liquid
{% if page.audience contains "vegan" or page.audience == "vegetarian" %}
    Then run this...
{% endif %}
```
{% endraw %}

Note that you have to specify the full condition each time. You can't shorten the above logic to the following:

{% raw %}
```liquid
{% if page.audience contains "vegan" or "vegetarian" %}
    // run this.
{% endif %}
```
{% endraw %}

This won't work.

## Unless operator

You can also use `unless` in your logic, like this:

{% raw %}
```liquid
{% unless site.output == "pdf" %}
...do this
{% endunless %}
```
{% endraw %}

When figuring out this logic, read it like this: "Run the code here *unless* this condition is satisfied."."

Don't read it the other way around or you'll get confused. (It's *not* executing the code only if the condition is satisfied.)

## Storing conditions in the \_data folder

Here's an example of using conditional logic based on a value in a data file:

{% raw %}
```liquid
{% if site.data.options.output == "alpha" %}
show this content...
{% elsif site.data.options.output == "beta" %}
show this content...
{% else %}
this shows if neither of the above two if conditions are met.
{% endif %}
```
{% endraw %}

To use this, I would need to have a \_data folder called options where the `output` property is stored.

## Specifying the location for \_data

You can also specify a `data_source` for your data location in your configuration file. Then you aren't limited to simply using `_data` to store your data files.

For example, suppose you have 2 projects: alpha and beta. You might store all the data files for alpha inside data_alpha, and all the data files for beta inside data_beta.

In your alpha configuration file, specify the data source like this:

```
data_source: data_alpha
```

Then create a folder called \_data_alpha.

For your beta configuration file, specify the data source like this:

```
data_source: data_beta
```

Then create a folder called \_data_beta.


## Conditions versus includes

If you have a lot of conditions in your text, it can get confusing. As a best practice, whenever you insert an `if` condition, add the `endif` at the same time. This will reduce the chances of forgetting to close the if statement. Jekyll won't build if there are problems with the liquid logic.

If your text is getting busy with a lot of conditional statements, consider putting a lot of content into includes so that you can more easily see where the conditions begin and end.

{% include links.html %}
