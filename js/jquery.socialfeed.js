if (typeof Object.create !== 'function') {
	Object.create = function(obj) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
};
(function($, window, document, undefined) {
	$.fn.socialfeed = function(options) {

		var defaults = {
			plugin_folder: '', // a folder in which the plugin is located (with a slash in the end)
			template: 'template.html', // a path to the tamplate file
			show_media: false, // show images of attachments if available
			media_min_width: 300,
			length: 300, // maximum length of post message shown
			callback: function(feed_container) { feed_container.fadeIn(600); }
		};
		//---------------------------------------------------------------------------------
		var options = $.extend(defaults, options),
			container = $(this),
			template,
			fbApiInit = 0,
			social_networks = {'facebook':false, 'instagram':false, 'twitter':false};
			container.empty();
		//---------------------------------------------------------------------------------

		//---------------------------------------------------------------------------------
		// This function performs consequent data loading from all of the sources by calling corresponding functions


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
				string = string.replace(exp, Utility.wrapLinkTemplate);
				
				return string;
			},
			wrapLinkTemplate: function(string) {
				return '<a target="_blank" href="' + string + '">' + string + '<\/a>';
			},
			shorten: function(string) {
				string = $.trim(string);
				if (string.length > options.length) {
					return jQuery.trim(string).substring(0, options.length).split(" ").slice(0, -1).join(" ") + "...";
				} else
					return string;
			},
			stripHTML: function(string) {
				if (typeof string === "undefined" || string === null)
					return '';
				return string.replace(/(<([^>]+)>)|nbsp;|\s{2,}|/ig, "");
			}
		}

		function SocialFeedPost(social_network, data) {
			this.content = data;
			this.content.social_network = social_network;
			this.content.attachment = (this.content.attachment == undefined) ? '' : this.content.attachment;
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
				
				//console.log(data);
				
				if ($(container).children('[social-feed-id=' + data.id + ']').length != 0)
					return false;
				if ($(container).children().length == 0) {
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
					
					// preload the image
					var height, width = '';
					var img = new Image();
					var imgSrc = image.attr("src");
					
					$(img).load(function () {
					    console.log('Width: ' + img.width + ', Height: ' + img.height);
					    
					    if (img.width < options.media_min_width) {
                            image.hide();
                            
                            console.log('Image too small');
                        }
					    // garbage collect img
					    delete img;
					}).error(function () {
						img.hide();
					    // image couldnt be loaded
					    console.log('An error occurred and your image could not be loaded.  Please try again.');
					}).attr({ src: imgSrc });

				}
			}

		}
		var Feed = {
				template: false,
				init: function() {

					if (!options.facebook.adjustedLimit && options.facebook.limit){
						options.facebook.adjustedLimit = options.facebook.limit;
					}

					Feed.getTemplate(function() {
						var count = 0;
						for (network in social_networks) {
							if (options[network]) {
								options[network].accounts.forEach(function(account) {
									Feed[network].getData(account);
								});
							}
							else {
								social_networks[network] = true;
							}
							count ++;
						}
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
				checkStatus: function(currentNetwork) {



					var complete = true;
					for (network in social_networks) {
						if (social_networks[network] == false) {
							complete = false;
							return
						}
					}

					
					if (complete == true) {
						options.callback(container);
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
							social_networks["twitter"] = true;
							Feed.checkStatus();
						},
						unifyPostData: function(element) {
							var post = {};
							post.id = element.id;
							post.dt_create = moment(element.created_at);
							post.author_link = 'http://twitter.com/' + element.user.screen_name;
							post.author_picture = element.user.profile_image_url;
							post.post_url = post.author_link + '/status/' + element.id_str;
							post.author_name = element.user.name;
							post.message = element.text;
							post.description = '';
							post.link = 'http://twitter.com/' + element.user.screen_name + '/status/' + element.id_str;

							if (options.show_media === true) {
								if (element.entities.media && element.entities.media.length > 0) {
									image_url = element.entities.media[0].media_url;
									if (image_url) {
										post.attachment = '<img class="attachment" src="' + image_url + '" />';
									}
								}
							}
							return post;
						},
					}

				},
				facebook: {
					posts: [],
					graph: 'https://graph.facebook.com/v2.2/',
					loaded: false,
					getData: function(account) {				

						if(fbApiInit == 0) {
							FB.init({
								appId: "1391248201177913",
								xfbml: true,
								version: 'v2.2'
							});
							fbApiInit = 1;
						}


						FB.api(

							'/'+account+'/feed', 
							{ 
								access_token : options.facebook.access_token,
								limit: options.facebook.adjustedLimit
							}, 
							function(response) {
								
								if (typeof response.error != "undefined" && typeof response.error.code != "undefined" && response.error.code == 1){

									FB.api(

									'/'+account+'/promotable_posts', 
									{ 
										access_token : options.facebook.access_token,
										limit: options.facebook.adjustedLimit
									}, 
									function(response) {
										Feed.facebook.utility.getPosts(response);
									});
								}

								else {
									Feed.facebook.utility.getPosts(response);
								}

							}
						);
					},
					utility: {
						prepareAttachment: function(element) {

							var image_url = element.picture;

							if (element.object_id) {
								image_url = Feed.facebook.graph + element.object_id + '/picture/?type=normal&w=1000&access_token='+options.facebook.access_token;
								
								//console.log(image_url);
							}
							else if (image_url.indexOf('_b.') != -1) {
								//do nothing it is already big
							} else if (image_url.indexOf('safe_image.php') != -1) {
								image_url = Feed.facebook.utility.getExternalImageURL(image_url, 'url');

							} else if (image_url.indexOf('app_full_proxy.php') != -1) {
								image_url = Feed.facebook.utility.getExternalImageURL(image_url, 'src');

							}
							return '<img class="attachment" src="' + image_url + '" />';
						},
						getExternalImageURL: function(image_url, parameter) {
							image_url = decodeURIComponent(image_url).split(parameter + '=')[1]
							if (image_url.indexOf('fbcdn-sphotos') == -1) {
								return image_url.split('&')[0];
							} else {
								return image_url
							}

						},
						getPosts: function(json) {
							if (json['data']) {

								options.facebook.adjustedLimit = options.facebook.limit;
								
								json['data'].forEach(function(element) {

									if (!element.story || element.story.indexOf("commented on") == -1){
										var post = new SocialFeedPost('facebook', Feed.facebook.utility.unifyPostData(element));
										post.render();
									}
									else if (options.facebook.limit) {
										options.facebook.adjustedLimit++;
									}

								});

								social_networks["facebook"] = true;
								Feed.checkStatus();

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
							post.message = (text) ? text : '';
							post.description = (element.description) ? element.description : '';
							post.link = (element.link) ? element.link : 'http://facebook.com/' + element.from.id;
							post.link = (post.link.indexOf("http") == -1) ? 'http://facebook.com/' + post.link : post.link;
 
							if (options.show_media === true) {
								if (element.picture) {
									attachment = Feed.facebook.utility.prepareAttachment(element);
									if (attachment) {
										post.attachment = attachment;
									}
								}
							}
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

							social_networks["instagram"] = true;
							Feed.checkStatus();
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
				}
			}
			// Initialization
		Feed.init();
		if (options.update_period) {
			setInterval(function() {
				return Feed.init();
			}, options.update_period);
		}
	};

})(jQuery);
