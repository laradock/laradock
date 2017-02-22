---
title: Workflow maps
tags: [formatting]
keywords: release notes, announcements, what's new, new features
last_updated: July 16, 2016
summary: "Version 6.0 of the Documentation theme for Jekyll reverts back to relative links so you can view the files offline. Additionally, you can store pages in subdirectories. Templates for alerts and images are available."
sidebar: mydoc_sidebar
permalink: mydoc_workflow_maps.html
folder: mydoc
---

## Workflow maps overview

You can implement workflow maps at the top of your pages. This is helpful if you're describing a process that involves multiple topics. See the following demos:

*  [Simple workflow maps][p2_sample1]
*  [Complex workflow maps][p2_sample6]


## Simple workflow maps

1.  Create an include at \_includes/custom/usermap.html, where usermap.html contains the workflow and links you want. See the usermap.html as an example. It should look something like this:

    ```xml  
    <div id="userMap">
    <div class="content"><a href="p2_sample1.html"><div class="box box1">Connect to ADB</div></a></div>
    <div class="arrow">→</div>
    <div class="content"><a href="p2_sample2.html"><div class="box box2">Download and Build the Starter Kit</div></a></div>
    <div class="arrow">→</div>
    <div class="content"><a href="p2_sample3.html"><div class="box box3">Take a Tour</div></a></div>
    <div class="arrow">→</div>
    <div class="content"><a href="p2_sample4.html"><div class="box box4">Load Your Widgets</div></a></div>
    <div class="arrow">→</div>
    <div class="content"><a href="p2_sample5.html"><div class="box box5">Query for Something</div></a></div>
    <div class="clearfix"></div>
    </div>
    ```
    
    You can have only 5 possible workflow squares across. Also, the links must be manually coded HTML like those shown, not automated Markdown links. (This is because the boxes are linked.)
    
2.  Where you want the user maps to appear, add the sidebar properties shown in red below:

    <pre>
    ---
    title: Sample 1 Topic
    keywords: sample
    summary: "This is just a sample topic..."
    sidebar: product2_sidebar
    permalink: p2_sample1
    folder: product2
    <span class="red">simple_map</span>: true
    <span class="red">map_name</span>: usermap
    <span class="red">box_number</span>: 1
    ---
    </pre>
    
    In the page.html layout, the following code gets activated when `simple_map` equals `true`:
    
    ```
    {% raw %}{% if page.simple_map == true %}
    
    <script>
        $(document).ready ( function(){
            $('.box{{page.box_number}}').addClass('active');
        });
    </script>
    
    {% include custom/{{page.map_name}}.html %}
    
    {% endif %}{% endraw %}
    ```
    
    The script adds an `active` class to the box number, which automatically makes the active workflow box become highlighted based on the page you're viewing. 
    
    The `map_name` gets used as the name of the included file.

## Complex workflow maps

The simpler user workflow allows for 5 workflow steps. If you have a more complex workflow, with multiple possible steps, branching, and more, consider using a complex workflow map. This map uses modals to show a list of instructions and links for each step.

1.  Create an include at \_includes/custom/usermapcomplex.html, where usermapcomplex.html contains the workflow and links you want. See the usermapcomplex.html as an example. The code in that file simply implements Bootstrap modals to create the pop-up boxes. Add your custom content inside the modal body:

    ```
    <div class="modal-body">
    <p>This is just dummy text ... Your first steps should be to get started. You will need to do the following:</p>
    
        <ul>
            <li><a href="p2_sample6.html">Sample 6</a></li>
            <li><a href="p2_sample7.html">Sample 7</a></li>
            <li><a href="p2_sample8.html">Sample 8</a></li>
        </ul>
        <p>If you run into any of these setup issues, you must solve them before you can continue on.</p>
    
              </div>
     ```
     
     The existing usermapcomplex.html file just has 3 workflow square modals. If you need more, duplicate the modal code. In the duplicated code, make sure you make the following values in red unique (but the same within the same modal):
     
     <pre>
     <button type="button" class="btn btn-default btn-lg modalButton3" data-toggle="modal" data-target="<span class="red">#myModal3</span>">Publish your app</button>
           <!-- Modal -->
           <div class="modal fade" id="<span class="red">myModal3</span>" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
     </pre>

2.  For each topic where you want the modal to appear, insert the following properties in your frontmatter:

    <pre>
    ---
    title: Sample 6 Topic
    keywords: sample
    summary: "This is just a sample topic..."
    sidebar: product2_sidebar
    permalink: p2_sample6
    <span class="red">complex_map: true</span>
    <span class="red">map_name: usermapcomplex</span>
    <span class="red">box_number: 1</span>
    toc: false
    folder: product2
    ---
    </pre>

    When your frontmatter contains `complex_map` equal to `true`, the following code gets activated in the page layout.html file:
    
    ```
    In the page.html layout, the following code gets activated when `map` equals `true`:
        
     ```
        {% raw %}{% if page.complex_map == true %}
        
        <script>
            $(document).ready ( function(){
                $('.modalButton{{page.box_number}}').addClass('active');
            });
        </script>
        
        {% include custom/{{page.map_name}}.html %}
        
        {% endif %}{% endraw %}
        ```
     ```
     
{% include links.html %}