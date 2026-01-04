import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Product, Sale } from '../types';
import { addProduct, addSale } from './sync';
import { localDb } from './db';

export async function exportProductsToExcel(products: Product[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Pro Phone Plus';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Products');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Price', key: 'price', width: 12 },
    { header: 'Min Stock', key: 'minStock', width: 12 },
    { header: 'Created', key: 'createdAt', width: 20 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E40AF' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };

  products.forEach((product) => {
    worksheet.addRow({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
      minStock: product.minStock,
      createdAt: new Date(product.createdAt).toLocaleDateString(),
    });
  });

  worksheet.getColumn('price').numFmt = '$#,##0.00';

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const date = new Date().toISOString().split('T')[0];
  saveAs(blob, `products-${date}.xlsx`);
}

export async function exportSalesToExcel(
  sales: Sale[],
  filename = 'sales'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Pro Phone Plus';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Sales');

  worksheet.columns = [
    { header: 'Product', key: 'productName', width: 30 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Unit Price', key: 'unitPrice', width: 12 },
    { header: 'Total', key: 'totalPrice', width: 12 },
    { header: 'Sold By', key: 'soldByName', width: 20 },
    { header: 'Date', key: 'createdAt', width: 20 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '059669' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };

  sales.forEach((sale) => {
    worksheet.addRow({
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalPrice: sale.totalPrice,
      soldByName: sale.soldByName,
      createdAt: new Date(sale.createdAt).toLocaleString(),
    });
  });

  worksheet.getColumn('unitPrice').numFmt = '$#,##0.00';
  worksheet.getColumn('totalPrice').numFmt = '$#,##0.00';

  const totalRow = worksheet.addRow({
    productName: 'TOTAL',
    quantity: sales.reduce((sum, s) => sum + s.quantity, 0),
    unitPrice: '',
    totalPrice: sales.reduce((sum, s) => sum + s.totalPrice, 0),
    soldByName: '',
    createdAt: '',
  });
  totalRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const date = new Date().toISOString().split('T')[0];
  saveAs(blob, `${filename}-${date}.xlsx`);
}

export async function importProductsFromExcel(
  file: File,
  userId: string,
  refreshData: () => Promise<void>
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) {
    throw new Error('No worksheet found');
  }

  const products: Array<{
    name: string;
    category: string;
    quantity: number;
    price: number;
    minStock: number;
  }> = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const name = row.getCell(1).value?.toString() || '';
    const category = row.getCell(2).value?.toString() || '';
    const quantity = Number(row.getCell(3).value) || 0;
    const price = Number(row.getCell(4).value) || 0;
    const minStock = Number(row.getCell(5).value) || 5;

    if (name && category) {
      products.push({ name, category, quantity, price, minStock });
    }
  });

  for (const product of products) {
    await addProduct({
      ...product,
      createdBy: userId,
    });
  }

  await refreshData();
}

export async function importSalesFromExcel(
  file: File,
  userId: string,
  userName: string,
  refreshData: () => Promise<void>
): Promise<{ success: number; errors: string[] }> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) {
    throw new Error('No worksheet found');
  }

  const errors: string[] = [];
  let successCount = 0;

  const products = await localDb.products.toArray();

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const productName = row.getCell(1).value?.toString().trim() || '';
    const quantity = Number(row.getCell(2).value) || 0;
    const unitPrice = Number(row.getCell(3).value) || 0;
    const soldByName = row.getCell(4).value?.toString().trim() || userName;
    const dateValue = row.getCell(5).value;

    if (!productName) continue;

    const product = products.find(
      (p) => p.name.toLowerCase() === productName.toLowerCase() && !p.deleted
    );

    if (!product) {
      errors.push(`Row ${rowNumber}: Product "${productName}" not found`);
      continue;
    }

    if (quantity <= 0) {
      errors.push(`Row ${rowNumber}: Invalid quantity for "${productName}"`);
      continue;
    }

    if (quantity > product.quantity) {
      errors.push(
        `Row ${rowNumber}: Not enough stock for "${productName}" (Available: ${product.quantity}, Requested: ${quantity})`
      );
      continue;
    }

    try {
      let saleDate = Date.now();
      if (dateValue) {
        if (dateValue instanceof Date) {
          saleDate = dateValue.getTime();
        } else if (typeof dateValue === 'string') {
          const parsed = new Date(dateValue);
          if (!isNaN(parsed.getTime())) {
            saleDate = parsed.getTime();
          }
        }
      }

      await addSale({
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: unitPrice > 0 ? unitPrice : product.price,
        totalPrice: (unitPrice > 0 ? unitPrice : product.price) * quantity,
        soldBy: userId,
        soldByName,
      });

      successCount++;
    } catch (error) {
      errors.push(`Row ${rowNumber}: Failed to add sale for "${productName}"`);
      console.error(`Error adding sale for row ${rowNumber}:`, error);
    }
  }

  await refreshData();

  return { success: successCount, errors };
}

export function downloadTemplate(): void {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Pro Phone Plus';

  const worksheet = workbook.addWorksheet('Products Template');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Price', key: 'price', width: 12 },
    { header: 'Min Stock', key: 'minStock', width: 12 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E40AF' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };

  worksheet.addRow({
    name: 'Example Product',
    category: 'Electronics',
    quantity: 100,
    price: 99.99,
    minStock: 10,
  });

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'products-template.xlsx');
  });
}

export function downloadSalesTemplate(): void {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Pro Phone Plus';

  const worksheet = workbook.addWorksheet('Sales Template');

  worksheet.columns = [
    { header: 'Product Name', key: 'productName', width: 30 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Unit Price', key: 'unitPrice', width: 12 },
    { header: 'Sold By Name', key: 'soldByName', width: 20 },
    { header: 'Date (Optional)', key: 'date', width: 20 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '059669' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };

  worksheet.addRow({
    productName: 'iPhone 14',
    quantity: 2,
    unitPrice: 899.99,
    soldByName: 'John Doe',
    date: new Date().toLocaleDateString(),
  });

  worksheet.addRow({
    productName: 'Samsung Galaxy S23',
    quantity: 1,
    unitPrice: 799.99,
    soldByName: 'Jane Smith',
    date: '',
  });

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'sales-template.xlsx');
  });
}
