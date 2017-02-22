---
title: Tables
tags: [formatting]
keywords: datatables, tables, grids, markdown, multimarkdown, jquery plugins
last_updated: July 16, 2016
datatable: true
summary: "You can format tables using either multimarkdown syntax or HTML. You can also use jQuery datatables (a plugin) if you need more robust tables."
sidebar: mydoc_sidebar
permalink: mydoc_tables.html
folder: mydoc
---

{% unless site.output == "pdf" %}
<script>
$(document).ready(function(){

    $('table.display').DataTable( {
        paging: true,
        stateSave: true,
        searching: true
    }
        );
});
</script>
{% endunless %}

## Multimarkdown Tables

You can use Multimarkdown syntax for tables. The following shows a sample:

```
| Priority apples | Second priority | Third priority |
|-------|--------|---------|
| ambrosia | gala | red delicious |
| pink lady | jazz | macintosh |
| honeycrisp | granny smith | fuji |
```

**Result:**

| Priority apples | Second priority | Third priority |
|-------|--------|---------|
| ambrosia | gala | red delicious |
| pink lady | jazz | macintosh |
| honeycrisp | granny smith | fuji |

{% include note.html content="You can't use block level tags (paragraphs or lists) inside Markdown tables, so if you need separate paragraphs inside a cell, use `<br/><br/>`." %}

## HTML Tables {#htmltables}

If you need a more sophisticated table syntax, use HTML syntax for the table. Although you're using HTML, you can use Markdown inside the table cells by adding `markdown="span"` as an attribute for the `td` tag, as shown in the following table. You can also control the column widths.

```html
<table>
<colgroup>
<col width="30%" />
<col width="70%" />
</colgroup>
<thead>
<tr class="header">
<th>Field</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td markdown="span">First column **fields**</td>
<td markdown="span">Some descriptive text. This is a markdown link to [Google](http://google.com). Or see [some link][mydoc_tags].</td>
</tr>
<tr>
<td markdown="span">Second column **fields**</td>
<td markdown="span">Some more descriptive text.
</td>
</tr>
</tbody>
</table>
```

**Result:**
<table>
<colgroup>
<col width="30%" />
<col width="70%" />
</colgroup>
<thead>
<tr class="header">
<th>Field</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td markdown="span">First column **fields**</td>
<td markdown="span">Some descriptive text. This is a markdown link to [Google](http://google.com). Or see [some link][mydoc_tags].</td>
</tr>
<tr>
<td markdown="span">Second column **fields**</td>
<td markdown="span">Some more descriptive text. 
</td>
</tr>
</tbody>
</table>

## jQuery datables

You also have the option of using a [jQuery datatable](https://www.datatables.net/), which gives you some more options. If you want to use a jQuery datatable, then add `datatable: true` in a page's frontmatter. This will load the right jQuery datatable scripts for the table on that page only (rather than loading the scripts on every page of the site.)

Also, you need to add this script to trigger the jQuery table on your page:

```js
<script>
$(document).ready(function(){

    $('table.display').DataTable( {
        paging: true,
        stateSave: true,
        searching: true
    }
        );
});
</script>
```

The available options for the datable are described in the [datatable documentation](https://www.datatables.net/manual/options), which is excellent.

Additionally, you must add a class of `display` to your tables. (You can change the class, but then you'll need to change the trigger above from `table.display` to whatever class you want to you. You might have different triggers with different options for different tables.)

Since Markdown doesn't allow you to add classes to tables, you'll need to use HTML for any datatables. Here's an example:

```html
<table id="sampleTable" class="display">
   <thead>
      <tr>
         <th>Parameter</th>
         <th>Description</th>
         <th>Type</th>
         <th>Default Value</th>
      </tr>
   </thead>
   <tbody>
      <tr>
         <td>Parameter 1</td>
         <td>Sample description
         </td>
         <td>Sample type</td>
         <td>Sample default value</td>
      </tr>
      <tr>
         <td>Parameter 2</td>
         <td>Sample description
         </td>
         <td>Sample type</td>
         <td>Sample default value</td>
      </tr>
    <tr>
       <td>Parameter 3</td>
       <td>Sample description
       </td>
       <td>Sample type</td>
       <td>Sample default value</td>
    </tr>
      <tr>
         <td>Parameter 4</td>
         <td>Sample description
         </td>
         <td>Sample type</td>
         <td>Sample default value</td>
      </tr>
   </tbody>
</table>
```

This renders to the following:

<table id="sampleTable" class="display">
   <thead>
      <tr>
         <th>Food</th>
         <th>Description</th>
         <th>Category</th>
         <th>Sample type</th>
      </tr>
   </thead>
   <tbody>
      <tr>
         <td>Apples</td>
         <td>A small, somewhat round and often red-colored, crispy fruit grown on trees.
         </td>
         <td>Fruit</td>
         <td>Fuji</td>
      </tr>
      <tr>
         <td>Bananas</td>
         <td>A long and curved, often-yellow, sweet and soft fruit that grows in bunches in tropical climates.
         </td>
         <td>Fruit</td>
         <td>Snow</td>
      </tr>
      <tr>
         <td>Kiwis</td>
         <td>A small, hairy-skinned sweet fruit with green-colored insides and seeds.
         </td>
         <td>Fruit</td>
         <td>Golden</td>
      </tr>
        <tr>
           <td>Oranges</td>
           <td>A spherical, orange-colored sweet fruit commonly grown in Florida and California.
           </td>
           <td>Fruit</td>
           <td>Navel</td>
        </tr>
   </tbody>
</table>

Notice a few features:

* You can keyword search the table. When you type a word, the table filters to match your word.
* You can sort the column order.
* You can page the results so that you show only a certain number of values on the first page and then require users to click next to see more entries.

Read more of the [datatable documentation](https://www.datatables.net/manual/options) to get a sense of the options you can configure. You should probably only use datatables when you have long, massive tables full of information.

{% include note.html content=" Try to keep the columns to 3 or 4 columns only. If you add 5+ columns, your table may create horizontal scrolling with the theme. Additionally, keep the column heading titles short." %}

{% include links.html %}
