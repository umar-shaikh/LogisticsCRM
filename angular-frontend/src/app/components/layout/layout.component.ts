import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="app-layout">
      <app-sidebar />
      <div class="main-content">
        <app-topbar />
        <div class="content-area">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { display: flex; min-height: 100vh; background: var(--bg-primary); }
    .main-content { flex: 1; margin-left: var(--sidebar-width); transition: margin-left 0.3s ease; }
    .content-area { padding: 20px 24px; min-height: calc(100vh - var(--topbar-height)); }
    @media (max-width: 768px) {
      .main-content { margin-left: 0; }
      .content-area { padding: 16px; }
    }
  `]
})
export class LayoutComponent {}
