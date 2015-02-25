Github Dillinger Plugin
==

0. Create your app with Github:  https://github.com/settings/applications/new
1. Create your `github-config.json`.  It needs to contain:
```
    {
      "client_id": "YOUR_ID",
      "client_secret": "YOUR_SECRET",
      "redirect_uri": "YOUR_REDIRECT_URI", // eg, http://dillinger.io
      "callback_url": "YOUR_CALLBACK_URL" // eg, http://dillinger.io/oauth/github
    }
```

2. Optionally, you can also generate a one-time personal access token from here: https://github.com/settings/applications

  If you go this route, your `github-config.json` needs to contain:
```
    {
      "access_token": "YOUR_PERSONAL_ACCESS_TOKEN"
    }
```
Optional configuration via environment
==

Set the following environment variables if adding `github-config.json` may present a challenge (when deploying on Heroku for example)
```
    github_client_id=YOUR_KEY
    github_client_secret=YOUR_SECRET
    github_callback_url=YOUR_CALLBACK_URL
    github_redirect_uri=YOUR_REDIRECT_URI
```
