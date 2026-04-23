import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';
import { CustomerType } from '@prisma/client';

export interface CustomerDto {
  id: string;
  name: string;
  type: CustomerType;
  address: string | null;
  phone: string | null;
  tax_id: string | null;
  bank_account: string | null;
  created_at: string;
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CustomerDto[]> {
    const customers = await this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
    return customers.map(this.mapToDto);
  }

  async findByType(type: CustomerType): Promise<CustomerDto[]> {
    const customers = await this.prisma.customer.findMany({
      where: { type },
      orderBy: { name: 'asc' },
    });
    return customers.map(this.mapToDto);
  }

  async findById(id: string): Promise<CustomerDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return this.mapToDto(customer);
  }

  async create(data: CreateCustomerDto): Promise<CustomerDto> {
    const customer = await this.prisma.customer.create({
      data,
    });
    return this.mapToDto(customer);
  }

  async update(id: string, data: UpdateCustomerDto): Promise<CustomerDto> {
    const customer = await this.prisma.customer.update({
      where: { id },
      data,
    });
    return this.mapToDto(customer);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.customer.delete({ where: { id } });
    return true;
  }

  private mapToDto(customer: any): CustomerDto {
    return {
      id: customer.id,
      name: customer.name,
      type: customer.type as CustomerType,
      address: customer.address,
      phone: customer.phone,
      tax_id: customer.tax_id,
      bank_account: customer.bank_account,
      created_at: customer.created_at.toISOString(),
    };
  }
}