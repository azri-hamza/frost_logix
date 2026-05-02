import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryNoteItemDto {
  @IsString()
  product_id: string;

  @IsString()
  product_name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;
}

export class CreateDeliveryNoteDto {
  @IsString()
  dn_number: string;

  @IsDateString()
  date: string;

  @IsString()
  customer_id: string;

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
  @Type(() => DeliveryNoteItemDto)
  items: DeliveryNoteItemDto[];
}