export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: { user: User; token: string; token_type: string };
}

export interface Customer {
  id: number;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  alt_phone?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  type: 'individual' | 'corporate' | 'ecommerce' | 'manufacturer';
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  shipments_count?: number;
  created_at: string;
  shipments_sum_total_amount?: number;
}

export interface Driver {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  license_number: string;
  license_type: string;
  license_expiry: string;
  date_of_birth: string;
  address: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status: 'available' | 'on_duty' | 'on_leave' | 'suspended';
  experience_level: 'beginner' | 'intermediate' | 'expert';
  photo?: string;
  notes?: string;
  vehicle?: Vehicle;
  created_at: string;
}

export interface Vehicle {
  id: number;
  registration_number: string;
  model: string;
  make: string;
  year: number;
  type: 'truck' | 'van' | 'bike' | 'container' | 'refrigerated' | 'tanker';
  capacity_kg: number;
  capacity_cubic_m?: number;
  fuel_type: string;
  fuel_efficiency?: number;
  chassis_number: string;
  engine_number: string;
  insurance_expiry: string;
  fitness_expiry: string;
  odometer: number;
  assigned_driver_id?: number;
  status: 'active' | 'maintenance' | 'retired' | 'in_transit';
  notes?: string;
  driver?: Driver;
  created_at: string;
}

export interface Route {
  id: number;
  route_name: string;
  origin: string;
  destination: string;
  distance_km: number;
  estimated_duration_min: number;
  waypoints?: string;
  type: 'local' | 'interstate' | 'international';
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
}

export interface Shipment {
  id: number;
  tracking_number: string;
  customer_id: number;
  driver_id?: number;
  vehicle_id?: number;
  route_id?: number;
  sender_name: string;
  sender_address: string;
  sender_phone: string;
  receiver_name: string;
  receiver_address: string;
  receiver_phone: string;
  goods_description: string;
  goods_type: string;
  weight_kg: number;
  volume_cbm?: number;
  quantity: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: string;
  pickup_date: string;
  delivery_date?: string;
  actual_pickup_at?: string;
  actual_delivery_at?: string;
  special_instructions?: string;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  customer?: Customer;
  driver?: Driver;
  vehicle?: Vehicle;
  route?: Route;
  events?: ShipmentEvent[];
  invoice?: Invoice;
  created_at: string;
}

export interface ShipmentEvent {
  id: number;
  shipment_id: number;
  event_type: string;
  location: string;
  description: string;
  event_time: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  shipment_id: number;
  customer_id: number;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partial';
  payment_method: string;
  notes?: string;
  shipment?: Shipment;
  customer?: Customer;
  created_at: string;
}

export interface Expense {
  id: number;
  title: string;
  vehicle_id?: number;
  shipment_id?: number;
  category: string;
  amount: number;
  expense_date: string;
  description?: string;
  receipt_path?: string;
  status: 'pending' | 'approved' | 'rejected';
  vehicle?: Vehicle;
  shipment?: Shipment;
  created_at: string;
}

export interface DashboardStats {
  total_shipments: number;
  active_shipments: number;
  pending_shipments: number;
  in_transit: number;
  delivered_this_month: number;
  total_customers: number;
  active_customers: number;
  new_customers_this_month: number;
  total_drivers: number;
  available_drivers: number;
  on_duty_drivers: number;
  total_vehicles: number;
  active_vehicles: number;
  in_transit_vehicles: number;
  total_revenue: number;
  revenue_this_month: number;
  pending_invoices: number;
  overdue_invoices: number;
  total_expenses: number;
  expenses_this_month: number;
  shipment_growth: number;
  revenue_growth: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
