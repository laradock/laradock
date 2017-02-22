---
title: Help APIs and UI tooltips
tags: [publishing, single_sourcing, content_types]
last_updated: July 3, 2016
keywords: API, content API, UI text, inline help, context-sensitive help, popovers, tooltips
summary: "You can loop through files and generate a JSON file that developers can consume like a help API. Developers can pull in values from the JSON into interface elements, styling them as popovers for user interface text, for example. The beauty of this method is that the UI text remains in the help system (or at least in a single JSON file delivered to the dev team) and isn't hard-coded into the UI."
sidebar: mydoc_sidebar
permalink: mydoc_help_api.html
folder: mydoc
---

## Full code demo of content API

You can create a help API that developers can use to pull in content.

For the full code demo, see the notes in the [Tooltips file](tooltips.html).

In this demo, the popovers pull in and display content from the information in a <a target="_blank" href="tooltips.json">tooltips.json</a> file located in the same directory.

Instead of placing the JSON source in the same directory, you could also host the JSON file on another site.

Additionally, instead of tooltip popovers, you could also print content directly to the page. Basically, whatever you can stuff into a JSON file, developers can integrate it onto a page.

## Diagram overview

Here's a diagram showing the basic idea of the help API:

<img src="images/helpapi.svg" style="width: 650px;"/>

Is this really an API? Well, sort of. The help content is pushed out into a JSON file that other websites and applications can easily consume. The endpoints don't deliver different data based on parameters added to a URL. But the overall concept is similar to an API: you have a client requesting resources from a server.

Note that in this scenario, the help is openly accessible on the web. If you have a private system, it's more complicated.

To deliver help this way using Jekyll, follow the steps in each of the sections below.

## 1. Create a "collection" for the help content

A collection is another content type that extends Jekyll beyond the use of pages and posts. Call the collection "tooltips."

Add the following information to your configuration file to declare your collection:

```
collections:
  tooltips:
    output: false
```

In your Jekyll project's root directory, create a new folder called "_tooltips" and put every page that you want to be part of that tooltips collection inside that folder.

In Jekyll, folders that begin with an underscore ("_") aren't included in the output. However, in the collection information that you add to your configuration file, if you change `output` to `true`, the tooltips folder will appear in the output, and each page inside tooltips will be generated. You most likely don't want this for tooltips (you just want the JSON file), so make the `output` setting `false`.

## 2. Create tooltip definitions in a YAML file

Inside the \_data folder, create a YAML file called something like definitions.yml. Add the definitions for each of your tooltips here like this:

```yaml
basketball: "Basketball is a sport involving two teams of five players each competing to put a ball through a small circular rim 10 feet above the ground. Basketball requires players to be in top physical condition, since they spend most of the game running back and forth along a 94-foot-long floor."
```

The definition of basketball is stored this data file so that you can re-use it in other parts of the help as well. You'll likely want the definition to appear not only in the tooltip in the UI, but also in the regular documentation as well.

## 3. Create pages in your collection

Create pages inside your new tooltips collection (that is, inside the \_tooltips folder). Each page needs to have a unique `id` in the frontmatter as well as a `product`. Then reference the definition you created in the definitions.yml file.

Here's an example:

```yaml
{% raw %}
---
doc_id: basketball
product: mydoc
---

{{site.data.definitions.basketball}}{% endraw %}
```

(Note: Avoid using `id`, as it seems to generate out as `/tooltips/basketball` instead of just `basketball.)

You need to create a separate file for each tooltip you want to deliver.  

The product attribute is required in the frontmatter to distinguish the tooltips produced here from the tooltips for other products in the same \_tooltips folder. When creating the JSON file, Jekyll will iterate through all the pages inside \_tooltips, regardless of any subfolders included here.

## 4. Create a JSON file that loops through your collection pages

Now it's time to create a JSON file with Liquid code that iterates through our tooltip collection and grabs the information from each tooltip file.

Inside your project's pages directory (e.g., mydoc), add a file called "tooltips.json." (You can use whatever name you want.) Add the following to your JSON file:

{% raw %}
```liquid
---
layout: null
search: exclude
---

{
"entries":
[
{% for page in site.tooltips %}
{
"doc_id": "{{ page.doc_id }}",
"body": "{{ page.content | strip_newlines | replace: '\', '\\\\' | replace: '"', '\\"' }}"
} {% unless forloop.last %},{% endunless %}
{% endfor %}
]
}

```
{% endraw %}

This code will loop through all pages in the tooltips collection and insert the `id` and `body` into key-value pairs for the JSON code. Here's an example of what that looks like after it's processed by Jekyll in the site build:

```json
{
  "entries": [
    {
      "doc_id": "baseball",
      "body": "{{site.data.definitions.baseball}}"
    },
    {
      "doc_id": "basketball",
      "body": "{{site.data.definitions.basketball}}"
    },
    {
      "doc_id": "football",
      "body": "{{site.data.definitions.football}}"
    },
    {
      "doc_id": "soccer",
      "body": "{{site.data.definitions.soccer}}"
    }
  ]
}
```

You can also view the same JSON file here: <a target="_blank" href="tooltips.json">tooltips.json</a>.

You can add different fields depending on how you want the JSON to be structured. Here we just have to fields: `doc_id` and `body`. And the JSON is looking just in the tooltips collection that we created.

{% include tip.html content="Check out [Google's style guide](https://google-styleguide.googlecode.com/svn/trunk/jsoncstyleguide.xml) for JSON. These best practices can help you keep your JSON file valid." %}

Note that you can create different JSON files that specialize in different content. For example, suppose you have some getting started information. You could put that into a different JSON file. Using the same structure, you might add an `if` tag that checks whether the page has frontmatter that says `type: getting_started` or something. Or you could put the content into separate collection entirely (different from tooltips).

By chunking up your JSON files, you can provide a quicker lookup. (I'm not sure how big the JSON file can be before you experience any latency with the jQuery lookup.)

## 5. Build your site and look for the JSON file

When you build your site, Jekyll will iterate through every page in your _tooltips folder and put the page id and body into this format. In the output, look for the JSON file in the tooltips.json file. You'll see that Jekyll has populated it with content. This is because of the triple hyphen lines in the JSON file &mdash; this instructs Jekyll to process the file.

## 6. Allow CORS access to your help if stored on a remote server

You can simply deliver the JSON file to devs to add to the project. But if you have the option, it's best to keep the JSON file stored in your own help system. Assuming you have the ability to update your content on the fly, this will give you completely control over the tooltips without being tied to a specific release window.

When people make calls to your site *from other domains*, you must allow them access to get the content. To do this, you have to enable something called CORS (cross origin resource sharing) within the server where your help resides.

In other words, people are going to be executing calls to reach into your site and grab your content. Just like the door on your house, you have to unlock it so people can get in. Enabling CORS is unlocking it.

How you enable CORS depends on the type of server.

If your server setup allows htaccess files to override general server permissions, create an .htaccess file and add the following:

```
Header set Access-Control-Allow-Origin "*"
```

Store this in the same directory as your project. This is what I've done in a directory on my web host (bluehost.com). Inside http://idratherassets.com/wp-content/apidemos/, I uploaded a file called ".htaccess" with the preceding code.

After I uploaded it, I renamed it to .htaccess, right-clicked the file and set the permissions to 774.

To test whether your server permissions are set correctly, open a terminal and run the following curl command pointing to your tooltips.json file:

```
curl -I http://idratherassets.com/wp-content/apidemos/tooltips.json
```

The `-I` command tells cURL to return the request header only.

If the server permissions are set correctly, you should see the following line somewhere in the response:

```xml
Access-Control-Allow-Origin: *
```

If you don't see this response, CORS isn't allowed for the file.

If you have an AWS S3 bucket, you can supposedly add a CORS configuration to the bucket permissions. Log into AWS S3 and click your bucket. On the right, in the Permissions section, click **Add CORS Configuration**. In that space, add the following policy:

```xml
<CORSConfiguration>
 <CORSRule>
   <AllowedOrigin>*</AllowedOrigin>
   <AllowedMethod>GET</AllowedMethod>
 </CORSRule>
</CORSConfiguration>
```

(Although this should work, in my experiment it doesn't. And I'm not sure why...)

In other server setups, you may need to edit one of your Apache configuration files. See [Enable CORS](http://enable-cors.org/server.html) or search online for ways to allow CORS for your server.

If you don't have CORS enabled, users will see a CORS error/warning message in the console of the page making the request.

{% include tip.html content="If enabling CORS is problematic, you could always just send developers the tooltips.json file and ask them to place it on their own server." %}

## 7. Explain how developers can access the help

Developers can access the help using the `.get` method from jQuery, among other methods. Here's an example of how to get tooltips for basketball, baseball, football, and soccer:

```js
{% raw %}var url = "tooltips.json";
         
         $.get( url, function( data ) {
         
          /* Bootstrap popover text is defined inside a data-content attribute inside an element. That's 
          why I'm using attr here. If you just want to insert content on the page, use append and remove the data-content argument from the parentheses.*/
         
             $.each(data.entries, function(i, page) {
                 if (page.doc_id == "basketball") {
                     $( "#basketball" ).attr( "data-content", page.body );
                 }
         
                 if (page.doc_id == "baseball") {
                     $( "#baseball" ).attr( "data-content", page.body );
                 }
                 if (page.doc_id == "football") {
                     $( "#football" ).attr( "data-content", page.body );
                 }
         
                 if (page.doc_id == "soccer") {
                     $( "#soccer" ).attr( "data-content", page.body );
                 }
         
         
                 });
             });{% endraw %}
```

View the <a target="_blank" href="tooltips.html" class="noCrossRef">tooltip demo</a> for a demonstration. See the source code for full code details.

The `url` in the demo is relative, but you could equally point it to an absolute path on a remote host assuming CORS is enabled on the host.

The `each` method looks through all the JSON content to find the item whose `page.id` is equal to `basketball`. It then looks for an element on the page named `#basketball` and adds a `data-content` attribute to that element.

{% include warning.html content="Make sure your JSON file is valid. Otherwise, this method won't work. I use the [JSON Formatter extension for Chrome](https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa?hl=en). When I go to the tooltips.json page in my browser, the JSON content &mdash; if valid &mdash; is nicely formatted (and includes some color coding). If the file isn't valid, it's not formatted and there isn't any color. You can also check the JSON formatting using [JSON Formatter and Validator](http://jsonformatter.curiousconcept.com/). If your JSON file isn't valid, identify the problem area using the validator and troubleshoot the file causing issues. It's usually due to some code that isn't escaping correctly." %}

Why `data-content`? Well, in this case, I'm using [Bootstrap popovers](http://getbootstrap.com/javascript/#popovers) to display the tooltip content. The `data-content` attribute is how Bootstrap injects popovers.

Here's the section on the page where the popover is inserted:

```
<p>Basketball <span class="glyphicon glyphicon-info-sign" id="basketball" data-toggle="popover"></span></p>
```

Notice that I just have `id="basketball"` added to this popover element. Developers merely need to add a unique ID to each tooltip they want to pull in the help content. Either you tell developers the unique ID they should add, or ask them what IDs they added (or just tell them to use an ID that matches the field's name).

In order to use jQuery and Bootstrap, you'll need to add the appropriate references in the head tags of your page:

```js
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>

<script type="text/javascript">
$(document).ready(function(){
    $('[data-toggle="popover"]').popover({
        placement : 'right',
        trigger: 'hover',
        html: true
    });
```

Again, see the <a class="noCrossRef" href="tooltips.html">Tooltip Demo</a> for a demo of the full code.

Note that even though you reference a Bootstrap JS script, Bootstrap's popovers require you to initialize them using the above code as well &mdash; they aren't turned on by default.

View the source code of the <a target="_blank" href="tooltips.html" class="noCrossRef">tooltip demo</a> for the full comments.

## 8. Create easy links to embed the help in your help site

You might also want to insert the same content into different parts of your help site. For example, if you have tooltips providing definitions for fields, you'll probably want to create a page in your help that lists those same definitions.

You could use the same method developers use to pull help content into their applications. But it will probably be easier to simply use Jekyll's tags for doing it.

Here's how you would reuse the content:


```html
{% raw %}<h2>Reuse Demo</h2>


<table>
<thead>
<tr>
<th>Sport</th>
<th>Comments</th>
</tr>
</thead>
<tbody>

<tr>
<td>Basketball</td>
<td>{{site.data.definitions.basketball}}</td>
</tr>

<tr>
<td>Baseball</td>
<td>{{site.data.definitions.baseball}}</td>
</tr>

<tr>
<td>Football</td>
<td>{{site.data.definitions.football}}</td>
</tr>

<tr>
<td>Soccer</td>
<td>{{site.data.definitions.soccer}}</td>
</tr>
</tbody>
</table>{% endraw %}
```

And here's the code:

<h2>Reuse Demo</h2>


<table>
<thead>
<tr>
<th>Sport</th>
<th>Comments</th>
</tr>
</thead>
<tbody>

<tr>
<td>Basketball</td>
<td>{{site.data.definitions.basketball}}</td>
</tr>

<tr>
<td>Baseball</td>
<td>{{site.data.definitions.baseball}}</td>
</tr>

<tr>
<td>Football</td>
<td>{{site.data.definitions.football}}</td>
</tr>

<tr>
<td>Soccer</td>
<td>{{site.data.definitions.soccer}}</td>
</tr>
</tbody>
</table>

Now you have both documentation and UI tooltips generated from the same definitions file.

{% include links.html %}
