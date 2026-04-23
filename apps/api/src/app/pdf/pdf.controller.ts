import { Controller, Post, Body, Res, ParseUUIDPipe } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('purchase-invoice')
  async generatePurchaseInvoice(
    @Body() data: PurchaseInvoiceDto,
    @Res() res: Response,
  ) {
    const html = this.getPurchaseInvoiceHtml(data);
    const pdf = await this.pdfService.generatePdfFromHtml(html);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="purchase-${data.invoiceNumber}.pdf"`,
    });
    res.end(pdf);
  }

  @Post('grn')
  async generateGRN(
    @Body() data: GrnDto,
    @Res() res: Response,
  ) {
    const html = this.getGrnHtml(data);
    const pdf = await this.pdfService.generatePdfFromHtml(html);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="grn-${data.grnNumber}.pdf"`,
    });
    res.end(pdf);
  }

  @Post('delivery-note')
  async generateDeliveryNote(
    @Body() data: DeliveryNoteDto,
    @Res() res: Response,
  ) {
    const html = this.getDeliveryNoteHtml(data);
    const pdf = await this.pdfService.generatePdfFromHtml(html);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="delivery-${data.dnNumber}.pdf"`,
    });
    res.end(pdf);
  }

  @Post('sales-invoice')
  async generateSalesInvoice(
    @Body() data: SalesInvoiceDto,
    @Res() res: Response,
  ) {
    const html = this.getSalesInvoiceHtml(data);
    const pdf = await this.pdfService.generatePdfFromHtml(html);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="sales-${data.invoiceNumber}.pdf"`,
    });
    res.end(pdf);
  }

  @Post('stock-comparison')
  async generateStockComparison(
    @Body() data: StockComparisonDto,
    @Res() res: Response,
  ) {
    const html = this.getStockComparisonHtml(data);
    const pdf = await this.pdfService.generatePdfFromHtml(html);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="stock-comparison.pdf"`,
    });
    res.end(pdf);
  }

  private getPurchaseInvoiceHtml(data: PurchaseInvoiceDto): string {
    const stockTypeLabel = data.stockType === 'SCHOOLS' ? 'المعاهد' : 'الآخرين';
    const itemsHtml = data.items
      .map(
        (item, index) => `
        <tr>
          <td>${item.productName}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: center;">${item.unitPrice.toFixed(3)}</td>
          <td style="text-align: right;">${item.total.toFixed(3)}</td>
        </tr>
      `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Amiri', serif; font-size: 12px; direction: rtl; }
          .container { width: 100%; padding: 10px; }
          .header { text-align: center; margin-bottom: 20px; }
          .company-name { font-size: 18px; font-weight: bold; }
          .title { font-size: 16px; font-weight: bold; margin: 10px 0; }
          .info { margin-bottom: 15px; }
          .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .totals { text-align: left; }
          .footer { margin-top: 20px; }
          @page { size: A4; margin: 10mm; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-name">${data.companyInfo?.name || 'الشركة'}</div>
            <div>${data.companyInfo?.address || ''}</div>
            <div>هاتف: ${data.companyInfo?.phone || ''}</div>
            <div>س.ض: ${data.companyInfo?.taxId || ''}</div>
          </div>
          
          <div class="title" style="text-align: center;">فاتورة شراء</div>
          
          <div class="info">
            <div class="info-row">
              <span>رقم الفاتورة: ${data.invoiceNumber}</span>
              <span>التاريخ: ${data.date}</span>
            </div>
            <div class="info-row">
              <span>المورد: ${data.supplierName}</span>
              <span>نوع البضاعة: ${stockTypeLabel}</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">الصنف</th>
                <th style="width: 20%;">الكمية</th>
                <th style="width: 20%;">السعر</th>
                <th style="width: 20%;">المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals">
            <div>الجملة: ${data.subtotal.toFixed(3)}</div>
            <div>الضريبة: ${data.tax.toFixed(3)}</div>
            <div style="font-weight: bold;">الصافي: ${data.netTotal.toFixed(3)}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getGrnHtml(data: GrnDto): string {
    const stockTypeLabel = data.stockType === 'SCHOOLS' ? 'المعاهد' : 'الآخرين';
    const itemsHtml = data.items
      .map((item) => `
        <tr>
          <td>${item.productName}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: center;">${item.unitPrice.toFixed(3)}</td>
          <td style="text-align: right;">${item.total.toFixed(3)}</td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Amiri', serif; font-size: 12px; direction: rtl; }
          .container { width: 100%; padding: 10px; }
          .header { text-align: center; margin-bottom: 20px; }
          .company-name { font-size: 18px; font-weight: bold; }
          .title { font-size: 16px; font-weight: bold; margin: 10px 0; }
          .info { margin-bottom: 15px; }
          .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .totals { text-align: left; }
          .signatures { margin-top: 30px; display: flex; justify-content: space-between; }
          @page { size: A4; margin: 10mm; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-name">${data.companyInfo?.name || 'الشركة'}</div>
            <div>${data.companyInfo?.address || ''}</div>
            <div>هاتف: ${data.companyInfo?.phone || ''}</div>
            <div>س.ض: ${data.companyInfo?.taxId || ''}</div>
          </div>
          
          <div class="title" style="text-align: center;">وصل استلام البضاعة</div>
          
          <div class="info">
            <div class="info-row">
              <span>رقم الوصل: ${data.grnNumber}</span>
              <span>التاريخ: ${data.date}</span>
            </div>
            <div class="info-row">
              <span>المورد: ${data.supplierName}</span>
              <span>نوع البضاعة: ${stockTypeLabel}</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">الصنف</th>
                <th style="width: 20%;">الكمية</th>
                <th style="width: 20%;">السعر</th>
                <th style="width: 20%;">المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals">
            <div>الجملة: ${data.total.toFixed(3)}</div>
          </div>
          
          <div class="signatures">
            <div>امضاء المورد</div>
            <div>امضاء المستلم</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getDeliveryNoteHtml(data: DeliveryNoteDto): string {
    const stockTypeLabel = data.stockType === 'SCHOOLS' ? 'المعاهد' : 'الآخرين';
    const itemsHtml = data.items
      .map((item) => `
        <tr>
          <td>${item.productName}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: center;">${item.unitPrice.toFixed(3)}</td>
          <td style="text-align: right;">${item.total.toFixed(3)}</td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Amiri', serif; font-size: 12px; direction: rtl; }
          .container { width: 100%; padding: 10px; }
          .header { text-align: center; margin-bottom: 20px; }
          .company-name { font-size: 18px; font-weight: bold; }
          .title { font-size: 16px; font-weight: bold; margin: 10px 0; }
          .info { margin-bottom: 15px; }
          .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .signatures { margin-top: 30px; display: flex; justify-content: space-between; }
          @page { size: A4; margin: 10mm; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-name">${data.companyInfo?.name || 'الشركة'}</div>
            <div>${data.companyInfo?.address || ''}</div>
            <div>هاتف: ${data.companyInfo?.phone || ''}</div>
            <div>س.ض: ${data.companyInfo?.taxId || ''}</div>
          </div>
          
          <div class="title" style="text-align: center;">وصل تسليم</div>
          
          <div class="info">
            <div class="info-row">
              <span>رقم الوصل: ${data.dnNumber}</span>
              <span>التاريخ: ${data.date}</span>
            </div>
            <div class="info-row">
              <span>الحريف: ${data.customerName}</span>
              <span>نوع البضاعة: ${stockTypeLabel}</span>
            </div>
            ${data.driverName ? `<div>السائق: ${data.driverName}</div>` : ''}
            ${data.vehiclePlate ? `<div>الشاحنة: ${data.vehiclePlate}</div>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">الصنف</th>
                <th style="width: 20%;">الكمية</th>
                <th style="width: 20%;">السعر</th>
                <th style="width: 20%;">المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="signatures">
            <div>امضاء الحريف</div>
            <div>امضاء المورد</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getSalesInvoiceHtml(data: SalesInvoiceDto): string {
    const stockTypeLabel = data.stockType === 'SCHOOLS' ? 'المعاهد' : 'الآخرين';
    const itemsHtml = data.items
      .map((item) => `
        <tr>
          <td>${item.productName}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: center;">${item.unitPrice.toFixed(3)}</td>
          <td style="text-align: right;">${item.total.toFixed(3)}</td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Amiri', serif; font-size: 12px; direction: rtl; }
          .container { width: 100%; padding: 10px; }
          .header { text-align: center; margin-bottom: 20px; }
          .company-name { font-size: 18px; font-weight: bold; }
          .title { font-size: 16px; font-weight: bold; margin: 10px 0; }
          .info { margin-bottom: 15px; }
          .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .totals { text-align: left; }
          @page { size: A4; margin: 10mm; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-name">${data.companyInfo?.name || 'الشركة'}</div>
            <div>${data.companyInfo?.address || ''}</div>
            <div>هاتف: ${data.companyInfo?.phone || ''}</div>
            <div>س.ض: ${data.companyInfo?.taxId || ''}</div>
          </div>
          
          <div class="title" style="text-align: center;">فاتورة مبيعات</div>
          
          <div class="info">
            <div class="info-row">
              <span>رقم الفاتورة: ${data.invoiceNumber}</span>
              <span>التاريخ: ${data.date}</span>
            </div>
            <div class="info-row">
              <span>الحريف: ${data.customerName}</span>
              <span>نوع البضاعة: ${stockTypeLabel}</span>
            </div>
            ${data.customerAddress ? `<div>العنوان: ${data.customerAddress}</div>` : ''}
            ${data.customerTaxId ? `<div>م.ف: ${data.customerTaxId}</div>` : ''}
            ${data.driverName ? `<div>السائق: ${data.driverName}</div>` : ''}
            ${data.vehiclePlate ? `<div>الشاحنة: ${data.vehiclePlate}</div>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">الصنف</th>
                <th style="width: 20%;">الكمية</th>
                <th style="width: 20%;">السعر</th>
                <th style="width: 20%;">المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals">
            <div>الجملة: ${data.subtotal.toFixed(3)}</div>
            <div>الضريبة: ${data.tax.toFixed(3)}</div>
            <div style="font-weight: bold;">الصافي: ${data.netTotal.toFixed(3)}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getStockComparisonHtml(data: StockComparisonDto): string {
    const stockTypeLabel = data.stockType === 'SCHOOLS' ? 'المعاهد' : 'الآخرين';
    const itemsHtml = data.items
      .map((item) => `
        <tr>
          <td>${item.productName}</td>
          <td style="text-align: center;">${item.purchaseQuantity}</td>
          <td style="text-align: center;">${item.purchaseValue.toFixed(3)}</td>
          <td style="text-align: center;">${item.saleQuantity}</td>
          <td style="text-align: center;">${item.saleValue.toFixed(3)}</td>
          <td style="text-align: center;">${item.stockQuantity}</td>
        </tr>
      `)
      .join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Amiri', serif; font-size: 10px; direction: rtl; }
          .container { width: 100%; padding: 10px; }
          .header { text-align: center; margin-bottom: 20px; }
          .title { font-size: 14px; font-weight: bold; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #000; padding: 6px; font-size: 10px; }
          th { background-color: #f0f0f0; font-weight: bold; }
          @page { size: A4 landscape; margin: 10mm; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title" style="text-align: center;">القيمة الجملية لبضاعة ${stockTypeLabel}</div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 25%;">الصنف</th>
                <th style="width: 15%;">الكمية (شراء)</th>
                <th style="width: 15%;">قيمة (شراء)</th>
                <th style="width: 15%;">الكمية (بيع)</th>
                <th style="width: 15%;">قيمة (بيع)</th>
                <th style="width: 15%;">الكمية (المخزون)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
  }
}

interface PurchaseInvoiceDto {
  invoiceNumber: string;
  date: string;
  supplierName: string;
  stockType: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number; total: number }>;
  subtotal: number;
  tax: number;
  netTotal: number;
  companyInfo?: { name: string; address: string; phone: string; taxId: string; bankAccount: string };
}

interface GrnDto {
  grnNumber: string;
  date: string;
  supplierName: string;
  stockType: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number; total: number }>;
  total: number;
  companyInfo?: { name: string; address: string; phone: string; taxId: string; bankAccount: string };
}

interface DeliveryNoteDto {
  dnNumber: string;
  date: string;
  customerName: string;
  stockType: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number; total: number }>;
  driverName?: string;
  vehiclePlate?: string;
  companyInfo?: { name: string; address: string; phone: string; taxId: string; bankAccount: string };
}

interface SalesInvoiceDto {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerTaxId?: string;
  customerAddress?: string;
  stockType: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number; total: number }>;
  subtotal: number;
  tax: number;
  netTotal: number;
  driverName?: string;
  vehiclePlate?: string;
  companyInfo?: { name: string; address: string; phone: string; taxId: string; bankAccount: string };
}

interface StockComparisonDto {
  stockType: string;
  items: Array<{
    productName: string;
    productUnit: string;
    purchaseQuantity: number;
    purchaseValue: number;
    saleQuantity: number;
    saleValue: number;
    stockQuantity: number;
  }>;
}