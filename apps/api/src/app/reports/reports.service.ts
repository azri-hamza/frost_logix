import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StockType } from '@prisma/client';

export interface StockComparisonRow {
  product_id: string;
  product_name: string;
  product_unit: string;
  purchase_quantity: number;
  purchase_value: number;
  sale_quantity: number;
  sale_value: number;
  stock_quantity: number;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStockComparison(stockType: StockType): Promise<StockComparisonRow[]> {
    const purchaseInvoices = await this.prisma.purchaseInvoice.findMany({
      where: { stock_type: stockType },
      include: { items: { include: { product: true } } },
    });

    const salesInvoices = await this.prisma.salesInvoice.findMany({
      where: { stock_type: stockType },
      include: { items: { include: { product: true } } },
    });

    const productMap = new Map<string, any>();

    for (const invoice of purchaseInvoices) {
      for (const item of invoice.items) {
        const pid = item.product_id;
        if (!productMap.has(pid)) {
          productMap.set(pid, {
            product_id: pid,
            product_name: item.product.name,
            product_unit: item.product.unit,
            purchase_quantity: 0,
            purchase_value: 0,
            sale_quantity: 0,
            sale_value: 0,
          });
        }
        const product = productMap.get(pid);
        product.purchase_quantity += Number(item.quantity);
        product.purchase_value += Number(item.total);
      }
    }

    for (const invoice of salesInvoices) {
      for (const item of invoice.items) {
        const pid = item.product_id;
        if (!productMap.has(pid)) {
          productMap.set(pid, {
            product_id: pid,
            product_name: item.product.name,
            product_unit: item.product.unit,
            purchase_quantity: 0,
            purchase_value: 0,
            sale_quantity: 0,
            sale_value: 0,
          });
        }
        const product = productMap.get(pid);
        product.sale_quantity += Number(item.quantity);
        product.sale_value += Number(item.total);
      }
    }

    const result: StockComparisonRow[] = [];
    for (const product of productMap.values()) {
      result.push({
        ...product,
        stock_quantity: product.purchase_quantity - product.sale_quantity,
      });
    }

    return result;
  }

  async getPurchaseAnalysis(
    startDate?: string,
    endDate?: string,
    stockType?: StockType,
  ): Promise<any[]> {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (stockType) where.stock_type = stockType;

    const invoices = await this.prisma.purchaseInvoice.findMany({
      where,
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { date: 'desc' },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      date: invoice.date.toISOString(),
      supplier_name: invoice.supplier.name,
      stock_type: invoice.stock_type,
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      net_total: Number(invoice.net_total),
      items: invoice.items.map((item) => ({
        product_name: item.product.name,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.total),
      })),
    }));
  }

  async getSalesAnalysis(
    startDate?: string,
    endDate?: string,
    stockType?: StockType,
  ): Promise<any[]> {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (stockType) where.stock_type = stockType;

    const invoices = await this.prisma.salesInvoice.findMany({
      where,
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { date: 'desc' },
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      date: invoice.date.toISOString(),
      customer_name: invoice.customer.name,
      customer_type: invoice.customer.type,
      stock_type: invoice.stock_type,
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      net_total: Number(invoice.net_total),
      items: invoice.items.map((item) => ({
        product_name: item.product.name,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.total),
      })),
    }));
  }

  async getDashboardSummary(): Promise<any> {
    const [totalProducts, totalCustomers, totalSuppliers, totalSalesToday] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.customer.count(),
      this.prisma.supplier.count(),
      this.prisma.salesInvoice.count({
        where: {
          date: {
            gte: new Date(new Date().toISOString().split('T')[0]),
          },
        },
      }),
    ]);

    const todaySales = await this.prisma.salesInvoice.aggregate({
      where: {
        date: {
          gte: new Date(new Date().toISOString().split('T')[0]),
        },
      },
      _sum: { net_total: true },
    });

    const todayPurchases = await this.prisma.purchaseInvoice.aggregate({
      where: {
        date: {
          gte: new Date(new Date().toISOString().split('T')[0]),
        },
      },
      _sum: { net_total: true },
    });

    return {
      totalProducts,
      totalCustomers,
      totalSuppliers,
      totalSalesToday,
      todaySalesTotal: todaySales._sum.net_total || 0,
      todayPurchasesTotal: todayPurchases._sum.net_total || 0,
    };
  }
}