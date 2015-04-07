if (typeof Object.create !== 'function') {
    Object.create = function(obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

(function($, window, document, undefined) {
    $.fn.socialfeed = function(_options) {


        var defaults = {
            plugin_folder: '', // a folder in which the plugin is located (with a slash in the end)
            template: 'template.html', // a path to the template file
            show_media: false, // show images of attachments if available
            media_min_width: 300,
            length: 500 // maximum length of post message shown
        };
        //---------------------------------------------------------------------------------
        var options = $.extend(defaults, _options),
            container = $(this),
            template,
            social_networks = ['facebook', 'instagram', 'vk', 'google', 'blogspot', 'twitter'];
        container.empty().css('display', 'inline-block');
        //---------------------------------------------------------------------------------

        //---------------------------------------------------------------------------------
        // This function performs consequent data loading from all of the sources by calling corresponding functions

        function fireCallback() {
            var fire = true;
            /*$.each(Object.keys(loaded), function() {
                if (loaded[this] > 0)
                    fire = false;
            });*/
            if (fire && options.callback) {
                options.callback();
            }
        }

        var Utility = {
            request: function(url, callback) {
                $.ajax({
                    url: url,
                    dataType: 'jsonp',
                    success: callback
                });
            },
            get_request: function(url, callback) {
                $.get(url, callback, 'json');
            },
            wrapLinks: function(string, social_network) {
                var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                if (social_network === 'google-plus') {
                    string = string.replace(/(@|#)([a-z0-9_]+['])/ig, Utility.wrapGoogleplusTagTemplate);
                } else {
                    string = string.replace(exp, Utility.wrapLinkTemplate);
                }
                return string;
            },
            wrapLinkTemplate: function(string) {
                return '<a target="_blank" href="' + string + '">' + string + '<\/a>';
            },
            wrapGoogleplusTagTemplate: function(string) {
                return '<a target="_blank" href="https://plus.google.com/s/' + string + '" >' + string + '<\/a>';
            },
            shorten: function(string) {
                string = $.trim(string);
                if (string.length > options.length) {
                    return jQuery.trim(string).substring(0, options.length).split(" ").slice(0, -1).join(" ") + "...";
                } else {
                    return string;
                }
            },
            stripHTML: function(string) {
                if (typeof string === "undefined" || string === null) {
                    return '';
                }
                return string.replace(/(<([^>]+)>)|nbsp;|\s{2,}|/ig, "");
            }
        };

        function SocialFeedPost(social_network, data) {
            this.content = data;
            this.content.social_network = social_network;
            this.content.attachment = (this.content.attachment === undefined) ? '' : this.content.attachment;
            this.content.time_ago = data.dt_create.fromNow();
            this.content.dt_create = this.content.dt_create.valueOf();
            this.content.text = Utility.wrapLinks(Utility.shorten(data.message + ' ' + data.description), data.social_network);
            this.content.moderation_passed = (options.moderation) ? options.moderation(this.content) : true;

            Feed[social_network].posts.push(this);
        }
        SocialFeedPost.prototype = {
            render: function() {
                var rendered_html = Feed.template(this.content);
                var data = this.content;

                if ($(container).children('[social-feed-id=' + data.id + ']').length !== 0) {
                    return false;
                }
                if ($(container).children().length === 0) {
                    $(container).append(rendered_html);
                } else {
                    var i = 0,
                        insert_index = -1;
                    $.each($(container).children(), function() {
                        if ($(this).attr('dt-create') < data.dt_create) {
                            insert_index = i;
                            return false;
                        }
                        i++;
                    });
                    $(container).append(rendered_html);
                    if (insert_index >= 0) {
                        insert_index++;
                        var before = $(container).children('div:nth-child(' + insert_index + ')'),
                            current = $(container).children('div:last-child');
                        $(current).insertBefore(before);
                    }

                }
                if (options.media_min_width) {

                    var query = '[social-feed-id=' + data.id + '] img.attachment';
                    var image = $(query);
                    image.error(function() {
                        image.hide();
                    });
                    image.load(function() {
                        if (image.width() < options.media_min_width) {
                            image.hide();
                        }
                    });
                }
                //if (lastelement) {

                //loaded[data.social_network]--;
                //fireCallback();
                //}
            }

        };

        var Feed = {
                template: false,
                init: function() {
                    Feed.getTemplate(function() {
                        social_networks.forEach(function(network) {
                            if (options[network]) {
                                //loaded[network] = 0;
                                options[network].accounts.forEach(function(account) {
                                    //loaded[network]++;
                                    Feed[network].getData(account);
                                });
                            }
                        });
                    });
                },
                getTemplate: function(callback) {
                    if (Feed.template)
                        return callback();
                    else {
                        if (options.template_html) {
                            Feed.template = doT.template(options.template_html);
                            return callback();
                        } else {
                            $.get(options.template, function(template_html) {
                                Feed.template = doT.template(template_html);
                                return callback();
                            });
                        }
                    }
                },
                twitter: {
                    posts: [],
                    loaded: false,
                    api: 'http://api.tweecool.com/',

                    getData: function(account) {

                        var cb = new Codebird;
                        cb.setConsumerKey(options.twitter.consumer_key, options.twitter.consumer_secret);

                        switch (account[0]) {
                            case '@':
                                var userid = account.substr(1);
                                cb.__call(
                                    "statuses_userTimeline",
                                    "id=" + userid + "&count=" + options.twitter.limit,
                                    Feed.twitter.utility.getPosts,
                                    true // this parameter required
                                );
                                break;
                            case '#':
                                var hashtag = account.substr(1);
                                cb.__call(
                                    "search_tweets",
                                    "q=" + hashtag + "&count=" + options.twitter.limit,
                                    function(reply) {
                                        Feed.twitter.utility.getPosts(reply.statuses);
                                    },
                                    true // this parameter required
                                );
                                break;
                            default:
                        }
                    },
                    utility: {
                        getPosts: function(json) {
                            if (json) {
                                $.each(json, function() {
                                    var element = this;
                                    var post = new SocialFeedPost('twitter', Feed.twitter.utility.unifyPostData(element));
                                    post.render();
                                });
                            }
                        },
                        unifyPostData: function(element) {
                            var post = {};
                            if (element.id) {
                                post.id = element.id;
                                post.dt_create = moment(element.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en');
                                post.author_link = 'http://twitter.com/' + element.user.screen_name;
                                post.author_picture = element.user.profile_image_url;
                                post.post_url = post.author_link + '/status/' + element.id_str;
                                post.author_name = element.user.name;
                                post.message = element.text;
                                post.description = '';
                                post.link = 'http://twitter.com/' + element.user.screen_name + '/status/' + element.id_str;

                                if (options.show_media === true) {
                                    if (element.entities.media && element.entities.media.length > 0) {
                                        var image_url = element.entities.media[0].media_url;
                                        if (image_url) {
                                            post.attachment = '<img class="attachment" src="' + image_url + '" />';
                                        }
                                    }
                                }
                            }
                            return post;
                        },
                    }

                },
                facebook: {
                    posts: [],
                    graph: 'https://graph.facebook.com/',
                    loaded: false,
                    getData: function(account) {
                        var request_url, limit = 'limit=' + options.facebook.limit,
                            query_extention = '&access_token=' + options.facebook.access_token + '&callback=?';
                        switch (account[0]) {
                            case '@':
                                var username = account.substr(1);
                                request_url = Feed.facebook.graph + 'v1.0/' + username + '/posts?' + limit + query_extention;
                                break;
                            case '#':
                                var hashtag = account.substr(1);
                                // search by hashtags is depriciated in API v2.x, so we use here v1.0 explicitly
                                request_url = Feed.facebook.graph + 'v1.0/search?q=%23' + hashtag + '&' + limit + query_extention;
                                break;
                            default:
                                // search by hashtags is depriciated in API v2.x, so we use here v1.0 explicitly
                                request_url = Feed.facebook.graph + 'v1.0/search?q=' + account + '&' + limit + query_extention;
                        }
                        Utility.request(request_url, Feed.facebook.utility.getPosts);
                    },
                    utility: {
                        prepareAttachment: function(element) {
                            var image_url = element.picture;
                            if (image_url.indexOf('_b.') !== -1) {
                                //do nothing it is already big
                            } else if (image_url.indexOf('safe_image.php') !== -1) {
                                image_url = Feed.facebook.utility.getExternalImageURL(image_url, 'url');

                            } else if (image_url.indexOf('app_full_proxy.php') !== -1) {
                                image_url = Feed.facebook.utility.getExternalImageURL(image_url, 'src');

                            } else if (element.object_id) {
                                image_url = Feed.facebook.graph + element.object_id + '/picture/?type=normal';
                            }
                            return '<img class="attachment" src="' + image_url + '" />';
                        },
                        getExternalImageURL: function(image_url, parameter) {
                            image_url = decodeURIComponent(image_url).split(parameter + '=')[1];
                            if (image_url.indexOf('fbcdn-sphotos') === -1) {
                                return image_url.split('&')[0];
                            } else {
                                return image_url;
                            }

                        },
                        getPosts: function(json) {
                            if (json['data']){
                                json['data'].forEach(function(element) {
                                    var post = new SocialFeedPost('facebook', Feed.facebook.utility.unifyPostData(element));
                                    post.render();
                                });
                            }
                        },
                        unifyPostData: function(element) {
                            var post = {},
                                text = (element.message) ? element.message : element.story;

                            post.id = element.id;
                            post.dt_create = moment(element.created_time);
                            post.author_link = 'http://facebook.com/' + element.from.id;
                            post.author_picture = Feed.facebook.graph + element.from.id + '/picture';
                            post.author_name = element.from.name;
                            post.name = element.name || "";
                            post.message = (text) ? text : '';
                            post.description = (element.description) ? element.description : '';
                            post.link = (element.link) ? element.link : 'http://facebook.com/' + element.from.id;

                            if (options.show_media === true) {
                                if (element.picture) {
                                    var attachment = Feed.facebook.utility.prepareAttachment(element);
                                    if (attachment) {
                                        post.attachment = attachment;
                                    }
                                }
                            }
                            return post;
                        }
                    }
                },
                google: {
                    posts: [],
                    loaded: false,
                    api: 'https://www.googleapis.com/plus/v1/',
                    getData: function(account) {
                        var request_url;
                        switch (account[0]) {
                            case '#':
                                var hashtag = account.substr(1);
                                request_url = Feed.google.api + 'activities?query=' + hashtag + '&key=' + options.google.access_token + '&maxResults=' + options.google.limit;
                                Utility.get_request(request_url, Feed.google.utility.getPosts);
                                break;
                            case '@':
                                var username = account.substr(1);
                                request_url = Feed.google.api + 'people/' + username + '/activities/public?key=' + options.google.access_token + '&maxResults=' + options.google.limit;
                                Utility.get_request(request_url, Feed.google.utility.getPosts);
                                break;
                            default:
                        }
                    },
                    utility: {
                        getPosts: function(json) {
                            if (json.items) {
                                $.each(json.items, function(i) {
                                    var post = new SocialFeedPost('google', Feed.google.utility.unifyPostData(json.items[i]));
                                    post.render();
                                });
                            }
                        },
                        unifyPostData: function(element) {
                            var post = {};

                            post.id = element.id;
                            post.attachment = '';
                            post.description = '';
                            post.dt_create = moment(element.published);
                            post.author_link = element.actor.url;
                            post.author_picture = element.actor.image.url;
                            post.author_name = element.actor.displayName;

                            if (options.show_media === true) {
                                if (element.object.attachments) {
                                    $.each(element.object.attachments, function() {
                                        var image = '';
                                        if (this.fullImage) {
                                            image = this.fullImage.url;
                                        } else {
                                            if (this.objectType === 'album') {
                                                if (this.thumbnails && this.thumbnails.length > 0) {
                                                    if (this.thumbnails[0].image) {
                                                        image = this.thumbnails[0].image.url;
                                                    }
                                                }
                                            }
                                        }
                                        post.attachment = '<img class="attachment" src="' + image + '"/>';
                                    });
                                }
                            }
                            post.message = element.title;
                            post.link = element.url;

                            return post;
                        }
                    }
                },
                instagram: {
                    posts: [],
                    api: 'https://api.instagram.com/v1/',
                    loaded: false,
                    getData: function(account) {
                        var url;

                        switch (account[0]) {
                            case '@':
                                var username = account.substr(1);
                                url = Feed.instagram.api + 'users/search/?q=' + username + '&' + 'client_id=' + options.instagram.client_id + '&count=1' + '&callback=?';
                                Utility.request(url, Feed.instagram.utility.getUsers);
                                break;
                            case '#':
                                var hashtag = account.substr(1);
                                url = Feed.instagram.api + 'tags/' + hashtag + '/media/recent/?' + 'client_id=' + options.instagram.client_id + '&' + 'count=' + options.instagram.limit + '&callback=?';
                                Utility.request(url, Feed.instagram.utility.getImages);
                                break;
                            default:
                        }
                    },
                    utility: {
                        getImages: function(json) {
                            if (json.data) {
                                json.data.forEach(function(element) {
                                    var post = new SocialFeedPost('instagram', Feed.instagram.utility.unifyPostData(element));
                                    post.render();
                                });
                            }
                        },
                        getUsers: function(json) {
                            json.data.forEach(function(user) {
                                var url = Feed.instagram.api + 'users/' + user.id + '/media/recent/?' + 'client_id=' + options.instagram.client_id + '&' + 'count=' + options.instagram.limit + '&callback=?';
                                Utility.request(url, Feed.instagram.utility.getImages);
                            });
                        },
                        unifyPostData: function(element) {
                            var post = {};

                            post.id = element.id;
                            post.dt_create = moment(element.created_time * 1000);
                            post.author_link = 'http://instagram.com/' + element.user.username;
                            post.author_picture = element.user.profile_picture;
                            post.author_name = element.user.full_name;
                            post.message = (element.caption && element.caption) ? element.caption.text : '';
                            post.description = '';
                            post.link = element.link;
                            if (options.show_media) {
                                post.attachment = '<img class="attachment" src="' + element.images.standard_resolution.url + '' + '" />';
                            }
                            return post;
                        }
                    }
                },
                vk: {
                    posts: [],
                    loaded: false,
                    base: 'http://vk.com/',
                    api: 'https://api.vk.com/method/',
                    user_json_template: 'https://api.vk.com/method/' + 'users.get?fields=first_name,%20last_name,%20screen_name,%20photo&uid=',
                    group_json_template: 'https://api.vk.com/method/' + 'groups.getById?fields=first_name,%20last_name,%20screen_name,%20photo&gid=',
                    getData: function(account) {
                        var request_url;

                        switch (account[0]) {
                            case '@':
                                var username = account.substr(1);
                                request_url = Feed.vk.api + 'wall.get?owner_id=' + username + '&filter=' + options.vk.source + '&count=' + options.vk.limit + '&callback=?';
                                Utility.get_request(request_url, Feed.vk.utility.getPosts);
                                break;
                            case '#':
                                var hashtag = account.substr(1);
                                request_url = Feed.vk.api + 'newsfeed.search?q=' + hashtag + '&count=' + options.vk.limit + '&callback=?';
                                Utility.get_request(request_url, Feed.vk.utility.getPosts);
                                break;
                            default:
                        }
                    },
                    utility: {
                        getPosts: function(json) {
                            if (json.response) {
                                $.each(json.response, function() {
                                    if (this != parseInt(this) && this.post_type === 'post') {
                                        var owner_id = (this.owner_id) ? this.owner_id : this.from_id,
                                            vk_wall_owner_url = (owner_id > 0) ? (Feed.vk.user_json_template + owner_id + '&callback=?') : (Feed.vk.group_json_template + (-1) * owner_id + '&callback=?'),
                                            element = this;
                                        Utility.get_request(vk_wall_owner_url, function(wall_owner) {
                                            Feed.vk.utility.unifyPostData(wall_owner, element, json);
                                        });
                                    }
                                });
                            }
                        },
                        unifyPostData: function(wall_owner, element, json) {
                            var post = {};

                            post.id = element.id;
                            post.dt_create = moment.unix(element.date);
                            post.description = ' ';
                            post.message = Utility.stripHTML(element.text);
                            if (options.show_media) {
                                if (element.attachment) {
                                    if (element.attachment.type === 'link')
                                        post.attachment = '<img class="attachment" src="' + element.attachment.link.image_src + '" />';
                                    if (element.attachment.type === 'video')
                                        post.attachment = '<img class="attachment" src="' + element.attachment.video.image_big + '" />';
                                    if (element.attachment.type === 'photo')
                                        post.attachment = '<img class="attachment" src="' + element.attachment.photo.src_big + '" />';
                                }
                            }

                            if (element.from_id > 0) {
                                var vk_user_json = Feed.vk.user_json_template + element.from_id + '&callback=?';
                                Utility.get_request(vk_user_json, function(user_json) {
                                    var vk_post = new SocialFeedPost('vk', Feed.vk.utility.getUser(user_json, post, element, json));
                                    vk_post.render();
                                });

                            } else {
                                var vk_group_json = Feed.vk.group_json_template + (-1) * element.from_id + '&callback=?';
                                Utility.get_request(vk_group_json, function(user_json) {
                                    var vk_post = new SocialFeedPost('vk', Feed.vk.utility.getGroup(user_json, post, element, json));
                                    vk_post.render();
                                });
                            }
                        },
                        getUser: function(user_json, post, element, json) {
                            post.author_name = user_json.response[0].first_name + ' ' + user_json.response[0].last_name;
                            post.author_picture = user_json.response[0].photo;
                            post.author_link = Feed.vk.base + user_json.response[0].screen_name;
                            post.link = Feed.vk.base + user_json.response[0].screen_name + '?w=wall' + element.from_id + '_' + element.id;

                            return post;
                        },
                        getGroup: function(user_json, post, element, json) {
                            post.author_name = user_json.response[0].name;
                            post.author_picture = user_json.response[0].photo;
                            post.author_link = Feed.vk.base + user_json.response[0].screen_name;
                            post.link = Feed.vk.base + user_json.response[0].screen_name + '?w=wall-' + user_json.response[0].gid + '_' + element.id;

                            return post;
                        }
                    }
                },
                blogspot: {
                    loaded: false,
                    getData: function(account) {
                        var url;

                        switch (account[0]) {
                            case '@':
                                var username = account.substr(1);
                                url = 'http://' + username + '.blogspot.com/feeds/posts/default?alt=json-in-script&callback=?';
                                request(url, getPosts);
                                break;
                            default:
                        }
                    },
                    utility: {
                        getPosts: function(json) {
                            $.each(json.feed.entry, function() {
                                var post = {},
                                    element = this;
                                post.id = element.id['$t'].replace(/[^a-z0-9]/gi, '');
                                post.dt_create = moment((element.published['$t']));
                                post.author_link = element.author[0]['uri']['$t'];
                                post.author_picture = 'http:' + element.author[0]['gd$image']['src'];
                                post.author_name = element.author[0]['name']['$t'];
                                post.message = element.title['$t'] + '</br></br>' + stripHTML(element.content['$t']);
                                post.description = '';
                                post.link = element.link.pop().href;

                                if (options.show_media) {
                                    if (element['media$thumbnail']) {
                                        post.attachment = '<img class="attachment" src="' + element['media$thumbnail']['url'] + '" />';
                                    }
                                }

                                post.render();

                            });
                        }
                    }
                }
            };
            // Initialization
        Feed.init();
        if (options.update_period) {
            setInterval(function() {
                return Feed.init();
            }, options.update_period);
        }
    };

})(jQuery);
