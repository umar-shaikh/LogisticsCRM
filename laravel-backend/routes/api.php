<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    AuthController,
    DashboardController,
    ShipmentController,
    CustomerController,
    DriverController,
    VehicleController,
    RouteController,
    InvoiceController,
    ExpenseController
};

/*
|--------------------------------------------------------------------------
| Logistics CRM API Routes
|--------------------------------------------------------------------------
| All routes are prefixed with /api (set in RouteServiceProvider)
| Auth using Laravel Sanctum
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/shipments/track/{trackingNumber}', [ShipmentController::class, 'track']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/recent-shipments', [DashboardController::class, 'recentShipments']);
    Route::get('/dashboard/shipment-status-chart', [DashboardController::class, 'shipmentStatusChart']);
    Route::get('/dashboard/monthly-revenue-chart', [DashboardController::class, 'monthlyRevenueChart']);
    Route::get('/dashboard/top-customers', [DashboardController::class, 'topCustomers']);
    Route::get('/dashboard/activities', [DashboardController::class, 'activities']);

    // Shipments
    Route::apiResource('shipments', ShipmentController::class);
    Route::post('/shipments/{id}/events', [ShipmentController::class, 'addEvent']);

    // Customers
    Route::apiResource('customers', CustomerController::class);
    Route::get('/customers-dropdown', [CustomerController::class, 'dropdown']);

    // Drivers
    Route::apiResource('drivers', DriverController::class);
    Route::get('/drivers-dropdown', [DriverController::class, 'dropdown']);

    // Vehicles
    Route::apiResource('vehicles', VehicleController::class);
    Route::get('/vehicles-dropdown', [VehicleController::class, 'dropdown']);

    // Routes
    Route::apiResource('routes', RouteController::class);
    Route::get('/routes-dropdown', [RouteController::class, 'dropdown']);

    // Invoices
    Route::apiResource('invoices', InvoiceController::class);
    Route::post('/invoices/generate/{shipmentId}', [InvoiceController::class, 'generateFromShipment']);
    Route::post('/invoices/{id}/mark-paid', [InvoiceController::class, 'markAsPaid']);

    // Expenses
    Route::apiResource('expenses', ExpenseController::class);
    Route::get('/expenses-summary', [ExpenseController::class, 'summary']);
});
