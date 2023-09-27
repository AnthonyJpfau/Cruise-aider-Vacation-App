const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', (chunk) => {
    process.stdout.write(chunk);
  });
});

req.on('error', (error) => {
  console.error(`Request error: ${error.message}`);
});

req.end();
