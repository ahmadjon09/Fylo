import mongoose from 'mongoose';
import { redis } from '../../config/redis.js';
import os from 'os';

export const getSystemStats = async (req, res, next) => {
  try {
    // Redis info
    let redisInfo = null;
    let redisMemory = null;
    try {
      const info = await redis.info('memory');
      const lines = info.split('\r\n');
      const memLine = lines.find(l => l.startsWith('used_memory_human'));
      const memPeakLine = lines.find(l => l.startsWith('used_memory_peak_human'));
      const mem = memLine?.split(':')[1] || 'N/A';
      const memPeak = memPeakLine?.split(':')[1] || 'N/A';
      const usedMemBytes = await redis.info('memory').then(i => {
        const m = i.match(/used_memory:(\d+)/);
        return m ? parseInt(m[1]) : 0;
      }).catch(()=>0);
      redisInfo = { used: mem, peak: memPeak, usedBytes: usedMemBytes };
      redisMemory = usedMemBytes;
    } catch (e) {
      redisInfo = { error: e.message };
    }

    // Mongo DB stats
    let mongoStats = null;
    try {
      const db = mongoose.connection.db;
      const stats = await db.stats();
      const collections = await db.listCollections().toArray();
      mongoStats = {
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        collections: stats.collections,
        objects: stats.objects,
        avgObjSize: stats.avgObjSize,
        indexSize: stats.indexSize,
        collectionList: collections.map(c=>c.name),
      };
    } catch (e) {
      mongoStats = { error: e.message };
    }

    // System info
    const sysInfo = {
      uptime: process.uptime(),
      uptimeHuman: `${Math.floor(process.uptime()/3600)}h ${Math.floor((process.uptime()%3600)/60)}m`,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      os: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
        loadAvg: os.loadavg(),
        hostname: os.hostname(),
      },
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
    };

    // Fylo app stats
    const Product = mongoose.model('Product');
    const Sale = mongoose.model('Sale');
    const User = mongoose.model('User');
    const Audit = mongoose.models.Audit;

    const [productCount, saleCount, userCount, auditCount] = await Promise.all([
      Product.countDocuments().catch(()=>0),
      Sale.countDocuments().catch(()=>0),
      User.countDocuments().catch(()=>0),
      Audit ? Audit.countDocuments().catch(()=>0) : 0,
    ]);

    res.json({
      success: true,
      data: {
        redis: redisInfo,
        mongo: mongoStats,
        system: sysInfo,
        fylo: {
          products: productCount,
          sales: saleCount,
          users: userCount,
          audits: auditCount,
          project: 'Fylo',
          bot: '@FyloRobot',
          version: '1.0.0',
        }
      }
    });
  } catch (e) { next(e); }
};

export const flushRedis = async (req, res, next) => {
  try {
    await redis.flushdb();
    res.json({ success: true, message: 'Redis тозаланди' });
  } catch (e) { next(e); }
};
