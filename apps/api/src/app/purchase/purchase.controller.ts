import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseInvoiceDto } from './dto/create-purchase-invoice.dto';
import { CreateGRNDto } from './dto/create-grn.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get('invoices')
  findAllInvoices() {
    return this.purchaseService.findAllInvoices();
  }

  @Get('invoices/:id')
  findInvoiceById(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseService.findInvoiceById(id);
  }

  @Post('invoices')
  createInvoice(@Body() data: CreatePurchaseInvoiceDto) {
    return this.purchaseService.createInvoice(data);
  }

  @Delete('invoices/:id')
  deleteInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseService.deleteInvoice(id);
  }

  @Get('grn')
  findAllGRNs() {
    return this.purchaseService.findAllGRNs();
  }

  @Get('grn/:id')
  findGRNById(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseService.findGRNById(id);
  }

  @Post('grn')
  createGRN(@Body() data: CreateGRNDto) {
    return this.purchaseService.createGRN(data);
  }

  @Delete('grn/:id')
  deleteGRN(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseService.deleteGRN(id);
  }
}