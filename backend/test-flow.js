const axios = require('axios');
async function run() {
  const API = 'http://localhost:5001/api';
  
  const uA = 'userA_' + Date.now();
  const uB = 'userB_' + Date.now();
  
  // User A signs up
  const resA = await axios.post(`${API}/auth/signup`, {username: uA, password: 'pw'});
  const cookieA = resA.headers['set-cookie'];
  
  // User B signs up
  const resB = await axios.post(`${API}/auth/signup`, {username: uB, password: 'pw'});
  const cookieB = resB.headers['set-cookie'];
  
  // User A creates private community
  const commRes = await axios.post(`${API}/communities`, {name: 'PrivComm_'+Date.now(), description: 'd', is_private: true}, {headers: {Cookie: cookieA}});
  const commId = commRes.data.id;
  console.log('Created community', commId, 'is_private:', commRes.data.is_private);
  
  // User B joins private community
  const joinRes = await axios.post(`${API}/communities/${commId}/join`, {}, {headers: {Cookie: cookieB}});
  console.log('User B joined. Result:', joinRes.data);
}
run().catch(console.error);
