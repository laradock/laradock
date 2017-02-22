---
title: Excluding files
tags: [single_sourcing]
last_updated: July 3, 2016
keywords: exclusion, separating outputs, removing files from outputs
summary: "By default, all the files in your Jekyll project are included in the output (this differs from DITA projects, which don't include files unless noted on the map). If you're single sourcing, you'll need to exclude the files that shouldn't be included in the output. The sidebar doesn't control inclusion or exclusion."
sidebar: mydoc_sidebar
permalink: mydoc_exluding_files.html
folder: mydoc
---


## About exclusion
By default, all files in your project are included in your output (regardless of whether they're listed in the sidebar_doc.yml file or not). To exclude files, note them in the `exclude` section in the configuration file. Here's a sample:

```

exclude:
  - mydoc_writers_*
  - bower_components
  - Gemfile
```

If you have different outputs for your site, you'll want to customize the exclude sections in your various configuration files.

## Exclude strategies
Here's the process I recommend. Put all files in the root directory of your project. Suppose one project's name is alpha and the other is beta. Then name each file as follows:

* alpha_sample.html
* beta_sample.html

In your exclude list for your beta project, specify it as follows:

```
exclude:
- alpha_*
```

In your exclude list for your alpha project, specify it as follows:

```
exclude:
- beta_*
```

If you have more sophisticated exclusion, add another level to your file names. For example, if you have different programming languages you want to filter by, add this:

* alpha_java_sample.html
* alpha_cpp_sample.html

Then you exclude files for your Alpha C++ project as follows:

```
exclude:

- alpha_java_*
- beta_*
```

And you exclude files for your Alpha Java project as follows:

```
exclude:

- alpha_cpp_*
- alpha_beta_*
```

When you exclude folders, include the trailing slash at the end of the folder name:

```
exclude:
- images/alpha/
```

There isn't a way to automatically exclude anything. By default, everything is included unless you explicitly list it under the exclude section.

## Excluding draft content

If you're working on a draft, put it inside the \_drafts folder or add `published: false` in the frontmatter. The \_drafts folder is excluded by default, so you don't have to specify it in your exclude list.

## Limitations

What if a file should appear in two projects but not the third? This can get tricky. For some files, rather than using a wildcard, you may need to manually specify the entire filename that you're excluding instead of excluding it by way of a wildcard pattern.

{% include links.html %}
