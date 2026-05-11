import { Component, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomersService } from '../../services/customers.service';
import { CustomerDto, CreateCustomerDto, UpdateCustomerDto, CustomerType } from '@frost-logix/shared-types';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.page.html',
  styleUrl: './customers.page.css',
})
export class CustomersPage {
  private readonly customersService = inject(CustomersService);

  customers = signal<CustomerDto[]>([]);
  showForm = signal(false);
  editingCustomer = signal<CustomerDto | null>(null);
  filter = signal<'all' | CustomerType>('all');
  newCustomer: CreateCustomerDto = {
    name: '',
    type: 'SCHOOLS',
    address: '',
    phone: '',
    tax_id: '',
    bank_account: '',
  };
  editForm: UpdateCustomerDto = {
    name: '',
    type: 'SCHOOLS',
    address: '',
    phone: '',
    tax_id: '',
    bank_account: '',
  };

  filteredCustomers = () => {
    if (this.filter() === 'all') return this.customers();
    return this.customers().filter((c) => c.type === this.filter());
  };

  constructor() {
    afterNextRender(() => {
      this.loadCustomers();
    });
  }

  loadCustomers(): void {
    this.customersService.getCustomers().subscribe({
      next: (customers) => this.customers.set(customers),
    });
  }

  createCustomer(): void {
    if (!this.newCustomer.name) return;
    this.customersService.createCustomer(this.newCustomer).subscribe({
      next: (customer) => {
        this.customers.update((current) => [...current, customer]);
        this.newCustomer = {
          name: '',
          type: 'SCHOOLS',
          address: '',
          phone: '',
          tax_id: '',
          bank_account: '',
        };
        this.showForm.set(false);
      },
    });
  }

  startEdit(customer: CustomerDto): void {
    this.editingCustomer.set(customer);
    this.editForm = {
      name: customer.name,
      type: customer.type,
      address: customer.address || '',
      phone: customer.phone || '',
      tax_id: customer.tax_id || '',
      bank_account: customer.bank_account || '',
    };
  }

  updateCustomer(): void {
    const customer = this.editingCustomer();
    if (!customer) return;

    const data: UpdateCustomerDto = {
      name: this.editForm.name || undefined,
      type: this.editForm.type,
      address: this.editForm.address || undefined,
      phone: this.editForm.phone || undefined,
      tax_id: this.editForm.tax_id || undefined,
      bank_account: this.editForm.bank_account || undefined,
    };

    this.customersService.updateCustomer(customer.id, data).subscribe({
      next: (updated) => {
        this.customers.update((current) =>
          current.map((c) => (c.id === updated.id ? updated : c))
        );
        this.editingCustomer.set(null);
      },
    });
  }

  cancelEdit(): void {
    this.editingCustomer.set(null);
  }
}