import ExcelJS from 'exceljs';
import Product from '../products/product.model.js';
import Sale from '../sales/sale.model.js';
import User from '../users/user.model.js';
import { throwForbidden } from '../../utils/errors.js';

const createWorkbook = () => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Fylo - @FyloRobot';
  wb.created = new Date();
  return wb;
};

const styleHeader = (row) => {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
};

export const exportProducts = async (req, res, next) => {
  try {
    const products = await Product.find().lean({ virtuals: true });
    const wb = createWorkbook();
    const ws = wb.addWorksheet('Маҳсулотлар - Fylo');
    ws.columns = [
      { header: 'Номи', key: 'name', width: 30 },
      { header: 'SKU', key: 'sku', width: 18 },
      { header: 'Бошланғич сони', key: 'quantity', width: 14 },
      { header: 'Ҳозирги қолдиқ', key: 'currentQuantity', width: 14 },
      { header: 'Таннарх', key: 'unitCost', width: 12 },
      { header: 'Мин. сотув нархи', key: 'minSellingPrice', width: 14 },
      { header: 'Омбор қиймати', key: 'inventoryValue', width: 16 },
      { header: 'Кутилаётган тушум', key: 'expectedRevenue', width: 16 },
      { header: 'Ҳолати', key: 'status', width: 12 },
      { header: 'Яратилган сана', key: 'createdAt', width: 20 },
    ];
    styleHeader(ws.getRow(1));
    products.forEach((p) => {
      ws.addRow({
        name: p.name,
        sku: p.sku,
        quantity: p.quantity,
        currentQuantity: p.currentQuantity,
        unitCost: p.unitCost,
        minSellingPrice: p.minSellingPrice,
        inventoryValue: p.currentQuantity * p.unitCost,
        expectedRevenue: p.currentQuantity * p.minSellingPrice,
        status: p.status === 'in_stock' ? 'Мавжуд' : p.status === 'low_stock' ? 'Кам қолган' : p.status === 'out_of_stock' ? 'Тугаган' : p.status,
        createdAt: p.createdAt,
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Fylo-mahsulotlar.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (e) { next(e); }
};

export const exportSales = async (req, res, next) => {
  try {
    const sales = await Sale.find().populate('product', 'name').populate('soldBy', 'fullName').lean();
    const wb = createWorkbook();
    const ws = wb.addWorksheet('Сотувлар - Fylo');
    ws.columns = [
      { header: 'Сана', key: 'createdAt', width: 20 },
      { header: 'Маҳсулот', key: 'productName', width: 30 },
      { header: 'Миқдори', key: 'quantity', width: 8 },
      { header: 'Сотув нархи', key: 'sellingPrice', width: 12 },
      { header: 'Таннарх', key: 'unitCost', width: 12 },
      { header: 'Тушум', key: 'totalRevenue', width: 12 },
      { header: 'Фойда', key: 'profit', width: 12 },
      { header: 'Сотди', key: 'soldBy', width: 20 },
      { header: 'Мижоз', key: 'customer', width: 20 },
      { header: 'Ҳолати', key: 'status', width: 10 },
    ];
    styleHeader(ws.getRow(1));
    sales.forEach((s) => {
      ws.addRow({
        createdAt: s.createdAt,
        productName: s.product?.name || s.productSnapshot?.name,
        quantity: s.quantity,
        sellingPrice: s.sellingPrice,
        unitCost: s.unitCost,
        totalRevenue: s.totalRevenue,
        profit: s.profit,
        soldBy: s.soldBy?.fullName,
        customer: s.customer?.name,
        status: s.status === 'completed' ? 'Якунланган' : s.status === 'refunded' ? 'Қайтарилган' : s.status,
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Fylo-sotuvlar.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (e) { next(e); }
};

export const exportUsers = async (req, res, next) => {
  try {
    if (!['admin','super_admin'].includes(req.user.role)) throwForbidden();
    const users = await User.find().lean();
    const wb = createWorkbook();
    const ws = wb.addWorksheet('Фойдаланувчилар - Fylo');
    ws.columns = [
      { header: 'Тўлиқ исм', key: 'fullName', width: 25 },
      { header: 'Телефон', key: 'phone', width: 20 },
      { header: 'Роль', key: 'role', width: 14 },
      { header: 'Онлайн', key: 'isOnline', width: 10 },
      { header: 'Охирги фаоллик', key: 'lastActiveAt', width: 20 },
      { header: 'Яратилган', key: 'createdAt', width: 20 },
    ];
    styleHeader(ws.getRow(1));
    users.forEach((u) => {
      ws.addRow({
        ...u,
        role: u.role === 'super_admin' ? 'Супер Админ' : u.role === 'admin' ? 'Админ' : 'Ишчи',
        isOnline: u.isOnline ? 'Онлайн' : 'Офлайн',
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Fylo-foydalanuvchilar.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (e) { next(e); }
};

export const exportDashboard = async (req, res, next) => {
  try {
    const [products, sales] = await Promise.all([Product.find().lean(), Sale.find({ status: 'completed' }).lean()]);
    const wb = createWorkbook();
    const summary = wb.addWorksheet('Ҳисобот - Fylo');
    summary.columns = [{ header: 'Кўрсаткич', key: 'metric', width: 32 }, { header: 'Қиймат', key: 'value', width: 20 }];
    styleHeader(summary.getRow(1));
    const invValue = products.reduce((s, p) => s + p.currentQuantity * p.unitCost, 0);
    const realizedProfit = sales.reduce((s, sale) => s + sale.profit, 0);
    const realizedRevenue = sales.reduce((s, sale) => s + sale.totalRevenue, 0);
    const totalIntl = products.reduce((s, p) => s + (p.totalIntlShipping || 0), 0);
    const totalLocal = products.reduce((s, p) => s + (p.totalLocalShipping || 0), 0);
    summary.addRows([
      { metric: 'Жами маҳсулотлар', value: products.length },
      { metric: 'Омбор қиймати', value: invValue },
      { metric: 'Реал тушум (фақат сотилган)', value: realizedRevenue },
      { metric: 'Реал фойда (фақат сотилган)', value: realizedProfit },
      { metric: 'Жами сотувлар', value: sales.length },
      { metric: 'Жами халқаро йўл харажатлари', value: totalIntl },
      { metric: 'Жами ички йўл харажатлари', value: totalLocal },
      { metric: 'Умумий йўл харажатлари', value: totalIntl + totalLocal },
    ]);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Fylo-hisobot.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (e) { next(e); }
};
