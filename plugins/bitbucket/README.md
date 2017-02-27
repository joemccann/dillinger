Bitbucket Dillinger Plugin
==

0. Create your app with Bitbucket:  https://bitbucket.org/account/user/<username>/api
1. Create your `bitbucket-config.json`.  It needs to contain:
```
    {
      "client_id": "YOUR_KEY",
      "client_secret": "YOUR_SECRET",
      "redirect_uri": "YOUR_REDIRECT_URI", // eg, http://dillinger.io
      "callback_url": "YOUR_CALLBACK_URL" // eg, http://dillinger.io/oauth/bitbucket
    }
```

Optional configuration via environment
==

Set the following environment variables if adding `bitbucket-config.json` may present a challenge (when deploying on Heroku for example)
```
    bitbucket_client_id=YOUR_KEY
    bitbucket_client_secret=YOUR_SECRET
    bitbucket_callback_url=YOUR_CALLBACK_URL
    bitbucket_redirect_uri=YOUR_REDIRECT_URI
```
