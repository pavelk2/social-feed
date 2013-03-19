Social-feed
===========
A jQuery plugin which shows a user feed from the most popular social networks.<br/> 
Currently supports: <a href="http://facebook.com">Facebook</a>, <a href="http://twitter.com">Twitter</a>, <a href="http://vk.com">VK</a>
<h4><a href="http://gitbox.ru/Social-feed" target="_blank">Online demo is here</a><h4>

<img src="https://dl.dropbox.com/u/15063198/GitHub/plugins/social-feed.png" />


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
                    tw_limit:2,
                    tw_username:'jack',
                    length:130,
                    cookies:true
                });
        </script>
        
If you want to change the layout of the feed, you can do it in the <em>template.html</em> file.
<br/>
If you don't need to show the feed from all supported social networks, put the credentials only for those you need.
<br/>
The Facebook requires an access token in order to get the feed of the user (even if it is public).
To use Facebook feed, please <a href="https://developers.facebook.com/apps">register an application</a>, generate a token and 
put it in  <em>fb_token</em>
<strong>Attention!</strong> A current version of plugin does not fully support IE browser. Please follow the process of solving issues for IE.


