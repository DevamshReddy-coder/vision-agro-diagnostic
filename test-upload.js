const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/inference/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=---123'
  }
}, res => {
  res.on('data', d => console.log(d.toString()));
});
req.write('-----123\r\nContent-Disposition: form-data; name="image"; filename="a.jpg"\r\nContent-Type: image/jpeg\r\n\r\nhi\r\n-----123--\r\n');
req.end();
