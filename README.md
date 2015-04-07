#Info on my Fork

- Fixed min_image_width issue, that would check the resized image-width instead of the "native" image-width.

- Updated the Facebook module to support v2 of the Facebook Graph API.
- Since I updated the code to use Open Graph v2, you'll need to include the Fb SDK init script before you call the plugin:
		<pre><code>&lt;script src="//connect.facebook.net/en_US/sdk.js"&gt;&lt;/script&gt;</code></pre>

- I removed support for Google+, VK, Blogspot because I didn't need them.
    - I can add this back in if anyone wants it.




To see original README, visit http://pavelk2.github.io/social-feed/
