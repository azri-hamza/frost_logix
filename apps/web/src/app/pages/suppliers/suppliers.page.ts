import { Component, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliersService } from '../../services/suppliers.service';
import { SupplierDto, CreateSupplierDto, UpdateSupplierDto } from '@frost-logix/shared-types';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.page.html',
  styleUrl: './suppliers.page.css',
})
export class SuppliersPage {
  private readonly suppliersService = inject(SuppliersService);

  suppliers = signal<SupplierDto[]>([]);
  showForm = signal(false);
  editingSupplier = signal<SupplierDto | null>(null);
  newSupplier: CreateSupplierDto = {
    name: '',
    address: '',
    phone: '',
    fax: '',
    tax_id: '',
    bank_account: '',
  };
  editForm: UpdateSupplierDto = {
    name: '',
    address: '',
    phone: '',
    fax: '',
    tax_id: '',
    bank_account: '',
  };

  constructor() {
    afterNextRender(() => {
      this.loadSuppliers();
    });
  }

  loadSuppliers(): void {
    this.suppliersService.getSuppliers().subscribe({
      next: (suppliers) => this.suppliers.set(suppliers),
    });
  }

  createSupplier(): void {
    if (!this.newSupplier.name) return;
    this.suppliersService.createSupplier(this.newSupplier).subscribe({
      next: (supplier) => {
        this.suppliers.update((current) => [...current, supplier]);
        this.newSupplier = {
          name: '',
          address: '',
          phone: '',
          fax: '',
          tax_id: '',
          bank_account: '',
        };
        this.showForm.set(false);
      },
    });
  }

  startEdit(supplier: SupplierDto): void {
    this.editingSupplier.set(supplier);
    this.editForm = {
      name: supplier.name,
      address: supplier.address || '',
      phone: supplier.phone || '',
      fax: supplier.fax || '',
      tax_id: supplier.tax_id || '',
      bank_account: supplier.bank_account || '',
    };
  }

  updateSupplier(): void {
    const supplier = this.editingSupplier();
    if (!supplier) return;

    const data: UpdateSupplierDto = {
      name: this.editForm.name || undefined,
      address: this.editForm.address || undefined,
      phone: this.editForm.phone || undefined,
      fax: this.editForm.fax || undefined,
      tax_id: this.editForm.tax_id || undefined,
      bank_account: this.editForm.bank_account || undefined,
    };

    this.suppliersService.updateSupplier(supplier.id, data).subscribe({
      next: (updated) => {
        this.suppliers.update((current) =>
          current.map((s) => (s.id === updated.id ? updated : s))
        );
        this.editingSupplier.set(null);
      },
    });
  }

  cancelEdit(): void {
    this.editingSupplier.set(null);
  }
}