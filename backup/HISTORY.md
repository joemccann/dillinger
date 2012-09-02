HISTORY
=

0.1.4
-
- Added filename label via modified [pull request][1]

  [1]: https://github.com/joemccann/dillinger/pull/14

0.1.0
-
- Added initial Dropbox support
- Updated notification position (needs to be completely refactored).

0.0.8
-
- Programmatically reading in the `README.md` to populate the `dillinger.ejs` view (DRY).
- Removed google site verification value.
- Added handler for showing the about dillinger info (updated about copy as well)
- Added boxflex per @rem's suggestion.


0.0.7
-
- Added noscript verbiage.
- Added nice loading/fade in action.
- Added fail handling with XHR errors.

0.0.6
- 
  - Created dillinger.io Google apps account (so md files can emailed in the future)
  - Added support for private repos' markdown files.

0.0.5
-
 - Added true import from Github repos
 - Styled github button

0.0.4
-
 - Added export HTML including route in Express app
 - Various UI styling improvements.
 - Upgraded to node 0.6.1
 - Removed cluster module; now using native clustering.

0.0.3
-
 - Compressed/concat dependencies
 - Added export markdown
 - Added various routes for export markdown