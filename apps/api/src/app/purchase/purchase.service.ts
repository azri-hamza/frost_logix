import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePurchaseInvoiceDto, PurchaseInvoiceItemDto } from './dto/create-purchase-invoice.dto';
import { CreateGRNDto, GRNItemDto } from './dto/create-grn.dto';
import { StockType } from '@prisma/client';

export interface PurchaseInvoiceDto {
  id: string;
  invoice_number: string;
  date: string;
  supplier_id: string;
  supplier_name: string;
  stock_type: StockType;
  subtotal: number;
  tax: number;
  net_total: number;
  notes: string | null;
  created_at: string;
  items: any[];
}

export interface GRNDto {
  id: string;
  grn_number: string;
  date: string;
  supplier_id: string;
  supplier_name: string;
  stock_type: StockType;
  notes: string | null;
  created_at: string;
  items: any[];
}

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllInvoices(): Promise<PurchaseInvoiceDto[]> {
    const invoices = await this.prisma.purchaseInvoice.findMany({
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { date: 'desc' },
    });
    return invoices.map(this.mapInvoiceToDto);
  }

  async findInvoiceById(id: string): Promise<PurchaseInvoiceDto> {
    const invoice = await this.prisma.purchaseInvoice.findUnique({
      where: { id },
      include: { supplier: true, items: { include: { product: true } } },
    });
    if (!invoice) {
      throw new NotFoundException('Purchase invoice not found');
    }
    return this.mapInvoiceToDto(invoice);
  }

  async createInvoice(data: CreatePurchaseInvoiceDto): Promise<PurchaseInvoiceDto> {
    const items = data.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
    }));

    const invoice = await this.prisma.purchaseInvoice.create({
      data: {
        invoice_number: data.invoice_number,
        date: new Date(data.date),
        supplier_id: data.supplier_id,
        stock_type: data.stock_type,
        subtotal: data.subtotal,
        tax: data.tax,
        net_total: data.net_total,
        notes: data.notes,
        items: {
          create: items,
        },
      },
      include: { supplier: true, items: { include: { product: true } } },
    });

    return this.mapInvoiceToDto(invoice);
  }

  async deleteInvoice(id: string): Promise<boolean> {
    await this.prisma.purchaseInvoiceItem.deleteMany({
      where: { purchase_invoice_id: id },
    });
    await this.prisma.purchaseInvoice.delete({ where: { id } });
    return true;
  }

  async findAllGRNs(): Promise<GRNDto[]> {
    const grns = await this.prisma.goodsReceivedNote.findMany({
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { date: 'desc' },
    });
    return grns.map(this.mapGRNToDto);
  }

  async findGRNById(id: string): Promise<GRNDto> {
    const grn = await this.prisma.goodsReceivedNote.findUnique({
      where: { id },
      include: { supplier: true, items: { include: { product: true } } },
    });
    if (!grn) {
      throw new NotFoundException('GRN not found');
    }
    return this.mapGRNToDto(grn);
  }

  async createGRN(data: CreateGRNDto): Promise<GRNDto> {
    const items = data.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
    }));

    const grn = await this.prisma.goodsReceivedNote.create({
      data: {
        grn_number: data.grn_number,
        date: new Date(data.date),
        supplier_id: data.supplier_id,
        stock_type: data.stock_type,
        notes: data.notes,
        items: {
          create: items,
        },
      },
      include: { supplier: true, items: { include: { product: true } } },
    });

    return this.mapGRNToDto(grn);
  }

  async deleteGRN(id: string): Promise<boolean> {
    await this.prisma.gRNItem.deleteMany({
      where: { grn_id: id },
    });
    await this.prisma.goodsReceivedNote.delete({ where: { id } });
    return true;
  }

  private mapInvoiceToDto(invoice: any): PurchaseInvoiceDto {
    return {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      date: invoice.date.toISOString(),
      supplier_id: invoice.supplier_id,
      supplier_name: invoice.supplier.name,
      stock_type: invoice.stock_type as StockType,
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      net_total: Number(invoice.net_total),
      notes: invoice.notes,
      created_at: invoice.created_at.toISOString(),
      items: invoice.items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.total),
      })),
    };
  }

  private mapGRNToDto(grn: any): GRNDto {
    return {
      id: grn.id,
      grn_number: grn.grn_number,
      date: grn.date.toISOString(),
      supplier_id: grn.supplier_id,
      supplier_name: grn.supplier.name,
      stock_type: grn.stock_type as StockType,
      notes: grn.notes,
      created_at: grn.created_at.toISOString(),
      items: grn.items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.total),
      })),
    };
  }
}