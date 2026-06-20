<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\Customer;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\Invoice;
use App\Models\Expense;
use Carbon\Carbon;

class DashboardController extends Controller {
    
    public function stats() {
        $now = Carbon::now();
        $monthStart = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();

        // Current month
        $currentMonthShipments = Shipment::whereBetween('created_at', [$monthStart, $now])->count();
        $currentMonthRevenue = Invoice::whereBetween('created_at', [$monthStart, $now])
            ->whereIn('status', ['paid', 'partial'])->sum('paid_amount');

        // Last month
        $lastMonthShipments = Shipment::whereBetween('created_at', [$lastMonthStart, $monthStart])->count();
        $lastMonthRevenue = Invoice::whereBetween('created_at', [$lastMonthStart, $monthStart])
            ->whereIn('status', ['paid', 'partial'])->sum('paid_amount');

        $shipmentGrowth = $lastMonthShipments > 0 
            ? round((($currentMonthShipments - $lastMonthShipments) / $lastMonthShipments) * 100, 1)
            : 100;
        
        $revenueGrowth = $lastMonthRevenue > 0 
            ? round((($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 100;

        return response()->json([
            'success' => true,
            'data' => [
                'total_shipments' => Shipment::count(),
                'active_shipments' => Shipment::whereNotIn('status', ['delivered', 'cancelled'])->count(),
                'pending_shipments' => Shipment::where('status', 'pending')->count(),
                'in_transit' => Shipment::where('status', 'in_transit')->count(),
                'delivered_this_month' => Shipment::where('status', 'delivered')
                    ->whereBetween('actual_delivery_at', [$monthStart, $now])->count(),
                
                'total_customers' => Customer::count(),
                'active_customers' => Customer::active()->count(),
                'new_customers_this_month' => Customer::whereBetween('created_at', [$monthStart, $now])->count(),
                
                'total_drivers' => Driver::count(),
                'available_drivers' => Driver::available()->count(),
                'on_duty_drivers' => Driver::where('status', 'on_duty')->count(),
                
                'total_vehicles' => Vehicle::count(),
                'active_vehicles' => Vehicle::active()->count(),
                'in_transit_vehicles' => Vehicle::where('status', 'in_transit')->count(),
                
                'total_revenue' => Invoice::whereIn('status', ['paid', 'partial'])->sum('paid_amount'),
                'revenue_this_month' => $currentMonthRevenue,
                'pending_invoices' => Invoice::whereIn('status', ['sent', 'overdue'])->count(),
                'overdue_invoices' => Invoice::overdue()->count(),
                
                'total_expenses' => Expense::where('status', 'approved')->sum('amount'),
                'expenses_this_month' => Expense::where('status', 'approved')
                    ->whereBetween('expense_date', [$monthStart, $now])->sum('amount'),
                
                'shipment_growth' => $shipmentGrowth,
                'revenue_growth' => $revenueGrowth,
            ]
        ]);
    }

    public function recentShipments() {
        $shipments = Shipment::with(['customer', 'driver'])
            ->latest()
            ->limit(10)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $shipments
        ]);
    }

    public function shipmentStatusChart() {
        $statuses = ['pending', 'confirmed', 'picked_up', 'in_transit', 
                     'out_for_delivery', 'delivered', 'cancelled'];
        $data = [];
        
        foreach ($statuses as $status) {
            $data[] = [
                'status' => $status,
                'count' => Shipment::where('status', $status)->count(),
                'label' => ucwords(str_replace('_', ' ', $status))
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function monthlyRevenueChart() {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $revenue = Invoice::whereIn('status', ['paid', 'partial'])
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('paid_amount');
            
            $months[] = [
                'month' => $date->format('M Y'),
                'revenue' => (float) $revenue
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => $months
        ]);
    }

    public function topCustomers() {
        $customers = Customer::withCount('shipments')
            ->withSum('shipments', 'total_amount')
            ->orderByDesc('shipments_count')
            ->limit(5)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    public function activities() {
        $recentShipments = Shipment::with('customer')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($s) => [
                'type' => 'shipment',
                'description' => "Shipment {$s->tracking_number} created for {$s->customer->company_name}",
                'status' => $s->status,
                'time' => $s->created_at->diffForHumans()
            ]);

        $recentDeliveries = Shipment::with('customer')
            ->where('status', 'delivered')
            ->latest('actual_delivery_at')
            ->limit(5)
            ->get()
            ->map(fn($s) => [
                'type' => 'delivery',
                'description' => "Shipment {$s->tracking_number} delivered to {$s->receiver_name}",
                'status' => 'delivered',
                'time' => $s->actual_delivery_at?->diffForHumans()
            ]);

        return response()->json([
            'success' => true,
            'data' => $recentShipments->merge($recentDeliveries)->sortByDesc('created_at')->values()
        ]);
    }
}
