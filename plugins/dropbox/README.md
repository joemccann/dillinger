Dropbox Dillinger Plugin
=

0. Create your app with dropbox:  https://www.dropbox.com/developers/apps
1. Create your `dropbox-config.json`.  It needs to contain:
{
  "app_key": "YOUR_KEY",
  "app_secret": "YOUR_SECRET",
  "callback_url": "YOUR_CALLBACK_URL",
  "auth_url": "https://www.dropbox.com/1/oauth/authorize",
  "request_token_url": "https://api.dropbox.com/1/oauth/request_token",
  "access_token_url": "https://api.dropbox.com/1/oauth/access_token"
}
