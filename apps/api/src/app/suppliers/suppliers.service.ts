import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/create-supplier.dto';

export interface SupplierDto {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  fax: string | null;
  tax_id: string | null;
  bank_account: string | null;
  created_at: string;
}

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SupplierDto[]> {
    const suppliers = await this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
    return suppliers.map(this.mapToDto);
  }

  async findById(id: string): Promise<SupplierDto> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return this.mapToDto(supplier);
  }

  async create(data: CreateSupplierDto): Promise<SupplierDto> {
    const supplier = await this.prisma.supplier.create({
      data,
    });
    return this.mapToDto(supplier);
  }

  async update(id: string, data: UpdateSupplierDto): Promise<SupplierDto> {
    const supplier = await this.prisma.supplier.update({
      where: { id },
      data,
    });
    return this.mapToDto(supplier);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.supplier.delete({ where: { id } });
    return true;
  }

  private mapToDto(supplier: any): SupplierDto {
    return {
      id: supplier.id,
      name: supplier.name,
      address: supplier.address,
      phone: supplier.phone,
      fax: supplier.fax,
      tax_id: supplier.tax_id,
      bank_account: supplier.bank_account,
      created_at: supplier.created_at.toISOString(),
    };
  }
}