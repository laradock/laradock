---
title: Images
tags: [formatting]
keywords: images, screenshots, vectors, svg, markdown syntax
last_updated: July 3, 2016
summary: "Store images in the images folder and use the image.html include to insert images. This include has several options, including figcaptions, that extract the content from the formatting."
sidebar: mydoc_sidebar
permalink: mydoc_images.html
folder: mydoc
---

## Image Include Template

Instead of using Markdown or HMTL syntax directly in your page for images, the syntax for images has been extracted out into an image include that allows you to pass the parameters you need. Include the image.html like this:

```liquid
{% raw %}
{% include image.html file="jekyll.png" url="http://jekyllrb.com" alt="Jekyll" caption="This is a sample caption" %"}
{% endraw %}
```

The available include properties are as follows:

| Property | description |
|-------|--------|
| file | The name of the file. Store it in the /images folder. If you want to organize your images in subfolders, reference the subfolder path here, like this: `mysubfolder/jekyllrb.png` |
| url | Whether to link the image to a URL |
| alt | Alternative image text for accessibility and SEO |
| caption | A caption for the image |
| max-width | a maximum width for the image (in pixels). Just specify the number, not px.|

The properties of the include get populated into the image.html template.

Here's the result:

{% include image.html file="jekyll.png" url="http://jekyllrb.com" alt="Jekyll" caption="This is a sample caption" %}



## Inline image includes

For inline images, such as with a button that you want to appear inline with text, use the inline_image.html include, like this:

```liquid
Click the **Android SDK Manager** button {%raw%}{% include inline_image.html
file="androidsdkmanagericon.png" alt="SDK button" %}{%endraw%}
```

Click the **Android SDK Manager** button {% include inline_image.html file="androidsdkmanagericon.png" alt="SDK button" %}

The inline_image.html include properties are as follows:

| Property | description |
|-------|--------|
| file | The name of the file |
| type | The type of file (png, svg, and so on) |
| alt | Alternative image text for accessibility and SEO |

## SVG Images

You can also embed SVG graphics. If you use SVG, you need to use the HTML syntax so that you can define a width/container for the graphic. Here's a sample embed:

```liquid
{% raw %}{% include image.html file="helpapi.svg" url="http://idratherbewriting.com/documentation-theme-jekyll/mydoc_help_api/" alt="Building a Help API" caption="A help API provides a JSON file at a web URL with content that can be pulled into different targets" max-width="600" %}{% endraw %}
```

Here's the result:


{% include image.html file="helpapi.svg" url="http://idratherbewriting.com/documentation-theme-jekyll/mydoc_help_api/" alt="Building a Help API" caption="A help API provides a JSON file at a web URL with content that can be pulled into different targets" max-width="600" %}

The stylesheet even handles SVG display in IE 9 and earlier through the following style (based on this [gist](https://gist.github.com/larrybotha/7881691)):

```css
/*
 * Let's target IE to respect aspect ratios and sizes for img tags containing SVG files
 *
 * [1] IE9
 * [2] IE10+
 */
/* 1 */
.ie9 img[src$=".svg"] {
    width: 100%;
}
/* 2 */
@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    img[src$=".svg"] {
        width: 100%;
    }
}
```

Also, if you're working with SVG graphics, note that Firefox does not support SVG fonts. In Illustrator, when you do a Save As with your AI file and choose SVG, to preserve your fonts, in the Font section, select "Convert to outline" as the Type (don't choose SVG in the Font section).

Also, remove the check box for "Use textpath element for text on a path". And select "Embed" rather than "Link." The following screenshot shows the settings I use. Your graphics will look great in Firefox.

{% include image.html file="illustratoroptions.png" caption="Essential options for SVG with Illustrator" %}

{% include links.html %}
