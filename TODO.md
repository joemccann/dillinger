TODO
==

- Fix IxD with the settings drop down menu; seems jerky/non-responsive.
- Add appcache/offline support (important!)
- Add user account management
    - Store Markdown files on server (Redis/Disk?)
    - Provide linking capabilities for md files
- Refactor github repo "profile" management on the client.
    - Stash current repos/branches/tree files in localStorage as JSON object?
- Cleanup list views in repos/branches/tree files (UI is just fugly at the moment).
- Add import via URL
    - Provide URL to markdown file
    - Node grabs it sends to client
- Probably gonna have to overhaul Navigation (too many features?)


STRETCH GOALS/FEATURES
==

- Integrate with Dropbox 
    - oAuth
    - Save files to Dropbox directory
- iPad/Tablet version
    - No export capabilities :/
- Call me crazy but smartphone version seems ludicrous.  Really, editing markdown files with live preview on a 320px or 480px screen?
    - Is possible, but would require typing markdown then either scrolling or flipping the view to see the preview. Export MD/HTML would have to be 'cloud-synced' either to Dropbox or a Dillinger service.
- Share via Email?
    - Nodemailer