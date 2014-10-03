codebird-js
===========
*A Twitter library in JavaScript.*

Copyright (C) 2010-2014 Jublo Solutions <support@jublo.net>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.


Including Codebird
------------------

To include Codebird in your code, add its scripts to your markup:

```html
<script type="text/javascript" src="codebird.js"></script>

<script type="text/javascript">
var cb = new Codebird;
cb.setConsumerKey("YOURKEY", "YOURSECRET");
</script>
```

You may also use a JavaScript module loader of your choice
(such as [RequireJS](http://requirejs.org/) or the one bundled in Node.js)
to load Codebird unobtrusively.  In Node.js, loading Codebird looks like this:

```javascript
var Codebird = require("codebird");
// or with leading "./", if the codebird.js file is in your main folder:
// var Codebird = require("./codebird");

var cb = new Codebird;
cb.setConsumerKey("YOURKEY", "YOURSECRET");
```


Authentication
--------------

To authenticate your API requests on behalf of a certain Twitter user
(following OAuth 1.0a), take a look at these steps:

```html
<script type="text/javascript" src="codebird.js"></script>

<script type="text/javascript">
var cb = new Codebird;
cb.setConsumerKey("YOURKEY", "YOURSECRET");
</script>
```

You may either set the OAuth token and secret, if you already have them:
```javascript
cb.setToken("YOURTOKEN", "YOURTOKENSECRET");
```

Or you authenticate, like this:

```javascript
// gets a request token
cb.__call(
    "oauth_requestToken",
    {oauth_callback: "oob"},
    function (reply) {
        // stores it
        cb.setToken(reply.oauth_token, reply.oauth_token_secret);

        // gets the authorize screen URL
        cb.__call(
            "oauth_authorize",
            {},
            function (auth_url) {
                window.codebird_auth = window.open(auth_url);
            }
        );
    }
);
```

Now you need to add a PIN box to your website.
After the user enters the PIN, complete the authentication:

```javascript
cb.__call(
    "oauth_accessToken",
    {oauth_verifier: document.getElementById("PINFIELD").value},
    function (reply) {
        // store the authenticated token, which may be different from the request token (!)
        cb.setToken(reply.oauth_token, reply.oauth_token_secret);

        // if you need to persist the login after page reload,
        // consider storing the token in a cookie or HTML5 local storage
    }
);
```

### Application-only auth

Some API methods also support authenticating on a per-application level.
This is useful for getting data that are not directly related to a specific
Twitter user, but generic to the Twitter ecosystem (such as ```search/tweets```).

To obtain an app-only bearer token, call the appropriate API:

```javascript
cb.__call(
    "oauth2_token",
    {},
    function (reply) {
        var bearer_token = reply.access_token;
    }
);
```

I strongly recommend that you store the obtained bearer token in your database.
There is no need to re-obtain the token with each page load, as it becomes invalid
only when you call the ```oauth2/invalidate_token``` method.

If you already have your token, tell Codebird to use it:
```javascript
cb.setBearerToken("YOURBEARERTOKEN");
```
In this case, you don't need to set the consumer key and secret.
For sending an API request with app-only auth, see the ‘Usage examples’ section.

### Authenticating using a callback URL, without PIN


1. Before sending your user off to Twitter, you have to store the request token and its secret, for example in a cookie.
2. In the callback URL, extract those values and assign them to the Codebird object.
3. Extract the ```oauth_verifier``` field from the request URI.

In Javascript, try extracting the URL parameter like this:

```javascript
var cb          = new Codebird;
var current_url = location.toString();
var query       = current_url.match(/\?(.+)$/).split("&amp;");
var parameters  = {};
var parameter;

cb.setConsumerKey("STUFF", "HERE");

for (var i = 0; i < query.length; i++) {
    parameter = query[i].split("=");
    if (parameter.length === 1) {
        parameter[1] = "";
    }
    parameters[decodeURIComponent(parameter[0])] = decodeURIComponent(parameter[1]);
}

// check if oauth_verifier is set
if (typeof parameters.oauth_verifier !== "undefined") {
    // assign stored request token parameters to codebird here
    // ...
    cb.setToken(stored_somewhere.oauth_token, stored_somewhere.oauth_token_secret);

    cb.__call(
        "oauth_accessToken",
        {
            oauth_verifier: parameters.oauth_verifier
        },
        function (reply) {
            cb.setToken(reply.oauth_token, reply.oauth_token_secret);

            // if you need to persist the login after page reload,
            // consider storing the token in a cookie or HTML5 local storage
        }
    );
}
```


Usage examples
--------------

:warning: *Because the Consumer Key and Token Secret are available in the code,
it is important that you configure your app as read-only at Twitter,
unless you are sure to know what you are doing.*

When you have an access token, calling the API is simple:

```javascript
cb.setToken("YOURTOKEN", "YOURTOKENSECRET"); // see above

cb.__call(
    "statuses_homeTimeline",
    {},
    function (reply) {
        console.log(reply);
    }
);
```

Tweeting is as easy as this:

```javascript
cb.__call(
    "statuses_update",
    {"status": "Whohoo, I just tweeted!"},
    function (reply) {
        // ...
    }
);
```

:warning: *Make sure to urlencode any parameter values that contain
query-reserved characters, like tweeting the `&` sign:*

```javascript
var params = "status=" + encodeURIComponent("Fish & chips");
cb.__call(
    "statuses_update",
    params,
    function (reply) {
        // ...
    }
);
```

In most cases, giving all parameters in an array is easier,
because no encoding is needed:

```javascript
var params = {
    status: "Fish & chips"
};
cb.__call(
    "statuses_update",
    params,
    function (reply) {
        // ...
    }
);
```

```javascript
var params = {
    screen_name: "jublonet"
};
cb.__call(
    "users_show",
    params,
    function (reply) {
        // ...
    }
);
```

```javascript
var params = {
    q: "NYC"
};
cb.__call(
    "search_tweets",
    params,
    function (reply) {
        // ...
    }
);
```

### Uploading files to Twitter

The array syntax is obligatory, and the media have to be base64-encoded:

```javascript
var params = {
    "status": "The bird is flying high. #larry",
    "media[]": "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAB+0lEQVR42mP8//8/Ay0BEwONwagFoxZQDljI0PP8x7/Z93/e+PxXmpMpXp5dh4+ZgYHh0bd/clxYnMuINaMtfvRLgp3RVZwVU+rkuz+eRz+//wXVxcrEkKnEceXTX0dRlhoNTmKDaOvzXwHHv6x9+gtN/M9/hpjTX+GmMzAw/P7HMOnOj+ff//35x/Ds+z9iLfjPwPDt7//QE1/Sz319/RNh3PkPf+58+Yup/t7Xf9p8zFKcTMRa4CLGCrFm1v2fSjs+pJ/7uuvl7w+//yO7HRkUq3GEyrCREMk+kqy2IiyH3/xhYGD48uf/rPs/Z93/yczIwM3CiFU9Hw5xnD4ouvTt4Tf0AP37n+HTb+w+UOBmIs2CICm2R9/+EZlqGRkYzIVYSLMgRIYtUYGdSAsMBFgUuJhIy2iMDAwt2pysjAwLHv78RcgnOcrs5BQVHEyMG579Imi6Nh9zrBxZFgixMW624pXnwldYcTAzLjDhZmUit7AzE2K54c7fp8eF1QhWRobFptwmgiwkF3b//jMwMjJ8+P3/zPs/yx/9Wvr412+MgBJlZ1xsyuOOrbAibMHH3/87b32fce/nR2ypnpuFMVGevU6TQ5SdqKKeEVez5cuf/7te/j727s+9L/++/v3PzcyowM1kIcTiLs7Kz8pIfNnOONouGrVg1AIGAJ6gvN4J6V9GAAAAAElFTkSuQmCC"
);
cb.__call(
    "statuses_updateWithMedia",
    params,
    function (reply) {
        // ...
    }
);
```

#### Multiple images
can be uploaded in a 2-step process. **First** you send each image to Twitter, like this:
```javascript
var params = {
    "media": "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAB+0lEQVR42mP8//8/Ay0BEwONwagFoxZQDljI0PP8x7/Z93/e+PxXmpMpXp5dh4+ZgYHh0bd/clxYnMuINaMtfvRLgp3RVZwVU+rkuz+eRz+//wXVxcrEkKnEceXTX0dRlhoNTmKDaOvzXwHHv6x9+gtN/M9/hpjTX+GmMzAw/P7HMOnOj+ff//35x/Ds+z9iLfjPwPDt7//QE1/Sz319/RNh3PkPf+58+Yup/t7Xf9p8zFKcTMRa4CLGCrFm1v2fSjs+pJ/7uuvl7w+//yO7HRkUq3GEyrCREMk+kqy2IiyH3/xhYGD48uf/rPs/Z93/yczIwM3CiFU9Hw5xnD4ouvTt4Tf0AP37n+HTb+w+UOBmIs2CICm2R9/+EZlqGRkYzIVYSLMgRIYtUYGdSAsMBFgUuJhIy2iMDAwt2pysjAwLHv78RcgnOcrs5BQVHEyMG579Imi6Nh9zrBxZFgixMW624pXnwldYcTAzLjDhZmUit7AzE2K54c7fp8eF1QhWRobFptwmgiwkF3b//jMwMjJ8+P3/zPs/yx/9Wvr412+MgBJlZ1xsyuOOrbAibMHH3/87b32fce/nR2ypnpuFMVGevU6TQ5SdqKKeEVez5cuf/7te/j727s+9L/++/v3PzcyowM1kIcTiLs7Kz8pIfNnOONouGrVg1AIGAJ6gvN4J6V9GAAAAAElFTkSuQmCC"
);
cb.__call(
    "media_upload",
    params,
    function (reply) {
        // you get a media id back:
        console.log(reply.media_id_string);

        // continue upload of 2nd image here
    }
);
```
**Second,** you attach the collected media ids for all images to your call
to ```statuses/update```, like this:

```javascript
cb.__call(
    "statuses_update",
    {
        "media_ids": "12345678901234567890,9876543210987654321"
        "status": "Whohoo, I just tweeted two images!"
    },
    function (reply) {
        // ...
    }
);
```

More [documentation for tweeting with multiple media](https://dev.twitter.com/docs/api/multiple-media-extended-entities) is available on the Twitter Developer site.

### Requests with app-only auth

To send API requests without an access token for a user (app-only auth),
add another parameter to your method call, like this:

```javascript
cb.__call(
    "search_tweets",
    "q=Twitter",
    function (reply) {
        // ...
    },
    true // this parameter required
);
```

Bear in mind that not all API methods support application-only auth.

Mapping API methods to Codebird function calls
----------------------------------------------

As you can see from the last example, there is a general way how Twitter’s API methods
map to Codebird function calls. The general rules are:

1. For each slash in a Twitter API method, use an underscore in the Codebird function.

    Example: ```statuses/update``` maps to ```cb.__call("statuses_update", ...)```.

2. For each underscore in a Twitter API method, use camelCase in the Codebird function.

    Example: ```statuses/home_timeline``` maps to ```cb.__call("statuses_homeTimeline", ...)```.

3. For each parameter template in method, use UPPERCASE in the Codebird function.
    Also don’t forget to include the parameter in your parameter list.

    Examples:
    - ```statuses/show/:id``` maps to ```cb.__call("statuses_show_ID", 'id=12345', ...)```.
    - ```users/profile_image/:screen_name``` maps to
      ```cb.__call("users_profileImage_SCREEN_NAME", "screen_name=jublonet", ...)```.

HTTP methods (GET, POST, DELETE etc.)
-------------------------------------

Never care about which HTTP method (verb) to use when calling a Twitter API.
Codebird is intelligent enough to find out on its own.

Response codes
--------------

The HTTP response code that the API gave is included in any return values.
You can find it within the return object’s ```httpstatus``` property.

### Dealing with rate-limits

Basically, Codebird leaves it up to you to handle Twitter’s rate limit.
The library returns the response HTTP status code, so you can detect rate limits.

I suggest you to check if the ```reply.httpstatus``` property is ```400```
and check with the Twitter API to find out if you are currently being
rate-limited.
See the [Rate Limiting FAQ](https://dev.twitter.com/docs/rate-limiting-faq)
for more information.

If you allow your callback function to accept a second parameter,
you will receive rate-limiting details in this parameter,
if the Twitter API responds with rate-limiting HTTP headers.

```javascript
cb.__call(
    "search_tweets",
    "q=Twitter",
    function (reply, rate_limit_status) {
        console.log(rate_limit_status);
        // ...
    }
);
```

API calls and the same-origin policy
------------------------------------

Normally, browsers only allow requests being sent to addresses that are on
the same base domain.  This is a security feature called the “same-origin
policy.”  However, this policy is in your way when you try to access the
(remote) Twitter API domain and its methods.

### Cross-domain requests

With Codebird, don’t worry about this.  We automatically send cross-domain
requests using a secured proxy that sends back the required headers to the
user’s browser.

This CORS proxy is using an encrypted SSL connection.
*We do not record data sent to or from the Twitter API.
Using Codebird’s CORS proxy is subject to the Acceptable use policy.*

If your JavaScript environment is not restricted under the same-origin policy
(for example in node.js), direct connections to the Twitter API are established
automatically, instead of contacting the CORS proxy.

You may also turn off the CORS compatibility manually like this:

```javascript
cb.setUseProxy(false);
```

### Support for Internet Explorer 7 to 9

Cross-domain requests work well in any browser except for
Internet Explorer 7-9.  Codebird cannot send POST requests in these browsers.
For IE7-9, Codebird works in limited operation mode:

- Calls to GET methods work fine,
- calling POST methods is impossible,
- Application-only auth does not work.

### Using your own proxy server

The source code of the CORS proxy is publicly available.  If you want to,
set up your own instance on your server.  Afterwards, tell Codebird the
address:

```javascript
cb.setProxy("https://example.com/codebird-cors-proxy/");
```

Heads up!  Follow the notes in the [codebird-cors-proxy README](https://github.com/jublonet/codebird-cors-proxy/#readme) for details.

Using multiple Codebird instances
---------------------------------

By default, each Codebird instance works on its own.

If you need to run requests to the Twitter API for multiple users at once,
Codebird supports this automatically. Just create a new object:

```javascript
var cb1 = new Codebird;
var cb2 = new Codebird;
```

Please note that your OAuth consumer key and secret is shared within
multiple Codebird instances, while the OAuth request and access tokens with their
secrets are *not* shared.

How Do I…?
----------

### …get user ID, screen name and more details about the current user?

When the user returns from the authentication screen, you need to trade
the obtained request token for an access token, using the OAuth verifier.
As discussed in the section ‘Usage example,’ you use a call to
```oauth/access_token``` to do that.

The API reply to this method call tells you details about the user that just logged in.
These details contain the **user ID** and the **screen name.**

Take a look at the returned data as follows:

```javascript
{
    oauth_token: "14648265-rPn8EJwfB**********************",
    oauth_token_secret: "agvf3L3**************************",
    user_id: 14648265,
    screen_name: "jublonet",
    httpstatus: 200
}
```

If you need to get more details, such as the user’s latest tweet,
you should fetch the complete User Entity.  The simplest way to get the
user entity of the currently authenticated user is to use the
```account/verify_credentials``` API method.  In Codebird, it works like this:

```javascript
cb.__call(
    "account_verifyCredentials",
    {},
    function (reply) {
        console.log(reply);
    }
);
```

I suggest to cache the User Entity after obtaining it, as the
```account/verify_credentials``` method is rate-limited by 15 calls per 15 minutes.

### …walk through cursored results?

The Twitter REST API utilizes a technique called ‘cursoring’ to paginate
large result sets. Cursoring separates results into pages of no more than
5000 results at a time, and provides a means to move backwards and
forwards through these pages.

Here is how you can walk through cursored results with Codebird.

1. Get the first result set of a cursored method:
```javascript
cb.__call(
    "followers_list",
    {},
    function (result1) {
        // ...
    }
);
```

2. To navigate forth, take the ```next_cursor_str```:
```javascript
var nextCursor = result1.next_cursor_str;
```

3. If ```nextCursor``` is not 0, use this cursor to request the next result page:
```javascript
    if (nextCursor > 0) {
        cb.__call(
            "followers_list",
            {cursor: nextCursor},
            function (result2) {
                // ...
            }
        );
    }
```

To navigate back instead of forth, use the field ```resultX.previous_cursor_str```
instead of ```next_cursor_str```.

It might make sense to use the cursors in a loop.  Watch out, though,
not to send more than the allowed number of requests to ```followers/list```
per rate-limit timeframe, or else you will hit your rate-limit.

### …use xAuth with Codebird?

Codebird supports xAuth just like every other authentication used at Twitter.
Remember that your application needs to be whitelisted to be able to use xAuth.

Here’s an example:
```javascript
cb.__call(
    "oauth_accessToken",
    {
        "x_auth_username": "username",
        "x_auth_password": "4h3_p4$$w0rd",
        "x_auth_mode"    : "client_auth"
    },
    function (reply) {
        console.log(reply);
        // ...
    }
);
```

If everything went fine, you will get an object like this:

```javascript
{
    "oauth_token": "14648265-ABLfBFlE*********************************",
    "oauth_token_secret": "9yTBY3pEfj*********************************",
    "user_id": "14648265",
    "screen_name": "jublonet",
    "x_auth_expires": "0",
    "httpstatus": 200
}
```

Are you getting a strange error message, an empty error, or status "0"?
If the user is enrolled in login verification, the server will return a
HTTP 401 error with a custom body (that may be filtered by your browser).

You may check the browser web console for an error message.

When this error occurs, advise the user to
[generate a temporary password](https://twitter.com/settings/applications)
on twitter.com and use that to complete signing in to the application.

### …access and use undocumented Twitter API methods?

Besides the well-documented official methods, the Twitter API also contains
undocumented additional methods.  They are used by official Twitter clients,
such as Twitter for iPhone and Twitter for Mac.

Access to these methods is restricted: Only white-listed applications
(consumer keys) may access undocumented methods.  Codebird supports accessing
internal methods, but that will only work if you provide a white-listed API key.
By reason, the API keys and secrets for official Twitter clients are not
provided within this package, since they should have been kept a secret.

If you provide Codebird with the Twitter for iPhone consumer key and secret,
the following example will get the latest events that happened with you:

```javascript
cb.__call(
    "activity_aboutMe",
    {},
    function (reply) {
        console.log(reply);
        // ...
    }
);
```
