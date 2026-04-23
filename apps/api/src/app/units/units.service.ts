import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';

export interface UnitDto {
  id: string;
  name: string;
  symbol: string;
  created_at: string;
}

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UnitDto[]> {
    const units = await this.prisma.unitOfMeasure.findMany({
      orderBy: { name: 'asc' },
    });
    return units.map(this.mapToDto);
  }

  async findById(id: string): Promise<UnitDto> {
    const unit = await this.prisma.unitOfMeasure.findUnique({
      where: { id },
    });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    return this.mapToDto(unit);
  }

  async create(data: CreateUnitDto): Promise<UnitDto> {
    const unit = await this.prisma.unitOfMeasure.create({
      data,
    });
    return this.mapToDto(unit);
  }

  async delete(id: string): Promise<boolean> {
    await this.prisma.unitOfMeasure.delete({ where: { id } });
    return true;
  }

  private mapToDto(unit: any): UnitDto {
    return {
      id: unit.id,
      name: unit.name,
      symbol: unit.symbol,
      created_at: unit.created_at.toISOString(),
    };
  }
}