import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { DashboardStats, Shipment, Customer } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page animate-fade-in">
      <div class="page-header flex-between">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-sub">Overview of your logistics operations</p>
        </div>
        <a routerLink="/shipments/new" class="btn-primary">
          <i class="fas fa-plus"></i> New Shipment
        </a>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let kpi of kpis; let i = index" [class]="'stagger-' + (i+1)">
          <div class="kpi-icon" [style.background]="kpi.bg">
            <i [class]="kpi.icon" [style.color]="kpi.color"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-value">{{kpi.value}}</span>
            <span class="kpi-label">{{kpi.label}}</span>
          </div>
          <span class="kpi-trend" [class.up]="kpi.trend > 0" [class.down]="kpi.trend < 0" *ngIf="kpi.trend !== 0">
            <i [class]="kpi.trend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{abs(kpi.trend)}}%
          </span>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="dashboard-grid">
        <!-- Charts Row -->
        <div class="dashboard-card chart-card">
          <div class="card-header flex-between">
            <h3><i class="fas fa-chart-bar"></i> Monthly Revenue</h3>
            <select class="select-sm">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div class="chart-bars">
            <div class="bar-item" *ngFor="let m of revenueChart">
              <div class="bar-track">
                <div class="bar-fill" [style.height.%]="getBarHeight(m.revenue)"></div>
              </div>
              <span class="bar-label">{{m.month}}</span>
              <span class="bar-value">{{m.revenue | currency:'INR':'symbol':'1.0-0'}}</span>
            </div>
          </div>
        </div>

        <div class="dashboard-card chart-card">
          <div class="card-header flex-between">
            <h3><i class="fas fa-chart-pie"></i> Shipment Status</h3>
          </div>
          <div class="status-donut">
            <div class="donut-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-hover)" stroke-width="12"/>
                <circle *ngFor="let s of statusChart; let i = index"
                  cx="60" cy="60" r="50" fill="none"
                  [attr.stroke]="s.color"
                  stroke-width="12"
                  [attr.stroke-dasharray]="getDonutSegment(s.count)"
                  [attr.stroke-dashoffset]="getDonutOffset(i)"
                  transform="rotate(-90 60 60)"
                  stroke-linecap="round"
                />
              </svg>
              <div class="donut-center">
                <span class="donut-total">{{totalShipments}}</span>
                <span class="donut-label">Total</span>
              </div>
            </div>
            <div class="donut-legend">
              <div class="legend-item" *ngFor="let s of statusChart">
                <span class="legend-dot" [style.background]="s.color"></span>
                <span class="legend-label">{{s.label}}</span>
                <span class="legend-value">{{s.count}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Shipments -->
        <div class="dashboard-card wide">
          <div class="card-header flex-between">
            <h3><i class="fas fa-box"></i> Recent Shipments</h3>
            <a routerLink="/shipments" class="link-sm">View All</a>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>Tracking #</th><th>Customer</th><th>Origin</th><th>Destination</th><th>Status</th><th>Amount</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of recentShipments" [routerLink]="['/shipments', s.id]" class="clickable">
                  <td><span class="tracking">{{s.tracking_number}}</span></td>
                  <td>{{s.customer?.company_name || 'N/A'}}</td>
                  <td>{{s.sender_address | slice:0:30}}...</td>
                  <td>{{s.receiver_address | slice:0:30}}...</td>
                  <td><span class="status" [class]="'status-' + s.status">{{s.status?.replace('_', ' ')}}</span></td>
                  <td class="font-mono">{{s.total_amount | currency:'INR'}}</td>
                </tr>
                <tr *ngIf="recentShipments.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">No shipments yet</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Customers -->
        <div class="dashboard-card">
          <div class="card-header flex-between">
            <h3><i class="fas fa-trophy"></i> Top Customers</h3>
          </div>
          <div class="customer-list">
            <div class="customer-row" *ngFor="let c of topCustomers; let i = index">
              <span class="customer-rank">#{{i+1}}</span>
              <div class="customer-info">
                <span class="customer-name">{{c.company_name}}</span>
                <span class="customer-meta">{{c.shipments_count}} shipments</span>
              </div>
              <span class="customer-value font-mono">{{c.shipments_sum_total_amount | currency:'INR':'symbol':'1.0-0'}}</span>
            </div>
            <div class="empty-state" *ngIf="topCustomers.length === 0">
              <i class="fas fa-users"></i>
              <p>No customers yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 18px;
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      border: none; border-radius: 10px;
      color: white; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: var(--transition);
      text-decoration: none;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(99,102,241,0.3); }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      position: relative;
      transition: var(--transition);
      opacity: 0;
      animation: fadeIn 0.4s ease forwards;
    }
    .kpi-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .kpi-icon {
      width: 44px; height: 44px;
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .kpi-icon i { font-size: 18px; }
    .kpi-info { flex: 1; }
    .kpi-value { display: block; font-size: 22px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
    .kpi-label { display: block; font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .kpi-trend {
      position: absolute; top: 16px; right: 16px;
      font-size: 11px; font-weight: 600; padding: 2px 8px;
      border-radius: 20px;
    }
    .kpi-trend.up { background: rgba(34,197,94,0.1); color: var(--success); }
    .kpi-trend.down { background: rgba(239,68,68,0.1); color: var(--danger); }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
    }
    .dashboard-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 20px;
      opacity: 0;
      animation: fadeIn 0.5s ease 0.2s forwards;
    }
    .dashboard-card.wide { grid-column: 1 / -1; }
    .card-header { margin-bottom: 16px; }
    .card-header h3 { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .card-header h3 i { color: var(--accent); font-size: 13px; }
    .select-sm {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: 12px;
      padding: 5px 10px;
      outline: none;
    }
    .link-sm { font-size: 12px; color: var(--accent); }

    /* Chart Bars */
    .chart-bars { display: flex; align-items: flex-end; gap: 16px; height: 200px; padding: 10px 0; }
    .bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .bar-track { width: 100%; height: 160px; background: var(--bg-primary); border-radius: 6px; position: relative; overflow: hidden; }
    .bar-fill { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, var(--accent), #8b5cf6); border-radius: 6px; transition: height 0.6s ease; }
    .bar-label { font-size: 11px; color: var(--text-muted); font-weight: 500; }
    .bar-value { font-size: 10px; color: var(--text-faint); font-family: var(--font-mono); }

    /* Donut Chart */
    .status-donut { display: flex; align-items: center; gap: 24px; padding: 10px 0; }
    .donut-ring { position: relative; width: 140px; height: 140px; flex-shrink: 0; }
    .donut-ring svg { width: 100%; height: 100%; transform: rotate(0deg); }
    .donut-center {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      text-align: center;
    }
    .donut-total { display: block; font-size: 22px; font-weight: 700; }
    .donut-label { display: block; font-size: 11px; color: var(--text-muted); }
    .donut-legend { flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
    .legend-label { color: var(--text-secondary); flex: 1; }
    .legend-value { font-weight: 600; font-family: var(--font-mono); }

    /* Table */
    .table-wrap { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      text-align: left; padding: 10px 12px;
      font-size: 11px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--text-muted);
      border-bottom: 1px solid var(--border-color);
    }
    .data-table td {
      padding: 12px;
      font-size: 13px;
      border-bottom: 1px solid var(--border-light);
    }
    .data-table tr.clickable { cursor: pointer; transition: var(--transition); }
    .data-table tr.clickable:hover { background: var(--bg-hover); }
    .data-table tr.clickable:hover td { color: var(--text-primary); }
    .tracking {
      font-family: var(--font-mono); font-size: 12px;
      background: var(--bg-primary); padding: 4px 8px;
      border-radius: 5px; color: var(--accent);
    }

    /* Customer List */
    .customer-list { display: flex; flex-direction: column; gap: 12px; }
    .customer-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px;
      background: var(--bg-primary);
      border-radius: 10px;
      transition: var(--transition);
    }
    .customer-row:hover { background: var(--bg-hover); }
    .customer-rank {
      width: 28px; height: 28px;
      background: var(--accent-light);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: var(--accent);
      font-family: var(--font-mono);
    }
    .customer-info { flex: 1; }
    .customer-name { display: block; font-size: 13px; font-weight: 600; }
    .customer-meta { display: block; font-size: 11px; color: var(--text-muted); }
    .customer-value { font-size: 13px; font-weight: 600; }

    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .kpi-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentShipments: Shipment[] = [];
  topCustomers: Customer[] = [];
  revenueChart: any[] = [];
  statusChart: any[] = [];
  totalShipments = 0;
  maxRevenue = 1;

  kpis: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadStats();
    this.loadRecentShipments();
    this.loadRevenueChart();
    this.loadStatusChart();
    this.loadTopCustomers();
  }

  loadStats() {
    this.api.getStats().subscribe(res => {
      if (res.success) {
        this.stats = res.data;
        this.kpis = [
          { label: 'Total Shipments', value: this.stats.total_shipments, icon: 'fas fa-box', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', trend: this.stats.shipment_growth },
          { label: 'Revenue (Month)', value: 'INR ' + this.formatNumber(this.stats.revenue_this_month), icon: 'fas fa-rupee-sign', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', trend: this.stats.revenue_growth },
          { label: 'Active Drivers', value: this.stats.available_drivers + '/' + this.stats.total_drivers, icon: 'fas fa-id-card', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', trend: 0 },
          { label: 'Pending Invoices', value: this.stats.pending_invoices, icon: 'fas fa-file-invoice', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', trend: 0 },
        ];
      }
    });
  }

  loadRecentShipments() {
    this.api.getRecentShipments().subscribe(res => {
      if (res.success) this.recentShipments = res.data;
    });
  }

  loadRevenueChart() {
    this.api.getMonthlyRevenueChart().subscribe(res => {
      if (res.success) {
        this.revenueChart = res.data;
        this.maxRevenue = Math.max(...res.data.map((m: any) => m.revenue), 1);
      }
    });
  }

  loadStatusChart() {
    this.api.getShipmentStatusChart().subscribe(res => {
      if (res.success) {
        const colors = ['#fbbf24', '#60a5fa', '#93c5fd', '#a78bfa', '#f59e0b', '#22c55e', '#ef4444'];
        this.statusChart = res.data.map((s: any, i: number) => ({ ...s, color: colors[i] || '#6366f1' }));
        this.totalShipments = res.data.reduce((sum: number, s: any) => sum + s.count, 0);
      }
    });
  }

  loadTopCustomers() {
    this.api.getTopCustomers().subscribe(res => {
      if (res.success) this.topCustomers = res.data;
    });
  }

  getBarHeight(revenue: number): number {
    return this.maxRevenue > 0 ? Math.max((revenue / this.maxRevenue) * 100, 5) : 5;
  }

  getDonutSegment(count: number): string {
    const circumference = 2 * Math.PI * 50;
    if (this.totalShipments === 0) return `0 ${circumference}`;
    const segment = (count / this.totalShipments) * circumference;
    return `${segment} ${circumference}`;
  }

  getDonutOffset(index: number): number {
    const circumference = 2 * Math.PI * 50;
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += (this.statusChart[i].count / this.totalShipments) * circumference;
    }
    return -offset;
  }

  formatNumber(n: number): string {
    if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  abs(n: number): number { return Math.abs(n); }
}
