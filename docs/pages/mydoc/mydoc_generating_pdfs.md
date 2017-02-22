---
title: Generating PDFs
permalink: mydoc_generating_pdfs.html
tags: [publishing, single_sourcing, content_types]
keywords: PDF, prince, prince XML, ant, xsl fo
last_updated: July 3, 2016
summary: "You can generate a PDF from your Jekyll project. You do this by creating a web version of your project that is printer friendly. You then use utility called Prince to iterate through the pages and create a PDF from them. It works quite well and gives you complete control to customize the PDF output through CSS, including page directives and dynamic tags from Prince."
sidebar: mydoc_sidebar
folder: mydoc
---


## PDF overview
This process for creating a PDF relies on Prince XML to transform the HTML content into PDF. Prince costs about $500 per license. That might seem like a lot, but if you're creating a PDF, you're probably working for a company that sells a product, so you likely have access to some resources.

The basic approach is to generate a list of all pages that need to be added to the PDF, and then add leverage Prince to package them up into a PDF.

It may seem like the setup is somewhat cumbersome, but it doesn't take long. Once you set it up, building a pdf is just a matter of running a couple of commands.

Also, creating a PDF this way gives you a lot more control and customization capabilities than with other methods for creating PDFs. If you know CSS, you can entirely customize the output.

## Demo

You can see an example of the finished product here:

<a target="_blank" class="noCrossRef" href="{{ "pdf/mydoc.pdf"}}"><button type="button" class="btn btn-default" aria-label="Left Align"><span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span> PDF Download</button></a>

## 1. Set up Prince

Download and install [Prince](http://www.princexml.com/doc/installing/).

You can install a fully functional trial version. The only difference is that the title page will have a small Prince PDF watermark.

## 2. Create a new configuration file for each of your PDF targets

The PDF configuration file will build on the settings in the regular configuration file but will some additional fields. Here's the configuration file for the mydoc product within this theme. This configuration file is located in the pdfconfigs folder.

```yaml
destination: _site/
url: "http://127.0.0.1:4010"
baseurl: "/mydoc-pdf"
port: 4010
output: pdf
product: mydoc
print_title: Jekyll theme for documentation — mydoc product
print_subtitle: version 5.0
output: pdf
defaults:
  -
    scope:
      path: ""
      type: "pages"
    values:
      layout: "page_print"
      comments: true
      search: true
```

{% include note.html content="Although you're creating a PDF, you must still build an HTML web target before running Prince. Prince will pull from the HTML files and from the file-list for the TOC." %}

Note that the default page layout specified by this configuration file is `page_print`. This layout strips out all the sections that shouldn't appear in the print PDF, such as the sidebar and top navigation bar.

Also note that there's a `output: pdf` toggle in case you want to make some of your content unique to PDF output. For example, you could add conditional logic that checks whether `site.output` is `pdf` or `web`. If it's `pdf`, then include information only for the PDF, and so on. If you're using nav tabs, you'll definitely want to create an alternative experience in the PDF.

In the configuration file, customize the values for the `print_title` and `print_subtitle` that you want. These will appear on the title page of the PDF.

## 3. Make sure your sidebar_doc.yml file has a titlepage.html and tocpage.html

There are two template pages in the root directory that are critical to the PDF:

* titlepage.html
* tocpage.html

These pages should appear in your sidebar YML file (in this product, mydoc_sidebar.yml):

```yaml
  - title:
    output: pdf
    type: frontmatter
    folderitems:
    - title:
      url: /titlepage/
      output: pdf
      type: frontmatter
    - title:
      url: /tocpage/
      output: pdf
      type: frontmatter
```

Leave these pages here in your sidebar. (The `output: pdf` property means they won't appear in your online TOC because the conditional logic of the sidebar.html checks whether `web` is equal to `pdf` or not before including the item in the web version of the content.)

The code in the tocpage.html is mostly identical to that of the sidebar.html page. This is essential for Prince to create the page numbers correctly with cross references.

There's another file (in the root directory of the theme) that is critical to the PDF generation process: prince-list.txt. This file simply iterates through the items in your sidebar and creates a list of links. Prince will consume the list of links from prince-list.txt and create a running PDF that contains all of the pages listed, with appropriate cross references and styling for them all.

{% include note.html content="If you have any files that you do not want to appear in the PDF, add <code>output: web</code> (rather than <code>output: pdf</code>) in the list of attributes in your sidebar. The prince-list.txt file that loops through the mydoc_sidebar.yml file to grab the URLs of each page that should appear in the PDF will skip over any items that do not list <code>output: pdf</code> in the item attributes. For example, you might not want your tag archives to appear in the PDF, but you probably will want to list them in the online help navigation." %}

## 4. Customize your headers and footers

Open up the css/printstyles.css file and customize what you want for the headers and footers. At the very least, customize the email address (`youremail@domain.com`) that appears in the bottom left.

Exactly how the print styling works here is pretty nifty. You don't need to understand the rest of the content in this section unless you want to customize your PDFs to look different from what I've configured. But I'm adding this information here in case you want to understand how to customize the look and feel of the PDF output.

This style creates a page reference for a link:

{% raw %}
```css
a[href]::after {
    content: " (page " target-counter(attr(href), page) ")"
}
```

You don't want cross references for any link that doesn't reference another page, so this style specifies that the content after should be blank:

```css
a[href*="mailto"]::after, a[data-toggle="tooltip"]::after, a[href].noCrossRef::after {
    content: "";
}
```
{% endraw %}

{% include tip.html content="If you have a link to a file download, or some other link that shouldn't have a cross reference (such as link used in JavaScript for navtabs or collapsible sections, for example, add `noCrossRef` as a class to the link to avoid having it say \"page 0\" in the cross reference." %}

This style specifies that after links to web resources, the URL should be inserted instead of the page number:

```css
a[href^="http:"]::after, a[href^="https:"]::after {
    content: " (" attr(href) ")";
}
```

This style sets the page margins:

```css
@page {
    margin: 60pt 90pt 60pt 90pt;
    font-family: sans-serif;
    font-style:none;
    color: gray;

}
```

To set a specific style property for a particular page, you have to name the page. This allows Prince to identify the page.

First you add frontmatter to the page that specifies the type. For the titlepage.html, here's the frontmatter:

```yaml
---
type: title
---
```

For the tocpage, here's the frontmatter:

```yaml
---
type: frontmatter
---
```

For the index.html page, we have this type tag (among others):

```yaml
---
type: first_page
---
```

The default_print.html layout will change the class of the `body` element based on the type value in the page's frontmatter:

{% raw %}
```liquid
<body class="{% if page.type == "title"%}title{% elsif page.type == "frontmatter" %}frontmatter{% elsif page.type == "first_page" %}first_page{% endif %} print">
```
{% endraw %}

Now in the css/printstyles.css file, you can assign a page name based on a specific class:

```css
body.title { page: title }
```

This means that for content inside of `body class="title"`, we can style this page in our stylesheet using `@page title`.

Here's how that title page is styled:

```css
@page title {
    @top-left {
        content: " ";
    }
    @top-right {
        content: " "
    }
    @bottom-right {
        content: " ";
    }
    @bottom-left {
        content: " ";
    }
}
```

As you can see, we don't have any header or footer content, because it's the title page.

For the tocpage.html, which has the `type: frontmatter`, this is specified in the stylesheet:

```css
body.frontmatter { page: frontmatter }
body.frontmatter {counter-reset: page 1}


@page frontmatter {
    @top-left {
        content: prince-script(guideName);
    }
    @top-right {
        content: prince-script(datestamp);
    }
    @bottom-right {
        content: counter(page, lower-roman);
    }
    @bottom-left {
        content: "youremail@domain.com";   }
}
```

With `counter(page, lower-roman)`, we reset the page count to 1 so that the title page doesn't start the count. Then we also add some header and footer info. The page numbers start counting in lower-roman numerals.

Finally, for the first page (which doesn't have a specific name), we restart the counting to 1 again and this time use regular numbers.

```css
body.first_page {counter-reset: page 1}

h1 { string-set: doctitle content() }

@page {
    @top-left {
        content: string(doctitle);
        font-size: 11px;
        font-style: italic;
    }
    @top-right {
        content: prince-script(datestamp);
        font-size: 11px;
    }

    @bottom-right {
        content: "Page " counter(page);
        font-size: 11px;
    }
    @bottom-left {
        content: prince-script(guideName);
        font-size: 11px;
    }
}
```

You'll see some other items in there such as `prince-script`. This means we're using JavaScript to run some functions to dynamically generate that content. These JavaScript functions are located in the \_includes/head_print.html:

```js
<script>
    Prince.addScriptFunc("datestamp", function() {
        return "PDF last generated: {{ site.time | date: '%B %d, %Y' }}";
    });
</script>

<script>
    Prince.addScriptFunc("guideName", function() {
        return "{{site.print_title}} User Guide";
    });
</script>
```

There are a couple of Prince functions that are default functions from Prince. This gets the heading title of the page:

```js
        content: string(doctitle);
```

This gets the current page:

```js
        content: "Page " counter(page);
```

Because the theme uses JavaScript in the CSS, you have to add the `--javascript` tag in the Prince command (detailed later on this page).

## 5. Customize the PDF script

Duplicate the pdf-mydocf.sh file in the root directory and customize it for your specific configuration files.

```
echo 'Killing all Jekyll instances'
kill -9 $(ps aux | grep '[j]ekyll' | awk '{print $2}')
clear

echo "Building PDF-friendly HTML site for Mydoc ...";
jekyll serve --detach --config _config.yml,pdfconfigs/config_mydoc_pdf.yml;
echo "done";

echo "Building the PDF ...";
prince --javascript --input-list=_site/pdfconfigs/prince-list.txt -o _pdf/mydoc.pdf;
echo "done";
```

Note that the first part kills all Jekyll instances. This way you won't try to serve Jekyll at a port that is already occupied.

The `jekyll serve` command serves up the HTML-friendly PDF configurations for our two projects. This web version is where Prince will go to get its content.

The prince script issues a command to the Prince utility. JavaScript is enabled (`--javascript`), and we tell it exactly where to find the list of files (`--input-list`) &mdash; just point to the prince-list.txt file. Then we tell it where and what to output (`-o`).

Make sure that the path to the prince-list.txt is correct. For the output directory, I like to output the PDF file into my project's source (into the files folder). Then when I build the web output, the PDF is included and something I can refer to.

{% include note.html content="You might not want to include the PDF in your project files, since you're likely committing the PDF to Github and as a result saving the changes from one PDF version to another with each save." %}

## 6. Add conditions for your new builds in the sidebarconfigs.html file

In the \_includes/custom/sidebarconfigs.html file, there's a section that looks like this:

```
{% raw %}{% if site.product == "mydoc" %}
{% assign sidebar_pdf = site.data.sidebars.mydoc_sidebar.entries %}
{% endif %}

{% if site.product == "product1" %}
{% assign sidebar_pdf = site.data.sidebars.product1_sidebar.entries %}
{% endif %}

{% if site.product == "product2" %}
{% assign sidebar_pdf = site.data.sidebars.product2_sidebar.entries %}
{% endif %}{% endraw %}
```

Add your own condition here that points to your sidebar.

What this does is allow the prince-list.txt and toc.html files to use a variable for the sidebar (called `sidebar_pdf`) when iterating through the sidebar. Otherwise, you would need to create a unique prince-list.txt and toc.html file for each separate PDF output you have.

## 7. Add a download button for the PDF

You can add a download button for your PDF using some Bootstrap button code:

```html
<a target="_blank" class="noCrossRef" href="/pdf/mydoc.pdf"><button type="button" class="btn btn-default" aria-label="Left Align"><span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span> PDF Download</button></a>
```

Here's what that looks like:

<a target="_blank" class="noCrossRef" href={{ "pdf/mydoc.pdf"}}"><button type="button" class="btn btn-default" aria-label="Left Align"><span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span> PDF Download</button></a>

## JavaScript conflicts

If you have JavaScript on any of your pages, Prince will note errors in Terminal like this:

```
error: TypeError: value is not an object
```

However, the PDF will still build.

You need to conditionalize out any JavaScript from your PDF web output before building your PDFs. Make sure that the PDF configuration files have the `output: pdf` property.

Then surround the JavaScript with conditional tags like this:

{% raw %}
```
{% unless site.output == "pdf" %}
javascript content here ...
{% endunless %}
```
{% endraw %}

For more detail about using `unless` in conditional logic, see [Conditional logic][mydoc_conditional_logic]. What this code means is "run this code unless this value is the case."

## Overriding Bootstrap Print Styles

The theme relies on Bootstrap's CSS for styling. However, for print media, Bootstrap applies the following style:

```
@media print{*,:after,:before{color:#000!important;text-shadow:none!important;background:0 0!important;-webkit-box-shadow:none!important;box-shadow:none!important}
```
This is minified, but basically the `*` (asterisk) means select all, and applied the color #000 (black). As a result, the Bootstrap style strips out all color from the PDF (for Bootstrap elements).

This is problematic for code snippets that have syntax highlighting. I decided to remove this de-coloring from the print output. I commented out the Bootstrap style:

```
@media print{*,:after,:before{/*color:#000!important;*/text-shadow:none!important;/*background:0 0!important*/;-webkit-box-shadow:none!important;box-shadow:none!important}
```

If you update Bootrap, make sure you make this edit. (Sorry, admittedly I couldn't figure out how to simply overwrite the `*` selector with a later style.)

I did, however, remove the color from the alerts and lighten the background shading for `pre` elements. The printstyles.css has this setting.

{% include links.html %}
