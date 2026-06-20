import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="topbar">
      <div class="topbar-search">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Search shipments, customers, drivers..." />
      </div>
      <div class="topbar-actions">
        <button class="topbar-btn">
          <i class="fas fa-bell"></i>
          <span class="notification-dot"></span>
        </button>
        <div class="topbar-user">
          <div class="user-info">
            <span class="user-name">{{auth.user?.name || 'Admin'}}</span>
            <span class="user-role">{{auth.user?.role || 'Manager'}}</span>
          </div>
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height);
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .topbar-search {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 8px 14px;
      width: 360px;
      transition: var(--transition);
    }
    .topbar-search:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-light);
    }
    .topbar-search i { color: var(--text-muted); font-size: 13px; }
    .topbar-search input {
      background: none;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 13px;
      width: 100%;
      font-family: var(--font-body);
    }
    .topbar-search input::placeholder { color: var(--text-muted); }
    .topbar-actions { display: flex; align-items: center; gap: 12px; }
    .topbar-btn {
      width: 38px; height: 38px;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition);
      position: relative;
    }
    .topbar-btn:hover { border-color: var(--accent); color: var(--accent); }
    .notification-dot {
      position: absolute;
      top: 8px; right: 8px;
      width: 7px; height: 7px;
      background: var(--danger);
      border-radius: 50%;
      border: 2px solid var(--bg-primary);
    }
    .topbar-user {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 10px;
      transition: var(--transition);
    }
    .topbar-user:hover { background: var(--bg-hover); }
    .user-info { text-align: right; }
    .user-name { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .user-role { display: block; font-size: 11px; color: var(--text-muted); text-transform: capitalize; }
    .user-avatar {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 14px;
    }
    @media (max-width: 768px) {
      .topbar { padding: 0 16px; }
      .topbar-search { display: none; }
      .user-info { display: none; }
    }
  `]
})
export class TopbarComponent {
  constructor(public auth: AuthService) {}
}
