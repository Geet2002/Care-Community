const http = require('http');
const { spawn } = require('child_process');

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
      res.on('end', () => resolve({status: res.statusCode, data: JSON.parse(body || '{}')}));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  const server = spawn('node', ['server.js']);
  let serverLogs = [];
  server.stdout.on('data', d => serverLogs.push(d.toString()));
  server.stderr.on('data', d => serverLogs.push(d.toString()));

  // wait for server to listen
  await new Promise(r => setTimeout(r, 2000));

  try {
    const userA = 'testA_' + Date.now();
    const userB = 'testB_' + Date.now();

    const resA = await request('/api/auth/signup', 'POST', {username: userA, password: 'pw'});
    const cookieA = resA.headers && resA.headers['set-cookie'] ? resA.headers['set-cookie'][0] : null;

    const resB = await request('/api/auth/signup', 'POST', {username: userB, password: 'pw'});
    const cookieB = resB.headers && resB.headers['set-cookie'] ? resB.headers['set-cookie'][0] : null;
    const userBid = resB.data.user.id;

    const resComm = await request('/api/communities', 'POST', {name: 'priv_' + Date.now(), description: 'desc', is_private: true}, cookieA);
    const commId = resComm.data.id;

    await request(`/api/communities/${commId}/join`, 'POST', {}, cookieB);
    
    console.log(`Approving request for user ${userBid} in comm ${commId}...`);
    const approveRes = await request(`/api/communities/${commId}/requests/${userBid}`, 'POST', {action: 'approve'}, cookieA);
    console.log('Approve response:', approveRes.status, approveRes.data);
  } finally {
    server.kill();
    console.log('--- Server Logs ---');
    console.log(serverLogs.join(''));
  }
}
run().catch(console.error);
