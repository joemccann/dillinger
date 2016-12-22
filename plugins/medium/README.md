medium Medium Plugin
==

1. Create your app with medium:  https://medium.com/me/applications
2. Create your `medium-config.json`.  It needs to contain:
```js
  {
    "client_id": "YOUR_CLIENT_ID"
  , "client_secret": "YOUR_SECRET"
  , "redirect_url": "http://dillinger.io/oauth/medium"
  , "callback_url": "http://dillinger.io/"
  }    
```

The values for `client_id` and `client_secret` can be obtained on the Medium app page.

For `redirect_url`, use `http://yoursite/oauth/medium` (or supply your own callback URL if you've created a custom route).

Optional Configuration Via Environment Variables
==

Set the following environment variables if adding `medium-config.json` may present a challenge (when deploying on Heroku for example)
```sh
  medium_client_id=YOUR_KEY
  medium_client_secret=YOUR_SECRET
  medium_callback_url=YOUR_CALLBACK_URL
  medium_redirect_url=YOUR_REDIRECT_URL
```