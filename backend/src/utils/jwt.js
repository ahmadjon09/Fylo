import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES });

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

export const generateTokenPair = (user) => {
  const payload = { id: user._id.toString(), role: user.role, phone: user.phone };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ id: user._id.toString(), tokenVersion: user.tokenVersion || 0 }),
  };
};
