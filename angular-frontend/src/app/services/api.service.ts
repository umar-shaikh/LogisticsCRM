import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse, PaginatedResponse, DashboardStats, Shipment, Customer,
  Driver, Vehicle, Route, Invoice, Expense, ShipmentEvent
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  // Auth
  login(credentials: { email: string; password: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/login`, credentials);
  }
  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/auth/logout`, {}, { headers: this.getHeaders() });
  }
  me(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/auth/me`, { headers: this.getHeaders() });
  }

  // Dashboard
  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/dashboard/stats`, { headers: this.getHeaders() });
  }
  getRecentShipments(): Observable<ApiResponse<Shipment[]>> {
    return this.http.get<ApiResponse<Shipment[]>>(`${this.baseUrl}/dashboard/recent-shipments`, { headers: this.getHeaders() });
  }
  getShipmentStatusChart(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/dashboard/shipment-status-chart`, { headers: this.getHeaders() });
  }
  getMonthlyRevenueChart(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/dashboard/monthly-revenue-chart`, { headers: this.getHeaders() });
  }
  getTopCustomers(): Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(`${this.baseUrl}/dashboard/top-customers`, { headers: this.getHeaders() });
  }

  // Shipments
  getShipments(params?: any): Observable<ApiResponse<PaginatedResponse<Shipment>>> {
    return this.http.get<ApiResponse<PaginatedResponse<Shipment>>>(`${this.baseUrl}/shipments`, {
      headers: this.getHeaders(), params: this.buildParams(params)
    });
  }
  getShipment(id: number): Observable<ApiResponse<Shipment>> {
    return this.http.get<ApiResponse<Shipment>>(`${this.baseUrl}/shipments/${id}`, { headers: this.getHeaders() });
  }
  createShipment(data: Partial<Shipment>): Observable<ApiResponse<Shipment>> {
    return this.http.post<ApiResponse<Shipment>>(`${this.baseUrl}/shipments`, data, { headers: this.getHeaders() });
  }
  updateShipment(id: number, data: Partial<Shipment>): Observable<ApiResponse<Shipment>> {
    return this.http.put<ApiResponse<Shipment>>(`${this.baseUrl}/shipments/${id}`, data, { headers: this.getHeaders() });
  }
  deleteShipment(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/shipments/${id}`, { headers: this.getHeaders() });
  }
  addShipmentEvent(id: number, event: Partial<ShipmentEvent>): Observable<ApiResponse<ShipmentEvent>> {
    return this.http.post<ApiResponse<ShipmentEvent>>(`${this.baseUrl}/shipments/${id}/events`, event, { headers: this.getHeaders() });
  }

  // Customers
  getCustomers(params?: any): Observable<ApiResponse<PaginatedResponse<Customer>>> {
    return this.http.get<ApiResponse<PaginatedResponse<Customer>>>(`${this.baseUrl}/customers`, {
      headers: this.getHeaders(), params: this.buildParams(params)
    });
  }
  getCustomer(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${this.baseUrl}/customers/${id}`, { headers: this.getHeaders() });
  }
  createCustomer(data: Partial<Customer>): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(`${this.baseUrl}/customers`, data, { headers: this.getHeaders() });
  }
  updateCustomer(id: number, data: Partial<Customer>): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.baseUrl}/customers/${id}`, data, { headers: this.getHeaders() });
  }
  deleteCustomer(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/customers/${id}`, { headers: this.getHeaders() });
  }
  getCustomerDropdown(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/customers-dropdown`, { headers: this.getHeaders() });
  }

  // Drivers
  getDrivers(params?: any): Observable<ApiResponse<PaginatedResponse<Driver>>> {
    return this.http.get<ApiResponse<PaginatedResponse<Driver>>>(`${this.baseUrl}/drivers`, {
      headers: this.getHeaders(), params: this.buildParams(params)
    });
  }
  createDriver(data: Partial<Driver>): Observable<ApiResponse<Driver>> {
    return this.http.post<ApiResponse<Driver>>(`${this.baseUrl}/drivers`, data, { headers: this.getHeaders() });
  }
  updateDriver(id: number, data: Partial<Driver>): Observable<ApiResponse<Driver>> {
    return this.http.put<ApiResponse<Driver>>(`${this.baseUrl}/drivers/${id}`, data, { headers: this.getHeaders() });
  }
  deleteDriver(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/drivers/${id}`, { headers: this.getHeaders() });
  }
  getDriverDropdown(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/drivers-dropdown`, { headers: this.getHeaders() });
  }

  // Vehicles
  getVehicles(params?: any): Observable<ApiResponse<PaginatedResponse<Vehicle>>> {
    return this.http.get<ApiResponse<PaginatedResponse<Vehicle>>>(`${this.baseUrl}/vehicles`, {
      headers: this.getHeaders(), params: this.buildParams(params)
    });
  }
  createVehicle(data: Partial<Vehicle>): Observable<ApiResponse<Vehicle>> {
    return this.http.post<ApiResponse<Vehicle>>(`${this.baseUrl}/vehicles`, data, { headers: this.getHeaders() });
  }
  updateVehicle(id: number, data: Partial<Vehicle>): Observable<ApiResponse<Vehicle>> {
    return this.http.put<ApiResponse<Vehicle>>(`${this.baseUrl}/vehicles/${id}`, data, { headers: this.getHeaders() });
  }
  deleteVehicle(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/vehicles/${id}`, { headers: this.getHeaders() });
  }
  getVehicleDropdown(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/vehicles-dropdown`, { headers: this.getHeaders() });
  }

  // Routes
  getRoutes(params?: any): Observable<ApiResponse<PaginatedResponse<Route>>> {
    return this.http.get<ApiResponse<PaginatedResponse<Route>>>(`${this.baseUrl}/routes`, {
      headers: this.getHeaders(), params: this.buildParams(params)
    });
  }
  createRoute(data: Partial<Route>): Observable<ApiResponse<Route>> {
    return this.http.post<ApiResponse<Route>>(`${this.baseUrl}/routes`, data, { headers: this.getHeaders() });
  }
  updateRoute(id: number, data: Partial<Route>): Observable<ApiResponse<Route>> {
    return this.http.put<ApiResponse<Route>>(`${this.baseUrl}/routes/${id}`, data, { headers: this.getHeaders() });
  }
  deleteRoute(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/routes/${id}`, { headers: this.getHeaders() });
  }
  getRouteDropdown(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/routes-dropdown`, { headers: this.getHeaders() });
  }

  // Invoices
  getInvoices(params?: any): Observable<ApiResponse<PaginatedResponse<Invoice>>> {
    return this.http.get<ApiResponse<PaginatedResponse<Invoice>>>(`${this.baseUrl}/invoices`, {
      headers: this.getHeaders(), params: this.buildParams(params)
    });
  }
  createInvoice(data: Partial<Invoice>): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(`${this.baseUrl}/invoices`, data, { headers: this.getHeaders() });
  }
  updateInvoice(id: number, data: Partial<Invoice>): Observable<ApiResponse<Invoice>> {
    return this.http.put<ApiResponse<Invoice>>(`${this.baseUrl}/invoices/${id}`, data, { headers: this.getHeaders() });
  }
  deleteInvoice(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/invoices/${id}`, { headers: this.getHeaders() });
  }
  generateInvoice(shipmentId: number): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(`${this.baseUrl}/invoices/generate/${shipmentId}`, {}, { headers: this.getHeaders() });
  }
  markInvoicePaid(id: number, method?: string): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(`${this.baseUrl}/invoices/${id}/mark-paid`, { payment_method: method }, { headers: this.getHeaders() });
  }

  // Expenses
  getExpenses(params?: any): Observable<ApiResponse<PaginatedResponse<Expense>>> {
    return this.http.get<ApiResponse<PaginatedResponse<Expense>>>(`${this.baseUrl}/expenses`, {
      headers: this.getHeaders(), params: this.buildParams(params)
    });
  }
  createExpense(data: Partial<Expense>): Observable<ApiResponse<Expense>> {
    return this.http.post<ApiResponse<Expense>>(`${this.baseUrl}/expenses`, data, { headers: this.getHeaders() });
  }
  getExpenseSummary(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/expenses-summary`, { headers: this.getHeaders() });
  }

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return httpParams;
  }
}
