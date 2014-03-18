GoogleDrive Dillinger Plugin
=

0. Create a project on Cloud Console and activate Google Drive API:  https://code.google.com/apis/console
1. Create your `googledrive-config.json`.  It needs to contain:

    {
      "client_id": "YOUR_ID",
      "client_secret": "YOUR_SECRET",
      "redirect_uri": "YOUR_REDIRECT_URI" // eg, http://dillinger.io/oauth/googledrive
    }

2. You also must add your redirect uri to your app's settings in the Google Cloud Console

Optional configuration via environment
==

Set the following environment variables if adding `googledrive-config.json` may present a challenge (when deploying on Heroku for example)

    googledrive_client_id=YOUR_KEY
    googledrive_client_secret=YOUR_SECRET
    googledrive_redirect_uri=YOUR_REDIRECT_URI

