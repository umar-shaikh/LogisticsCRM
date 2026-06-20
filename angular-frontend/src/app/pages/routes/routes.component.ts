import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Route as RouteModel } from '../../models';

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page animate-fade-in">
      <div class="page-header flex-between">
        <div><h1 class="page-title">Routes</h1><p class="page-sub">Define and manage delivery routes</p></div>
        <button class="btn-primary" (click)="openModal()"><i class="fas fa-plus"></i> Add Route</button>
      </div>
      <div class="filters-bar">
        <div class="search-box"><i class="fas fa-search"></i><input type="text" [(ngModel)]="search" (input)="load()" placeholder="Search routes..." /></div>
        <select [(ngModel)]="typeFilter" (change)="load()">
          <option value="">All Types</option><option value="local">Local</option><option value="interstate">Interstate</option><option value="international">International</option>
        </select>
      </div>
      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead><tr><th>Route Name</th><th>Origin</th><th>Destination</th><th>Distance</th><th>Duration</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              <tr *ngFor="let r of routes">
                <td><strong>{{r.route_name}}</strong></td>
                <td><i class="fas fa-map-marker-alt text-success mr-1"></i>{{r.origin}}</td>
                <td><i class="fas fa-map-marker-alt text-danger mr-1"></i>{{r.destination}}</td>
                <td class="font-mono">{{r.distance_km}} km</td>
                <td class="font-mono">{{formatDuration(r.estimated_duration_min)}}</td>
                <td><span class="type-badge">{{r.type}}</span></td>
                <td><span class="status" [class]="'status-' + r.status">{{r.status}}</span></td>
                <td>
                  <button class="icon-btn" (click)="edit(r)" title="Edit"><i class="fas fa-edit"></i></button>
                  <button class="icon-btn danger" (click)="del(r.id)" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
              </tr>
              <tr *ngIf="routes.length === 0"><td colspan="8"><div class="empty-state"><i class="fas fa-route"></i><p>No routes found</p></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header"><h3>{{editing ? 'Edit' : 'Add'}} Route</h3><button class="close-btn" (click)="showModal = false"><i class="fas fa-times"></i></button></div>
        <form (ngSubmit)="save()" class="modal-body">
          <div class="form-group"><label>Route Name *</label><input type="text" [(ngModel)]="form.route_name" name="route_name" required /></div>
          <div class="form-row"><div class="form-group"><label>Origin *</label><input type="text" [(ngModel)]="form.origin" name="origin" required /></div><div class="form-group"><label>Destination *</label><input type="text" [(ngModel)]="form.destination" name="destination" required /></div></div>
          <div class="form-row"><div class="form-group"><label>Distance (km) *</label><input type="number" [(ngModel)]="form.distance_km" name="distance_km" step="0.1" required /></div><div class="form-group"><label>Duration (min) *</label><input type="number" [(ngModel)]="form.estimated_duration_min" name="estimated_duration_min" required /></div></div>
          <div class="form-row"><div class="form-group"><label>Type</label><select [(ngModel)]="form.type" name="type"><option value="local">Local</option><option value="interstate">Interstate</option><option value="international">International</option></select></div><div class="form-group"><label>Status</label><select [(ngModel)]="form.status" name="status"><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>
          <div class="form-group"><label>Waypoints</label><textarea [(ngModel)]="form.waypoints" name="waypoints" rows="2" placeholder="Comma-separated waypoints"></textarea></div>
          <div class="modal-footer"><button type="button" class="btn-secondary" (click)="showModal = false">Cancel</button><button type="submit" class="btn-primary" [disabled]="saving"><i class="fas fa-spinner fa-spin" *ngIf="saving"></i> {{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}}</button></div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg, var(--accent), #8b5cf6); border: none; border-radius: 10px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-secondary { padding: 10px 18px; background: var(--bg-hover); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); font-size: 13px; cursor: pointer; }
    .mr-1 { margin-right: 4px; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; }
    .search-box { flex: 1; display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; padding: 0 14px; }
    .search-box input { flex: 1; background: none; border: none; outline: none; color: var(--text-primary); font-size: 13px; padding: 10px 0; font-family: var(--font-body); }
    .filters-bar select { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; color: var(--text-secondary); font-size: 13px; padding: 10px 14px; outline: none; }
    .card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); border-bottom: 1px solid var(--border-color); background: var(--bg-primary); }
    .data-table td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid var(--border-light); }
    .type-badge { background: var(--accent-light); color: var(--accent); padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: capitalize; }
    .icon-btn { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; background: none; border: 1px solid var(--border-color); border-radius: 7px; color: var(--text-muted); cursor: pointer; font-size: 11px; margin: 0 2px; }
    .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
    .icon-btn.danger:hover { border-color: var(--danger); color: var(--danger); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
    .close-btn { width: 32px; height: 32px; background: none; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-muted); cursor: pointer; }
    .modal-body { padding: 24px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 16px; border-top: 1px solid var(--border-color); margin-top: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 13px; font-family: var(--font-body); outline: none; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); }
    @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class RoutesComponent implements OnInit {
  routes: RouteModel[] = []; search = ''; typeFilter = '';
  showModal = false; editing = false; saving = false;
  form: any = { type: 'interstate', status: 'active' };

  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }

  load() {
    this.api.getRoutes({ search: this.search, type: this.typeFilter }).subscribe(res => {
      if (res.success) this.routes = res.data.data;
    });
  }
  openModal() { this.editing = false; this.form = { type: 'interstate', status: 'active' }; this.showModal = true; }
  edit(r: RouteModel) { this.editing = true; this.form = { ...r }; this.showModal = true; }
  save() {
    this.saving = true;
    const req = this.editing ? this.api.updateRoute(this.form.id, this.form) : this.api.createRoute(this.form);
    req.subscribe(() => { this.saving = false; this.showModal = false; this.load(); });
  }
  del(id: number) { if (confirm('Delete this route?')) this.api.deleteRoute(id).subscribe(() => this.load()); }
  formatDuration(mins: number): string { const h = Math.floor(mins / 60); const m = mins % 60; return h > 0 ? `${h}h ${m}m` : `${m}m`; }
}
