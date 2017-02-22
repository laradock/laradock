---
title: Posts
tags: [getting_started, formatting, content_types]
keywords: posts, blog, news, authoring, exclusion, frontmatter
last_updated: Feb 25, 2016
summary: "You can use posts when you want to create blogs or news type of content."
sidebar: mydoc_sidebar
permalink: mydoc_posts.html
folder: mydoc
---

hello there. 
 
## About posts

Posts are typically used for blogs or other news information because they contain a date and are sorted in reverse chronological order.

You create a post by adding a file in the \_posts folder that is named yyyy-mm-dddd-permalink.md, which might be 2016-02-25-my-latest-updates.md. You can use any number of subfolders here that you want.

Posts use the post.html layout in the \_layouts folder when you are viewing the post.

The news.html file in the root directory shows a reverse chronological listing of the 10 latest posts

## Allowed frontmatter

The frontmatter you can use with posts is as follows:

---
title: My sample post
keywords: pages, authoring, exclusion, frontmatter
summary: "This is some summary frontmatter for my sample post."
sidebar: mydoc_sidebar
permalink: mydoc_pages.html
tags: content_types
---


| Frontmatter | Required? | Description |
|-------------|-------------|-------------|
| **title** | Required | The title for the page |
| **tags** | Optional | Tags for the page. Make all tags single words, with underscores if needed. Separate them with commas. Enclose the whole list within brackets. Also, note that tags must be added to \_data/tags_doc.yml to be allowed entrance into the page. This prevents tags from becoming somewhat random and unstructured. You must create a tag page for each one of your tags following the sample pattern in the tabs folder. (Tag pages aren't automatically created.)  |
| **keywords** | Optional | Synonyms and other keywords for the page. This information gets stuffed into the page's metadata to increase SEO. The user won't see the keywords, but if you search for one of the keywords, it will be picked up by the search engine.  |
| **summary** | Optional | A 1-2 word sentence summarizing the content on the page. This gets formatted into the summary section in the page layout. Adding summaries is a key way to make your content more scannable by users (check out [Jakob Nielsen's site](http://www.nngroup.com/articles/corporate-blogs-front-page-structure/) for a great example of page summaries.) The only drawback with summaries is that you can't use variables in them. |
| **permalink**| Required | This theme uses permalinks to facilitate the linking. You specify the permalink want for the page, and the \_site output will put the page into the root directory when you publish. Follow the same convention here as you do with page permalinks -- list the file name followed by the .html extension. |


{% include links.html %}
