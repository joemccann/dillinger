Github Config
=========

In order to use the github features associated with Dilinger you need to create a file in this directory called `github.json`.

It should look like the following:

    {
      "client_id": "ccss0d6aaa33333eaafc"
    , "redirect_uri": "http://dillinger.io/"
    , "client_secret": "8e8076be325035274ca238e4dbe70d0317217e39"
    , "callback_url": "http://dillinger.io/oauth/github"
    }    

To obtain the `client_id` and the `client_secret` you'll need to register your application with Github.  Do that here:  [Github App]


Dropbox Config
=========

In order to use the dropbox features associated with Dilinger you need to create a file in this directory called `dropbox.json`.

It should look like the following:

    {
      "consumer_key": "YOUR-KEY"
    , "consumer_secret": "YOUR-SECRET"
    , "oauth_callback": "http://dillinger.io/oauth/dropbox"
    }

To obtain the `consumer_key` and the `consumer_secret` you'll need to register your application with Dropbox.  Do that here:  [Dropbox App]


Redis Config
=========

In order to shut down the admin party (meaning everyone has access) with Redis, you'll need to authenticate to your Redis store.  To do that:

* Create a `redis.conf` file in this directory. Here's an example: https://gist.github.com/1440179
* Or run this in your terminal in this directory: `wget https://raw.github.com/gist/1440179/b8204bbf8f2db5e20393740c173e1c17e419fb64/redis.conf`
* Now, and this is **important,** change the temporary password on line 123 (masterauth) to your own password (no spaces).

Done!

  [Github App]: https://github.com/account/applications/new
  [Dropbox App]: https://www.dropbox.com/developers/apps