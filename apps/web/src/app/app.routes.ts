import { Routes } from '@angular/router';
import { App } from './app';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { EditUserComponent } from './users/edit/edit-user.component';
import { authGuard } from './guards/auth.guard';
import { ProductsPage } from './pages/products/products.page';
import { CustomersPage } from './pages/customers/customers.page';
import { SuppliersPage } from './pages/suppliers/suppliers.page';
import { PurchasePage } from './pages/purchase/purchase.page';
import { SalesPage } from './pages/sales/sales.page';
import { InventoryPage } from './pages/inventory/inventory.page';
import { ReportsPage } from './pages/reports/reports.page';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'users', component: EditUserComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductsPage, canActivate: [authGuard] },
  { path: 'customers', component: CustomersPage, canActivate: [authGuard] },
  { path: 'suppliers', component: SuppliersPage, canActivate: [authGuard] },
  { path: 'purchase', component: PurchasePage, canActivate: [authGuard] },
  { path: 'sales', component: SalesPage, canActivate: [authGuard] },
  { path: 'inventory', component: InventoryPage, canActivate: [authGuard] },
  { path: 'reports', component: ReportsPage, canActivate: [authGuard] },
];