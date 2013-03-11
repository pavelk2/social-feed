social-feed
===========
A jQuery plugin which shows a user feed from the most popular social networks 
Currently supports: Facebook, Twitter, VK

<h4><a href="http://gitbox.ru/Social-feed">Demo is here</a><h4>

The Social-feed plugin uses Twitter Bootstrap css and jquery library, so don't forget to connect them.

If you don't need to show the feed from all 3 social networks, put the credentials only for those you need.

$('.social-feed-container').socialfeed({
                fb_username:'pavel.kucherbaev',
                fb_limit:2,
                vk_username:36603,
                vk_limit:2,
                tw_limit:2,
                tw_username:'pavelk2',
                length:140
            });

The Facebook requires an access token in order to get the feed of the user (even if it is public).
To use Facebook feed, please <a href="https://developers.facebook.com/apps">register an application</a> and 
put its credentials in php/settings.php

