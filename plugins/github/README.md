Github Dillinger Plugin
=

0. Create your app with Github:  https://github.com/settings/applications/new
1. Create your `github-config.json`.  It needs to contain:
{
  "client_id": "YOUR_ID"
, "redirect_uri": "http://dillinger.io/"
, "client_secret": "YOUR_SECRET"
, "callback_url": "http://dillinger.io/oauth/github"
}