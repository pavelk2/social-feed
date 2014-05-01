Social-feed
===========
The jQuery plugin which shows a user feed from the most popular social networks.<br/> 
Currently are supported: <a href="http://facebook.com">Facebook</a>, <a href="http://instagram.com">Instagram</a>, <a href="http://vk.com">VK</a>, <a href="http://plus.google.com">Google+</a>, (<a href="http://twitter.com">Twitter</a> is currently not supported)
<hr>
If you use this plugin, please <a href="mailto:pavel@kucherbaev.com">write me a short message</a> with a link to the project where you embed the plugin, and some features you want to have implemented here. It will help me to stay focused on the important issues and see the global picture!
<br/><strong>It is not mandatory, but I really appreciate it!</strong>
<p>
<strong>Attention:</strong> After Twitter has prohibided an anonymous fetching of tweets - this function is currently not supported. Wait an update with a fix.
</p>
<hr>
<h4><a href="http://pavelk2.github.io/social-feed/" target="_blank">Online demo is here</a><h4>

<img src="http://habrastorage.org/storage2/bc3/834/e4d/bc3834e4dd952f22b470830d7dc1096c.png" />
<hr>
With previews:<br/>
<img src="http://habrastorage.org/storage2/2ee/a85/fcf/2eea85fcf3c76efb328b0b2d9e8df7ad.png" />
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
                    //FACEBOOK--------------------
                    facebook:{
                        username:'barack.obama',
                        limit:2,
                        token:'YOUR_FACEBOOK_ACCESS_TOKEN' //you can also create an app https://developers.facebook.com/ and put  here your 'APP ID|APP SECRET' - it is easier but not safe
                    },
                    //VK--------------------
                    vk:{
                        userid:36603,
                        limit:2,
                        source:'all'
                    },
                    //GOOGLEPLUS-------------------
                    google:{
                         access_token: 'YOUR_GOOGLE_PLUS_ACCESS_TOKEN', // https://console.developers.google.com/
                         userid: '114860576370498981824',
                         limit: 2
                     },
                    //INSTAGRAM---------------------
                    instagram:{
                        userid:23686378,
                        client_id:'YOUR_INSTAGRAM_CLIENT_ID', //http://instagram.com/developer/
                        limit:2
                    },
                    //GENERAL SETTINGS--------------
                    length:130,
                    show_media:true,
                    // optional callback function (when all posts are collected and rendered)
                    callback: function(){
                        console.log('all posts collected');
                    }
                });
        </script>

When you run the plugin, make sure that you have your <strong>webserver running</strong>

If you want to change the layout of the feed, you can do it in the <em>template.html</em> file.
<br/>
If you don't need to show the feed from all the supported social networks, put the credentials only for those you need.
<br/>
The Facebook requires an access token in order to get the feed of the user (even if it is public).
To use Facebook feed, please <a href="https://developers.facebook.com/apps">register an application</a>, <a href="https://developers.facebook.com/tools/explorer/">generate a token</a> and 
put it in  <em>fb_token</em>.<br/>
<h4>Dependencies:</h4>
    
<strong>Attention!</strong> The current version of the plugin does not fully support IE browser. Please follow the process of solving issues for IE.


