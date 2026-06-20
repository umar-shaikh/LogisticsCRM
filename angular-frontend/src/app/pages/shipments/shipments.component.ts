import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Shipment } from '../../models';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page animate-fade-in">
      <div class="page-header flex-between">
        <div>
          <h1 class="page-title">Shipments</h1>
          <p class="page-sub">Manage and track all shipments</p>
        </div>
        <button class="btn-primary" (click)="showModal = true">
          <i class="fas fa-plus"></i> Create Shipment
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" [(ngModel)]="search" (input)="loadShipments()" placeholder="Search by tracking #, sender, receiver..." />
        </div>
        <select [(ngModel)]="statusFilter" (change)="loadShipments()">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="picked_up">Picked Up</option>
          <option value="in_transit">In Transit</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select [(ngModel)]="priorityFilter" (change)="loadShipments()">
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Customer</th>
                <th>Sender / Receiver</th>
                <th>Goods</th>
                <th>Weight</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of shipments" [routerLink]="['/shipments', s.id]" class="clickable">
                <td><span class="tracking">{{s.tracking_number}}</span></td>
                <td>{{s.customer?.company_name || '-'}}</td>
                <td>
                  <div class="sender-receiver">
                    <span><i class="fas fa-arrow-up text-success"></i> {{s.sender_name | slice:0:20}}</span>
                    <span><i class="fas fa-arrow-down text-info"></i> {{s.receiver_name | slice:0:20}}</span>
                  </div>
                </td>
                <td>
                  <span class="goods-type">{{s.goods_description | slice:0:25}}</span>
                  <span class="goods-badge">{{s.goods_type}}</span>
                </td>
                <td class="font-mono">{{s.weight_kg}} kg</td>
                <td>
                  <span class="priority-badge" [class]="'priority-' + s.priority">{{s.priority}}</span>
                </td>
                <td><span class="status" [class]="'status-' + s.status">{{s.status?.replace('_', ' ')}}</span></td>
                <td class="font-mono">{{s.total_amount | currency:'INR'}}</td>
                <td>
                  <button class="icon-btn" (click)="$event.stopPropagation(); editShipment(s)" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="icon-btn danger" (click)="$event.stopPropagation(); deleteShipment(s.id)" title="Delete">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="shipments.length === 0">
                <td colspan="9">
                  <div class="empty-state"><i class="fas fa-box-open"></i><p>No shipments found</p></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)"><i class="fas fa-chevron-left"></i></button>
          <span *ngFor="let p of pages" [class.active]="p === currentPage" (click)="goToPage(p)">{{p}}</span>
          <button [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)"><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Create Shipment</h3>
          <button class="close-btn" (click)="showModal = false"><i class="fas fa-times"></i></button>
        </div>
        <form (ngSubmit)="createShipment()" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Customer</label>
              <select [(ngModel)]="newShipment.customer_id" name="customer_id" required>
                <option value="">Select Customer</option>
                <option *ngFor="let c of customers" [value]="c.id">{{c.company_name}}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Priority</label>
              <select [(ngModel)]="newShipment.priority" name="priority">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Sender Name</label>
              <input type="text" [(ngModel)]="newShipment.sender_name" name="sender_name" required />
            </div>
            <div class="form-group">
              <label>Sender Phone</label>
              <input type="text" [(ngModel)]="newShipment.sender_phone" name="sender_phone" required />
            </div>
          </div>
          <div class="form-group">
            <label>Sender Address</label>
            <textarea [(ngModel)]="newShipment.sender_address" name="sender_address" rows="2" required></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Receiver Name</label>
              <input type="text" [(ngModel)]="newShipment.receiver_name" name="receiver_name" required />
            </div>
            <div class="form-group">
              <label>Receiver Phone</label>
              <input type="text" [(ngModel)]="newShipment.receiver_phone" name="receiver_phone" required />
            </div>
          </div>
          <div class="form-group">
            <label>Receiver Address</label>
            <textarea [(ngModel)]="newShipment.receiver_address" name="receiver_address" rows="2" required></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Goods Description</label>
              <input type="text" [(ngModel)]="newShipment.goods_description" name="goods_description" required />
            </div>
            <div class="form-group">
              <label>Goods Type</label>
              <select [(ngModel)]="newShipment.goods_type" name="goods_type">
                <option value="general">General</option>
                <option value="fragile">Fragile</option>
                <option value="hazardous">Hazardous</option>
                <option value="perishable">Perishable</option>
                <option value="valuable">Valuable</option>
                <option value="oversized">Oversized</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Weight (kg)</label>
              <input type="number" [(ngModel)]="newShipment.weight_kg" name="weight_kg" required />
            </div>
            <div class="form-group">
              <label>Quantity</label>
              <input type="number" [(ngModel)]="newShipment.quantity" name="quantity" value="1" />
            </div>
            <div class="form-group">
              <label>Shipping Cost</label>
              <input type="number" [(ngModel)]="newShipment.shipping_cost" name="shipping_cost" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Pickup Date</label>
              <input type="date" [(ngModel)]="newShipment.pickup_date" name="pickup_date" required />
            </div>
            <div class="form-group">
              <label>Delivery Date</label>
              <input type="date" [(ngModel)]="newShipment.delivery_date" name="delivery_date" />
            </div>
          </div>
          <div class="form-group">
            <label>Special Instructions</label>
            <textarea [(ngModel)]="newShipment.special_instructions" name="special_instructions" rows="2"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="showModal = false">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="saving">
              <i class="fas fa-spinner fa-spin" *ngIf="saving"></i> {{saving ? 'Creating...' : 'Create Shipment'}}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg, var(--accent), #8b5cf6); border: none; border-radius: 10px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-secondary { padding: 10px 18px; background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); font-size: 13px; cursor: pointer; transition: var(--transition); }
    .btn-secondary:hover { border-color: var(--accent); color: var(--text-primary); }

    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 280px; display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; padding: 0 14px; }
    .search-box:focus-within { border-color: var(--accent); }
    .search-box i { color: var(--text-muted); font-size: 13px; }
    .search-box input { flex: 1; background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; padding: 10px 0; font-family: var(--font-body); }
    .search-box input::placeholder { color: var(--text-muted); }
    .filters-bar select { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); font-size: 13px; padding: 10px 14px; outline: none; min-width: 140px; }

    .card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); border-bottom: 1px solid var(--border-color); background: var(--bg-primary); }
    .data-table td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid var(--border-light); vertical-align: middle; }
    .data-table tr.clickable { cursor: pointer; transition: var(--transition); }
    .data-table tr.clickable:hover td { background: var(--bg-hover); }
    .tracking { font-family: var(--font-mono); font-size: 11px; background: var(--accent-light); padding: 3px 8px; border-radius: 5px; color: var(--accent); }
    .sender-receiver { display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
    .sender-receiver i { font-size: 9px; margin-right: 4px; }
    .goods-type { display: block; font-size: 12px; }
    .goods-badge { font-size: 10px; color: var(--text-muted); background: var(--bg-primary); padding: 2px 6px; border-radius: 4px; }
    .priority-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    .priority-low { background: rgba(100,116,139,0.15); color: #94a3b8; }
    .priority-normal { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .priority-high { background: rgba(245,158,11,0.15); color: #fbbf24; }
    .priority-urgent { background: rgba(239,68,68,0.15); color: #f87171; }
    .icon-btn { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; background: none; border: 1px solid var(--border-color); border-radius: 7px; color: var(--text-muted); cursor: pointer; transition: var(--transition); font-size: 11px; margin: 0 2px; }
    .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
    .icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 16px; border-top: 1px solid var(--border-color); }
    .pagination button, .pagination span { min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: var(--transition); }
    .pagination span:hover { border-color: var(--accent); color: var(--accent); }
    .pagination span.active { background: var(--accent); border-color: var(--accent); color: white; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
    .modal-header h3 { font-size: 16px; font-weight: 700; }
    .close-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-muted); cursor: pointer; transition: var(--transition); }
    .close-btn:hover { border-color: var(--danger); color: var(--danger); }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid var(--border-color); margin-top: 16px; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-row.three { grid-template-columns: 1fr 1fr 1fr; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%; padding: 10px 12px;
      background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px;
      color: var(--text-primary); font-size: 13px; font-family: var(--font-body);
      outline: none; transition: var(--transition);
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
    .form-group input::placeholder { color: var(--text-faint); }

    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
      .form-row.three { grid-template-columns: 1fr; }
    }
  `]
})
export class ShipmentsComponent implements OnInit {
  shipments: Shipment[] = [];
  customers: any[] = [];
  search = '';
  statusFilter = '';
  priorityFilter = '';
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];
  showModal = false;
  saving = false;

  newShipment: any = { priority: 'normal', goods_type: 'general', quantity: 1, pickup_date: new Date().toISOString().split('T')[0] };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadShipments();
    this.loadCustomers();
  }

  loadShipments() {
    this.api.getShipments({
      search: this.search,
      status: this.statusFilter,
      priority: this.priorityFilter,
      page: this.currentPage
    }).subscribe(res => {
      if (res.success) {
        this.shipments = res.data.data;
        this.currentPage = res.data.current_page;
        this.totalPages = res.data.last_page;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      }
    });
  }

  loadCustomers() {
    this.api.getCustomerDropdown().subscribe(res => {
      if (res.success) this.customers = res.data;
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadShipments();
  }

  createShipment() {
    this.saving = true;
    this.api.createShipment(this.newShipment).subscribe({
      next: res => {
        if (res.success) {
          this.showModal = false;
          this.newShipment = { priority: 'normal', goods_type: 'general', quantity: 1, pickup_date: new Date().toISOString().split('T')[0] };
          this.loadShipments();
        }
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  editShipment(s: Shipment) {
    // Navigate to detail page for editing
  }

  deleteShipment(id: number) {
    if (confirm('Delete this shipment?')) {
      this.api.deleteShipment(id).subscribe(() => this.loadShipments());
    }
  }
}
