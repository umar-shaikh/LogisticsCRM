import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Customer } from '../../models';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page animate-fade-in">
      <div class="page-header flex-between">
        <div>
          <h1 class="page-title">Customers</h1>
          <p class="page-sub">Manage your client relationships</p>
        </div>
        <button class="btn-primary" (click)="showModal = true">
          <i class="fas fa-plus"></i> Add Customer
        </button>
      </div>

      <div class="filters-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" [(ngModel)]="search" (input)="loadCustomers()" placeholder="Search customers..." />
        </div>
        <select [(ngModel)]="typeFilter" (change)="loadCustomers()">
          <option value="">All Types</option>
          <option value="individual">Individual</option>
          <option value="corporate">Corporate</option>
          <option value="ecommerce">E-Commerce</option>
          <option value="manufacturer">Manufacturer</option>
        </select>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Company</th><th>Contact Person</th><th>Email / Phone</th><th>Location</th><th>Type</th><th>Status</th><th>Shipments</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of customers">
                <td><strong>{{c.company_name}}</strong></td>
                <td>{{c.contact_person}}</td>
                <td><div class="contact-info"><span>{{c.email}}</span><span>{{c.phone}}</span></div></td>
                <td>{{c.city}}, {{c.state}}</td>
                <td><span class="type-badge">{{c.type}}</span></td>
                <td><span class="status" [class]="'status-' + c.status">{{c.status}}</span></td>
                <td class="font-mono">{{c.shipments_count || 0}}</td>
                <td>
                  <button class="icon-btn" (click)="editCustomer(c)" title="Edit"><i class="fas fa-edit"></i></button>
                  <button class="icon-btn danger" (click)="deleteCustomer(c.id)" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
              </tr>
              <tr *ngIf="customers.length === 0">
                <td colspan="8"><div class="empty-state"><i class="fas fa-users"></i><p>No customers found</p></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>{{editing ? 'Edit' : 'Add'}} Customer</h3><button class="close-btn" (click)="showModal = false"><i class="fas fa-times"></i></button></div>
        <form (ngSubmit)="saveCustomer()" class="modal-body">
          <div class="form-row">
            <div class="form-group"><label>Company Name *</label><input type="text" [(ngModel)]="form.company_name" name="company_name" required /></div>
            <div class="form-group"><label>Contact Person *</label><input type="text" [(ngModel)]="form.contact_person" name="contact_person" required /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Email *</label><input type="email" [(ngModel)]="form.email" name="email" required /></div>
            <div class="form-group"><label>Phone *</label><input type="text" [(ngModel)]="form.phone" name="phone" required /></div>
          </div>
          <div class="form-group"><label>Address *</label><textarea [(ngModel)]="form.address" name="address" rows="2" required></textarea></div>
          <div class="form-row">
            <div class="form-group"><label>City *</label><input type="text" [(ngModel)]="form.city" name="city" required /></div>
            <div class="form-group"><label>State *</label><input type="text" [(ngModel)]="form.state" name="state" required /></div>
            <div class="form-group"><label>Pincode *</label><input type="text" [(ngModel)]="form.pincode" name="pincode" required /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Customer Type</label>
              <select [(ngModel)]="form.type" name="type"><option value="individual">Individual</option><option value="corporate">Corporate</option><option value="ecommerce">E-Commerce</option><option value="manufacturer">Manufacturer</option></select>
            </div>
            <div class="form-group"><label>Status</label>
              <select [(ngModel)]="form.status" name="status"><option value="active">Active</option><option value="inactive">Inactive</option><option value="blocked">Blocked</option></select>
            </div>
          </div>
          <div class="form-group"><label>Notes</label><textarea [(ngModel)]="form.notes" name="notes" rows="2"></textarea></div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="showModal = false">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="saving"><i class="fas fa-spinner fa-spin" *ngIf="saving"></i> {{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg, var(--accent), #8b5cf6); border: none; border-radius: 10px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-secondary { padding: 10px 18px; background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); font-size: 13px; cursor: pointer; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; }
    .search-box { flex: 1; display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; padding: 0 14px; }
    .search-box input { flex: 1; background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; padding: 10px 0; font-family: var(--font-body); }
    .search-box input::placeholder { color: var(--text-muted); }
    .filters-bar select { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); font-size: 13px; padding: 10px 14px; outline: none; }
    .card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); border-bottom: 1px solid var(--border-color); background: var(--bg-primary); }
    .data-table td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid var(--border-light); }
    .contact-info { display: flex; flex-direction: column; gap: 2px; }
    .contact-info span { font-size: 12px; color: var(--text-secondary); }
    .type-badge { background: var(--accent-light); color: var(--accent); padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: capitalize; }
    .icon-btn { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; background: none; border: 1px solid var(--border-color); border-radius: 7px; color: var(--text-muted); cursor: pointer; transition: var(--transition); font-size: 11px; margin: 0 2px; }
    .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
    .icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
    .close-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-muted); cursor: pointer; }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid var(--border-color); margin-top: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-row.three { grid-template-columns: 1fr 1fr 1fr; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 13px; font-family: var(--font-body); outline: none; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); }
    @media (max-width: 768px) { .form-row, .form-row.three { grid-template-columns: 1fr; } }
  `]
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  search = '';
  typeFilter = '';
  showModal = false;
  editing = false;
  saving = false;
  form: any = { type: 'corporate', status: 'active' };

  constructor(private api: ApiService) {}

  ngOnInit() { this.loadCustomers(); }

  loadCustomers() {
    this.api.getCustomers({ search: this.search, type: this.typeFilter }).subscribe(res => {
      if (res.success) this.customers = res.data.data;
    });
  }

  editCustomer(c: Customer) {
    this.editing = true;
    this.form = { ...c };
    this.showModal = true;
  }

  saveCustomer() {
    this.saving = true;
    const req = this.editing
      ? this.api.updateCustomer(this.form.id, this.form)
      : this.api.createCustomer(this.form);
    req.subscribe(() => {
      this.saving = false;
      this.showModal = false;
      this.form = { type: 'corporate', status: 'active' };
      this.editing = false;
      this.loadCustomers();
    });
  }

  deleteCustomer(id: number) {
    if (confirm('Delete this customer?')) this.api.deleteCustomer(id).subscribe(() => this.loadCustomers());
  }
}
