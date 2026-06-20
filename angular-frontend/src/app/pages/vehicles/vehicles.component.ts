import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Vehicle } from '../../models';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page animate-fade-in">
      <div class="page-header flex-between">
        <div><h1 class="page-title">Fleet</h1><p class="page-sub">Manage your vehicles</p></div>
        <button class="btn-primary" (click)="openModal()"><i class="fas fa-plus"></i> Add Vehicle</button>
      </div>
      <div class="filters-bar">
        <div class="search-box"><i class="fas fa-search"></i><input type="text" [(ngModel)]="search" (input)="load()" placeholder="Search vehicles..." /></div>
        <select [(ngModel)]="statusFilter" (change)="load()">
          <option value="">All Status</option><option value="active">Active</option><option value="maintenance">Maintenance</option><option value="in_transit">In Transit</option><option value="retired">Retired</option>
        </select>
        <select [(ngModel)]="typeFilter" (change)="load()">
          <option value="">All Types</option><option value="truck">Truck</option><option value="van">Van</option><option value="bike">Bike</option><option value="container">Container</option><option value="refrigerated">Refrigerated</option><option value="tanker">Tanker</option>
        </select>
      </div>
      <div class="grid-3">
        <div class="vehicle-card" *ngFor="let v of vehicles">
          <div class="vehicle-header">
            <div class="vehicle-icon"><i class="fas fa-truck"></i></div>
            <div class="vehicle-info">
              <h4>{{v.model}} {{v.make}}</h4>
              <span class="vehicle-reg">{{v.registration_number}}</span>
            </div>
            <span class="status" [class]="'status-' + v.status">{{v.status?.replace('_', ' ')}}</span>
          </div>
          <div class="vehicle-body">
            <div class="vehicle-row"><span>Type</span><span class="type-badge">{{v.type}}</span></div>
            <div class="vehicle-row"><span>Capacity</span><span class="font-mono">{{v.capacity_kg}} kg</span></div>
            <div class="vehicle-row"><span>Fuel</span><span>{{v.fuel_type | titlecase}}</span></div>
            <div class="vehicle-row"><span>Year</span><span>{{v.year}}</span></div>
            <div class="vehicle-row"><span>Odometer</span><span class="font-mono">{{v.odometer | number}} km</span></div>
            <div class="vehicle-row"><span>Driver</span><span>{{v.driver?.full_name || 'Unassigned'}}</span></div>
          </div>
          <div class="vehicle-footer">
            <button class="icon-btn" (click)="edit(v)" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="icon-btn danger" (click)="del(v.id)" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
      <div class="empty-state" *ngIf="vehicles.length === 0"><i class="fas fa-truck"></i><p>No vehicles found</p></div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>{{editing ? 'Edit' : 'Add'}} Vehicle</h3><button class="close-btn" (click)="showModal = false"><i class="fas fa-times"></i></button></div>
        <form (ngSubmit)="save()" class="modal-body">
          <div class="form-row"><div class="form-group"><label>Registration # *</label><input type="text" [(ngModel)]="form.registration_number" name="registration_number" required /></div><div class="form-group"><label>Make *</label><input type="text" [(ngModel)]="form.make" name="make" required /></div></div>
          <div class="form-row"><div class="form-group"><label>Model *</label><input type="text" [(ngModel)]="form.model" name="model" required /></div><div class="form-group"><label>Year *</label><input type="number" [(ngModel)]="form.year" name="year" required /></div></div>
          <div class="form-row"><div class="form-group"><label>Type</label><select [(ngModel)]="form.type" name="type"><option value="truck">Truck</option><option value="van">Van</option><option value="bike">Bike</option><option value="container">Container</option><option value="refrigerated">Refrigerated</option><option value="tanker">Tanker</option></select></div><div class="form-group"><label>Capacity (kg) *</label><input type="number" [(ngModel)]="form.capacity_kg" name="capacity_kg" required /></div></div>
          <div class="form-row"><div class="form-group"><label>Fuel Type</label><select [(ngModel)]="form.fuel_type" name="fuel_type"><option value="diesel">Diesel</option><option value="petrol">Petrol</option><option value="electric">Electric</option><option value="cng">CNG</option></select></div><div class="form-group"><label>Fuel Efficiency</label><input type="number" [(ngModel)]="form.fuel_efficiency" name="fuel_efficiency" step="0.1" /></div></div>
          <div class="form-row"><div class="form-group"><label>Chassis # *</label><input type="text" [(ngModel)]="form.chassis_number" name="chassis_number" required /></div><div class="form-group"><label>Engine # *</label><input type="text" [(ngModel)]="form.engine_number" name="engine_number" required /></div></div>
          <div class="form-row"><div class="form-group"><label>Insurance Expiry *</label><input type="date" [(ngModel)]="form.insurance_expiry" name="insurance_expiry" required /></div><div class="form-group"><label>Fitness Expiry *</label><input type="date" [(ngModel)]="form.fitness_expiry" name="fitness_expiry" required /></div></div>
          <div class="form-group"><label>Assign Driver</label><select [(ngModel)]="form.assigned_driver_id" name="assigned_driver_id"><option [ngValue]="null">None</option><option *ngFor="let d of drivers" [ngValue]="d.id">{{d.full_name}}</option></select></div>
          <div class="modal-footer"><button type="button" class="btn-secondary" (click)="showModal = false">Cancel</button><button type="submit" class="btn-primary" [disabled]="saving"><i class="fas fa-spinner fa-spin" *ngIf="saving"></i> {{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}}</button></div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg, var(--accent), #8b5cf6); border: none; border-radius: 10px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-secondary { padding: 10px 18px; background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); font-size: 13px; cursor: pointer; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 200px; display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; padding: 0 14px; }
    .search-box input { flex: 1; background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; padding: 10px 0; font-family: var(--font-body); }
    .filters-bar select { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); font-size: 13px; padding: 10px 14px; outline: none; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .vehicle-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; transition: var(--transition); }
    .vehicle-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .vehicle-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .vehicle-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b, #ef4444); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; }
    .vehicle-info { flex: 1; }
    .vehicle-info h4 { font-size: 15px; font-weight: 600; }
    .vehicle-reg { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }
    .vehicle-body { display: flex; flex-direction: column; gap: 0; margin-bottom: 16px; }
    .vehicle-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-light); font-size: 12px; }
    .vehicle-row span:first-child { color: var(--text-muted); }
    .vehicle-row span:last-child { color: var(--text-primary); font-weight: 500; }
    .type-badge { background: var(--accent-light); color: var(--accent); padding: 2px 8px; border-radius: 5px; font-size: 10px; font-weight: 600; text-transform: capitalize; }
    .vehicle-footer { display: flex; gap: 6px; padding-top: 12px; border-top: 1px solid var(--border-light); }
    .icon-btn { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; background: none; border: 1px solid var(--border-color); border-radius: 7px; color: var(--text-muted); cursor: pointer; font-size: 11px; }
    .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
    .icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
    .close-btn { width: 32px; height: 32px; background: none; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-muted); cursor: pointer; }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid var(--border-color); margin-top: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .form-group input, .form-group select { width: 100%; padding: 10px 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 13px; font-family: var(--font-body); outline: none; }
    .form-group input:focus, .form-group select:focus { border-color: var(--accent); }
    @media (max-width: 1024px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .grid-3 { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class VehiclesComponent implements OnInit {
  vehicles: Vehicle[] = []; drivers: any[] = []; search = ''; statusFilter = ''; typeFilter = '';
  showModal = false; editing = false; saving = false;
  form: any = { type: 'truck', fuel_type: 'diesel', status: 'active' };

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); this.api.getDriverDropdown().subscribe(r => { if (r.success) this.drivers = r.data; }); }

  load() {
    this.api.getVehicles({ search: this.search, status: this.statusFilter, type: this.typeFilter }).subscribe(res => {
      if (res.success) this.vehicles = res.data.data;
    });
  }
  openModal() { this.editing = false; this.form = { type: 'truck', fuel_type: 'diesel', status: 'active' }; this.showModal = true; }
  edit(v: Vehicle) { this.editing = true; this.form = { ...v }; this.showModal = true; }
  save() {
    this.saving = true;
    const req = this.editing ? this.api.updateVehicle(this.form.id, this.form) : this.api.createVehicle(this.form);
    req.subscribe(() => { this.saving = false; this.showModal = false; this.load(); });
  }
  del(id: number) { if (confirm('Delete this vehicle?')) this.api.deleteVehicle(id).subscribe(() => this.load()); }
}
