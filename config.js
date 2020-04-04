'use strict'
const rc = require('rc')
const defaultConfig = {
  title: 'Online Markdown Editor - Dillinger, the Last Markdown Editor ever.',
  description: `Dillinger is an online cloud based HTML5 filled
  Markdown Editor. Sync with Dropbox, Github, Google Drive or OneDrive.
  Convert HTML to Markdown. 100% Open Source!`,
  googleWebmasterMeta: 'DAyGOgtsg8rJpq9VVktKzDkQ1UhXm1FYl8SD47hPkjA',
  keywords: 'Markdown, Dillinger, Editor, ACE, Github, Open Source, Node.js',
  author: 'Joe McCann and Martin Broder'
}

module.exports = function () {
  return rc('dillinger', defaultConfig)
}
