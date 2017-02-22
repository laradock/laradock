---
title: Syntax highlighting
tags: [formatting]
keywords: rouge, pygments, prettify, color coding,
last_updated: July 3, 2016
summary: "You can apply syntax highlighting to your code. This theme uses pygments and applies color coding based on the lexer you specify."
sidebar: mydoc_sidebar
permalink: mydoc_syntax_highlighting.html
folder: mydoc
---

## About syntax highlighting
For syntax highlighting, use fenced code blocks optionally followed by the language syntax you want:

<pre>
```java
import java.util.Scanner;

public class ScannerAndKeyboard
{

	public static void main(String[] args)
	{	Scanner s = new Scanner(System.in);
		System.out.print( "Enter your name: "  );
		String name = s.nextLine();
		System.out.println( "Hello " + name + "!" );
	}
}
```
</pre>

This looks as follows:

```java
import java.util.Scanner;

public class ScannerAndKeyboard
{

	public static void main(String[] args)
	{	Scanner s = new Scanner(System.in);
		System.out.print( "Enter your name: "  );
		String name = s.nextLine();
		System.out.println( "Hello " + name + "!" );
	}
}
```

Fenced code blocks require a blank line before and after.

If you're using an HTML file, you can also use the `highlight` command with Liquid markup.

<pre>
{% raw %}{% highlight java %}
import java.util.Scanner;

public class ScannerAndKeyboard
{

	public static void main(String[] args)
	{	Scanner s = new Scanner(System.in);
		System.out.print( "Enter your name: "  );
		String name = s.nextLine();
		System.out.println( "Hello " + name + "!" );
	}
}
{% endhighlight %}{% endraw %}
</pre> 

Result: 

{% highlight java %}
import java.util.Scanner;

public class ScannerAndKeyboard
{

	public static void main(String[] args)
	{	Scanner s = new Scanner(System.in);
		System.out.print( "Enter your name: "  );
		String name = s.nextLine();
		System.out.println( "Hello " + name + "!" );
	}
}
{% endhighlight %}

The theme has syntax highlighting specified in the configuration file as follows:

```
highlighter: rouge
```

The syntax highlighting is done via the css/syntax.css file.

## Available lexers

The keywords you must add to specify the highlighting (in the previous example, `ruby`) are called "lexers." You can search for "lexers." Here are some common ones I use:

* js
* html
* yaml
* css
* json
* php
* java
* cpp
* dotnet
* xml
* http

{% include links.html %}
