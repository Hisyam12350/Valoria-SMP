const Rcon = require('rcon');

const conn = new Rcon('216.163.186.78', 22556, 'valoria123');

conn.on('auth', function() {
  console.log('Authenticated!');
  conn.send('list');
}).on('response', function(str) {
  console.log('Response:', str);
  conn.disconnect();
}).on('error', function(err) {
  console.error('Error:', err);
}).on('end', function() {
  console.log('Connection closed');
});

conn.connect();