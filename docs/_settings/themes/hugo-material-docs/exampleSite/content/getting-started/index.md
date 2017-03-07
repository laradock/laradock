---
date: 2016-03-09T00:11:02+01:00
title: Getting started
weight: 10
---

## Installation

### Installing Hugo

Hugo itself is just a single binary without dependencies on expensive runtimes like Ruby, Python or PHP and without dependencies on any databases. You just need to download the [latest version](https://github.com/spf13/hugo/releases). For more information read the official [installation guides](http://gohugo.io/overview/installing/).

Let's make sure Hugo is set up as expected. You should see a similar version number in your terminal:

```sh
hugo version
# Hugo Static Site Generator v0.15 BuildDate: 2016-01-03T12:47:47+01:00
```

### Installing Material

Next, assuming you have Hugo up and running the `hugo-material-docs` theme can be installed with `git`:

```sh
# create a new Hugo website
hugo new site my-awesome-docs

# move into the themes folder of your website
cd my-awesome-docs/themes/

# download the theme
git clone git@github.com:digitalcraftsman/hugo-material-docs.git
```

## Setup

Next, take a look in the `exampleSite` folder at `themes/hugo-material-docs/`. This directory contains an example config file and the content that you are currently reading. It serves as an example setup for your documentation.

Copy at least the `config.toml` in the root directory of your website. Overwrite the existing config file if necessary.

Hugo includes a development server, so you can view your changes as you go -
very handy. Spin it up with the following command:

``` sh
hugo server
```

Now you can go to [localhost:1313](http://localhost:1313) and the Material
theme should be visible. You can now start writing your documentation, or read
on and customize the theme through some options.

## Configuration

Before you are able to deploy your documentation you should take a few minute to adjust some information in the `config.toml`. Open the file in an editor:

```toml
baseurl = "https://example.com/"
languageCode = "en-us"
title = "Material Docs"

[params]
  # General information
  author = "Digitalcraftsman"
  description = "A material design theme for documentations."
  copyright = "Released under the MIT license"
```

## Options

### Github integration

If your project is hosted on GitHub, add the repository link to the
configuration. If the `provider` equals **GitHub**, the Material theme will
add a download and star button, and display the number of stars:

```toml
[params]
  # Repository
  provider = "GitHub"
  repo_url = "https://github.com/digitalcraftsman/hugo-material-docs"
```

### Adding a version

In order to add the current version next to the project banner inside the
drawer, you can set the variable `version`:

```toml
[params]
  version = "1.0.0"
```

This will also change the link behind the download button to point to the
archive with the respective version on GitHub, assuming a release tagged with
this exact version identifier.

### Adding a logo

If your project has a logo, you can add it to the drawer/navigation by defining
the variable `logo`. Ideally, the image of your logo should have
rectangular shape with a minimum resolution of 128x128 and leave some room
towards the edges. The logo will also be used as a web application icon on iOS.
Either save your logo somewhere in the `static/` folder and reference the file relative to this location or use an external URL:

```toml
[params]
  logo = "images/logo.png"
```

### Adding a custom favicon

Favicons are small small icons that are displayed in the tabs right next to the title of the current page. As with the logo above you need to save your favicon in `static/` and link it relative to this folder or use an external URL:

```toml
[params]
  favicon = "favicon.ico"
```

### Google Analytics

You can enable Google Analytics by replacing `UA-XXXXXXXX-X` with your own tracking code.

```toml
googleAnalytics = "UA-XXXXXXXX-X"
```

### Small tweaks

This theme provides a simple way for making small adjustments, that is changing
some margins, centering text, etc. The `custom_css` and `custom_js` option allow you to add further CSS and JS files. They can either reside locally in the `/static` folder or on an external server, e.g. a CDN. In both cases use either the relative path to `/static` or the absolute URL to the external ressource.


```toml
[params]
  # Custom assets
  custom_css = [
    "foo.css",
    "bar.css"
  ]

  custom_js  = ["buzz.js"]
```

### Changing the color palette

Material defines a default hue for every primary and accent color on Google's
material design [color palette][]. This makes it very easy to change the overall look of the theme. Just set the variables `palette.primary` and `palette.accent` to one of the colors defined in the palette:

```toml
[params.palette]
  primary = "red"
  accent  = "light-green"
```

Color names can be written upper- or lowercase but must match the names of the
material design [color palette](http://www.materialui.co/colors). Valid values are: _red_, _pink_, _purple_, _deep purple_, _indigo_, _blue_, _light-blue_, _cyan_, _teal_, _green_, _light-green_,
_lime_, _yellow_, _amber_, _orange_, _deep-orange_, _brown_, _grey_ and
_blue-grey_. The last three colors can only be used as a primary color.

![Color palette](/images/colors.png)

If the color is set via this configuration, an additional CSS file called
`palettes.css` is included that defines the color palettes.

### Changing the font family

Material uses the [Ubuntu font family](http://font.ubuntu.com) by default, specifically the regular sans-serif type for text and the monospaced type for code. Both fonts are loaded from [Google Fonts](https://www.google.com/fonts) and can be easily changed to other fonts, like for example Google's own [Roboto font](https://www.google.com/fonts/specimen/Roboto):

```toml
[params.font]
  text = "Roboto"
  code = "Roboto Mono"
```

The text font will be loaded in font-weights 400 and **700**, the monospaced
font in regular weight.

### Syntax highlighting

This theme uses the popular [Highlight.js](https://highlightjs.org/) library to colorize code examples. The default theme is called `Github` with a few small tweaks. You can link our own theme if you like. Again, store your stylesheet in the `static/` folder and set the relative path in the config file:

```toml
[params]
  # Syntax highlighting theme
  highlight_css  = "path/to/theme.css"
```

### Adding a GitHub and Twitter account

If you have a GitHub and/or Twitter account, you can add links to your
accounts to the drawer by setting the variables `github` and
`twitter` respectively:

``` toml
[social]
  twitter = ""
  github  = "digitalcraftsman"
```

### Adding menu entries

Once you created your first content files you can link them manually in the sidebar on the left. A menu entry has the following schema:

```toml
[[menu.main]]
  name   = "Material"
  url    = "/"
  weight = 0
  pre    = ""
```

`name` is the title displayed in the menu and `url` the relative URL to the content. The `weight` attribute allows you to modify the order of the menu entries. A menu entry appears further down the more weight you add. The `pre` attribute is optional and allows you to *pre*pend elements to a menu link, e.g. an icon.

Instead of just linking a single file you can enhance the sidebar by creating a nested menu. This way you can list all pages of a section instead of linking them one by one (without nesting).

You need extend the frontmatter of each file content file in a section slightly. The snippet below registers this content file as 'child' of a menu entry that already exists.

```yaml
menu:
  main:
    parent: Material
    identifier: <link name>
    weight: 0
```

`main` specifies to which menu the content file should be added. `main` is the only menu in this theme by default. `parent` let's you register this content file to an existing menu entry, in this case the `Material` link. Note that the parent in the frontmatter needs to match the name in `config.toml`.

`identifier` is the link that is shown in the menu. Ideally you choose the same name for the `identifier` and the `title` of the page. Again, `weight` allows you to change the order of the nested links in a section.

### Markdown extensions

Hugo uses [Blackfriday](https://github.com/russross/blackfriday) to process your content. For a detailed description of all options take a look at the [Blackfriday configuration](http://gohugo.io/overview/configuration/#configure-blackfriday-rendering) section in the Hugo documentation.

```toml
[blackfriday]
  smartypants = true
  fractions = true
  smartDashes = true
  plainIDAnchors = true
```
