---
date: 2016-03-08T21:07:13+01:00
title: Material for Hugo
type: index
weight: 0
---

## Beautiful documentation

Material is a theme for [Hugo](https://gohugo.io), a fast and flexible static site generator. It is built using Google's [material design](https://www.google.com/design/spec/material-design/introduction.html)
guidelines, fully responsive, optimized for touch and pointer devices as well
as all sorts of screen sizes.

![Material Screenshot](/images/screen.png)

Material is very lightweight – it is built from scratch using Javascript and
CSS that weighs less than 30kb (minified, gzipped and excluding Google Fonts
and Analytics). Yet, it is highly customizable and degrades gracefully in older
browsers.

## Quick start

Install with `git`:

```sh
git clone git@github.com:digitalcraftsman/hugo-material-docs.git themes/hugo-material-docs
```

## Features

- Beautiful, readable and very user-friendly design based on Google's material
  design guidelines, packed in a full responsive template with a well-defined
  and [easily customizable color palette]({{< relref "getting-started/index.md#changing-the-color-palette" >}}), great typography, as well as a
  beautiful search interface and footer.

- Well-tested and optimized Javascript and CSS including a cross-browser
  fixed/sticky header, a drawer that even works without Javascript using
  the [checkbox hack](http://tutorialzine.com/2015/08/quick-tip-css-only-dropdowns-with-the-checkbox-hack/) with fallbacks, responsive tables that scroll when
  the screen is too small and well-defined print styles.

- Extra configuration options like a [project logo]({{< relref "getting-started/index.md#adding-a-logo" >}}), links to the authors
  [GitHub and Twitter accounts]({{< relref "getting-started/index.md#adding-a-github-and-twitter-account" >}}) and display of the amount of stars the
  project has on GitHub.

- Web application capability on iOS – when the page is saved to the homescreen,
  it behaves and looks like a native application.

See the [getting started guide]({{< relref "getting-started/index.md" >}}) for instructions how to get
it up and running.

## Acknowledgements

Last but not least a big thank you to [Martin Donath](https://github.com/squidfunk). He created the original [Material theme](https://github.com/squidfunk/mkdocs-material) for Hugo's companion [MkDocs](http://www.mkdocs.org/). This port wouldn't be possible without him.

Furthermore, thanks to [Steve Francia](https://gihub.com/spf13) for creating Hugo and the [awesome community](https://github.com/spf13/hugo/graphs/contributors) around the project.
