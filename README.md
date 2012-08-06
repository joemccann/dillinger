Dillinger
=========

Dillinger is a cloud-enabled HTML5 Markdown editor.

  - Type some Markdown text in the left window
  - See the HTML in the right
  - Magic

Markdown is a lightweight markup language based on the formatting conventions that people naturally use in email.  As [John Gruber] writes on the [Markdown site] [1]:

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable 
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.

This text your see here is *actually* written in Markdown! To get a feel for Markdown's syntax, type some text into the left window and watch the results in the right.  


Tech
-----------

Dillinger uses a number of open source projects to work properly:

* [Ace Editor] - awesome web-based text editor
* [Showdown] - a port of Markdown to JavaScript
* [Twitter Bootstrap] - great UI boilerplate for modern web apps
* [node.js] - evented I/O for the backend
* [Redis] - wickedly fast key-value data store
* [keymaster.js] - awesome keyboard handler lib by [@thomasfuchs]
* [jQuery] - duh 


Coming Soon
--------------

**NOTE**: currently the `app.js` file expects a Redis instance to be up and running and available. Dillinger currently uses Redis version **2.4.4**.  You will need to modify the `redis.conf` file if you are going to use an older version of Redis.


Installation
--------------

NOTE: currently the `app.js` file expects a Redis instance to be up and running and available.  It is used for session storage and will be used in the future.

1. Clone the repo
2. `cd dillinger`
3. `npm install -d` (also, if you don't have `smoosh` installed globally execute: `npm install smoosh -g`)
4. `mkdir -p public/files`
5. `mkdir -p public/files/md && mkdir -p public/files/html`
6. Read the Readme file located at `config/README.md` and do what it says.
7. `redis-server config/redis.conf`
8. `node build.js` as this will concat/compress the css and js files.
9. `sudo node app.js`
10. `open http://127.0.0.1`

NOTE: Have a look at the `app.json` file as it has some configuration variables in there as well. You will definitely need to update the `IMAGE_PREFIX_PRODUCTION: "http://cdn.dillinger.io/"` to your own CDN. If you're not using a CDN, set it's path to `/img/` for that is where the images reside locally in the dillinger repo.


*Free Software, Fuck Yeah!*

  [john gruber]: http://daringfireball.net/
  [@thomasfuchs]: http://twitter.com/thomasfuchs
  [1]: http://daringfireball.net/projects/markdown/
  [showdown]: http://www.attacklab.net/
  [ace editor]: http://ace.ajax.org
  [node.js]: http://nodejs.org
  [Twitter Bootstrap]: http://twitter.github.com/bootstrap/
  [keymaster.js]: https://github.com/madrobby/keymaster
  [jQuery]: http://jquery.com  
  [Redis]: http://redis.io
  