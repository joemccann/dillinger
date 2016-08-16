#!/usr/bin/env node

'use strict'

const exec = require('child_process').execSync
	, path = require('path')
	, fs = require('fs')
	, pkg = require('../package.json')
	;

let build = `docker build -t joemccann/dillinger:${pkg.version} . && \
	docker push joemccann/dillinger:${pkg.version} `;

let exec_opts = {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
}

exec(build, exec_opts)

// Now let's update our Kubernetes deploymet files to the latest
// version of the docker image

const filenameDev = path.join(__dirname, '..', 'dillinger.k8s.dev.yml')
	, filenameProd = path.join(__dirname, '..', 'dillinger.k8s.production.yml')
	;

function updateKubeFile(filename){

	fs.readFile( filename, 'utf8', 
		function readfileCB(err,data){

		if(err) return console.error(err)

			let pattern = /dillinger:([^\s]+)/i; 

			data = data.replace(pattern, `dillinger:${pkg.version}`)
		
			fs.writeFile(filename, data, function writeFileCb(err,d){

			if(err) return console.error(err)

			console.log(`Updated Kubernetes deploy file: ${filename}\n`)

		}) // end write

	}) // end read

}

updateKubeFile(filenameDev)
updateKubeFile(filenameProd)
