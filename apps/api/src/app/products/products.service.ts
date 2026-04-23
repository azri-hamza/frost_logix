import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';

export interface ProductDto {
  id: string;
  name: string;
  name_ar: string | null;
  unit: string;
  is_active: boolean;
  created_at: string;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProductDto[]> {
    const products = await this.prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
    return products.map(this.mapToDto);
  }

  async findActive(): Promise<ProductDto[]> {
    const products = await this.prisma.product.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
    return products.map(this.mapToDto);
  }

  async findById(id: string): Promise<ProductDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.mapToDto(product);
  }

  async create(data: CreateProductDto): Promise<ProductDto> {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        name_ar: data.name_ar,
        unit: data.unit || 'kg',
      },
    });
    return this.mapToDto(product);
  }

  async update(id: string, data: UpdateProductDto): Promise<ProductDto> {
    const product = await this.prisma.product.update({
      where: { id },
      data,
    });
    return this.mapToDto(product);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.product.delete({ where: { id } });
    return true;
  }

  private mapToDto(product: any): ProductDto {
    return {
      id: product.id,
      name: product.name,
      name_ar: product.name_ar,
      unit: product.unit,
      is_active: product.is_active,
      created_at: product.created_at.toISOString(),
    };
  }
}