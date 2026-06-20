import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Shipment } from '../../models';

@Component({
  selector: 'app-shipment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page animate-fade-in" *ngIf="shipment">
      <div class="page-header">
        <div class="flex-between">
          <div>
            <a routerLink="/shipments" class="back-link"><i class="fas fa-arrow-left"></i> Back to Shipments</a>
            <h1 class="page-title mt-2">Shipment {{shipment.tracking_number}}</h1>
            <p class="page-sub">Created on {{shipment.created_at | date:'medium'}}</p>
          </div>
          <div class="header-actions">
            <select [(ngModel)]="shipment.status" (change)="updateStatus()" class="status-select">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button class="btn-primary" (click)="generateInvoice()">
              <i class="fas fa-file-invoice"></i> Generate Invoice
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-track">
        <div class="progress-line">
          <div class="progress-fill" [style.width.%]="getProgress()"></div>
        </div>
        <div class="progress-steps">
          <div class="step" *ngFor="let step of steps; let i = index" [class.completed]="isStepComplete(step.value)" [class.current]="shipment.status === step.value">
            <div class="step-dot"><i [class]="step.icon"></i></div>
            <span class="step-label">{{step.label}}</span>
          </div>
        </div>
      </div>

      <!-- Detail Grid -->
      <div class="detail-grid">
        <div class="detail-card">
          <h4><i class="fas fa-user-tie"></i> Sender Information</h4>
          <div class="detail-row"><label>Name</label><span>{{shipment.sender_name}}</span></div>
          <div class="detail-row"><label>Phone</label><span>{{shipment.sender_phone}}</span></div>
          <div class="detail-row"><label>Address</label><span>{{shipment.sender_address}}</span></div>
        </div>
        <div class="detail-card">
          <h4><i class="fas fa-user"></i> Receiver Information</h4>
          <div class="detail-row"><label>Name</label><span>{{shipment.receiver_name}}</span></div>
          <div class="detail-row"><label>Phone</label><span>{{shipment.receiver_phone}}</span></div>
          <div class="detail-row"><label>Address</label><span>{{shipment.receiver_address}}</span></div>
        </div>
        <div class="detail-card">
          <h4><i class="fas fa-box"></i> Goods Details</h4>
          <div class="detail-row"><label>Description</label><span>{{shipment.goods_description}}</span></div>
          <div class="detail-row"><label>Type</label><span class="type-badge">{{shipment.goods_type}}</span></div>
          <div class="detail-row"><label>Weight</label><span class="font-mono">{{shipment.weight_kg}} kg</span></div>
          <div class="detail-row"><label>Quantity</label><span class="font-mono">{{shipment.quantity}}</span></div>
        </div>
        <div class="detail-card">
          <h4><i class="fas fa-rupee-sign"></i> Financial Details</h4>
          <div class="detail-row"><label>Shipping Cost</label><span class="font-mono">{{shipment.shipping_cost | currency:'INR'}}</span></div>
          <div class="detail-row"><label>Tax</label><span class="font-mono">{{shipment.tax_amount | currency:'INR'}}</span></div>
          <div class="detail-row"><label>Total</label><span class="font-mono text-success" style="font-size:16px;font-weight:700;">{{shipment.total_amount | currency:'INR'}}</span></div>
        </div>
      </div>

      <!-- Assignment -->
      <div class="detail-card wide mt-3">
        <h4><i class="fas fa-truck"></i> Assignment</h4>
        <div class="assignment-row">
          <div class="form-group">
            <label>Driver</label>
            <select [(ngModel)]="shipment.driver_id" (change)="updateAssignment()">
              <option [value]="null">Unassigned</option>
              <option *ngFor="let d of drivers" [value]="d.id">{{d.full_name}}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Vehicle</label>
            <select [(ngModel)]="shipment.vehicle_id" (change)="updateAssignment()">
              <option [value]="null">Unassigned</option>
              <option *ngFor="let v of vehicles" [value]="v.id">{{v.registration_number}} - {{v.model}}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Route</label>
            <select [(ngModel)]="shipment.route_id" (change)="updateAssignment()">
              <option [value]="null">No Route</option>
              <option *ngFor="let r of routesList" [value]="r.id">{{r.route_name}}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tracking Events -->
      <div class="detail-card wide mt-3">
        <div class="flex-between">
          <h4><i class="fas fa-map-marker-alt"></i> Tracking History</h4>
          <button class="btn-sm" (click)="showEventForm = !showEventForm"><i class="fas fa-plus"></i> Add Event</button>
        </div>
        <div class="event-form" *ngIf="showEventForm">
          <div class="form-row">
            <div class="form-group">
              <label>Location</label>
              <input type="text" [(ngModel)]="newEvent.location" placeholder="City, State" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <input type="text" [(ngModel)]="newEvent.description" placeholder="Event description" />
            </div>
          </div>
          <button class="btn-primary btn-sm" (click)="addEvent()">Add Checkpoint</button>
        </div>
        <div class="timeline">
          <div class="timeline-item" *ngFor="let event of shipment.events; let last = last">
            <div class="timeline-dot" [class.last]="last"></div>
            <div class="timeline-content">
              <span class="timeline-type">{{event.event_type | titlecase}}</span>
              <span class="timeline-location"><i class="fas fa-map-marker-alt"></i> {{event.location}}</span>
              <p class="timeline-desc">{{event.description}}</p>
              <span class="timeline-time">{{event.event_time | date:'medium'}}</span>
            </div>
          </div>
          <div class="empty-state" *ngIf="!shipment.events?.length">
            <i class="fas fa-route"></i><p>No tracking events yet</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .back-link { font-size: 12px; color: var(--accent); display: inline-flex; align-items: center; gap: 6px; }
    .header-actions { display: flex; gap: 10px; align-items: center; }
    .status-select { padding: 8px 12px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 13px; outline: none; }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg, var(--accent), #8b5cf6); border: none; border-radius: 10px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
    .btn-sm { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: var(--transition); }
    .btn-sm:hover { border-color: var(--accent); color: var(--accent); }

    .progress-track { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px 32px; margin-bottom: 20px; }
    .progress-line { height: 4px; background: var(--bg-primary); border-radius: 2px; margin-bottom: 16px; position: relative; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #8b5cf6); border-radius: 2px; transition: width 0.5s ease; }
    .progress-steps { display: flex; justify-content: space-between; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .step-dot { width: 36px; height: 36px; border-radius: 50%; background: var(--bg-primary); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--text-muted); transition: var(--transition); }
    .step.completed .step-dot { background: var(--accent); border-color: var(--accent); color: white; }
    .step.current .step-dot { background: var(--accent-light); border-color: var(--accent); color: var(--accent); box-shadow: 0 0 0 4px rgba(99,102,241,0.2); }
    .step-label { font-size: 10px; color: var(--text-muted); font-weight: 500; }
    .step.completed .step-label { color: var(--accent); }
    .step.current .step-label { color: var(--text-primary); font-weight: 600; }

    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .detail-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; }
    .detail-card.wide { grid-column: 1 / -1; }
    .detail-card h4 { font-size: 13px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
    .detail-card h4 i { color: var(--accent); font-size: 12px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-light); }
    .detail-row:last-child { border-bottom: none; }
    .detail-row label { font-size: 12px; color: var(--text-muted); }
    .detail-row span { font-size: 13px; color: var(--text-primary); font-weight: 500; }
    .type-badge { background: var(--accent-light); color: var(--accent); padding: 2px 8px; border-radius: 5px; font-size: 11px; }

    .assignment-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
    .form-group select, .form-group input { width: 100%; padding: 10px 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 13px; outline: none; font-family: var(--font-body); }
    .form-group select:focus, .form-group input:focus { border-color: var(--accent); }

    .event-form { background: var(--bg-primary); border-radius: 10px; padding: 16px; margin-bottom: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .timeline { position: relative; padding-left: 28px; }
    .timeline::before { content: ''; position: absolute; left: 11px; top: 0; bottom: 0; width: 2px; background: var(--border-color); }
    .timeline-item { position: relative; padding-bottom: 20px; }
    .timeline-dot { position: absolute; left: -28px; top: 2px; width: 24px; height: 24px; background: var(--bg-card); border: 2px solid var(--border-color); border-radius: 50%; z-index: 1; }
    .timeline-dot.last { border-color: var(--accent); background: var(--accent-light); }
    .timeline-content { display: flex; flex-wrap: wrap; gap: 4px 16px; align-items: center; }
    .timeline-type { font-size: 12px; font-weight: 600; color: var(--accent); background: var(--accent-light); padding: 2px 8px; border-radius: 5px; text-transform: capitalize; }
    .timeline-location { font-size: 12px; color: var(--text-muted); }
    .timeline-location i { font-size: 10px; margin-right: 4px; }
    .timeline-desc { width: 100%; font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
    .timeline-time { font-size: 11px; color: var(--text-faint); font-family: var(--font-mono); }

    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
      .assignment-row { grid-template-columns: 1fr; }
      .progress-steps { display: none; }
    }
  `]
})
export class ShipmentDetailComponent implements OnInit {
  shipment: Shipment | null = null;
  drivers: any[] = [];
  vehicles: any[] = [];
  routesList: any[] = [];
  showEventForm = false;
  newEvent = { location: '', description: '' };

  steps = [
    { label: 'Pending', value: 'pending', icon: 'fas fa-clock' },
    { label: 'Confirmed', value: 'confirmed', icon: 'fas fa-check' },
    { label: 'Picked Up', value: 'picked_up', icon: 'fas fa-box' },
    { label: 'In Transit', value: 'in_transit', icon: 'fas fa-truck' },
    { label: 'Out for Delivery', value: 'out_for_delivery', icon: 'fas fa-shipping-fast' },
    { label: 'Delivered', value: 'delivered', icon: 'fas fa-check-double' },
  ];

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadShipment(id);
    this.loadDropdowns();
  }

  loadShipment(id: number) {
    this.api.getShipment(id).subscribe(res => {
      if (res.success) this.shipment = res.data;
    });
  }

  loadDropdowns() {
    this.api.getDriverDropdown().subscribe(res => { if (res.success) this.drivers = res.data; });
    this.api.getVehicleDropdown().subscribe(res => { if (res.success) this.vehicles = res.data; });
    this.api.getRouteDropdown().subscribe(res => { if (res.success) this.routesList = res.data; });
  }

  getProgress(): number {
    if (!this.shipment) return 0;
    const idx = this.steps.findIndex(s => s.value === this.shipment!.status);
    if (idx < 0) return 0;
    return ((idx) / (this.steps.length - 1)) * 100;
  }

  isStepComplete(stepValue: string): boolean {
    if (!this.shipment) return false;
    const currentIdx = this.steps.findIndex(s => s.value === this.shipment!.status);
    const stepIdx = this.steps.findIndex(s => s.value === stepValue);
    return stepIdx < currentIdx;
  }

  updateStatus() {
    if (!this.shipment) return;
    this.api.updateShipment(this.shipment.id, { status: this.shipment.status }).subscribe(() => {
      this.loadShipment(this.shipment!.id);
    });
  }

  updateAssignment() {
    if (!this.shipment) return;
    this.api.updateShipment(this.shipment.id, {
      driver_id: this.shipment.driver_id,
      vehicle_id: this.shipment.vehicle_id,
      route_id: this.shipment.route_id
    }).subscribe();
  }

  addEvent() {
    if (!this.shipment || !this.newEvent.location) return;
    this.api.addShipmentEvent(this.shipment.id, {
      event_type: 'checkpoint',
      ...this.newEvent
    }).subscribe(() => {
      this.newEvent = { location: '', description: '' };
      this.showEventForm = false;
      this.loadShipment(this.shipment!.id);
    });
  }

  generateInvoice() {
    if (!this.shipment) return;
    this.api.generateInvoice(this.shipment.id).subscribe({
      next: () => alert('Invoice generated successfully!'),
      error: () => alert('Invoice already exists or failed to generate.')
    });
  }
}
