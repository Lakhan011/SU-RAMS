const { signToken } = require('./src/lib/auth');

async function run() {
  const token = await signToken({id: 'cmtv67ot3000l9yh0um7ggmho', role: 'SUPER_ADMIN'});
  
  const res = await fetch('http://localhost:3000/api/scholars/cmtv7nvqj000m9y1wl0n3fpsl', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'auth-token=' + token
    },
    body: JSON.stringify({ supervisorId: 'cmtv67otk000t9yh0lyt5j5mw' })
  });
  
  console.log("STATUS:", res.status);
  console.log("BODY:", await res.json());
}
run();
