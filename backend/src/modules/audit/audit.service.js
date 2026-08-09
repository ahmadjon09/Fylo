import Audit from './audit.model.js';

const actionTranslations = {
  'user:login': 'Фойдаланувчи кирди',
  'user:logout': 'Фойдаланувчи чиқди',
  'user:create': 'Фойдаланувчи яратилди',
  'user:update': 'Фойдаланувчи ўзгартирилди',
  'user:delete': 'Фойдаланувчи ўчирилди',
  'product:create': 'Маҳсулот яратилди',
  'product:update': 'Маҳсулот ўзгартирилди',
  'product:delete': 'Маҳсулот ўчирилди',
  'product:bulk_create': 'Кўплаб маҳсулот қўшилди',
  'sale:create': 'Сотув амалга оширилди',
  'sale:refund': 'Сотув қайтарилди',
  'system:view': 'Тизим маълумотлари кўрилди',
};

export const logAudit = async ({ req, action, targetId = null, targetModel = null, details = {}, user = null }) => {
  try {
    const actingUser = user || req?.user;
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || 'unknown';
    const ua = req?.headers?.['user-agent'] || 'unknown';
    
    // Try to get location from request body/header if provided
    let location = null;
    if (req?.body?.location) {
      location = {
        lat: req.body.location.lat || null,
        lon: req.body.location.lon || null,
        city: req.body.location.city || '',
        country: req.body.location.country || '',
        address: req.body.location.address || '',
      };
    } else if (req?.headers?.['x-location']) {
      try {
        const parsed = JSON.parse(req.headers['x-location']);
        location = parsed;
      } catch {}
    }

    // Fire-and-forget for speed - don't await, don't block main request
    Audit.create({
      action,
      actionUz: actionTranslations[action] || action,
      userId: actingUser?.id || actingUser?._id || null,
      userName: actingUser?.fullName || actingUser?.name || 'Номаълум',
      userRole: actingUser?.role || 'unknown',
      targetId,
      targetModel,
      details,
      ip,
      userAgent: ua,
      location,
    }).catch(()=>{});

  } catch (e) {
    // Silent fail for audit - don't break main flow
    console.error('[Audit] log error', e.message);
  }
};

export const getAuditLogs = async ({ page = 1, limit = 20, action, userId, from, to, search }) => {
  const filter = {};
  if (action) filter.action = action;
  if (userId) filter.userId = userId;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (search) {
    filter.$or = [
      { action: { $regex: search, $options: 'i' } },
      { userName: { $regex: search, $options: 'i' } },
      { 'details.name': { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page-1)*limit;
  const [logs, total] = await Promise.all([
    Audit.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Audit.countDocuments(filter),
  ]);

  return { logs, total, page, pages: Math.ceil(total/limit) };
};
