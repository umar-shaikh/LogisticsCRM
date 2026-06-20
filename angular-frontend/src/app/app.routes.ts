import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'shipments', loadComponent: () => import('./pages/shipments/shipments.component').then(m => m.ShipmentsComponent) },
      { path: 'shipments/:id', loadComponent: () => import('./pages/shipments/shipment-detail.component').then(m => m.ShipmentDetailComponent) },
      { path: 'customers', loadComponent: () => import('./pages/customers/customers.component').then(m => m.CustomersComponent) },
      { path: 'drivers', loadComponent: () => import('./pages/drivers/drivers.component').then(m => m.DriversComponent) },
      { path: 'vehicles', loadComponent: () => import('./pages/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
      { path: 'routes', loadComponent: () => import('./pages/routes/routes.component').then(m => m.RoutesComponent) },
      { path: 'invoices', loadComponent: () => import('./pages/invoices/invoices.component').then(m => m.InvoicesComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
