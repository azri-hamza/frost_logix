import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StockType } from '@prisma/client';

export class PurchaseInvoiceItemDto {
  @IsString()
  product_id: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;
}

export class CreatePurchaseInvoiceDto {
  @IsString()
  invoice_number: string;

  @IsDateString()
  date: string;

  @IsString()
  supplier_id: string;

  @IsEnum(StockType)
  stock_type: StockType;

  @IsNumber()
  subtotal: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  net_total: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseInvoiceItemDto)
  items: PurchaseInvoiceItemDto[];
}