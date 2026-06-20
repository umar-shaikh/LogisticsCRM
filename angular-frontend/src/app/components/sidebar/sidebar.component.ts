import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <i class="fas fa-truck-fast"></i>
        </div>
        <div class="brand-text">
          <span class="brand-title">Logistics CRM</span>
          <span class="brand-sub">Management System</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-label">Main</span>
          <a *ngFor="let item of mainNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item">
            <i [class]="item.icon"></i>
            <span>{{item.label}}</span>
            <span class="nav-badge" *ngIf="item.badge">{{item.badge}}</span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-label">Operations</span>
          <a *ngFor="let item of opsNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item">
            <i [class]="item.icon"></i>
            <span>{{item.label}}</span>
            <span class="nav-badge" *ngIf="item.badge">{{item.badge}}</span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-label">Finance</span>
          <a *ngFor="let item of financeNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item">
            <i [class]="item.icon"></i>
            <span>{{item.label}}</span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-label">System</span>
          <a *ngFor="let item of systemNav"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item">
            <i [class]="item.icon"></i>
            <span>{{item.label}}</span>
          </a>
          <a class="nav-item" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </a>
        </div>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border-color);
      position: fixed;
      top: 0; left: 0;
      z-index: 100;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .brand-icon {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
    }
    .brand-title {
      display: block;
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .brand-sub {
      display: block;
      font-size: 10px;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }
    .sidebar-nav {
      flex: 1;
      padding: 12px 10px;
    }
    .nav-section {
      margin-bottom: 8px;
    }
    .nav-label {
      display: block;
      padding: 12px 12px 6px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-faint);
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      margin: 2px 0;
      border-radius: 8px;
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      transition: var(--transition);
      cursor: pointer;
      position: relative;
    }
    .nav-item i {
      width: 18px;
      text-align: center;
      font-size: 14px;
    }
    .nav-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: var(--accent-light);
      color: var(--accent);
    }
    .nav-item.active::before {
      content: '';
      position: absolute;
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: var(--accent);
      border-radius: 0 3px 3px 0;
    }
    .nav-badge {
      margin-left: auto;
      background: var(--accent);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
    }
    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); transition: transform 0.3s ease; }
      .sidebar.mobile-open { transform: translateX(0); }
    }
  `]
})
export class SidebarComponent {
  mainNav: NavItem[] = [
    { label: 'Dashboard', icon: 'fas fa-chart-line', route: '/dashboard' },
    { label: 'Shipments', icon: 'fas fa-box', route: '/shipments', badge: 0 },
  ];
  opsNav: NavItem[] = [
    { label: 'Customers', icon: 'fas fa-users', route: '/customers' },
    { label: 'Drivers', icon: 'fas fa-id-card', route: '/drivers' },
    { label: 'Vehicles', icon: 'fas fa-truck', route: '/vehicles' },
    { label: 'Routes', icon: 'fas fa-route', route: '/routes' },
  ];
  financeNav: NavItem[] = [
    { label: 'Invoices', icon: 'fas fa-file-invoice-dollar', route: '/invoices' },
  ];
  systemNav: NavItem[] = [
    { label: 'Settings', icon: 'fas fa-cog', route: '/settings' },
  ];

  constructor(private auth: AuthService) {}

  logout() { this.auth.logout(); }
}
