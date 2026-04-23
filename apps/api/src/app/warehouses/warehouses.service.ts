import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/create-warehouse.dto';

export interface WarehouseDto {
  id: string;
  name: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<WarehouseDto[]> {
    const warehouses = await this.prisma.warehouse.findMany({
      orderBy: { name: 'asc' },
    });
    return warehouses.map(this.mapToDto);
  }

  async findActive(): Promise<WarehouseDto[]> {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
    return warehouses.map(this.mapToDto);
  }

  async findById(id: string): Promise<WarehouseDto> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return this.mapToDto(warehouse);
  }

  async create(data: CreateWarehouseDto): Promise<WarehouseDto> {
    const warehouse = await this.prisma.warehouse.create({
      data: {
        name: data.name,
        location: data.location,
      },
    });
    return this.mapToDto(warehouse);
  }

  async update(id: string, data: UpdateWarehouseDto): Promise<WarehouseDto> {
    const warehouse = await this.prisma.warehouse.update({
      where: { id },
      data,
    });
    return this.mapToDto(warehouse);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.warehouse.delete({ where: { id } });
    return true;
  }

  private mapToDto(warehouse: any): WarehouseDto {
    return {
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      is_active: warehouse.is_active,
      created_at: warehouse.created_at.toISOString(),
    };
  }
}