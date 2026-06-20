import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Invoice } from '../../models';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page animate-fade-in">
      <div class="page-header flex-between">
        <div><h1 class="page-title">Invoices</h1><p class="page-sub">Manage billing and payments</p></div>
        <button class="btn-primary" (click)="openModal()"><i class="fas fa-plus"></i> Create Invoice</button>
      </div>

      <!-- Summary Cards -->
      <div class="summary-row">
        <div class="summary-card"><i class="fas fa-file-invoice text-info"></i><div><span class="val">{{summary.total || 0}}</span><span class="lab">Total Invoices</span></div></div>
        <div class="summary-card"><i class="fas fa-check-circle text-success"></i><div><span class="val">{{summary.paid || 0}}</span><span class="lab">Paid</span></div></div>
        <div class="summary-card"><i class="fas fa-clock text-warning"></i><div><span class="val">{{summary.pending || 0}}</span><span class="lab">Pending</span></div></div>
        <div class="summary-card"><i class="fas fa-exclamation-circle text-danger"></i><div><span class="val">{{summary.overdue || 0}}</span><span class="lab">Overdue</span></div></div>
      </div>

      <div class="filters-bar">
        <div class="search-box"><i class="fas fa-search"></i><input type="text" [(ngModel)]="search" (input)="load()" placeholder="Search invoices..." /></div>
        <select [(ngModel)]="statusFilter" (change)="load()">
          <option value="">All Status</option><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="partial">Partial</option><option value="overdue">Overdue</option><option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Invoice #</th><th>Customer</th><th>Shipment</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let inv of invoices">
                <td><span class="inv-num">{{inv.invoice_number}}</span></td>
                <td>{{inv.customer?.company_name || '-'}}</td>
                <td><span class="tracking-sm">{{inv.shipment?.tracking_number || '-'}}</span></td>
                <td>{{inv.invoice_date | date:'shortDate'}}</td>
                <td [class.text-danger]="inv.status === 'overdue'">{{inv.due_date | date:'shortDate'}}</td>
                <td class="font-mono">{{inv.total_amount | currency:'INR'}}</td>
                <td><span class="status" [class]="'status-' + inv.status">{{inv.status}}</span></td>
                <td>
                  <button *ngIf="inv.status !== 'paid' && inv.status !== 'cancelled'" class="icon-btn success" (click)="markPaid(inv.id)" title="Mark Paid"><i class="fas fa-check"></i></button>
                  <button class="icon-btn" (click)="edit(inv)" title="Edit"><i class="fas fa-edit"></i></button>
                  <button class="icon-btn danger" (click)="del(inv.id)" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
              </tr>
              <tr *ngIf="invoices.length === 0"><td colspan="8"><div class="empty-state"><i class="fas fa-file-invoice-dollar"></i><p>No invoices found</p></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>{{editing ? 'Edit' : 'Create'}} Invoice</h3><button class="close-btn" (click)="showModal = false"><i class="fas fa-times"></i></button></div>
        <form (ngSubmit)="save()" class="modal-body">
          <div class="form-row"><div class="form-group"><label>Shipment *</label><select [(ngModel)]="form.shipment_id" name="shipment_id" required><option *ngFor="let s of shipments" [value]="s.id">{{s.tracking_number}}</option></select></div><div class="form-group"><label>Customer *</label><select [(ngModel)]="form.customer_id" name="customer_id" required><option *ngFor="let c of customers" [value]="c.id">{{c.company_name}}</option></select></div></div>
          <div class="form-row"><div class="form-group"><label>Invoice Date *</label><input type="date" [(ngModel)]="form.invoice_date" name="invoice_date" required /></div><div class="form-group"><label>Due Date *</label><input type="date" [(ngModel)]="form.due_date" name="due_date" required /></div></div>
          <div class="form-row"><div class="form-group"><label>Subtotal *</label><input type="number" [(ngModel)]="form.subtotal" name="subtotal" required /></div><div class="form-group"><label>Tax Rate (%)</label><input type="number" [(ngModel)]="form.tax_rate" name="tax_rate" value="18" /></div></div>
          <div class="form-group"><label>Notes</label><textarea [(ngModel)]="form.notes" name="notes" rows="2"></textarea></div>
          <div class="modal-footer"><button type="button" class="btn-secondary" (click)="showModal = false">Cancel</button><button type="submit" class="btn-primary" [disabled]="saving"><i class="fas fa-spinner fa-spin" *ngIf="saving"></i> {{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}}</button></div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg, var(--accent), #8b5cf6); border: none; border-radius: 10px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-secondary { padding: 10px 18px; background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); font-size: 13px; cursor: pointer; }
    .summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
    .summary-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px 20px; display: flex; align-items: center; gap: 14px; }
    .summary-card i { font-size: 22px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); border-radius: 11px; }
    .summary-card .val { display: block; font-size: 20px; font-weight: 700; }
    .summary-card .lab { display: block; font-size: 12px; color: var(--text-muted); }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; }
    .search-box { flex: 1; display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; padding: 0 14px; }
    .search-box input { flex: 1; background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; padding: 10px 0; font-family: var(--font-body); }
    .filters-bar select { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); font-size: 13px; padding: 10px 14px; outline: none; }
    .card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); border-bottom: 1px solid var(--border-color); background: var(--bg-primary); }
    .data-table td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid var(--border-light); }
    .inv-num { font-family: var(--font-mono); font-size: 12px; color: var(--accent); font-weight: 500; }
    .tracking-sm { font-family: var(--font-mono); font-size: 10px; background: var(--bg-primary); padding: 2px 6px; border-radius: 4px; color: var(--text-muted); }
    .icon-btn { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; background: none; border: 1px solid var(--border-color); border-radius: 7px; color: var(--text-muted); cursor: pointer; font-size: 11px; margin: 0 2px; }
    .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
    .icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); }
    .icon-btn.success:hover { border-color: var(--success); color: var(--success); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
    .close-btn { width: 32px; height: 32px; background: none; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-muted); cursor: pointer; }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid var(--border-color); margin-top: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 13px; font-family: var(--font-body); outline: none; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); }
    @media (max-width: 768px) { .summary-row { grid-template-columns: repeat(2, 1fr); } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = []; customers: any[] = []; shipments: any[] = [];
  search = ''; statusFilter = ''; summary: any = {};
  showModal = false; editing = false; saving = false;
  form: any = { tax_rate: 18, invoice_date: new Date().toISOString().split('T')[0] };

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); this.loadDropdowns(); }

  load() {
    this.api.getInvoices({ search: this.search, status: this.statusFilter }).subscribe(res => {
      if (res.success) {
        this.invoices = res.data.data;
        this.summary = {
          total: this.invoices.length,
          paid: this.invoices.filter(i => i.status === 'paid').length,
          pending: this.invoices.filter(i => i.status === 'sent' || i.status === 'draft').length,
          overdue: this.invoices.filter(i => i.status === 'overdue').length
        };
      }
    });
  }
  loadDropdowns() {
    this.api.getCustomerDropdown().subscribe(r => { if (r.success) this.customers = r.data; });
    this.api.getShipments({ per_page: 100 }).subscribe(r => { if (r.success) this.shipments = r.data.data.filter((s: any) => !s.invoice); });
  }
  openModal() { this.editing = false; this.form = { tax_rate: 18, invoice_date: new Date().toISOString().split('T')[0] }; this.showModal = true; }
  edit(inv: Invoice) { this.editing = true; this.form = { ...inv }; this.showModal = true; }
  save() {
    this.saving = true;
    const req = this.editing ? this.api.updateInvoice(this.form.id, this.form) : this.api.createInvoice(this.form);
    req.subscribe(() => { this.saving = false; this.showModal = false; this.load(); });
  }
  del(id: number) { if (confirm('Delete this invoice?')) this.api.deleteInvoice(id).subscribe(() => this.load()); }
  markPaid(id: number) { if (confirm('Mark as paid?')) this.api.markInvoicePaid(id).subscribe(() => this.load()); }
}
