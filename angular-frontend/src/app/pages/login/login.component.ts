import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-left">
        <div class="login-brand">
          <i class="fas fa-truck-fast"></i>
          <span>Logistics CRM</span>
        </div>
        <h1>Manage Your<br/>Logistics <span>Smarter</span></h1>
        <p>Streamline shipments, track deliveries, manage your fleet, and handle invoicing all in one powerful platform.</p>
        <div class="login-features">
          <div class="feature"><i class="fas fa-check-circle"></i> Real-time shipment tracking</div>
          <div class="feature"><i class="fas fa-check-circle"></i> Fleet & driver management</div>
          <div class="feature"><i class="fas fa-check-circle"></i> Automated invoicing</div>
          <div class="feature"><i class="fas fa-check-circle"></i> Route optimization</div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-card">
          <h2>Welcome Back</h2>
          <p class="login-sub">Sign in to your account to continue</p>

          <div class="alert alert-error" *ngIf="error">{{error}}</div>

          <form (ngSubmit)="login()">
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-wrap">
                <i class="fas fa-envelope"></i>
                <input type="email" [(ngModel)]="email" name="email" placeholder="admin@logistics.com" required />
              </div>
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="input-wrap">
                <i class="fas fa-lock"></i>
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="Enter your password" required />
                <button type="button" class="toggle-pw" (click)="showPassword = !showPassword">
                  <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>
            <div class="form-options">
              <label class="checkbox">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit" class="btn-login" [disabled]="loading">
              <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
              {{loading ? 'Signing in...' : 'Sign In'}}
            </button>
          </form>

          <div class="login-footer">
            <p>Don't have an account? <a href="#">Contact admin</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { display: flex; min-height: 100vh; }
    .login-left {
      flex: 1;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 80px;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .login-left::before {
      content: '';
      position: absolute;
      top: -50%; right: -30%;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%);
      border-radius: 50%;
    }
    .login-left::after {
      content: '';
      position: absolute;
      bottom: -30%; left: -20%;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%);
      border-radius: 50%;
    }
    .login-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 48px;
      position: relative;
      z-index: 1;
    }
    .login-brand i {
      width: 44px; height: 44px;
      background: rgba(255,255,255,0.15);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .login-left h1 {
      font-size: 42px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }
    .login-left h1 span {
      background: linear-gradient(135deg, #818cf8, #c4b5fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .login-left > p {
      font-size: 15px;
      opacity: 0.7;
      line-height: 1.7;
      max-width: 440px;
      margin-bottom: 40px;
      position: relative;
      z-index: 1;
    }
    .login-features {
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: relative;
      z-index: 1;
    }
    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      opacity: 0.85;
    }
    .feature i { color: #34d399; font-size: 16px; }

    .login-right {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      padding: 40px;
    }
    .login-card { width: 100%; max-width: 380px; }
    .login-card h2 { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
    .login-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 28px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    .input-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 0 14px;
      transition: var(--transition);
    }
    .input-wrap:focus-within {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-light);
    }
    .input-wrap i { color: var(--text-muted); font-size: 13px; width: 14px; }
    .input-wrap input {
      flex: 1;
      background: none; border: none; outline: none;
      color: var(--text-primary);
      font-size: 14px;
      padding: 12px 0;
      font-family: var(--font-body);
    }
    .input-wrap input::placeholder { color: var(--text-faint); }
    .toggle-pw {
      background: none; border: none; outline: none;
      color: var(--text-muted); cursor: pointer;
      padding: 0; font-size: 13px;
    }
    .form-options {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px; font-size: 13px;
    }
    .checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--text-secondary); }
    .checkbox input { accent-color: var(--accent); }
    .form-options a { color: var(--accent); font-size: 13px; }
    .btn-login {
      width: 100%;
      padding: 13px;
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      border: none; border-radius: 10px;
      color: white; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: var(--transition);
      font-family: var(--font-body);
    }
    .btn-login:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.3); }
    .btn-login:disabled { opacity: 0.7; cursor: not-allowed; }
    .login-footer { margin-top: 24px; text-align: center; font-size: 13px; color: var(--text-muted); }
    .login-footer a { color: var(--accent); font-weight: 500; }

    @media (max-width: 900px) {
      .login-left { display: none; }
      .login-right { width: 100%; }
    }
  `]
})
export class LoginComponent {
  email = 'admin@logistics.com';
  password = 'password';
  showPassword = false;
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe(success => {
      this.loading = false;
      if (success) this.router.navigate(['/dashboard']);
      else this.error = 'Invalid email or password';
    });
  }
}
