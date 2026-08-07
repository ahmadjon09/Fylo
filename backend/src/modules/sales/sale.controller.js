import Sale from './sale.model.js';
import Product from '../products/product.model.js';
import { AppError, throwNotFound } from '../../utils/errors.js';
import { parsePagination, buildPaginatedResponse } from '../../utils/pagination.js';
import { cache, CACHE_KEYS } from '../../config/redis.js';
import { calcSaleMetrics } from '../../utils/calc.js';
import { notifyAdmins } from '../telegram/telegram.service.js';

export const getSales = async (req, res, next) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(req.query);
    const filter = {};
    if (req.query.productId) filter.product = req.query.productId;
    if (req.query.soldBy) filter.soldBy = req.query.soldBy;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const cacheKey = CACHE_KEYS.sales(JSON.stringify({ filter, page, limit, sortBy, sortOrder }));
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, ...cached });

    const [sales, total] = await Promise.all([
      Sale.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).populate('product', 'name sku').populate('soldBy', 'fullName').lean(),
      Sale.countDocuments(filter),
    ]);

    const result = buildPaginatedResponse(sales, total, { page, limit });
    cache.set(cacheKey, result, 60).catch(()=>{});
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
};

export const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('product soldBy').lean();
    if (!sale) throwNotFound('Sale');
    res.json({ success: true, data: sale });
  } catch (e) { next(e); }
};

export const createSale = async (req, res, next) => {
  try {
    const { productId, quantity, sellingPrice, customerName, customerPhone, customerAddress, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) throwNotFound('Product');
    if (product.currentQuantity < quantity) throw new AppError(`Омборда етарли эмас. Мавжуд: ${product.currentQuantity}`, 400, 'VALIDATION_ERROR');

    const { cost, revenue, profit } = calcSaleMetrics({ unitCost: product.unitCost, sellingPrice, quantity });
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const tempKey = `sale:pending:${Date.now()}`;
    cache.set(tempKey, { productId, quantity, sellingPrice }, 30).catch(()=>{});

    const sale = await Sale.create({
      product: product._id,
      productSnapshot: {
        name: product.name,
        unitCost: product.unitCost,
        sku: product.sku,
        image: product.images?.[0]?.url || '',
      },
      quantity,
      sellingPrice,
      unitCost: product.unitCost,
      totalCost: cost,
      totalRevenue: revenue,
      profit,
      profitMargin,
      customer: { name: customerName, phone: customerPhone, address: customerAddress },
      comment,
      soldBy: req.user.id,
    });

    // Fast inventory update — single save
    product.currentQuantity -= quantity;
    product.totalSold += quantity;
    product.totalRevenue += revenue;
    product.totalProfit += profit;
    product.save().catch(()=>{});

    cache.invalidateTags(['products', 'sales', 'dashboard']).catch(()=>{});
    cache.del(tempKey).catch(()=>{});
    cache.del(CACHE_KEYS.product(product._id)).catch(()=>{});

    req.io?.emit('sale:created', sale);
    req.io?.emit('product:updated', product.toObject({ virtuals: true }));

    notifyAdmins(
      `💰 *Сотув — Fylo*\n\n` +
      `*Маҳсулот:* ${product.name} x${quantity}\n` +
      `*Нарх:* $${sellingPrice} (таннарх $${product.unitCost.toFixed(2)})\n` +
      `*Фойда:* $${profit.toFixed(2)}\n` +
      `*Сотди:* ${req.user.fullName || 'Админ'}\n\n` +
      `🤖 @FyloRobot`
    ).catch(() => {});

    res.status(201).json({ success: true, data: sale });
  } catch (e) { next(e); }
};

export const refundSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) throwNotFound('Sale');
    if (sale.status === 'refunded') throw new AppError('Аллақачон қайтарилган', 400);

    const product = await Product.findById(sale.product);
    if (product) {
      product.currentQuantity += sale.quantity;
      product.totalSold = Math.max(0, (product.totalSold || 0) - sale.quantity);
      product.totalRevenue = Math.max(0, (product.totalRevenue || 0) - sale.totalRevenue);
      product.totalProfit = Math.max(0, (product.totalProfit || 0) - sale.profit);
      product.save().catch(()=>{});
    }

    sale.status = 'refunded';
    sale.refundedAt = new Date();
    sale.refundReason = req.body.reason || '';
    await sale.save();

    cache.invalidateTags(['products', 'sales', 'dashboard']).catch(()=>{});
    req.io?.emit('sale:refunded', sale);
    if (product) req.io?.emit('product:updated', product.toObject({ virtuals: true }));

    res.json({ success: true, data: sale });
  } catch (e) { next(e); }
};

export const dailySalesStats = async (_req, res, next) => {
  try {
    const stats = await Sale.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalRevenue' },
          profit: { $sum: '$profit' },
          count: { $sum: 1 },
          quantity: { $sum: '$quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data: stats });
  } catch (e) { next(e); }
};
