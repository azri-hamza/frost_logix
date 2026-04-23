import { IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { StockType } from '@prisma/client';

export class CreateBatchDto {
  @IsString()
  product_id: string;

  @IsString()
  warehouse_id: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;

  @IsEnum(StockType)
  stock_type: StockType;

  @IsDateString()
  @IsOptional()
  expiry_date?: string;
}