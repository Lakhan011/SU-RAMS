
const { SignJWT } = require('jose');
const crypto = require('crypto');
async function test() {
  const secretKey = process.env.JWT_SECRET || 'super-secret-fallback-key-change-in-production';
  const key = new TextEncoder().encode(secretKey);
  const token = await new SignJWT({ id: 'cmtv67oru00099yh0x7iacrzh', role: 'SUPER_ADMIN' })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(key);
  
  const res = await fetch('http://localhost:3000/api/scholars/cmtv7nvqj000m9y1wl0n3fpsl', {
    headers: { 'Cookie': 'auth-token=' + token }
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
