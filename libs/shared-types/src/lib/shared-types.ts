export interface UserDto {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface CreateUserDto {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
}

export type StockType = 'SCHOOLS' | 'OTHERS';
export type CustomerType = 'SCHOOLS' | 'OTHERS';
export type UserRole = 'MANAGER' | 'STAFF';

export interface ProductDto {
  id: string;
  name: string;
  name_ar: string | null;
  unit: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateProductDto {
  name: string;
  name_ar?: string;
  unit?: string;
}

export interface UpdateProductDto {
  name?: string;
  name_ar?: string;
  unit?: string;
  is_active?: boolean;
}

export interface WarehouseDto {
  id: string;
  name: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateWarehouseDto {
  name: string;
  location?: string;
}

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

export interface CreateCustomerDto {
  name: string;
  type: CustomerType;
  address?: string;
  phone?: string;
  tax_id?: string;
  bank_account?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  type?: CustomerType;
  address?: string;
  phone?: string;
  tax_id?: string;
  bank_account?: string;
}

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

export interface CreateSupplierDto {
  name: string;
  address?: string;
  phone?: string;
  fax?: string;
  tax_id?: string;
  bank_account?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  address?: string;
  phone?: string;
  fax?: string;
  tax_id?: string;
  bank_account?: string;
}

export interface UnitDto {
  id: string;
  name: string;
  symbol: string;
  created_at: string;
}

export interface CreateUnitDto {
  name: string;
  symbol: string;
}

export interface BatchDto {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  unit_price: number;
  expiry_date: string | null;
  received_date: string;
  stock_type: StockType;
  created_at: string;
}

export interface CreateBatchDto {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  unit_price: number;
  stock_type: StockType;
  expiry_date?: string;
}

export interface PurchaseInvoiceItemDto {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreatePurchaseInvoiceDto {
  invoice_number: string;
  date: string;
  supplier_id: string;
  stock_type: StockType;
  subtotal: number;
  tax: number;
  net_total: number;
  notes?: string;
  items: PurchaseInvoiceItemDto[];
}

export interface GRNItemDto {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateGRNDto {
  grn_number: string;
  date: string;
  supplier_id: string;
  stock_type: StockType;
  notes?: string;
  items: GRNItemDto[];
}

export interface DeliveryNoteItemDto {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateDeliveryNoteDto {
  dn_number: string;
  date: string;
  customer_id: string;
  driver_name?: string;
  vehicle_plate?: string;
  notes?: string;
  items: DeliveryNoteItemDto[];
}

export interface SalesInvoiceItemDto {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateSalesInvoiceDto {
  invoice_number: string;
  date: string;
  customer_id: string;
  stock_type: StockType;
  delivery_note_ids?: string[];
  subtotal: number;
  tax: number;
  net_total: number;
  driver_name?: string;
  vehicle_plate?: string;
  notes?: string;
  items: SalesInvoiceItemDto[];
}

export interface StockComparisonRow {
  product_id: string;
  product_name: string;
  product_unit: string;
  purchase_quantity: number;
  purchase_value: number;
  sale_quantity: number;
  sale_value: number;
  stock_quantity: number;
}
