import Product from '../products/product.model.js';
import Sale from '../sales/sale.model.js';
import User from '../users/user.model.js';
import { cache, CACHE_KEYS, redis } from '../../config/redis.js';

export const getDashboard = async (req, res, next) => {
  try {
    const range = req.query.range || '30d';
    const cacheKey = CACHE_KEYS.dashboard(range);
    const cached = await cache.get(cacheKey);
    if (cached) return res.json({ success: true, data: cached });

    let fromDate = new Date();
    if (range === '7d') fromDate.setDate(fromDate.getDate() - 7);
    else if (range === '30d') fromDate.setDate(fromDate.getDate() - 30);
    else if (range === '90d') fromDate.setDate(fromDate.getDate() - 90);
    else if (range === '1y') fromDate.setFullYear(fromDate.getFullYear() - 1);
    else fromDate.setDate(fromDate.getDate() - 30);

    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalUsers,
      onlineCount,
      inventoryAgg,
      salesAgg,
      shippingAgg,
      recentSales,
      topProducts,
      salesByDay,
      salesByMonth,
    ] = await Promise.all([
      Product.countDocuments({ status: { $ne: 'discontinued' } }),
      Product.countDocuments({ status: 'low_stock' }),
      Product.countDocuments({ status: 'out_of_stock' }),
      User.countDocuments({ isDisabled: false }),
      redis.scard('presence:online').then((n) => n || 0).catch(() => 0),
      Product.aggregate([
        { $match: { status: { $ne: 'discontinued' } } },
        {
          $group: {
            _id: null,
            totalInventoryValue: { $sum: { $multiply: ['$currentQuantity', '$unitCost'] } },
            totalExpectedRevenue: { $sum: { $multiply: ['$currentQuantity', '$minSellingPrice'] } },
            totalExpectedProfit: { $sum: { $multiply: ['$currentQuantity', { $subtract: ['$minSellingPrice', '$unitCost'] }] } },
            totalQuantity: { $sum: '$currentQuantity' },
          },
        },
      ]),
      Sale.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            realizedRevenue: { $sum: '$totalRevenue' },
            realizedCost: { $sum: '$totalCost' },
            realizedProfit: { $sum: '$profit' },
            totalSalesCount: { $sum: 1 },
            totalQuantitySold: { $sum: '$quantity' },
          },
        },
      ]),
      // New: Shipping costs stats - chet el va ichki yo'l haqlari
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalIntlShipping: { $sum: '$totalIntlShipping' },
            totalLocalShipping: { $sum: '$totalLocalShipping' },
            totalPurchase: { $sum: '$totalPurchasePrice' },
            avgUnitCost: { $avg: '$unitCost' },
          },
        },
      ]),
      Sale.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(10).populate('product', 'name').populate('soldBy', 'fullName').lean(),
      Sale.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: fromDate } } },
        { $group: { _id: '$product', totalQty: { $sum: '$quantity' }, totalProfit: { $sum: '$profit' }, totalRevenue: { $sum: '$totalRevenue' } } },
        { $sort: { totalQty: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      ]),
      Sale.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: fromDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalRevenue' }, profit: { $sum: '$profit' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Sale.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$totalRevenue' }, profit: { $sum: '$profit' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
    ]);

    const inventory = inventoryAgg[0] || { totalInventoryValue: 0, totalExpectedRevenue: 0, totalExpectedProfit: 0, totalQuantity: 0 };
    const sales = salesAgg[0] || { realizedRevenue: 0, realizedCost: 0, realizedProfit: 0, totalSalesCount: 0, totalQuantitySold: 0 };
    const shipping = shippingAgg[0] || { totalIntlShipping: 0, totalLocalShipping: 0, totalPurchase: 0, avgUnitCost: 0 };

    const data = {
      kpis: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalUsers,
        onlineUsers: onlineCount,
        inventoryValue: inventory.totalInventoryValue || 0,
        expectedRevenue: inventory.totalExpectedRevenue || 0,
        expectedProfit: inventory.totalExpectedProfit || 0,
        realizedRevenue: sales.realizedRevenue || 0,
        realizedCost: sales.realizedCost || 0,
        realizedProfit: sales.realizedProfit || 0,
        totalQuantity: inventory.totalQuantity || 0,
        totalQuantitySold: sales.totalQuantitySold || 0,
        totalSalesCount: sales.totalSalesCount || 0,
        // New shipping stats
        totalIntlShipping: shipping.totalIntlShipping || 0,
        totalLocalShipping: shipping.totalLocalShipping || 0,
        totalShipping: (shipping.totalIntlShipping || 0) + (shipping.totalLocalShipping || 0),
        totalPurchase: shipping.totalPurchase || 0,
        avgUnitCost: shipping.avgUnitCost || 0,
      },
      charts: {
        dailySales: salesByDay,
        monthlySales: salesByMonth,
        topProducts,
      },
      recentSales,
      lowStockList: await Product.find({ status: 'low_stock' }).sort({ currentQuantity: 1 }).limit(8).lean(),
      shippingBreakdown: {
        intl: shipping.totalIntlShipping || 0,
        local: shipping.totalLocalShipping || 0,
        purchase: shipping.totalPurchase || 0,
      }
    };

    cache.set(cacheKey, data, 60).catch(()=>{});
    res.json({ success: true, data });
  } catch (e) { next(e); }
};
