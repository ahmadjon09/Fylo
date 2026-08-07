import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';
import { env } from '../config/env.js';

export const uploadToImgBB = async (buffer, filename = 'image.jpg') => {
  if (!env.IMGBB_API_KEY) {
    throw new Error('IMGBB_API_KEY missing');
  }

  // Optimize image: resize max 1200px, convert to webp? Keep jpeg for compatibility
  let optimized;
  try {
    optimized = await sharp(buffer)
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch {
    optimized = buffer;
  }

  const base64 = optimized.toString('base64');

  const form = new FormData();
  form.append('key', env.IMGBB_API_KEY);
  form.append('image', base64);
  form.append('name', filename);

  const res = await axios.post('https://api.imgbb.com/1/upload', form, {
    headers: form.getHeaders(),
    timeout: 15000,
  });

  if (!res.data?.data?.url) throw new Error('imgbb upload failed');
  return {
    url: res.data.data.url,
    thumb: res.data.data.thumb?.url || res.data.data.url,
    medium: res.data.data.medium?.url || res.data.data.url,
    deleteUrl: res.data.data.delete_url,
  };
};

export const uploadAvatar = async (buffer) => {
  const small = await sharp(buffer)
    .resize(320, 320, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toBuffer();
  return uploadToImgBB(small, `avatar-${Date.now()}.jpg`);
};
