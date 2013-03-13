(function($){  
    $.fn.socialfeed = function(options)
    {
        var defaults = {
            plugin_folder: 'social-feed', // a folder in which the plugin is located
            // VK.com
            vk_limit: 3,
            //vk_username: "vk_username", // ID of a VK page which stream will be shown  
            // Twitter
            tw_limit: 3, // Maximum amount of posts showed
            //tw_username: "tw_username", // ID of a Facebook page which stream will be shown  
            // Facebook
            fb_limit: 3, //Maximum amount of posts showed
            //fb_username: "fb_username", // ID of a Facebook page which stream will be shown
            // General
            length: 500 // maximum length of post message shown
        };
        //---------------------------------------------------------------------------------
        var options = $.extend(defaults, options);  
        container = $(this); 
        container.css('display', 'inline-block');
        //---------------------------------------------------------------------------------
        // Initiate function
        return getAllData();
        //---------------------------------------------------------------------------------
        /*
        getAllData
        [void getAllData(void)]
        input: void - description here
        output: void - description here
        This function performs consequent data loading from all of the sources by calling corresponding functions
        */
        function getAllData()
        {
            if (options.fb_username != undefined) {
                //Facebook requires an access_token for fetching the feed.
                $.get(options.plugin_folder + '/php/get_access_token.php', function(data) {
                    getFacebookData(data);
                });
            }
            if (options.tw_username != undefined) {
                getTwitterData();
            }
            if (options.vk_username != undefined) {
                getVkontakteData();
            }
        }
        function getFacebookData(access_token)
        {
            var element;
            var limit='&limit='+options.fb_limit;
            var query_extention='&access_token='+access_token+'&callback=?';
            var fb_graph='https://graph.facebook.com/';
            var feed_json=fb_graph+options.fb_username+'/feed/?'+limit+query_extention; 
            $.get(feed_json,function(json){
                $.each(json.data,function(){
                    element=this;
                    var text,url;
                    var post=[];
                   
                    if (element.message!=undefined || element.story!=undefined){
                        if (element.message!=undefined)
                            text=element.message;
                        else
                            text=element.story;
                        if (element.link!=undefined)
                            url=element.link;
                        else
                            url='http://facebook.com/'+element.from.id;
                        post['dt_create']=convertDate(element.created_time);
                        post['author_link']='http://facebook.com/'+element.from.id;
                        post['author_picture']=fb_graph+element.from.id+'/picture';
                        post['post_url']=url;
                        post['author_name']=element.from.name;
                        post['message']=text;
                        post['description']='';
                        post['link']=url;
                        if (element.description!=undefined)
                            post['description']=element.description;
                        post['social-network']='fb';
                        render(post);
                    }
                });
            },'json');
            
        }
        function getVkontakteData()
        {
            var regex = /(<([^>]+)>)/ig;
            var vk_json='https://api.vk.com/method/wall.get?owner_id='+options.vk_username+'&filter=owner&count='+options.vk_limit+'&callback=?';
            var vk_user_json='https://api.vk.com/method/users.get?fields=first_name,%20last_name,%20screen_name,%20photo&uid=';
            var vk_group_json='https://api.vk.com/method/groups.getById?fields=first_name,%20last_name,%20screen_name,%20photo&gid=';
            $.get(vk_json,function(json){
                var i=0;
                $.each(json.response, function(){ 
                    if (this != parseInt(this)){
                        var element;
                        element=this;
                        var post=[];
                        post['dt_create']=new Date(element.date*1000);
                        post['description']='';
                        post['message']=element.text.replace(regex,"");
                        post['social-network']='vk';
                        //if the post is created by user
                        if (element.from_id>0){
                            vk_user_json+=element.from_id+'&callback=?';
                            $.get(vk_user_json,function(user_json){
                                post['author_name']=user_json.response[0].first_name+' '+user_json.response[0].last_name;
                                post['author_picture']=user_json.response[0].photo;
                                post['author_link']='http://vk.com/'+user_json.response[0].screen_name;
                                post['link']='http://vk.com/'+user_json.response[0].screen_name+'?w=wall'+user_json.response[0].uid+'_'+element.id+'%2Fall';
                                render(post); 
                            },'json');
                        //if the post is created by group    
                        }else{
                            vk_group_json+=(-1)*element.from_id+'&callback=?';
                            $.get(vk_group_json,function(user_json){
                                post['author_name']=user_json.response[0].name;
                                post['author_picture']=user_json.response[0].photo;
                                post['author_link']='http://vk.com/'+user_json.response[0].screen_name;
                                post['link']='http://vk.com/'+user_json.response[0].screen_name+'?w=wall-'+user_json.response[0].gid+'_'+element.id;
                                render(post);
                                   
                            },'json');
                        }      
                    }
                });
                  
            },'json');
        }
        function getTwitterData()
        {
            var element;
            var tw_json='http://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name='+options.tw_username+'&count='+options.tw_limit+'&callback=?';
            $.get(tw_json,function(json){
                $.each(json, function() { 
                    var post=[];
                    element=this;
                    post['dt_create']=convertDate(element.created_at);
                    post['author_link']='http://twitter.com/'+element.user.screen_name;
                    post['author_picture']=element.user.profile_image_url;
                    post['post_url']='http://twitter.com/'+element.user.screen_name+'/status/'+element.id_str;
                    post['author_name']=element.user.name;
                    post['message']=element.text;
                    post['description']='';
                    post['social-network']='tw';
                    post['link']='http://twitter.com/'+element.user.screen_name+'/status/'+element.id_str;
                    render(post);
                });
                 
            },'json');
        }
        //---------------------------------------------------------------------------------
        //Render functions
        //---------------------------------------------------------------------------------
        function render(data)
        {
            var template='<div class="media social-feed-element" dt_create="'+data['dt_create']+'">\n\
 <a class="pull-left" href="' + data['author_link'] + '" target="_blank">\n\
<img class="media-object" src="'+data['author_picture']+'">\n\
                </a>\n\
                <div class="media-body">\n\
                <p><img class="social-network-icon" title="posted by '+data['social-network']+'" src="'+options.plugin_folder+'/img/'+data['social-network']+'-icon-24.png" />'+data['author_name']+'<a href="'+data['link']+'" target="_blank" class="read-button"><span class="label label-info">open </span></a></p>\n\
                <div>\n\
                '+wrapLinks(short_text(data['message']+' '+data['description']))+' \n\
                </div></div></div>';
            placeRow(template,data);      
        }
        function placeRow(li,data)
        {
            if ($(container).children().length==0){
                $(container).append(li);  
            }else{
                var i=0;
                var insert_index=-1;
                    
                $.each($(container).children(), function(){ 
                    if (convertDate($(this).attr('dt_create'))<data['dt_create']){
                        insert_index=i;
                        return false;
                    }
                    i++;
                });
                //console.log(container+' div:nth-child('+insert_index+')');
                if (insert_index>=0){
                    insert_index++;
                    var element=$(container).children('div:nth-child('+insert_index+')');
                    $(li).insertBefore(element);  
                }
                else{
                    $(container).append(li); 
                }
                
            }
        }
        //---------------------------------------------------------------------------------
        //utility functions
        //---------------------------------------------------------------------------------
        function wrapTemplate( str ) 
        {
            return '<a target="_blank" href="' + str + '">' + str + '<\/a>';
        }
        function wrapLinks(string) 
        {
            return string.replace(/\bhttp[^ ]+/ig, wrapTemplate);
        }
        function convertDate(string)
        {
    
            var date = new Date(
                string.replace(/^\w+ (\w+) (\d+) ([\d:]+) \+0000 (\d+)$/,
                    "$1 $2 $4 $3 UTC"));
            return date;
        }
        function short_text(string)
        {
            if (string.length>options.length)
                return jQuery.trim(string).substring(0, options.length)+'...';
            else
                return jQuery.trim(string);
        }
    //---------------------------------------------------------------------------------
    };  
   
})(jQuery); 
