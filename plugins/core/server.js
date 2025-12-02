'use strict'

const express = require('express')
const app = module.exports = express()
const fs = require('fs')
const path = require('path')
const md = require('./markdown-it.js')
const breakdance = require('breakdance')
const { mdToPdf } = require('md-to-pdf')

const _getFullHtml = (name, str, style) => {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' +
    name + '</title><style>' +
    ((style) || '') + '</style></head><body id="preview">\n' +
    md.render(str) + '\n</body></html>'
}

// Move this into _getFormat() to reload the CSS without restarting node.

const _getFormat = () => {
  const _format = fs.readFileSync(path.resolve(__dirname, '../../public/css/export.css')).toString('utf-8')
  return _format
}

const fetchMd = (req, res) => {
  const unmd = req.body.unmd
  let name = req.body.name.trim()

  if (!name.includes('.md')) {
    name = name + '.md'
  }

  if (req.body.preview === 'false') {
    res.attachment(name)
  } else {
    // We don't use text/markdown because my "favorite" browser
    // (IE) ignores the Content-Disposition: inline; and prompts
    // the user to download the file.
    res.type('text')

    // For some reason IE and Chrome ignore the filename
    // field when Content-Type: text/plain;
    res.set('Content-Disposition', `inline; filename="${name}"`)
  }

  res.end(unmd)
}

const fetchHtml = (req, res) => {
  var unmd = req.body.unmd

  // For formatted HTML or not...
  var format = req.body.formatting ? _getFormat() : ''

  var html = _getFullHtml(req.body.name, unmd, format)

  var name = req.body.name.trim() + '.html'

  if (req.body.preview === 'false') {
    res.attachment(name)
  } else {
    res.type('html')
    res.set('Content-Disposition', `inline; filename="${name}"`)
  }

  res.end(html)
}

const fetchPdf = async (req, res) => {
  const { name = '', unmd = '' } = req.body

  const { err, data } = await markdown2Pdf(unmd)

  if (err) {
    return res.end(err.message)
  }

  const { content = '' } = data

  if (!content) return res.end('No PDF content exists in the data')

  const filename = name.replace(/\.md$/, '') + '.pdf';

  if (req.body.preview === 'false') {
    res.attachment(filename)
  } else {
    res.type('pdf')
    res.set('Content-Disposition', `inline; filename="${filename}"`)
  }

  res.contentType('application/pdf')
  res.send(Buffer.from(content))
}

// Convert HTML to MD
const htmlToMd = (req, res) => {
  var md = ''

  try {
    md = breakdance(req.body.html)
  } catch (e) {
    return res.status(400).json({
      error: {
        message: 'Something went wrong with the HTML to Markdown conversion.'
      }
    })
  }

  return res.status(200).json({
    convertedMd: md
  })
}

const markdown2Pdf = async (md) => {
  let pdf = null

  try {
    pdf = await mdToPdf({ content: md }, {
      launch_options: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  } catch (err) {
    return { err }
  }

  if (pdf && pdf.content) {
    return { data: pdf }
  } else {
    console.log('no pdf content')
    return { err: new Error('No pdf content.') }
  }
}

/* Start Dillinger Routes */

// Download a markdown file directly as response.
app.post('/factory/fetch_markdown', fetchMd)

// Download an html file directly as response.
app.post('/factory/fetch_html', fetchHtml)

// Download a pdf file directly as response.
app.post('/factory/fetch_pdf', fetchPdf)

// Download a pdf file directly as response.
app.post('/factory/html_to_md', htmlToMd)

/* End Dillinger Core */
