const { Rcon } = require('rcon-client');

const rcon = new Rcon({
  host: '216.163.186.78',
  port: 12001,
  password: 'valoria123',
  timeout: 10000,
});

rcon.connect()
  .then(() => {
    console.log('Connected!');
    return rcon.send('list');
  })
  .then(res => {
    console.log('Response:', res);
    rcon.end();
  })
  .catch(err => {
    console.error('Error:', err);
  });