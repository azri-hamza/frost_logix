import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDeliveryNoteDto, DeliveryNoteItemDto } from './dto/create-delivery-note.dto';
import { CreateSalesInvoiceDto, SalesInvoiceItemDto } from './dto/create-sales-invoice.dto';
import { StockType } from '@prisma/client';
import { BatchesService } from '../batches/batches.service';

export interface DeliveryNoteDto {
  id: string;
  dn_number: string;
  date: string;
  customer_id: string;
  customer_name: string;
  driver_name: string | null;
  vehicle_plate: string | null;
  notes: string | null;
  created_at: string;
  items: any[];
}

export interface SalesInvoiceDto {
  id: string;
  invoice_number: string;
  date: string;
  customer_id: string;
  customer_name: string;
  stock_type: StockType;
  delivery_note_ids: string[];
  subtotal: number;
  tax: number;
  net_total: number;
  driver_name: string | null;
  vehicle_plate: string | null;
  notes: string | null;
  created_at: string;
  items: any[];
}

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly batchesService: BatchesService,
  ) {}

  async findAllDeliveryNotes(): Promise<DeliveryNoteDto[]> {
    const dns = await this.prisma.deliveryNote.findMany({
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { date: 'desc' },
    });
    return dns.map(this.mapDNToDto);
  }

  async findDeliveryNoteById(id: string): Promise<DeliveryNoteDto> {
    const dn = await this.prisma.deliveryNote.findUnique({
      where: { id },
      include: { customer: true, items: { include: { product: true } } },
    });
    if (!dn) {
      throw new NotFoundException('Delivery note not found');
    }
    return this.mapDNToDto(dn);
  }

  async createDeliveryNote(data: CreateDeliveryNoteDto): Promise<DeliveryNoteDto> {
    const items = data.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
    }));

    const dn = await this.prisma.deliveryNote.create({
      data: {
        dn_number: data.dn_number,
        date: new Date(data.date),
        customer_id: data.customer_id,
        driver_name: data.driver_name,
        vehicle_plate: data.vehicle_plate,
        notes: data.notes,
        items: {
          create: items,
        },
      },
      include: { customer: true, items: { include: { product: true } } },
    });

    return this.mapDNToDto(dn);
  }

  async deleteDeliveryNote(id: string): Promise<boolean> {
    await this.prisma.deliveryNoteItem.deleteMany({
      where: { dn_id: id },
    });
    await this.prisma.deliveryNote.delete({ where: { id } });
    return true;
  }

  async findAllInvoices(): Promise<SalesInvoiceDto[]> {
    const invoices = await this.prisma.salesInvoice.findMany({
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { date: 'desc' },
    });
    return invoices.map(this.mapInvoiceToDto);
  }

  async findInvoiceById(id: string): Promise<SalesInvoiceDto> {
    const invoice = await this.prisma.salesInvoice.findUnique({
      where: { id },
      include: { customer: true, items: { include: { product: true } } },
    });
    if (!invoice) {
      throw new NotFoundException('Sales invoice not found');
    }
    return this.mapInvoiceToDto(invoice);
  }

  async createInvoice(data: CreateSalesInvoiceDto): Promise<SalesInvoiceDto> {
    const items = data.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
    }));

    await this.batchesService.decreaseStock(
      data.items[0].product_id,
      data.items.reduce((sum, item) => sum + item.quantity, 0),
      data.stock_type,
    );

    const invoice = await this.prisma.salesInvoice.create({
      data: {
        invoice_number: data.invoice_number,
        date: new Date(data.date),
        customer_id: data.customer_id,
        stock_type: data.stock_type,
        delivery_note_ids: data.delivery_note_ids || [],
        subtotal: data.subtotal,
        tax: data.tax,
        net_total: data.net_total,
        driver_name: data.driver_name,
        vehicle_plate: data.vehicle_plate,
        notes: data.notes,
        items: {
          create: items,
        },
      },
      include: { customer: true, items: { include: { product: true } } },
    });

    return this.mapInvoiceToDto(invoice);
  }

  async deleteInvoice(id: string): Promise<boolean> {
    await this.prisma.salesInvoiceItem.deleteMany({
      where: { sales_invoice_id: id },
    });
    await this.prisma.salesInvoice.delete({ where: { id } });
    return true;
  }

  private mapDNToDto(dn: any): DeliveryNoteDto {
    return {
      id: dn.id,
      dn_number: dn.dn_number,
      date: dn.date.toISOString(),
      customer_id: dn.customer_id,
      customer_name: dn.customer.name,
      driver_name: dn.driver_name,
      vehicle_plate: dn.vehicle_plate,
      notes: dn.notes,
      created_at: dn.created_at.toISOString(),
      items: dn.items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.total),
      })),
    };
  }

  private mapInvoiceToDto(invoice: any): SalesInvoiceDto {
    return {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      date: invoice.date.toISOString(),
      customer_id: invoice.customer_id,
      customer_name: invoice.customer.name,
      stock_type: invoice.stock_type as StockType,
      delivery_note_ids: invoice.delivery_note_ids || [],
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      net_total: Number(invoice.net_total),
      driver_name: invoice.driver_name,
      vehicle_plate: invoice.vehicle_plate,
      notes: invoice.notes,
      created_at: invoice.created_at.toISOString(),
      items: invoice.items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.total),
      })),
    };
  }
}