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
    var defaults = {
            plugin_folder: '', // a folder in which the plugin is located (with a slash in the end)
            template: 'template.html', // a path to the tamplate file
            show_media: false, //show images of attachments if available
            cookies: false, //if true then twitter results will be saved in cookies, to fetch them if 150 requests/hour is over.
            length: 500 // maximum length of post message shown
        };
    //---------------------------------------------------------------------------------
    var options = $.extend(defaults, options),container = $(this),template,loaded = []; 
    container.empty().css('display', 'inline-block');
    //---------------------------------------------------------------------------------
    // Initiate function
    return getAllData();
    //---------------------------------------------------------------------------------
    //This function performs consequent data loading from all of the sources by calling corresponding functions
    function getAllData(){
        if (options.facebook) {
            getFacebookData();
        }
        if (options.twitter) {
            getTwitterData();
        }
        if (options.vk) {
            getVKData();
        }
        if (options.google){
            getGoogleplusData();
        }
        if (options.instagram){
            getInstagramData();
        }
    }
    function fireCallback(){
        console.log(loaded);
        var fire = true;
        $.each(Object.keys(loaded),function(){
            console.log(this);
            console.log(loaded[this]);
            if (!loaded[this])
                fire = false;
        });
        if (fire && options.callback)
            options.callback();
    }
    function getFacebookData(){
        var limit = 'limit=' + options.facebook.limit,
        query_extention = '&access_token=' + options.facebook.token + '&callback=?',
        fb_graph = 'https://graph.facebook.com/',
        feed_json = fb_graph + options.facebook.username + '/feed?' + limit + query_extention; 
        loaded['fb'] = false;
        $.get(feed_json,function(json){

           $.each(json.data,function(){
            var element = this,
            post = {};
            if (element.message || element.story){
                var text = element.story, url = 'http://facebook.com/' + element.from.id
                if (element.message)
                    text = element.message;                            
                if (element.link)
                    url = element.link;   
                if (options.show_media){
                    if (element.picture){
                        post.attachment = '<img class="attachment" src="' + element.picture.replace('_s.', '_b.') + '" />';
                    }
                }
                post.dt_create = moment(element.created_time);
                post.author_link = 'http://facebook.com/' + element.from.id;
                post.author_picture = fb_graph + element.from.id + '/picture';
                post.post_url = url;
                post.author_name = element.from.name;
                post.message = text;
                post.description = (element.description) ? element.description : '';
                post.link = url;
                post.social_network = 'fb';
                getTemplate(post, json.data[json.data.length-1] == element);
            }
        });
},'json');

}
function getGoogleplusData(){
    var content = 'https://www.googleapis.com/plus/v1/people/' + options.google.userid + '/activities/public?key=' + options.google.access_token + '&maxResults=' + options.google.limit;
    loaded['google'] = false;
    $.ajax({
     url : content,
     dataType : 'jsonp',
     success:function(json){     

       $.each(json.items, function(){              
        var post = {},
        element = this;     
        post.attachment = '';      
        post.description = '';                                                 
        post.dt_create = moment(element.published);
        post.author_link = element.actor.url;
        post.author_picture = element.actor.image.url;
        post.post_url = element.url;
        post.author_name = element.actor.displayName;
        if(options.show_media === true){
            if(element.verb === 'share' && element.object.content === ""){                                                                                                          
                $.each(element.object.attachments, function(){
                    share = this;                                    
                    post.attachment = '<img width="50%" src="' + share.image.url + '"/>';                                
                });                                                          
            }          
            if(element.verb === 'share'){                                                  
                $.each(element.object.attachments, function(){  
                    if(this.thumbnails.length > 1){
                        $.each(this.thumbnails, function(){                                                                                                                                      
                            post.attachment += '<img src="' + this.image.url + '"/>';                                                                                                                                                                                                                                                       
                        });   
                    }
                    else{                                    
                        post.attachment =  '<img src="' + this.image.url + '"/>';
                    }        
                });
            }
            else{
                if(element.object.attachments !== undefined){
                    $.each(element.object.attachments, function(){
                        var image = '';
                        if (this.image){
                            image=  this.image.url;
                        }else{
                            if (this.objectType=='album'){
                                if (this.thumbnails.length>0)
                                    image=this.thumbnails[0].image.url;
                            }
                        }
                        post.attachment = '<img width="50%;" src="' + image + '"/>';
                    });
                }
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
        post.social_network = 'google';      
        post.link = element.url;                                          
        getTemplate(post, json.items[json.items.length-1] == element);                    
    }); 
} 

});
}   
function getVKData(){
    var vk_json = 'https://api.vk.com/method/wall.get?owner_id='+options.vk.userid+'&filter='+options.vk.source+'&count='+options.vk.limit+'&callback=?',
    vk_user_json_template = 'https://api.vk.com/method/users.get?fields=first_name,%20last_name,%20screen_name,%20photo&uid=',
    vk_group_json_template = 'https://api.vk.com/method/groups.getById?fields=first_name,%20last_name,%20screen_name,%20photo&gid=';
    loaded['vk'] = false;
    $.get(vk_json,function(json){
        var vk_wall_owner =(options.vk.userid > 0) ? (vk_user_json_template + options.vk.userid + '&callback=?') : (vk_group_json_template+(-1) * options.vk.userid + '&callback=?'); 
        $.get(vk_wall_owner,function(wall_owner){

         $.each(json.response, function(){ 
            if (this != parseInt(this)){
                var element = this,
                post = {};
                    post.dt_create = moment.unix(element.date);//dateToSeconds(new Date(element.date*1000));
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
                    //if the post is created by user
                    if (element.from_id > 0){
                        var vk_user_json = vk_user_json_template + element.from_id + '&callback=?';
                        $.get(vk_user_json,function(user_json){
                            post.author_name = user_json.response[0].first_name + ' ' + user_json.response[0].last_name;
                            post.author_picture = user_json.response[0].photo;
                            post.author_link = 'http://vk.com/' + user_json.response[0].screen_name;
                            post.link = 'http://vk.com/' + wall_owner.response[0].screen_name + '?w=wall' + element.to_id + '_' + element.id + '%2Fall';
                            getTemplate(post, json.response[json.response.length-1] == element); 
                        },'json');
                    //if the post is created by group    
                }else{
                    var vk_group_json = vk_group_json_template+(-1) * element.from_id + '&callback=?';
                    $.get(vk_group_json,function(user_json){
                        post.author_name = user_json.response[0].name;
                        post.author_picture = user_json.response[0].photo;
                        post.author_link = 'http://vk.com/' + user_json.response[0].screen_name;
                        post.link = 'http://vk.com/' + wall_owner.response[0].screen_name + '?w=wall-' + user_json.response[0].gid  + '_' + element.id;
                        getTemplate(post, json.response[json.response.length-1] == element);
                    },'json');
                }      
            }
        });  
},'json');
},'json');
}
function getInstagramData() {
    var feed_json, search = '', limit = 'count=' + options.instagram.limit, query_extention = 'client_id=' + options.instagram.client_id + '&' + limit + '&callback=?', igm_api = 'https://api.instagram.com/v1/';
    igm_api = igm_api + 'users/' + options.instagram.userid + '/media/recent?';
    feed_json = igm_api + query_extention;
    loaded['igm'] = false;
    $.ajax({
        url : feed_json,
        dataType : 'jsonp',
        success : function(json) {

           $.each(json.data, function() {
            var post = {}, element = this;
            post.id = element.id;
            post.dt_create = moment((element.created_time * 1000));
            post.author_link = 'http://instagram.com/' + element.user.username;
            post.author_picture = element.user.profile_picture;
            post.post_url = element.link;
            post.author_name = element.user.full_name;
            post.message = element.caption.text;
            post.description = '';
            post.social_network = 'igm';
            post.link = element.link;
            if (options.show_media) {
                post.attachment = '<img class="attachment" src="' + element.images.standard_resolution.url + '' + '" />';
            }
            getTemplate(post, json.data[json.data.length-1] == element);
        });
       }
   });

}
function getTwitterData(){
    var tw_json = 'http://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name=' + options.twitter.username + '&count=' + options.tw_limit + '&callback=?';
    loaded['tw'] = false;
    $.ajax({
        url:tw_json,
        dataType:'json',
        timeout:1000,
        success:function(json){

         $.each(json, function(i) {              
            var post = {},
            element = this;
            post.dt_create = moment(fixTwitterDate(element.created_at));
            post.author_link = 'http://twitter.com/'+element.user.screen_name;
            post.author_picture = element.user.profile_image_url;
            post.post_url = post.author_link + '/status/' + element.id_str;
            post.author_name = element.user.name;
            post.message = element.text;
            post.description = '';
            post.social_network = 'tw';
            post.link = 'http://twitter.com/' + element.user.screen_name + '/status/' + element.id_str;
            if (options.cookies)
                $.cookie('social-feed-twitter' + i,JSON.stringify(post));
            getTemplate(post,json[json.length-1] == element);                    
        });
     }, 
     error:function(e){
        if (options.cookies){
                        //if can not fetch data from Twitter (because of the 150 responses / hour limit) get them from cookies
                        for (var i = 0, limit = options.tw_limit; i < limit && $.cookie('social-feed-twitter' + i) != null; i++){
                            var data = JSON.parse($.cookie('social-feed-twitter' + i));
                            data.dt_create = moment(data.dt_create);
                            getTemplate(data);
                        }            
                    }
                }
            });
}
        //---------------------------------------------------------------------------------
        //Render functions
        //---------------------------------------------------------------------------------
        function getTemplate(data, lastelement){
            var content = data;     
            content.attachment=(content.attachment==undefined) ? '' : content.attachment;
            content.time_ago = data.dt_create.fromNow();
            content.dt_create=content.dt_create.valueOf();
            content.text = wrapLinks(shorten(data.message + ' ' + data.description),data.social_network);
            content.social_icon = options.plugin_folder + 'img/' + data.social_network + '-icon-24.png';
            if (template!=undefined)
                placeTemplate(template(content),data, lastelement);  
            else 
                $.get(options.template,function(template_html){
                    template = doT.template(template_html);
                    placeTemplate(template(content),data,lastelement);      
                });
            
        }
        function placeTemplate(template,data, lastelement){
            if ($(container).children().length == 0){
                $(container).append(template);  
            }else{
                var i = 0,
                insert_index = -1;                    
                $.each($(container).children(), function(){
                    if ($(this).attr('dt_create') < data.dt_create){
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
                loaded[data.social_network] = true;
                fireCallback();
            }
        }
        //---------------------------------------------------------------------------------
        //Utility functions
        //---------------------------------------------------------------------------------
        function wrapLinks(string,social_network){
            var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;            
            if (social_network === 'tw'){
                string = string.replace(/(@|#)([a-z0-9_]+)/ig, wrapTwitterTagTemplate);
            }
            else if(social_network === 'google'){                
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
        //---------------------------------------------------------------------------------
        function wrapTwitterTagTemplate(string){
            return '<a target="_blank" href="http://twitter.com/' + string + '" >' + string + '<\/a>';
        }
        //---------------------------------------------------------------------------------
        function wrapGoogleplusTagTemplate(string){
            return '<a target="_blank" href="https://plus.google.com/s/' + string + '" >' + string + '<\/a>';   
        }
        //---------------------------------------------------------------------------------
        function fixTwitterDate(created_at) {
            created_at = created_at.replace('+0000','Z');
            if(created_at !== undefined)
                return created_at;
        }
        function shorten(string){
            string = $.trim(string);
            if (string.length > options.length)
            {
                var cut = string.substring(0, options.length),
                link_start_position = cut.lastIndexOf('http');
                if (link_start_position > 0){
                    var link_end_position = string.indexOf(' ',link_start_position);
                    if (link_end_position > options.length && string != string.substring(0,link_end_position))
                        return string.substring(0,link_end_position) + " ..";
                    else
                        return string;
                }else{
                    return cut + "..";
                } 
            }else
            return string;
        }
        function stripHTML(string){
            if (typeof string === "undefined" || string === null)
                return '';
            return string.replace(/(<([^>]+)>)|nbsp;|\s{2,}|/ig,"");
        }
    //---------------------------------------------------------------------------------
};  

})(jQuery); 
