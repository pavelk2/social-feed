Social-feed
===========
A jQuery plugin which shows a user feed from the most popular social networks.<br/> 
Currently supports: <a href="http://facebook.com">Facebook</a>, <a href="http://twitter.com">Twitter</a>, <a href="http://vk.com">VK</a>
<h4><a href="http://gitbox.ru/Social-feed">Online demo is here</a><h4>

<img src="https://dl.dropbox.com/u/15063198/GitHub/plugins/social-feed.png" />



<h4>Getting started</h4>
<pre>
$('.social-feed-container').socialfeed({
                fb_username:'pavel.kucherbaev',
                fb_limit:2,
                vk_username:36603,
                vk_limit:2,
                tw_limit:2,
                tw_username:'pavelk2',
                length:140
            });
</pre>
The Social-feed plugin uses Twitter Bootstrap css and jquery library, so don't forget to connect them.
</br>
If you don't need to show the feed from all supported social networks, put the credentials only for those you need.
</br>
The Facebook requires an access token in order to get the feed of the user (even if it is public).
To use Facebook feed, please <a href="https://developers.facebook.com/apps">register an application</a> and 
put its credentials in php/settings.php

