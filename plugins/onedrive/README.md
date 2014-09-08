OneDrive Dillinger Plugin
=========================

The steps below are taken directly from the OneDrive [developer documentation](http://msdn.microsoft.com/en-us/library/dn659750.aspx). Please check the [source](http://msdn.microsoft.com/en-us/library/dn659750.aspx) site for the latest updates.

Register your app and configure its settings
--------------------------------------------

1. Go to the [Live SDK app management site](http://go.microsoft.com/fwlink/p/?LinkId=193157).
2. If prompted, sign in with your Microsoft account credentials.
3. If you are not immediately prompted to provide the app's display name and primary language, click **Create application**.
4. Type the app's display name and select the app's primary language.
5. Read the **Live Connect terms of use** and the **Privacy and Cookies** statement, and then click **I accept**. A client ID is created and displayed in **App Settings**. It should look something like this: `00000000603E0BFE`.

Specify a redirect domain and get a client secret
-------------------------------------------------

1. In the [Live SDK app management site](http://go.microsoft.com/fwlink/p/?LinkId=193157), select your app and click **Edit settings > API Settings**.
2. Under **Redirect URLs**, type the redirect domain you will be redirecting users to
3. Click **App Settings**. On the application summary page, the client secret is displayed. It should look something like this:
`qXipuPomaauItsIsmwtKZ2YacGZtCyXD`

Configure Dillinger
-------------------

Create your `onedrive-config.json`.  It needs to contain:

    {
      "client_id": "YOUR_ID",
      "client_secret": "YOUR_SECRET",
      "redirect_uri": "YOUR_REDIRECT_URI" // eg, http://dillinger.io/oauth/onedrive
    }

Optional configuration via environment
--------------------------------------

Set the following environment variables if adding `onedrive-config.json` may present a challenge (when deploying on Heroku for example)

    onedrive_client_id=YOUR_KEY
    onedrive_client_secret=YOUR_SECRET
    onedrive_redirect_uri=YOUR_REDIRECT_URI
