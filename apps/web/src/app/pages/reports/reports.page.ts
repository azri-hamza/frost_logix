import { Component, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../services/reports.service';
import { PdfService } from '../../services/pdf.service';
import { StockComparisonRow, StockType } from '@frost-logix/shared-types';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.page.html',
  styleUrl: './reports.page.css',
})
export class ReportsPage {
  private readonly reportsService = inject(ReportsService);
  private readonly pdfService = inject(PdfService);

  dashboard = signal<any>({});
  stockComparison = signal<StockComparisonRow[]>([]);
  purchases = signal<any[]>([]);
  sales = signal<any[]>([]);
  stockType = signal<StockType>('SCHOOLS');
  view = signal<'stock-comparison' | 'purchases' | 'sales'>('stock-comparison');

  exportStockComparisonPdf(): void {
    const typeLabel = this.stockType() === 'SCHOOLS' ? 'المعاهد' : 'الآخرين';
    this.pdfService.generateStockComparisonReport({
      stockType: typeLabel,
      items: this.stockComparison().map((item) => ({
        productName: item.product_name,
        productUnit: item.product_unit,
        purchaseQuantity: item.purchase_quantity,
        purchaseValue: item.purchase_value,
        saleQuantity: item.sale_quantity,
        saleValue: item.sale_value,
        stockQuantity: item.stock_quantity,
      })),
    }).then((doc) => {
      this.pdfService.downloadPdf(doc, `stock-comparison-${typeLabel}.pdf`);
    });
  }

  loadStockComparison(type: StockType): void {
    this.stockType.set(type);
    this.reportsService.getStockComparison(type).subscribe({
      next: (data) => this.stockComparison.set(data),
    });
  }

  constructor() {
    afterNextRender(() => {
      this.loadDashboard();
      this.loadStockComparison('SCHOOLS');
      this.loadPurchases();
      this.loadSales();
    });
  }

  loadDashboard(): void {
    this.reportsService.getDashboardSummary().subscribe({
      next: (data) => this.dashboard.set(data),
    });
  }

  loadPurchases(): void {
    this.reportsService.getPurchaseAnalysis().subscribe({
      next: (data) => this.purchases.set(data),
    });
  }

  loadSales(): void {
    this.reportsService.getSalesAnalysis().subscribe({
      next: (data) => this.sales.set(data),
    });
  }
}