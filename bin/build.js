#!/usr/bin/env node

'use strict'

const exec = require('child_process').execSync
	, path = require('path')
	, fs = require('fs')
	, pkg = require('../package.json')
	;

function updateDeps(){
	fs.writeFileSync(path.join(__dirname, '..', 'deps.json'),JSON.stringify(pkg.dependencies))
	console.log('deps.json updated')
}

let build = `docker build -t joemccann/dillinger:${pkg.version} . && \
	docker push joemccann/dillinger:${pkg.version} `;

let exec_opts = {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
}

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

// First, update our deps.json file for faster docker builds
updateDeps()


// Now, build the docker image...
exec(build, exec_opts)

// Now let's update our Kubernetes deploymet files to the latest
// version of the docker image
updateKubeFile(filenameDev)
updateKubeFile(filenameProd)
