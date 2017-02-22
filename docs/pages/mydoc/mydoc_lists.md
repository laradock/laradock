---
title: Lists
keywords: bulleted lists, numbered lists
tags: [formatting]
summary: "This page shows how to create both bulleted and numbered lists"
sidebar: mydoc_sidebar
permalink: mydoc_lists.html
---

## Bulleted Lists

This is a bulleted list:

```
*  first item
*  second item
*  third item
```

**Result:**

*  first item
*  second item
*  third item


## Numbered list

This is a simple numbered list:

```
1.  First item.
1.  Second item.
1.  Third item.
```

**Result:**

1.  First item.
1.  Second item.
1.  Third item.

You can use whatever numbers you want &mdash; when the Markdown filter processes the content, it will assign the correct numbers to the list items.

## Complex Lists

Here's a more complex list:

```
1.  Sample first item.

    * sub-bullet one
    * sub-bullet two

2.  Continuing the list

    1. sub-list numbered one
    2. sub-list numbered two

3.  Another list item.
```

**Result:**

1.  Sample first item.

    * sub-bullet one
    * sub-bullet two

2.  Continuing the list

    1. sub-list numbered one
    2. sub-list numbered two

3.  Another list item.

## Another Complex List

Here's a list with some intercepting text:

```
1.  Sample first item.

    This is a result statement that talks about something....

2.  Continuing the list

    {% include note.html content="Remember to do this. If you have \"quotes\", you must escape them." %}

    Here's a list in here:

    * first item
    * second item

3.  Another list item.

    ```js
    function alert("hello");
    ```

4.  Another item.
```

**Result:**

1.  Sample first item.

    This is a result statement that talks about something....

2.  Continuing the list

    {% include note.html content="Remember to do this. If you have \"quotes\", you must escape them." %}

    Here's a list in here:

    * first item
    * second item

3.  Another list item.

    ```js
    function alert("hello");
    ```

4.  Another item.

### Key Principle to Remember with Lists

The key principle is to line up the first character after the dot following the number:

{% include image.html file="liningup.png" caption="Lining up the left edge ensures the list stays in tact." %}

For the sake of simplicity, use two spaces after the dot for numbers 1 through 9. Use one space for numbers 10 and up. If any part of your list doesn't align symmetrically on this left edge, the list will not render correctly. Also note that this is characteristic of kramdown-flavored Markdown and may not yield the same results in other Markdown flavors.
