import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { StockType } from '@prisma/client';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('stock-comparison')
  getStockComparison(@Query('stockType') stockType: StockType) {
    return this.reportsService.getStockComparison(stockType);
  }

  @Get('purchase-analysis')
  getPurchaseAnalysis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('stockType') stockType?: StockType,
  ) {
    return this.reportsService.getPurchaseAnalysis(startDate, endDate, stockType);
  }

  @Get('sales-analysis')
  getSalesAnalysis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('stockType') stockType?: StockType,
  ) {
    return this.reportsService.getSalesAnalysis(startDate, endDate, stockType);
  }

  @Get('dashboard')
  getDashboardSummary() {
    return this.reportsService.getDashboardSummary();
  }
}