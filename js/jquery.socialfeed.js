if ( typeof Object.create !== 'function' ) {
    Object.create = function( obj ) {
        function F() {};
        F.prototype = obj;
        return new F();
    };
}
;
(function( $, window, document, undefined ) {
    /*var socialFeed = {
    };
    $.fn.socialfeed = function( options ) {
               return this.each(function() {
                       var feed = Object.create( socialFeed );
                       
                       feed( options, this );

                       $.data( this, 'socialfeed', feed );
               });
   };*/
$.fn.socialfeed = function(options)
{
    function request(url, callback){
        $.ajax({
            url : url,
            dataType : 'jsonp',
            success : callback
        });
    }
    function get_request(url, callback){
        $.get(url, callback,'json');
    }
    var defaults = {
            plugin_folder: '', // a folder in which the plugin is located (with a slash in the end)
            template: 'template.html', // a path to the tamplate file
            show_media: false, // show images of attachments if available
            length: 500 // maximum length of post message shown
        };
    //---------------------------------------------------------------------------------
    var options = $.extend(defaults, options),container = $(this),template,loaded = [], social_networks = ['facebook','instagram','vk','google','blogspot']; 
    container.empty().css('display', 'inline-block');
    //---------------------------------------------------------------------------------
    
    //---------------------------------------------------------------------------------
    // This function performs consequent data loading from all of the sources by calling corresponding functions

    function fireCallback(){
        var fire = true;
        $.each(Object.keys(loaded),function(){
            if (loaded[this] > 0)
                fire = false;
        });
        if (fire && options.callback)
            options.callback();
    }
    var getData = {
        checkAll: function(){
            social_networks.forEach(function(network){
                if (options[network]) {
                    loaded[network]=0;
                    options[network].accounts.forEach(function(account){
                        loaded[network]++;
                        getData[network](account);
                    });
                }
            });
        },
        facebook: function(account){

            var request_url, limit = 'limit=' + options.facebook.limit,
            query_extention = '&access_token=' + options.facebook.access_token + '&callback=?',
            fb_graph = 'https://graph.facebook.com/';

            switch (account[0]){
                case '@':
                var username = account.substr(1);

                request_url = fb_graph + username + '/feed?' + limit + query_extention; 
                request(request_url,getPosts);
                break;
                case '#':
                var hashtag = account.substr(1);
                
                request_url = fb_graph+'search?q=%23'+hashtag+'&' + limit + query_extention; 
                request(request_url,getPosts);
                break;
                default:
                request_url = fb_graph+'search?q='+account+'&' + limit + query_extention; 
                request(request_url,getPosts);
            }
            
            function getPosts(json){
                $.each(json.data,function(){
                    var element = this, post = {};

                    if (element.message || element.story){
                        var text = element.story, url = 'http://facebook.com/' + element.from.id
                        if (element.message) text = element.message;                            
                        if (element.link) url = element.link;   
                        if (options.show_media){
                            if (element.picture){
                                var image_url = element.picture;
                                if (image_url.indexOf('?') == -1){
                                    image_url = image_url.replace('_s.', '_b.').replace('s130x130', 's720x720')
                                }
                                post.attachment = '<img class="attachment" src="' + image_url + '" />';
                            }
                        }

                        post.id = element.id;
                        post.dt_create = moment(element.created_time);
                        post.author_link = 'http://facebook.com/' + element.from.id;
                        post.author_picture = fb_graph + element.from.id + '/picture';
                        post.author_name = element.from.name;
                        post.message = text;
                        post.description = (element.description) ? element.description : '';
                        post.link = url;
                        post.social_network = 'facebook';
                        
                        getTemplate(post, json.data[json.data.length-1] == element);
                    }
                });
}
},
instagram: function(account){
    var url, search = '', limit = 'count=' + options.instagram.limit, query_extention = 'client_id=' + options.instagram.client_id + '&' + limit + '&callback=?', igm_api_base = 'https://api.instagram.com/v1/';

    switch (account[0]){
        case '@':
        var username = account.substr(1);
        url = igm_api_base + 'users/search/?q=' + username + '&'+query_extention;
        request(url,getUsers);
        break;
        case '#':
        var hashtag = account.substr(1);
        url = igm_api_base + 'tags/' + hashtag + '/media/recent/?'+query_extention;
        request(url,getImages);
        break;
        default:
        var a =1;
    }

    function getUsers(json){
        $.each(json.data, function() {
            var user = this;
            if (user.username == username){
                url = igm_api_base + 'users/' + user.id + '/media/recent/?'+query_extention;
                request(url,getImages);
            }
        });
    }
    function getImages(json){
        $.each(json.data, function() {
            var post = {}, element = this;

            post.id = element.id;
            post.dt_create = moment((element.created_time * 1000));
            post.author_link = 'http://instagram.com/' + element.user.username;
            post.author_picture = element.user.profile_picture;
            post.author_name = element.user.full_name;
            post.message = (element.caption && element.caption)? element.caption.text : '';
            post.description = '';
            post.social_network = 'instagram';
            post.link = element.link;
            if (options.show_media) {
                post.attachment = '<img class="attachment" src="' + element.images.standard_resolution.url + '' + '" />';
            }

            getTemplate(post, json.data[json.data.length-1] == element);
        });
    }
},
vk: function(account){
    var vk_api_base = 'https://api.vk.com/method/', request_url, vk_user_json_template = vk_api_base+'users.get?fields=first_name,%20last_name,%20screen_name,%20photo&uid=',
    vk_group_json_template = vk_api_base+'groups.getById?fields=first_name,%20last_name,%20screen_name,%20photo&gid=';

    switch (account[0]){
        case '@':
        var username = account.substr(1);
        request_url = vk_api_base+'wall.get?owner_id='+username+'&filter='+options.vk.source+'&count='+options.vk.limit+'&callback=?';
        get_request(request_url,getPosts);
        break;
        case '#':
        var hashtag = account.substr(1);
        request_url = vk_api_base+'newsfeed.search?q='+hashtag+'&count='+options.vk.limit+'&callback=?';
        get_request(request_url,getPosts);
        break;
        default:
        var a =1;
    }
    function getPosts(json){
        $.each(json.response, function(){ 
            if (this != parseInt(this) && this.post_type == 'post'){
                var owner_id = (this.owner_id) ? this.owner_id : this.from_id, vk_wall_owner_url =(owner_id > 0) ? (vk_user_json_template + owner_id + '&callback=?') : (vk_group_json_template+(-1) * owner_id + '&callback=?') ,element = this;
                
                get_request(vk_wall_owner_url, function(wall_owner){
                    showPost(wall_owner,element, json);
                });

            }
        });  
    }
    function showPost(wall_owner, element, json){
        var post = {};
        
        post.id = element.id;
        post.dt_create = moment.unix(element.date);
        post.description = ' ';
        post.message = stripHTML(element.text);
        if (options.show_media) {
            if (element.attachment){
                if (element.attachment.type=='video')
                    post.attachment='<img class="attachment" src="'+element.attachment.video.image_big+'" />';
                if (element.attachment.type=='photo')
                    post.attachment='<img class="attachment" src="'+element.attachment.photo.src_big+'" />';
                if (element.attachment.type=='link')
                    post.attachment='<img class="attachment" src="'+element.attachment.link.image_src+'" />';
            }
        }
        post.social_network='vk';

        if (element.from_id > 0){
            var vk_user_json = vk_user_json_template + element.from_id + '&callback=?';
            get_request(vk_user_json, function(user_json){
                getUser(user_json, post,element, json);
            });

        }else{
            var vk_group_json = vk_group_json_template+(-1) * element.from_id + '&callback=?';
            get_request(vk_group_json, function(user_json){
                getGroup(user_json, post,element, json);
            });
        }
    }
    function getUser(user_json, post,element, json){
        post.author_name = user_json.response[0].first_name + ' ' + user_json.response[0].last_name;
        post.author_picture = user_json.response[0].photo;
        post.author_link = 'http://vk.com/' + user_json.response[0].screen_name;
        post.link = 'http://vk.com/' + user_json.response[0].screen_name + '?w=wall' + element.from_id + '_' + element.id;
        
        getTemplate(post, json.response[json.response.length-1] == element); 
    }
    function getGroup(user_json, post,element, json){
        post.author_name = user_json.response[0].name;
        post.author_picture = user_json.response[0].photo;
        post.author_link = 'http://vk.com/' + user_json.response[0].screen_name;
        post.link = 'http://vk.com/' + user_json.response[0].screen_name + '?w=wall-' + user_json.response[0].gid  + '_' + element.id;
        
        getTemplate(post, json.response[json.response.length-1] == element);
    }
},
google: function(account){
    var url, api_base = 'https://www.googleapis.com/plus/v1/';
    switch (account[0]){
        case '#':
        var hashtag = account.substr(1);
        url = api_base+'activities?query='+hashtag+'&key=' + options.google.access_token + '&maxResults=' + options.google.limit;        request(url,getPosts);
        break;

        case '@':
        var username = account.substr(1);
        url = api_base+'people/' + username + '/activities/public?key=' + options.google.access_token + '&maxResults=' + options.google.limit;
        request(url,getPosts);
        break;

        default:
        var a = 1;

    }
    function getPosts(json){
        $.each(json.items, function(){          
            var post = {},
            element = this;     
            post.id = element.id;
            post.attachment = '';      
            post.description = '';                                                 
            post.dt_create = moment(element.published);
            post.author_link = element.actor.url;
            post.author_picture = element.actor.image.url;
            post.author_name = element.actor.displayName;

            if(options.show_media === true){
                if(element.object.attachments){
                    $.each(element.object.attachments, function(){
                        var image = '';
                        if (this.fullImage){
                            image =  this.fullImage.url;
                        }else{
                            if (this.objectType=='album'){
                                if (this.thumbnails && this.thumbnails.length>0)
                                    if (this.thumbnails[0].image)
                                        image=this.thumbnails[0].image.url;
                                }
                            }
                            post.attachment = '<img class="attachment" src="' + image + '"/>';
                        });
                }
            }
            if(element.object.content === ''){
                $.each(element.object.attachments, function(){
                    if(this.content !== undefined){                                    
                        post.message = this.content;                                                                                                           
                    }
                    else if(this.displayName !== undefined){                                    
                        post.message = this.displayName + '<br />' + this.url;
                    }                                
                });                            
            }
            else{                            
                post.message = element.object.content;                                                                               
            }
            post.social_network = 'google-plus';      
            post.link = element.url;                                          
            
            getTemplate(post, json.items[json.items.length-1] == element);                    

        }); 
} 
},
blogspot: function(account){
    var url;

    switch (account[0]){
        case '@':
        var username = account.substr(1);
        url = 'http://'+username+'.blogspot.com/feeds/posts/default?alt=json-in-script&callback=?';
        request(url,getPosts);
        break;
        default:
        var a =1;
    }

    function getPosts(json){

        $.each(json.feed.entry, function() {
            var post = {}, element = this;
            post.id = element.id['$t'].replace(/[^a-z0-9]/gi,'');
            //post.dt_create = moment((element.published['$t'])); // why introducing a new library
            post.dt_create = new Date(element.published['$t']);
            
            // use if statement if ternary caused an error. did not tried it myself
            typeof(element.category!="undefined")?post.category=element.category:post.category=[]; //category is an array of tags
            
            
            post.author_link = element.author[0]['uri']['$t'];
            // is this neccessary? for each entry?
            post.author_picture = 'http:'+element.author[0]['gd$image']['src'];
            post.author_name = element.author[0]['name']['$t'];
            post.message = element.title['$t']+'</br></br>'+stripHTML(element.content['$t']);
            post.description = '';
            post.social_network = 'blogspot';
            post.link = element.link.pop().href;
            if (options.show_media) {
                if (element['media$thumbnail'])
                    post.attachment = '<img class="attachment" src="' + element['media$thumbnail']['url']+'" />';
            }

            getTemplate(post, json.feed.entry[json.feed.entry-1] == element);
        });
    }
}
};
// Initiate function
getData.checkAll();
if (options.update_period){
    setInterval(function(){
        return getData.checkAll();
    },options.update_period);
}

//---------------------------------------------------------------------------------
// Render functions
//---------------------------------------------------------------------------------
function getTemplate(data, lastelement){
    var content = data;  

    content.attachment=(content.attachment==undefined) ? '' : content.attachment;
    content.time_ago = data.dt_create.fromNow();
    content.dt_create=content.dt_create.valueOf();
    content.text = wrapLinks(shorten(data.message + ' ' + data.description),data.social_network);
    content.moderation_passed = (options.moderation) ? options.moderation(content) : true;    
    
    if (template!=undefined)
        placeTemplate(template(content),data, lastelement);  
    else{ 
        if (options.template_html){
            template = doT.template(options.template_html);
            placeTemplate(template(content),data,lastelement); 
        }else{
            $.get(options.template,function(template_html){
                template = doT.template(template_html);
                placeTemplate(template(content),data,lastelement);      
            });
        }
    }
}
function placeTemplate(template,data, lastelement){
    if ($(container).children('[social-feed-id='+data.id+']').length != 0)
        return false;
    if ($(container).children().length == 0){
        $(container).append(template);  
    }else{
        var i = 0,
        insert_index = -1;                    
        $.each($(container).children(), function(){
            if ($(this).attr('dt-create') < data.dt_create){
                insert_index = i;
                return false;
            }
            i++;
        });
        $(container).append(template);
        if (insert_index >= 0){
            insert_index++;
            var before = $(container).children('div:nth-child('+insert_index+')'),
            current = $(container).children('div:last-child');
            $(current).insertBefore(before);  
        }

    }
    if (lastelement){
        loaded[data.social_network]--;
        fireCallback();
    }
}
//---------------------------------------------------------------------------------
// Utility functions
//---------------------------------------------------------------------------------
function wrapLinks(string,social_network){
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;            
    if(social_network === 'google-plus'){                
        string = string.replace(/(@|#)([a-z0-9_]+['])/ig, wrapGoogleplusTagTemplate);                       
    }
    else{
        string = string.replace(exp, wrapLinkTemplate);
    }
    return string;
}
function wrapLinkTemplate(string){
    return '<a target="_blank" href="' + string + '">' + string + '<\/a>';
}
function wrapGoogleplusTagTemplate(string){
    return '<a target="_blank" href="https://plus.google.com/s/' + string + '" >' + string + '<\/a>';   
}
function shorten(string){
    string = $.trim(string);
    if (string.length > options.length)
    {
        return jQuery.trim(string).substring(0, options.length).split(" ").slice(0, -1).join(" ") + "..."; 
    }else
    return string;
}
function stripHTML(string){
    if (typeof string === "undefined" || string === null)
        return '';
    return string.replace(/(<([^>]+)>)|nbsp;|\s{2,}|/ig,"");
}
};  

})(jQuery); 
