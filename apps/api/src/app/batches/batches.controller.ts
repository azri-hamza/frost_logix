import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { StockType } from '@prisma/client';

@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get()
  findAll(@Query('warehouseId') warehouseId?: string) {
    return this.batchesService.findAll(warehouseId);
  }

  @Get('product/:productId')
  findByProduct(
    @Param('productId') productId: string,
    @Query('stockType') stockType?: StockType,
  ) {
    return this.batchesService.findByProduct(productId, stockType);
  }

  @Get('stock-summary')
  getStockSummary(
    @Query('warehouseId') warehouseId?: string,
    @Query('stockType') stockType?: StockType,
  ) {
    return this.batchesService.getStockSummary(warehouseId, stockType);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.batchesService.findById(id);
  }

  @Post()
  create(@Body() data: CreateBatchDto) {
    return this.batchesService.create(data);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.batchesService.delete(id);
  }
}