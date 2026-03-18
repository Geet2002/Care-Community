const http = require('http');

function request(path, method, body, cookie = null) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(cookie ? { 'Cookie': cookie } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk.toString());
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: JSON.parse(body || '{}')
        });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  const userA = 'testA_' + Date.now();
  const userB = 'testB_' + Date.now();

  const resA = await request('/api/auth/signup', 'POST', {username: userA, password: 'pw'});
  const cookieA = resA.headers['set-cookie'][0];

  const resB = await request('/api/auth/signup', 'POST', {username: userB, password: 'pw'});
  const cookieB = resB.headers['set-cookie'][0];
  const userBid = resB.data.user.id;

  const resComm = await request('/api/communities', 'POST', {name: 'priv_' + Date.now(), description: 'priv_desc', is_private: true}, cookieA);
  const commId = resComm.data.id;

  await request(`/api/communities/${commId}/join`, 'POST', {}, cookieB);
  
  const approveRes = await request(`/api/communities/${commId}/requests/${userBid}`, 'POST', {action: 'approve'}, cookieA);
  console.log('Approve res:', approveRes.status, approveRes.data);
}
run().catch(console.error);
