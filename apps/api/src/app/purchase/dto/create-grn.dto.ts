import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StockType } from '@prisma/client';

export class GRNItemDto {
  @IsString()
  product_id: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;
}

export class CreateGRNDto {
  @IsString()
  grn_number: string;

  @IsDateString()
  date: string;

  @IsString()
  supplier_id: string;

  @IsEnum(StockType)
  stock_type: StockType;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GRNItemDto)
  items: GRNItemDto[];
}