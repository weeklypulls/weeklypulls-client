var path = require('path');
var express = require('express');

var app = express();

const dist = path.join(__dirname, 'dist');
app.use(express.static(dist));
app.set('port', process.env.PORT || 8080);
app.get('*', (req, res) => res.sendFile(path.resolve(dist, 'index.html')));

var server = app.listen(app.get('port'), function() {
  console.log('listening on port ', server.address().port);
});
