import Product from './product.model.js';
import { throwNotFound, AppError } from '../../utils/errors.js';
import { parsePagination, buildPaginatedResponse, buildSearchFilter } from '../../utils/pagination.js';
import { cache, CACHE_KEYS } from '../../config/redis.js';
import { calcUnitCost } from '../../utils/calc.js';
import { notifyAdmins } from '../telegram/telegram.service.js';
import { logAudit } from '../audit/audit.service.js';

const LOW_FIXED = 10;

export const getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.unitCost = {};
      if (req.query.minPrice) filter.unitCost.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.unitCost.$lte = Number(req.query.maxPrice);
    }
    if (req.query.search) Object.assign(filter, buildSearchFilter(req.query.search, ['name', 'sku']));

    const cacheKey = CACHE_KEYS.products(JSON.stringify({ filter, page, limit, sortBy, sortOrder }));
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, ...cached });

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).populate('createdBy', 'fullName').lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    const result = buildPaginatedResponse(products, total, { page, limit });
    cache.set(cacheKey, result, 90).catch(()=>{});
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
};

export const getProductById = async (req, res, next) => {
  try {
    const cached = await cache.get(CACHE_KEYS.product(req.params.id));
    if (cached) return res.json({ success: true, data: cached });

    const product = await Product.findById(req.params.id).populate('createdBy updatedBy', 'fullName avatar').lean({ virtuals: true });
    if (!product) throwNotFound('Маҳсулот');
    cache.set(CACHE_KEYS.product(req.params.id), product, 180).catch(()=>{});
    res.json({ success: true, data: product });
  } catch (e) { next(e); }
};

export const createProduct = async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.sku || String(data.sku).trim() === '') delete data.sku;
    else data.sku = String(data.sku).trim();

    const calculated = calcUnitCost({
      purchasePrice: data.totalPurchasePrice,
      intlShipping: data.totalIntlShipping,
      localShipping: data.totalLocalShipping,
      quantity: data.quantity,
    });
    const unitCost = Math.abs(calculated - (data.unitCost || 0)) < 0.01 ? data.unitCost : calculated;
    if (data.minSellingPrice < unitCost) throw new AppError(`Мин сотув нархи ${data.minSellingPrice} таннарх ${unitCost.toFixed(2)} дан паст бўлиши мумкин эмас`, 400, 'VALIDATION_ERROR');

    const payload = {
      ...data,
      unitCost,
      currentQuantity: data.quantity,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    };

    const tempId = `product:pending:${Date.now()}`;
    cache.set(tempId, payload, 30).catch(()=>{});

    let product;
    try {
      product = await Product.create(payload);
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'SKU';
        throw new AppError(`${field.toUpperCase()} аллақачон мавжуд: ${Object.values(err.keyValue || {}).join(', ')}`, 409, 'CONFLICT');
      }
      throw err;
    }

    cache.invalidateTags(['products', 'dashboard']).catch(()=>{});
    cache.del(tempId).catch(()=>{});
    cache.set(CACHE_KEYS.product(product._id), product.toObject({ virtuals: true }), 180).catch(()=>{});

    logAudit({ req, action: 'product:create', targetId: product._id, targetModel: 'Product', details: { name: product.name, quantity: product.quantity, unitCost: product.unitCost } });

    notifyAdmins(
      `Янги маҳсулот қўшилди — Fylo\n\n` +
      `Номи: ${product.name}\n` +
      `Миқдори: ${product.quantity} дона\n` +
      `Таннарх: $${product.unitCost.toFixed(2)}\n` +
      `Сотув нархи: $${product.minSellingPrice.toFixed(2)}\n` +
      `Қўшди: ${req.user.fullName || 'Админ'}\n\n` +
      `Bot: @FyloRobot`
    ).catch(() => {});

    res.status(201).json({ success: true, data: product });
  } catch (e) { next(e); }
};

export const bulkCreateProducts = async (req, res, next) => {
  try {
    const { products } = req.body;
    const cleaned = products.map(p => {
      const np = { ...p };
      if (!np.sku || String(np.sku).trim() === '') delete np.sku;
      else np.sku = String(np.sku).trim();
      return np;
    });

    const docs = cleaned.map((p) => {
      const unitCost = calcUnitCost({ purchasePrice: p.totalPurchasePrice, intlShipping: p.totalIntlShipping, localShipping: p.totalLocalShipping, quantity: p.quantity });
      return { ...p, unitCost, currentQuantity: p.quantity, createdBy: req.user.id, updatedBy: req.user.id };
    });
    for (const d of docs) {
      if (d.minSellingPrice < d.unitCost) throw new AppError(`Маҳсулот ${d.name}: мин нарх таннархдан кичик`, 400, 'VALIDATION_ERROR');
    }
    
    let created;
    try {
      created = await Product.insertMany(docs, { ordered: false });
    } catch (err) {
      if (err.code === 11000 || err.writeErrors) {
        created = [];
        for (const doc of docs) {
          try {
            const single = await Product.create(doc);
            created.push(single);
          } catch (e) {
            if (e.code !== 11000) throw e;
          }
        }
        if (!created.length) throw new AppError('Барча маҳсулотлар дубликат — ҳеч бири қўшилмади', 409, 'CONFLICT');
      } else {
        throw err;
      }
    }

    cache.invalidateTags(['products', 'dashboard']).catch(()=>{});
    logAudit({ req, action: 'product:bulk_create', details: { count: created.length } });
    res.status(201).json({ success: true, data: created, count: created.length });
  } catch (e) { next(e); }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updates = { ...req.body, updatedBy: req.user.id };
    if (updates.sku !== undefined) {
      if (!updates.sku || String(updates.sku).trim() === '') delete updates.sku;
      else updates.sku = String(updates.sku).trim();
    }
    if (updates.totalPurchasePrice !== undefined || updates.totalIntlShipping !== undefined || updates.totalLocalShipping !== undefined || updates.quantity !== undefined) {
      const existing = await Product.findById(req.params.id).lean();
      if (!existing) throwNotFound('Маҳсулот');
      const qty = updates.quantity ?? existing.quantity;
      const purchase = updates.totalPurchasePrice ?? existing.totalPurchasePrice;
      const intl = updates.totalIntlShipping ?? existing.totalIntlShipping;
      const local = updates.totalLocalShipping ?? existing.totalLocalShipping;
      updates.unitCost = calcUnitCost({ purchasePrice: purchase, intlShipping: intl, localShipping: local, quantity: qty });
      const minPrice = updates.minSellingPrice ?? existing.minSellingPrice;
      if (minPrice < updates.unitCost) throw new AppError('Мин нарх таннархдан кичик бўлиши мумкин эмас', 400, 'VALIDATION_ERROR');
    }
    let product;
    try {
      product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).lean({ virtuals: true });
    } catch (err) {
      if (err.code === 11000) {
        throw new AppError(`SKU аллақачон мавжуд: ${Object.values(err.keyValue || {}).join(', ')}`, 409, 'CONFLICT');
      }
      throw err;
    }
    if (!product) throwNotFound('Маҳсулот');
    cache.invalidateTags(['products', 'dashboard']).catch(()=>{});
    cache.del(CACHE_KEYS.product(req.params.id)).catch(()=>{});
    cache.set(CACHE_KEYS.product(req.params.id), product, 180).catch(()=>{});
    logAudit({ req, action: 'product:update', targetId: product._id, details: { name: product.name } });
    res.json({ success: true, data: product });
  } catch (e) { next(e); }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throwNotFound('Маҳсулот');
    cache.invalidateTags(['products', 'dashboard']).catch(()=>{});
    cache.del(CACHE_KEYS.product(req.params.id)).catch(()=>{});
    logAudit({ req, action: 'product:delete', targetId: req.params.id, details: { name: product.name } });
    res.json({ success: true, message: 'Маҳсулот ўчирилди' });
  } catch (e) { next(e); }
};

export const lowStock = async (req, res, next) => {
  try {
    const products = await Product.find({ currentQuantity: { $lte: LOW_FIXED, $gt: 0 }, status: { $ne: 'discontinued' } })
      .sort({ currentQuantity: 1 })
      .limit(100)
      .lean({ virtuals: true });
    res.json({ success: true, data: products });
  } catch (e) { next(e); }
};
