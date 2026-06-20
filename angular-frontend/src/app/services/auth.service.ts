import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.currentUser$.pipe(map(u => !!u));

  constructor(private api: ApiService, private router: Router) {
    const token = localStorage.getItem('token');
    if (token) this.loadUser();
  }

  login(email: string, password: string): Observable<boolean> {
    return this.api.login({ email, password }).pipe(
      map(res => {
        if (res.success && res.data) {
          localStorage.setItem('token', res.data.token);
          this.currentUserSubject.next(res.data.user);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  loadUser() {
    this.api.me().subscribe({
      next: res => { if (res.success) this.currentUserSubject.next(res.data); },
      error: () => this.logout()
    });
  }

  logout() {
    this.api.logout().subscribe();
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  get user(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
}
