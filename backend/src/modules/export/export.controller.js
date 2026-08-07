import ExcelJS from 'exceljs';
import Product from '../products/product.model.js';
import Sale from '../sales/sale.model.js';
import User from '../users/user.model.js';
import { throwForbidden } from '../../utils/errors.js';

const createWorkbook = () => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Fylo';
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
    const ws = wb.addWorksheet('Products');
    ws.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'SKU', key: 'sku', width: 18 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Current Qty', key: 'currentQuantity', width: 12 },
      { header: 'Unit Cost', key: 'unitCost', width: 12 },
      { header: 'Min Price', key: 'minSellingPrice', width: 12 },
      { header: 'Inventory Value', key: 'inventoryValue', width: 16 },
      { header: 'Expected Revenue', key: 'expectedRevenue', width: 16 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 20 },
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
        status: p.status,
        createdAt: p.createdAt,
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (e) { next(e); }
};

export const exportSales = async (req, res, next) => {
  try {
    const sales = await Sale.find().populate('product', 'name').populate('soldBy', 'fullName').lean();
    const wb = createWorkbook();
    const ws = wb.addWorksheet('Sales');
    ws.columns = [
      { header: 'Date', key: 'createdAt', width: 20 },
      { header: 'Product', key: 'productName', width: 30 },
      { header: 'Qty', key: 'quantity', width: 8 },
      { header: 'Selling Price', key: 'sellingPrice', width: 12 },
      { header: 'Unit Cost', key: 'unitCost', width: 12 },
      { header: 'Revenue', key: 'totalRevenue', width: 12 },
      { header: 'Profit', key: 'profit', width: 12 },
      { header: 'Sold By', key: 'soldBy', width: 20 },
      { header: 'Customer', key: 'customer', width: 20 },
      { header: 'Status', key: 'status', width: 10 },
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
        status: s.status,
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sales.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (e) { next(e); }
};

export const exportUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') throwForbidden();
    const users = await User.find().lean();
    const wb = createWorkbook();
    const ws = wb.addWorksheet('Users');
    ws.columns = [
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Role', key: 'role', width: 10 },
      { header: 'Online', key: 'isOnline', width: 10 },
      { header: 'Last Active', key: 'lastActiveAt', width: 20 },
      { header: 'Created', key: 'createdAt', width: 20 },
    ];
    styleHeader(ws.getRow(1));
    users.forEach((u) => ws.addRow(u));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (e) { next(e); }
};

export const exportDashboard = async (req, res, next) => {
  try {
    const [products, sales] = await Promise.all([Product.find().lean(), Sale.find({ status: 'completed' }).lean()]);
    const wb = createWorkbook();
    const summary = wb.addWorksheet('Summary');
    summary.columns = [{ header: 'Metric', key: 'metric', width: 28 }, { header: 'Value', key: 'value', width: 20 }];
    styleHeader(summary.getRow(1));
    const invValue = products.reduce((s, p) => s + p.currentQuantity * p.unitCost, 0);
    const realizedProfit = sales.reduce((s, sale) => s + sale.profit, 0);
    const realizedRevenue = sales.reduce((s, sale) => s + sale.totalRevenue, 0);
    summary.addRows([
      { metric: 'Total Products', value: products.length },
      { metric: 'Inventory Value', value: invValue },
      { metric: 'Realized Revenue (sold only)', value: realizedRevenue },
      { metric: 'Realized Profit (sold only)', value: realizedProfit },
      { metric: 'Total Sales', value: sales.length },
    ]);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=dashboard.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (e) { next(e); }
};
