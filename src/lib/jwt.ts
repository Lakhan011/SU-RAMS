import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super-secret-fallback-key-change-in-production';
const key = new TextEncoder().encode(secretKey);

export async function signToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}