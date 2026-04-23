import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { StockType } from '@prisma/client';

export interface BatchDto {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  unit_price: number;
  expiry_date: string | null;
  received_date: string;
  stock_type: StockType;
  created_at: string;
}

export interface StockSummary {
  product_id: string;
  product_name: string;
  product_unit: string;
  total_quantity: number;
  stock_type: StockType;
}

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(warehouseId?: string): Promise<BatchDto[]> {
    const where = warehouseId ? { warehouse_id: warehouseId } : {};
    const batches = await this.prisma.batch.findMany({
      where,
      include: { product: true, warehouse: true },
      orderBy: { received_date: 'desc' },
    });
    return batches.map(this.mapToDto);
  }

  async findByProduct(productId: string, stockType?: StockType): Promise<BatchDto[]> {
    const where: any = { product_id: productId };
    if (stockType) {
      where.stock_type = stockType;
    }
    const batches = await this.prisma.batch.findMany({
      where,
      include: { product: true, warehouse: true },
      orderBy: { received_date: 'desc' },
    });
    return batches.map(this.mapToDto);
  }

  async findById(id: string): Promise<BatchDto> {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: { product: true, warehouse: true },
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }
    return this.mapToDto(batch);
  }

  async create(data: CreateBatchDto): Promise<BatchDto> {
    const batch = await this.prisma.batch.create({
      data: {
        product_id: data.product_id,
        warehouse_id: data.warehouse_id,
        quantity: data.quantity,
        unit_price: data.unit_price,
        stock_type: data.stock_type,
        expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
      },
      include: { product: true, warehouse: true },
    });
    return this.mapToDto(batch);
  }

  async updateQuantity(id: string, quantity: number): Promise<BatchDto> {
    const batch = await this.prisma.batch.update({
      where: { id },
      data: { quantity },
      include: { product: true, warehouse: true },
    });
    return this.mapToDto(batch);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.batch.delete({ where: { id } });
    return true;
  }

  async getStockSummary(warehouseId?: string, stockType?: StockType): Promise<StockSummary[]> {
    const where: any = {};
    if (warehouseId) where.warehouse_id = warehouseId;
    if (stockType) where.stock_type = stockType;

    const batches = await this.prisma.batch.findMany({
      where,
      include: { product: true },
    });

    const summaryMap = new Map<string, StockSummary>();
    for (const batch of batches) {
      const key = `${batch.product_id}_${batch.stock_type}`;
      const existing = summaryMap.get(key);
      if (existing) {
        existing.total_quantity += Number(batch.quantity);
      } else {
        summaryMap.set(key, {
          product_id: batch.product_id,
          product_name: batch.product.name,
          product_unit: batch.product.unit,
          total_quantity: Number(batch.quantity),
          stock_type: batch.stock_type,
        });
      }
    }

    return Array.from(summaryMap.values());
  }

  async decreaseStock(
    productId: string,
    quantity: number,
    stockType: StockType,
    warehouseId?: string,
  ): Promise<void> {
    const where: any = {
      product_id: productId,
      stock_type: stockType,
      quantity: { gt: 0 },
    };
    if (warehouseId) {
      where.warehouse_id = warehouseId;
    }

    const batches = await this.prisma.batch.findMany({
      where,
      orderBy: { received_date: 'asc' },
    });

    let remaining = quantity;
    for (const batch of batches) {
      if (remaining <= 0) break;
      const batchQty = Number(batch.quantity);
      if (batchQty <= remaining) {
        await this.prisma.batch.update({
          where: { id: batch.id },
          data: { quantity: 0 },
        });
        remaining -= batchQty;
      } else {
        await this.prisma.batch.update({
          where: { id: batch.id },
          data: { quantity: batchQty - remaining },
        });
        remaining = 0;
      }
    }

    if (remaining > 0) {
      throw new Error(`Insufficient stock for product`);
    }
  }

  private mapToDto(batch: any): BatchDto {
    return {
      id: batch.id,
      product_id: batch.product_id,
      warehouse_id: batch.warehouse_id,
      quantity: Number(batch.quantity),
      unit_price: Number(batch.unit_price),
      expiry_date: batch.expiry_date?.toISOString() || null,
      received_date: batch.received_date.toISOString(),
      stock_type: batch.stock_type as StockType,
      created_at: batch.created_at.toISOString(),
    };
  }
}