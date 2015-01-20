# Social-feed

The jQuery plugin which shows user feeds from the most popular social networks.

![](http://habrastorage.org/files/286/85e/03e/28685e03ef2b4bdc8f7da551b339426e.png)

## Demo

http://pavelk2.github.io/social-feed/

Social networks supported: 
- [x] Facebook
- [x] Instagram
- [x] Twitter
- [x] Google+
- [x] VK
- [x] Blogspot
 
## Installation
via http://bower.io:
```
bower install social-feed
```
or download the latest release:

https://github.com/pavelk2/social-feed/releases
## Getting started

Connect css:
```html
<!-- Social-feed css -->
<link href="css/jquery.socialfeed.css" rel="stylesheet" type="text/css">
<!-- font-awesome for social network icons -->
<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">
```
Create a container for your feed:
```html
<div class="social-feed-container"></div>
```
Connect js:
```html
<!-- jQuery -->
<script src="bower_components/jquery/dist/jquery.min.js"></script>
<!-- Codebird.js - required for TWITTER -->
<script src="bower_components/codebird-js/codebird.js"></script>
<!-- doT.js for rendering templates -->
<script src="bower_components/doT/doT.min.js"></script>
<!-- Moment.js for showing "time ago" -->
<script src="bower_components/moment/min/moment.min.js"></script>
<!-- Social-feed js -->
<script src="js/jquery.socialfeed.js"></script>
```
Initialize the social-feed plugin:

```html
<script>
    $(document).ready(function(){
        $('.social-feed-container').socialfeed({
                    // FACEBOOK
                    facebook:{
                        accounts: ['@teslamotors','#teslamotors'],
                        limit: 2,
                        access_token: 'YOUR_FACEBOOK_ACCESS_TOKEN' // APP_ID|APP_SECRET
                    },
                    // TWITTER
                    twitter:{
                        accounts: ['@spacex'],
                        limit: 2,
                        consumer_key: 'YOUR_CONSUMER_KEY', // make sure to have your app read-only
                        consumer_secret: 'YOUR_CONSUMER_SECRET_KEY', // make sure to have your app read-only
                     },
                    // VK
                    vk:{
                        accounts: ['@125936523','#teslamotors'], 
                        limit: 2,
                        source: 'all'
                    },
                    // GOOGLEPLUS
                    google:{
                         accounts: ['#teslamotors'],
                         limit: 2,
                         access_token: 'YOUR_GOOGLE_PLUS_ACCESS_TOKEN'
                     },
                    // INSTAGRAM
                    instagram:{
                        accounts: ['@teslamotors','#teslamotors'],
                        limit:2,
                        client_id: 'YOUR_INSTAGRAM_CLIENT_ID'
                    },
                    // BLOGSPOT
                    /*blogspot:{
                        accounts:['@iman-khaghanifar']
                    },*/
                    // GENERAL SETTINGS
                    length:400,
                    show_media:true,
                    // Moderation function - if returns false, template will have class hidden
                    moderation: function(content){
                        return  (content.text) ? content.text.indexOf('fuck') == -1 : true;
                    },
                    //update_period: 5000,
                    // When all the posts are collected and displayed - this function is evoked
                    callback: function(){
                        console.log('all posts are collected');
                    }
                });
        });
</script>
```

When you run the plugin, make sure that you have your **webserver running**

If you want to change the layout of the feed, you can do it in the **template.html** file.


Also you can simply create template as a string and pass it as template_html parameter.
If you don't need to show the feed from all the supported social networks, put the credentials only for those you need.

## Dependencies
*  http://fontawesome.io/ - for displaying icons of social networks
*  http://momentjs.com/ - for displaying time ago
*  http://olado.github.io/doT/ - for rendering templates
*  https://github.com/jublonet/codebird-js - for sending requests to Twitter

## License
MIT

## Issues
Found a bug or want a feature to be implemented?
Please report it here https://github.com/pavelk2/social-feed/issues

Currently working on the server side: (https://github.com/pavelk2/social-feed-server)
## Let me know

If you use this plugin, please <a href="mailto:pavel@kucherbaev.com">write me a short message</a> with a link to the project where you embed the plugin, and some features you want to have implemented here. It helps me to stay focused on the important issues. *It is not mandatory, but I really appreciate it!*

Do you want to become a part of the Social-feed? Write me and become an active contributor.

Check out my other projects: http://kucherbaev.com
