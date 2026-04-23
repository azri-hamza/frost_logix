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
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">التقارير</h1>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded border border-border bg-card p-4">
          <div class="text-sm text-muted-foreground">عدد المنتجات</div>
          <div class="text-2xl font-bold">{{ dashboard().totalProducts }}</div>
        </div>
        <div class="rounded border border-border bg-card p-4">
          <div class="text-sm text-muted-foreground">عدد الزباتن</div>
          <div class="text-2xl font-bold">{{ dashboard().totalCustomers }}</div>
        </div>
        <div class="rounded border border-border bg-card p-4">
          <div class="text-sm text-muted-foreground">المبيعات اليوم</div>
          <div class="text-2xl font-bold">{{ dashboard().todaySalesTotal || 0 }}</div>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          (click)="view.set('stock-comparison')"
          class="rounded px-3 py-1"
          [class.bg-primary]="view() === 'stock-comparison'"
          [class.text-primary-foreground]="view() === 'stock-comparison'"
        >
          مقارنة المخزون
        </button>
        <button
          (click)="view.set('purchases')"
          class="rounded px-3 py-1"
          [class.bg-primary]="view() === 'purchases'"
          [class.text-primary-foreground]="view() === 'purchases'"
        >
          تحليل المشتريات
        </button>
        <button
          (click)="view.set('sales')"
          class="rounded px-3 py-1"
          [class.bg-primary]="view() === 'sales'"
          [class.text-primary-foreground]="view() === 'sales'"
        >
          تحليل المبيعات
        </button>
      </div>

      @if (view() === 'stock-comparison') {
        <div class="flex gap-2 mb-4">
          <button
            (click)="loadStockComparison('SCHOOLS')"
            class="rounded px-3 py-1"
            [class.bg-primary]="stockType() === 'SCHOOLS'"
            [class.text-primary-foreground]="stockType() === 'SCHOOLS'"
          >
            المعاهد
          </button>
          <button
            (click)="loadStockComparison('OTHERS')"
            class="rounded px-3 py-1"
            [class.bg-primary]="stockType() === 'OTHERS'"
            [class.text-primary-foreground]="stockType() === 'OTHERS'"
          >
            آخرون
          </button>
          <button
            (click)="exportStockComparisonPdf()"
            class="mr-auto rounded bg-secondary px-3 py-1"
          >
            تصدير PDF
          </button>
        </div>

        <div class="rounded border border-border">
          <table class="w-full">
            <thead class="border-b border-border bg-muted">
              <tr>
                <th class="px-4 py-2 text-right">المنتج</th>
                <th class="px-4 py-2 text-right">الكمية المشتراة</th>
                <th class="px-4 py-2 text-right">قيمة الشراء</th>
                <th class="px-4 py-2 text-right">الكمية المباعة</th>
                <th class="px-4 py-2 text-right">قيمة البيع</th>
                <th class="px-4 py-2 text-right">المخزون</th>
              </tr>
            </thead>
            <tbody>
              @for (row of stockComparison(); track row.product_id) {
                <tr class="border-b border-border">
                  <td class="px-4 py-2">{{ row.product_name }}</td>
                  <td class="px-4 py-2">{{ row.purchase_quantity }}</td>
                  <td class="px-4 py-2">{{ row.purchase_value }}</td>
                  <td class="px-4 py-2">{{ row.sale_quantity }}</td>
                  <td class="px-4 py-2">{{ row.sale_value }}</td>
                  <td class="px-4 py-2">{{ row.stock_quantity }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (view() === 'purchases') {
        <div class="rounded border border-border">
          <table class="w-full">
            <thead class="border-b border-border bg-muted">
              <tr>
                <th class="px-4 py-2 text-right">رقم الفاتورة</th>
                <th class="px-4 py-2 text-right">التاريخ</th>
                <th class="px-4 py-2 text-right">المورد</th>
                <th class="px-4 py-2 text-right">الصافي</th>
              </tr>
            </thead>
            <tbody>
              @for (p of purchases(); track p.id) {
                <tr class="border-b border-border">
                  <td class="px-4 py-2">{{ p.invoice_number }}</td>
                  <td class="px-4 py-2">{{ p.date | date:'shortDate' }}</td>
                  <td class="px-4 py-2">{{ p.supplier_name }}</td>
                  <td class="px-4 py-2">{{ p.net_total }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (view() === 'sales') {
        <div class="rounded border border-border">
          <table class="w-full">
            <thead class="border-b border-border bg-muted">
              <tr>
                <th class="px-4 py-2 text-right">رقم الفاتورة</th>
                <th class="px-4 py-2 text-right">التاريخ</th>
                <th class="px-4 py-2 text-right">الزبون</th>
                <th class="px-4 py-2 text-right">الصافي</th>
              </tr>
            </thead>
            <tbody>
              @for (s of sales(); track s.id) {
                <tr class="border-b border-border">
                  <td class="px-4 py-2">{{ s.invoice_number }}</td>
                  <td class="px-4 py-2">{{ s.date | date:'shortDate' }}</td>
                  <td class="px-4 py-2">{{ s.customer_name }}</td>
                  <td class="px-4 py-2">{{ s.net_total }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
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