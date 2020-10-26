#!/usr/bin/env node

'use strict'

const exec = require('child_process').execSync
const path = require('path')
const fs = require('fs')
const pkg = require('../package.json')

const build = `docker build -t joemccann/dillinger:${pkg.version} . && \
docker push joemccann/dillinger:${pkg.version} `

const exec_opts = {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
}

const filenameProd = path.join(__dirname, '..', 'dillinger.k8s.production.yml')

function updateKubeFile (filename) {
  fs.readFile(filename, 'utf8',
    function readfileCB (err, data) {
      if (err) return console.error(err)

      const pattern = /dillinger:([^\s]+)/ig

      data = data.replace(pattern, `dillinger:${pkg.version}`)

      fs.writeFile(filename, data, function writeFileCb (err, d) {
        if (err) return console.error(err)

        console.log(`\nUpdated Kubernetes deploy file: ${filename} to dillinger:${pkg.version}\n`)
      }) // end write
    }) // end read
}

// Build the docker image...
exec(build, exec_opts)

// Now let's update our Kubernetes deployment files to the latest
// version of the docker image
updateKubeFile(filenameProd)
