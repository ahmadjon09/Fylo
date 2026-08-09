import { getAuditLogs } from './audit.service.js';
import Audit from './audit.model.js';

export const listAudits = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
    const result = await getAuditLogs({
      page,
      limit,
      action: req.query.action,
      userId: req.query.userId,
      from: req.query.from,
      to: req.query.to,
      search: req.query.search,
    });
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
};

export const getAuditStats = async (req, res, next) => {
  try {
    const last24h = new Date(Date.now() - 24*60*60*1000);
    const last7d = new Date(Date.now() - 7*24*60*60*1000);

    const [total, last24hCount, last7dCount, byAction, byUser] = await Promise.all([
      Audit.countDocuments(),
      Audit.countDocuments({ createdAt: { $gte: last24h } }),
      Audit.countDocuments({ createdAt: { $gte: last7d } }),
      Audit.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Audit.aggregate([
        { $group: { _id: '$userId', userName: { $first: '$userName' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({ success: true, data: { total, last24hCount, last7dCount, byAction, byUser } });
  } catch (e) { next(e); }
};

export const deleteOldAudits = async (req, res, next) => {
  try {
    // Manual cleanup - TTL already does auto delete, but allow super admin to trigger
    const before = new Date(Date.now() - 60*24*60*60*1000);
    const result = await Audit.deleteMany({ createdAt: { $lt: before } });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (e) { next(e); }
};
