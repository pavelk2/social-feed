Social-feed
===========
A jQuery plugin which shows a user feed from the most popular social networks.<br/> 
Currently supports: <a href="http://facebook.com">Facebook</a>, <a href="http://twitter.com">Twitter</a>, <a href="http://vk.com">VK</a>
<hr>
If you use this plugin, please <a href="mailto:pavel@kucherbaev.com">write me a short message</a> with a link to the project where you embed the plugin, and what would 
you like to have more in the plugin. It will help me to stay focused on the important issues and see the global picture!
<br/><strong>It is not mandatory, but i will really appreciate it!</strong>
<p>
<strong>Attention:</strong> After Twitter has prohibided an anonymous fetching of tweets - this function is currently not supported. Wait an update with a fix.
</p>
<hr>
<h4><a href="http://gitbox.ru/Social-feed" target="_blank">Online demo is here</a><h4>

<img src="https://dl.dropbox.com/u/15063198/GitHub/plugins/social-feed.png" />
<hr>
With previews:<br/>
<img src="https://dl.dropbox.com/u/15063198/GitHub/plugins/social-feed-pic.png" />
<hr>
<h4>Getting started</h4>
Connect css and js:

        <link href="css/jquery.socialfeed.css" rel="stylesheet" type="text/css">
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
        <script src="js/jquery.socialfeed.utility.js"></script>
        <script src="js/jquery.socialfeed.js"></script>

Create a container for your feed:

        <div class="social-feed-container"></div>

Initialize the social-feed plugin:

        <script>
        $('.social-feed-container').socialfeed({
                    fb_username:'barack.obama',
                    fb_limit:2,
                    fb_token:'YOUR_FACEBOOK_APP_ACCESS_TOKEN',
                    vk_username:1,
                    vk_limit:2,
                    vk_source: 'all',
                    tw_limit:2,
                    tw_username:'jack',
                    length:130,
                    cookies:true,
                    show_media:true
                });
        </script>

When you run the plugin, make sure that you have your <strong>webserver running</strong>, otherwise you can get 
the next problem:
<pre>
        XMLHttpRequest cannot load file://......./Social-feed/template.html. 
        Origin null is not allowed by Access-Control-Allow-Origin. 
</pre>
If you want to change the layout of the feed, you can do it in the <em>template.html</em> file.
<br/>
If you don't need to show the feed from all supported social networks, put the credentials only for those you need.
<br/>
The Facebook requires an access token in order to get the feed of the user (even if it is public).
To use Facebook feed, please <a href="https://developers.facebook.com/apps">register an application</a>, generate a token and 
put it in  <em>fb_token</em>.<br/>
<strong>Attention!</strong> A current version of plugin does not fully support IE browser. Please follow the process of solving issues for IE.


