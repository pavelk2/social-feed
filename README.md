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
<h6>Check out my other projects: <a href="http://kucherbaev.com" target="_blank"> http://kucherbaev.com</a><h6>
<hr>
<h1><a href="http://pavelk2.github.io/social-feed/" target="_blank">Demo</a><h1>

<img src="http://habrastorage.org/storage2/bc3/834/e4d/bc3834e4dd952f22b470830d7dc1096c.png" />
<hr>
With previews:<br/>
<img src="http://habrastorage.org/storage2/2ee/a85/fcf/2eea85fcf3c76efb328b0b2d9e8df7ad.png" />
<hr>
<h4>Getting started</h4>
Connect css:

        <!-- Social-feed css -->
        <link href="css/jquery.socialfeed.css" rel="stylesheet" type="text/css">
        <!-- font-awesome for social network icons -->
        <link href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" rel="stylesheet">

Create a container for your feed:

        <div class="social-feed-container"></div>

Connect js:

        <!-- jQuery -->
        <script src="http://code.jquery.com/jquery-latest.min.js"></script>
    
        <!-- doT.js for rendering templates and moment.js for showing time ago -->
        <script src="dependencies/doT.min.js"></script>
        <script src="dependencies/moment.min.js"></script>
    
        <!-- Social-feed js -->
        <script src="js/jquery.socialfeed.js"></script>

Initialize the social-feed plugin:

        <script>
         $('.social-feed-container').socialfeed({
                    //FACEBOOK--------------------
                    facebook:{
                        accounts:['teslamotors'], //usernames or id
                        limit:2,
                        token:'YOUR_FACEBOOK_ACCESS_TOKEN' //you can also create an app and put  here your 'APP ID|APP SECRET' - it is easier but not safe
                    },
                    //VK--------------------
                    vk:{
                        accounts:[125936523], //id for users and -id (with minus) for groups 
                        limit:2,
                        source:'all'
                    },
                    //GOOGLEPLUS-------------------
                    google:{
                         access_token: 'YOUR_GOOGLE_PLUS_TOKEN',
                         accounts: ['111435337725041517235','114461178896543099856','+TeslaMotors'],
                         limit: 2
                     },
                    //INSTAGRAM---------------------
                    instagram:{
                        accounts:[297604134], //userid
                        client_id:'YOUR_INSTAGRAM_APP_CLIENT_ID',
                        limit:2
                    },
                    //GENERAL SETTINGS--------------
                    length:130,
                    show_media:true,
                    callback: function(){
                        console.log('all posts are collected');
                    }
                });
        </script>

When you run the plugin, make sure that you have your <strong>webserver running</strong>

If you want to change the layout of the feed, you can do it in the <em>template.html</em> file.
<br/>
If you don't need to show the feed from all the supported social networks, put the credentials only for those you need.

<h4>Dependencies:</h4>
-  http://fontawesome.io/ - for displaying icons of social networks
-  http://momentjs.com/ - for displaying time ago
-  http://olado.github.io/doT/ - for rendering templates

<strong>Attention!</strong> The current version of the plugin does not fully support IE browser. Please follow the process of solving issues for IE.


