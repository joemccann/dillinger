/**
 * Module dependencies.
 */

var stylus = require('stylus')
  , connect = require('connect')
  , jade = require('jade')
  , nib = require('../');

/**
 * Server.
 */

var server = connect();

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

server.use(stylus.middleware({
    src: __dirname
  , dest: __dirname + '/public'
  , force: true
  , compile: compile
}));

server.use(connect.static(__dirname + '/public'));

server.use(function(req, res){
  jade.renderFile(__dirname + '/index.jade', function(err, str){
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(str);
  });
});

server.listen(3000);
console.log('Server listening on port 3000');
