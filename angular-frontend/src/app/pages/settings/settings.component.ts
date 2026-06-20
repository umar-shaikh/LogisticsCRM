import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
        <p class="page-sub">Manage your account and preferences</p>
      </div>

      <div class="settings-grid">
        <!-- Profile -->
        <div class="settings-card">
          <div class="card-header"><i class="fas fa-user-circle"></i><h3>Profile</h3></div>
          <div class="settings-body">
            <div class="profile-header">
              <div class="profile-avatar"><i class="fas fa-user"></i></div>
              <div class="profile-info">
                <h4>{{auth.user?.name || 'Admin User'}}</h4>
                <span>{{auth.user?.email || 'admin@logistics.com'}}</span>
                <span class="role-badge">{{auth.user?.role || 'Admin'}}</span>
              </div>
            </div>
            <div class="form-row"><div class="form-group"><label>Name</label><input type="text" [(ngModel)]="profile.name" /></div><div class="form-group"><label>Email</label><input type="email" [(ngModel)]="profile.email" disabled /></div></div>
            <div class="form-group"><label>Phone</label><input type="text" [(ngModel)]="profile.phone" /></div>
            <button class="btn-primary" (click)="saveProfile()">Save Changes</button>
          </div>
        </div>

        <!-- Security -->
        <div class="settings-card">
          <div class="card-header"><i class="fas fa-shield-alt"></i><h3>Security</h3></div>
          <div class="settings-body">
            <div class="form-group"><label>Current Password</label><input type="password" [(ngModel)]="password.current" placeholder="Enter current password" /></div>
            <div class="form-row"><div class="form-group"><label>New Password</label><input type="password" [(ngModel)]="password.new" placeholder="Enter new password" /></div><div class="form-group"><label>Confirm Password</label><input type="password" [(ngModel)]="password.confirm" placeholder="Confirm new password" /></div></div>
            <button class="btn-primary" (click)="changePassword()">Update Password</button>
          </div>
        </div>

        <!-- Company -->
        <div class="settings-card">
          <div class="card-header"><i class="fas fa-building"></i><h3>Company</h3></div>
          <div class="settings-body">
            <div class="form-row"><div class="form-group"><label>Company Name</label><input type="text" [(ngModel)]="company.name" /></div><div class="form-group"><label>GST Number</label><input type="text" [(ngModel)]="company.gst" /></div></div>
            <div class="form-group"><label>Address</label><textarea [(ngModel)]="company.address" rows="2"></textarea></div>
            <div class="form-row"><div class="form-group"><label>Default Tax Rate (%)</label><input type="number" [(ngModel)]="company.taxRate" /></div><div class="form-group"><label>Currency</label><select [(ngModel)]="company.currency"><option value="INR">INR (Indian Rupee)</option><option value="USD">USD (US Dollar)</option><option value="EUR">EUR (Euro)</option></select></div></div>
            <button class="btn-primary" (click)="saveCompany()">Save Settings</button>
          </div>
        </div>

        <!-- About -->
        <div class="settings-card">
          <div class="card-header"><i class="fas fa-info-circle"></i><h3>About</h3></div>
          <div class="settings-body">
            <div class="about-item"><label>Version</label><span class="font-mono">v1.0.0</span></div>
            <div class="about-item"><label>Stack</label><span>Laravel + Angular + MySQL</span></div>
            <div class="about-item"><label>License</label><span>MIT</span></div>
            <p class="about-desc">Logistics CRM - A comprehensive logistics management system built for modern supply chain operations.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .settings-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
    .card-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px; background: var(--bg-primary); border-bottom: 1px solid var(--border-color); }
    .card-header i { color: var(--accent); font-size: 16px; }
    .card-header h3 { font-size: 14px; font-weight: 600; }
    .settings-body { padding: 20px; }
    .profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
    .profile-avatar { width: 56px; height: 56px; background: linear-gradient(135deg, var(--accent), #8b5cf6); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; }
    .profile-info h4 { font-size: 15px; font-weight: 600; }
    .profile-info span { display: block; font-size: 12px; color: var(--text-muted); }
    .role-badge { display: inline-block !important; margin-top: 4px; background: var(--accent-light); color: var(--accent); padding: 2px 8px; border-radius: 5px; font-size: 10px; font-weight: 600; text-transform: capitalize; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 13px; font-family: var(--font-body); outline: none; transition: var(--transition); }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
    .form-group input:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg, var(--accent), #8b5cf6); border: none; border-radius: 10px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
    .about-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-light); font-size: 13px; }
    .about-item label { color: var(--text-muted); }
    .about-item span { color: var(--text-primary); font-weight: 500; }
    .about-desc { margin-top: 12px; font-size: 12px; color: var(--text-muted); line-height: 1.6; }
    @media (max-width: 768px) { .settings-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class SettingsComponent {
  profile = { name: '', email: '', phone: '' };
  password = { current: '', new: '', confirm: '' };
  company = { name: 'Logistics Pro', gst: '', address: '', taxRate: 18, currency: 'INR' };

  constructor(public auth: AuthService) {
    if (auth.user) {
      this.profile.name = auth.user.name;
      this.profile.email = auth.user.email;
      this.profile.phone = auth.user.phone || '';
    }
  }

  saveProfile() { alert('Profile saved!'); }
  changePassword() {
    if (this.password.new !== this.password.confirm) { alert('Passwords do not match'); return; }
    alert('Password updated!');
    this.password = { current: '', new: '', confirm: '' };
  }
  saveCompany() { alert('Company settings saved!'); }
}
