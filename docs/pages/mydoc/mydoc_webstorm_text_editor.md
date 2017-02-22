---
title: WebStorm Text Editor
keywords: webstorm, sublime, markdown, atom, gnome, notepad ++, textpad, bbedit
last_updated: March 20, 2016
summary: "You can use a variety of text editors when working with a Jekyll project. WebStorm from IntelliJ offers a lot of project-specific features, such as find and replace, that make it ideal for working with tech comm projects."
sidebar: mydoc_sidebar
permalink: mydoc_webstorm_text_editor.html
folder: mydoc
---

## About text editors and WebStorm
There are a variety of text editors available, but I like WebStorm the best because it groups files into projects, which makes it easy to find all instances of a text string, to do find and replace operations across the project, and more.

If you decide to use WebStorm, here are a few tips on configuring the editor.

## Remove unnecessary plugins

By default, WebStorm comes packaged with a lot more functionality than you probably need. You can lighten the editor by removing some of the plugins. Go to **WebStorm > Preferences > Plugins** and clear the check boxes of plugins you don't need.

## Set default tab indent to 3 spaces instead of 4

You can set the way the tab works, and whether it uses spaces or a tab character. For details, see [Code Style. JavaScript](https://www.jetbrains.com/help/webstorm/2016.1/code-style-javascript.html?origin=old_help#d658997e132) in WebStorm's help.

On a Mac, go to **WebStorm > Preferences > Editor > Code Style > Other File Types**. Don't select the "Use tab character" check box. Set **4** for the **Tab size** and **Indent** check boxes.

On Windows, go to **File > Settings > Editor > Code Style > Other File Types** to access the same menu.

## Add the Markdown Support plugin

Since you'll be writing in Markdown, having color coding and other support for Markdown is important. Install the Markdown Support plugin by going to **WebStorm > Preferences > Plugins** and clicking **Install JetBrains Plugin**. Search for **Markdown Support**. You can also implement the Markdown Navigator plugin.

## Enable Soft Wraps (word wrapping)

Most likely you'll want to enable soft wraps, which wraps lines rather than extending them out forever and requiring you to scroll horizontally to see the text. To enable softwrapping, go to **WebStorm > Preferences > Editor > General** and see the Soft Wraps section. Select the **Use soft wraps in editor** check box.

## Exclude a directory

When you're searching for content, you don't want to edit any file that appears in the \_site directory. You can exclude a directory from Webstorm by right-clicking the directory and choosing **Mark Directory As** and then selecting **Excluded**.

## Set tabs to 4 spaces

You can set the default number of spaces a tab sets, including whether Webstorm uses a tab character or spaces. You want spaces, and you want to set this to default number of spaces to ```4```. Note that this is due to the way Kramdown handles the continuation 
of lists.

To set the indentation, see the "Tabs and Indents" topic in this [Code Style. Javascript](https://www.jetbrains.com/help/webstorm/2016.1/code-style-javascript.html?origin=old_help#d658997e132) topic in Webstorm's help.

## Shortcuts

It can help to learn a few key shortcuts:

|Command | Shortcuts |
|-------|--------|
| Shift + Shift | Allows you to find a file by searching for its name. |
| Shift + Command + F | Find in whole project. (WebStorm uses the term "Find in path".) |
| Shift + Command + R | Replace in whole project. (Again, WebStorm calls it "Replace in path.") |
| Command + F | Find on page |
| Shift + R | Replace on page |
| Right-click > Add to Favorites | Allows you to add files to a Favorites section, which expands below the list of files in the project pane. |
| Shift + tab | Applies outdenting (opposite of tabbing) |
| Shift + Function + F6 | Rename a file |
| Command + Delete | Delete a file |
| Command + 2 | Show Favorites pane |
| Shift + Option + F | Add to Favorites |

{{site.data.alerts.tip}} If these shortcut keys aren't working for you, make sure you have the "Max OS X 10.5+" keymap selected. Go to <b>WebStorm > Preferences > Keymap</b> and select it there. {{site.data.alerts.end}}

## Finding files

When I want to find a file, I browse to the file in the preview site and copy the page name in the URL. Then in Webstorm I press **Shift** twice and paste in the file name. The search feature automatically highlights the file I want, and I press **Enter**.

## Identifying changed files

When you have the Git and Github integration, changed files appear in blue. This lets you know what needs to be committed to your repository.

## Creating file templates

Rather than insert the frontmatter by hand each time, it's much faster to simply create a Jekyll template. To create a Jekyll template in WebStorm:

1. Right-click a file in the list of project files, and select **New > Edit File Templates**.

   If you don't see the Edit File Templates option, you may need to create a file template first. Go to **File > Default Settings > Editor > File and Code Templates**. Create a new file template with an md extension, and then close and restart WebStorm. Then repeat this step and you will see the File Templates option appear in the right context menu.

2. In the upper-left corner of the dialog box that appears, click the **+** button to create a new template.
3. Name it something like Jekyll page. Insert the frontmatter you want, and save it.

   To use the Jekyll template, when you create a new file in your WebStorm project, you can select your Jekyll file template.

## Disable pair quotes

By default, each time you type `'`, WebStorm will pair the quote (creating two quotes). You can disable this by going to **WebStorm > Preferences > Editor > Smartkeys**. Clear the **Insert pair quotes** check box.
