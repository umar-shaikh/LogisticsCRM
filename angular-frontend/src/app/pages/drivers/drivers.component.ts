import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Driver } from '../../models';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page animate-fade-in">
      <div class="page-header flex-between">
        <div><h1 class="page-title">Drivers</h1><p class="page-sub">Manage your fleet drivers</p></div>
        <button class="btn-primary" (click)="openModal()"><i class="fas fa-plus"></i> Add Driver</button>
      </div>
      <div class="filters-bar">
        <div class="search-box"><i class="fas fa-search"></i><input type="text" [(ngModel)]="search" (input)="load()" placeholder="Search drivers..." /></div>
        <select [(ngModel)]="statusFilter" (change)="load()">
          <option value="">All Status</option><option value="available">Available</option><option value="on_duty">On Duty</option><option value="on_leave">On Leave</option><option value="suspended">Suspended</option>
        </select>
      </div>
      <div class="grid-3">
        <div class="driver-card" *ngFor="let d of drivers">
          <div class="driver-header">
            <div class="driver-avatar"><i class="fas fa-user"></i></div>
            <div class="driver-info">
              <h4>{{d.full_name}}</h4>
              <span class="driver-license">{{d.license_number}}</span>
            </div>
            <span class="status" [class]="'status-' + d.status">{{d.status?.replace('_', ' ')}}</span>
          </div>
          <div class="driver-body">
            <div class="driver-detail"><i class="fas fa-envelope"></i> {{d.email}}</div>
            <div class="driver-detail"><i class="fas fa-phone"></i> {{d.phone}}</div>
            <div class="driver-detail"><i class="fas fa-map-marker-alt"></i> {{d.address | slice:0:40}}</div>
            <div class="driver-detail"><i class="fas fa-star"></i> {{d.experience_level | titlecase}}</div>
            <div class="driver-detail"><i class="fas fa-calendar"></i> License Exp: {{d.license_expiry | date}}</div>
          </div>
          <div class="driver-footer">
            <button class="icon-btn" (click)="edit(d)" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="icon-btn danger" (click)="del(d.id)" title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
      <div class="empty-state" *ngIf="drivers.length === 0"><i class="fas fa-id-card"></i><p>No drivers found</p></div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>{{editing ? 'Edit' : 'Add'}} Driver</h3><button class="close-btn" (click)="showModal = false"><i class="fas fa-times"></i></button></div>
        <form (ngSubmit)="save()" class="modal-body">
          <div class="form-row"><div class="form-group"><label>Full Name *</label><input type="text" [(ngModel)]="form.full_name" name="full_name" required /></div><div class="form-group"><label>Email *</label><input type="email" [(ngModel)]="form.email" name="email" required /></div></div>
          <div class="form-row"><div class="form-group"><label>Phone *</label><input type="text" [(ngModel)]="form.phone" name="phone" required /></div><div class="form-group"><label>License Number *</label><input type="text" [(ngModel)]="form.license_number" name="license_number" required /></div></div>
          <div class="form-row"><div class="form-group"><label>License Expiry *</label><input type="date" [(ngModel)]="form.license_expiry" name="license_expiry" required /></div><div class="form-group"><label>Date of Birth *</label><input type="date" [(ngModel)]="form.date_of_birth" name="date_of_birth" required /></div></div>
          <div class="form-group"><label>Address *</label><textarea [(ngModel)]="form.address" name="address" rows="2" required></textarea></div>
          <div class="form-row"><div class="form-group"><label>Experience</label><select [(ngModel)]="form.experience_level" name="experience_level"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="expert">Expert</option></select></div><div class="form-group"><label>Status</label><select [(ngModel)]="form.status" name="status"><option value="available">Available</option><option value="on_duty">On Duty</option><option value="on_leave">On Leave</option><option value="suspended">Suspended</option></select></div></div>
          <div class="modal-footer"><button type="button" class="btn-secondary" (click)="showModal = false">Cancel</button><button type="submit" class="btn-primary" [disabled]="saving"><i class="fas fa-spinner fa-spin" *ngIf="saving"></i> {{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}}</button></div>
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
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .driver-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; transition: var(--transition); }
    .driver-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .driver-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .driver-avatar { width: 48px; height: 48px; background: linear-gradient(135deg, var(--accent), #8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; }
    .driver-info { flex: 1; }
    .driver-info h4 { font-size: 15px; font-weight: 600; }
    .driver-license { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }
    .driver-body { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .driver-detail { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px; }
    .driver-detail i { width: 14px; color: var(--text-muted); font-size: 11px; }
    .driver-footer { display: flex; gap: 6px; padding-top: 12px; border-top: 1px solid var(--border-light); }
    .icon-btn { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; background: none; border: 1px solid var(--border-color); border-radius: 7px; color: var(--text-muted); cursor: pointer; font-size: 11px; }
    .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
    .icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); }
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
    @media (max-width: 1024px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .grid-3 { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class DriversComponent implements OnInit {
  drivers: Driver[] = []; search = ''; statusFilter = '';
  showModal = false; editing = false; saving = false;
  form: any = { experience_level: 'intermediate', status: 'available' };

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.getDrivers({ search: this.search, status: this.statusFilter }).subscribe(res => {
      if (res.success) this.drivers = res.data.data;
    });
  }
  openModal() { this.editing = false; this.form = { experience_level: 'intermediate', status: 'available' }; this.showModal = true; }
  edit(d: Driver) { this.editing = true; this.form = { ...d }; this.showModal = true; }
  save() {
    this.saving = true;
    const req = this.editing ? this.api.updateDriver(this.form.id, this.form) : this.api.createDriver(this.form);
    req.subscribe(() => { this.saving = false; this.showModal = false; this.load(); });
  }
  del(id: number) { if (confirm('Delete this driver?')) this.api.deleteDriver(id).subscribe(() => this.load()); }
}
