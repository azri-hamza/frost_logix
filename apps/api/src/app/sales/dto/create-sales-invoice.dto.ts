import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StockType } from '@prisma/client';

export class SalesInvoiceItemDto {
  @IsString()
  product_id: string;

  @IsString()
  product_name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;
}

export class CreateSalesInvoiceDto {
  @IsString()
  invoice_number: string;

  @IsDateString()
  date: string;

  @IsString()
  customer_id: string;

  @IsEnum(StockType)
  stock_type: StockType;

  @IsArray()
  @IsOptional()
  delivery_note_ids?: string[];

  @IsNumber()
  subtotal: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  net_total: number;

  @IsString()
  @IsOptional()
  driver_name?: string;

  @IsString()
  @IsOptional()
  vehicle_plate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesInvoiceItemDto)
  items: SalesInvoiceItemDto[];
}