Dropbox Dillinger Plugin
==

0. Create your app with dropbox:  https://www.dropbox.com/developers/apps
1. Create your `dropbox-config.json`.  It needs to contain:

```
    {
      "app_key": "YOUR_KEY",
      "app_secret": "YOUR_SECRET",
      "callback_url": "YOUR_CALLBACK_URL",
      "auth_url": "https://www.dropbox.com/oauth2/authorize"
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
    
Dropbox v1 to v2 Migration
==

If your app was previously set up to use the v1 Dropbox API via Dillinger, all you need to do to ensure the v2 upgrade will work with Dropbox is:

- Ensure `Allow implicit grant` is set under your OAuth2 settings
- Ensure Redirect URI` is set under your OAuth2 settings to point to your Dillinger instance
- Ensure `app_key` and `app_secret` are present in your config and that the URLs are updated to the new endpoints
