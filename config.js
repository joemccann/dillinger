'use strict'
const rc = require('rc')

const defaultConfig = {
  title: 'Online Markdown Editor - Dillinger, the Last Markdown Editor ever.',
  description: `Dillinger is an online cloud based HTML5 filled
  Markdown Editor. Sync with Dropbox, Github, Google Drive or OneDrive.
  Convert HTML to Markdown. 100% Open Source!`,
  googleWebmasterMeta: 'DAyGOgtsg8rJpq9VVktKzDkQ1UhXm1FYl8SD47hPkjA',
  keywords: 'Markdown, Dillinger, Editor, ACE, Github, Open Source, Node.js',
  author: 'Joe McCann and Martin Broder',
  // Add default database configuration
  development: {
    port: process.env.PORT || 8080,
    db: {
      mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/dillinger',
      redis: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  }
}

// Export a function that returns the configuration
module.exports = function() {
  return rc('dillinger', defaultConfig)
}
