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
- [x] Pinterest
- [x] RSS
- [ ] Blogspot

## Installation
via http://bower.io:
```
bower install social-feed
```
or download the latest release:

https://github.com/pavelk2/social-feed/releases
## Getting started

Load dependency CSS:
```html
<!-- Social-feed css -->
<link href="bower_components/social-feed/css/jquery.socialfeed.css" rel="stylesheet" type="text/css">
<!-- font-awesome for social network icons -->
<link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">
```
Create a container for your feed:
```html
<div class="social-feed-container"></div>
```
Load dependency javascript
```html
<!-- jQuery -->
<script src="bower_components/jquery/dist/jquery.min.js"></script>
<!-- Codebird.js - required for TWITTER -->
<script src="bower_components/codebird-js/codebird.js"></script>
<!-- doT.js for rendering templates -->
<script src="bower_components/doT/doT.min.js"></script>
<!-- Moment.js for showing "time ago" and/or "date"-->
<script src="bower_components/moment/min/moment.min.js"></script>
<!-- Moment Locale to format the date to your language (eg. italian lang)-->
<script src="bower_components/moment/locale/it.js"></script>
<!-- Social-feed js -->
<script src="bower_components/social-feed/js/jquery.socialfeed.js"></script>
```
Initialize the social-feed plugin:

```html
<script>
    $(document).ready(function(){
        $('.social-feed-container').socialfeed({
            // INSTAGRAM
            instagram:{
                accounts: ['@teslamotors','#teslamotors'],  //Array: Specify a list of accounts from which to pull posts
                limit: 2,                                    //Integer: max number of posts to load
                client_id: 'YOUR_INSTAGRAM_CLIENT_ID'       //String: Instagram client id (optional if using access token)
                access_token: 'YOUR_INSTAGRAM_ACCESS_TOKEN' //String: Instagram access token
            },

            // GENERAL SETTINGS
            length:400                                      //Integer: For posts with text longer than this length, show an ellipsis.
        });
    });
</script>
```

When you run the plugin, make sure that you have your **webserver running**

To alter the default post markup, edit ````template.html```` or pass a template string into the ````template_html```` parameter.

##All Settings

Social-feed.js supports many social networks. If you don't need or want to pull data from them all, remove the ones you don't need.

````javascript
$('.social-feed-container').socialfeed({
    // FACEBOOK
    facebook:{
        accounts: ['@teslamotors','!teslamotors'],  //Array: Specify a list of accounts from which to pull wall posts
        limit: 2,                                   //Integer: max number of posts to load
        access_token: 'YOUR_FACEBOOK_ACCESS_TOKEN'  //String: "APP_ID|APP_SECRET"
    },

    // TWITTER
    twitter:{
        accounts: ['@spacex'],                      //Array: Specify a list of accounts from which to pull tweets
        limit: 2,                                   //Integer: max number of tweets to load
        consumer_key: 'YOUR_CONSUMER_KEY',          //String: consumer key. make sure to have your app read-only
        consumer_secret: 'YOUR_CONSUMER_SECRET_KEY',//String: consumer secret key. make sure to have your app read-only
     },

    // VK
    vk:{
        accounts: ['@125936523','#teslamotors'],    //Array: Specify a list of accounts from which to pull posts
        limit: 2,                                   //Integer: max number of posts to load
        source: 'all'                               //String: VK API post filter. Possible values: "Owner","Others","all","suggests"
    },

    // GOOGLEPLUS
    google:{
         accounts: ['#teslamotors'],                //Array: Specify a list of accounts from which to pull posts
         limit: 2,                                  //Integer: max number of posts to load
         access_token: 'YOUR_GOOGLE_PLUS_ACCESS_TOKEN'//String: G+ access token
     },

    // INSTAGRAM
    instagram:{
        accounts: ['@teslamotors','#teslamotors'],  //Array: Specify a list of accounts from which to pull posts
        limit: 2,                                   //Integer: max number of posts to load
        client_id: 'YOUR_INSTAGRAM_CLIENT_ID'       //String: Instagram client id (option if using access token)
        access_token: 'YOUR_INSTAGRAM_ACCESS_TOKEN' //String: Instagram access token
    },

    // PINTEREST

    pinterest:{
        accounts: ['@teslamotors/model-s','@me'],   //Array: Specify a list of accounts from which to pull posts
                                                    //@me to pull your pins
                                                    //@user/board to pull pins from a user board
        limit: 2,                                   //Integer: max number of posts to load
        access_token: 'YOUR_PINTEREST_ACCESS_TOKEN' //String: Pinterest client id
    },

    // RSS

    rss:{
        urls: ['http://teslapodcast.libsyn.com/rss'], //Array: Specifiy a list of rss feed from which to pull posts
        limit: 2                                      //Integer: max number of posts to load for each url
    }

    // GENERAL SETTINGS
    length:400,                                     //Integer: For posts with text longer than this length, show an ellipsis.
    show_media:true,                                //Boolean: if false, doesn't display any post images
    media_min_width: 300,                           //Integer: Only get posts with images larger than this value
    update_period: 5000,                            //Integer: Number of seconds before social-feed will attempt to load new posts.
    template: "tweet.html",                         //String: Filename used to get the post template.
    template_html:                                  //String: HTML used for each post. This overrides the 'template' filename option
    '<article class="twitter-post"> \
    <h4>{{=it.author_name}}</h4><p>{{=it.text}}  \
    <a href="{{=it.link}}" target="_blank">read more</a> \
    </p> \
    </article>',
    date_format: "ll",                              //String: Display format of the date attribute (see http://momentjs.com/docs/#/displaying/format/)
    moderation: function(content) {                 //Function: if returns false, template will have class hidden
        return  (content.text) ? content.text.indexOf('fuck') == -1 : true;
    },
    callback: function() {                          //Function: This is a callback function which is evoked when all the posts are collected and displayed
        console.log("All posts collected!");
    }
});
````

## Dependencies
*  http://fontawesome.io/ - for displaying icons of social networks. You can remove this dependency by editing replacing .fa icons with images in the template.
*  http://momentjs.com/ - for displaying time ago
*  http://olado.github.io/doT/ - for rendering templates
*  https://github.com/jublonet/codebird-js - for sending requests to Twitter

### Ordering / sorting
Please note, when using a custom template, that the ordering mechanism depends on the `dt-create` attribute.

## License
[MIT](http://mit-license.org/)

## Issues
Found a bug or want a feature to be implemented?
Please report it here https://github.com/pavelk2/social-feed/issues

Currently working on the server side: (https://github.com/pavelk2/social-feed-server)
## Let me know

If you use this plugin, please <a href="mailto:pavel@kucherbaev.com">write me a short message</a> with a link to the project where you embed the plugin, and some features you want to have implemented here. It helps me to stay focused on the important issues. *It is not mandatory, but I really appreciate it!*

Do you want to become a part of the Social-feed? Write me and become an active contributor.

Check out my other projects: http://kucherbaev.com

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/pavelk2/social-feed/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

[![Join the chat at https://gitter.im/pavelk2/social-feed](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pavelk2/social-feed?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
