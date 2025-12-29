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
try {
  exec(build, exec_opts)
} catch (e) {
  console.warn(`
WARNING: Docker build failed. This is likely because the Docker daemon is not running or accessible.
If you don't have Docker installed or running, you can ignore this, but the image won't be pushed to Docker Hub.
Error: ${e.message}
`)
}

// Now let's update our Kubernetes deployment files to the latest
// version of the docker image
updateKubeFile(filenameProd)
