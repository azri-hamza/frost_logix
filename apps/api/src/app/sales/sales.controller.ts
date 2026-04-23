import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateDeliveryNoteDto } from './dto/create-delivery-note.dto';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('delivery-notes')
  findAllDeliveryNotes() {
    return this.salesService.findAllDeliveryNotes();
  }

  @Get('delivery-notes/:id')
  findDeliveryNoteById(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findDeliveryNoteById(id);
  }

  @Post('delivery-notes')
  createDeliveryNote(@Body() data: CreateDeliveryNoteDto) {
    return this.salesService.createDeliveryNote(data);
  }

  @Delete('delivery-notes/:id')
  deleteDeliveryNote(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.deleteDeliveryNote(id);
  }

  @Get('invoices')
  findAllInvoices() {
    return this.salesService.findAllInvoices();
  }

  @Get('invoices/:id')
  findInvoiceById(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findInvoiceById(id);
  }

  @Post('invoices')
  createInvoice(@Body() data: CreateSalesInvoiceDto) {
    return this.salesService.createInvoice(data);
  }

  @Delete('invoices/:id')
  deleteInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.deleteInvoice(id);
  }
}