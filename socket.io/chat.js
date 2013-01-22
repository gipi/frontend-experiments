/*
 * The application flow consists in three simple message types:
 *
 *  - new user: when a new connection to the server is made
 *  - remove user: when a client disconnect
 *  - msg: a client send a message to the server
 *  - updatechat: the server echoes back the message to all connected clients
 */
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs'),
  url = require('url')

app.listen(8800);

function handler (req, res) {
  var pathname = url.parse(req.url).pathname;
  console.log('pathname: ' + pathname);
  fs.readFile(__dirname + '/' + pathname,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + pathname);
    }

    res.writeHead(200);
    res.end(data);
  });
}

var g_users = new Array();

var g_users_count = 0;

function count_logged_users() {
  console.log('now are connected ' + g_users.length + ' users');
}

io.sockets.on('connection', function (socket) {
  g_users.push(socket);

  // the user get the timestamp as name
  socket.username = Math.round(new Date().getTime() / 1000);

  count_logged_users();

  io.sockets.emit('new user', socket.username);

  // disconnect must be attached to the socket of the connection call
  socket.on('disconnect', function() {
    g_users.pop(socket);
    console.log('on disconnect');

    io.sockets.emit('remove user', socket.username);

    count_logged_users();
  });

  socket.on('msg', function(message) {
    console.log(message);
    io.sockets.emit('updatechat', socket.username, message);
  })
});

