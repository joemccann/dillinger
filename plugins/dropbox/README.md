Dropbox Dillinger Plugin
==

0. Create your app with dropbox:  https://www.dropbox.com/developers/apps
1. Create your `dropbox-config.json`.  It needs to contain:

```
    {
      "app_key": "YOUR_KEY",
      "app_secret": "YOUR_SECRET",
      "callback_url": "YOUR_CALLBACK_URL",
      "auth_url": "https://www.dropbox.com/oauth2/authorize",
      "request_token_url": "https://api.dropbox.com/oauth2/request_token",
      "access_token_url": "https://api.dropbox.com/oauth2/access_token"
    }
```
The values for `app_key` and `app_secret` can be obtained on the dropbox app page.

For `callback_url`, use `http://yoursite/oauth/dropbox` (or supply your own callback URL if you've created a custom route).

Optional configuration via environment
==

Set the following environment variables if adding `dropbox-config.json` may present a challenge (when deploying on Heroku for example)

    dropbox_app_key=YOUR_KEY
    dropbox_app_secret=YOUR_SECRET
    dropbox_callback_url=YOUR_CALLBACK_URL
