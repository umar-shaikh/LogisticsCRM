<?php
/**
 * Logistics CRM - Database Schema
 * Run this migration in Laravel to create all tables
 * 
 * php artisan migrate
 * or run SQL directly in MySQL
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        
        // Users (Admins & Staff)
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['super_admin', 'admin', 'manager', 'staff'])->default('staff');
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });

        // Customers / Clients
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('contact_person');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('alt_phone')->nullable();
            $table->text('address');
            $table->string('city');
            $table->string('state');
            $table->string('country')->default('India');
            $table->string('pincode');
            $table->enum('type', ['individual', 'corporate', 'ecommerce', 'manufacturer'])->default('corporate');
            $table->enum('status', ['active', 'inactive', 'blocked'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Drivers
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->string('license_number')->unique();
            $table->string('license_type')->default('HGV');
            $table->date('license_expiry');
            $table->date('date_of_birth');
            $table->text('address');
            $table->string('emergency_contact')->nullable();
            $table->string('emergency_phone')->nullable();
            $table->enum('status', ['available', 'on_duty', 'on_leave', 'suspended'])->default('available');
            $table->enum('experience_level', ['beginner', 'intermediate', 'expert'])->default('intermediate');
            $table->string('photo')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Vehicles / Fleet
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('registration_number')->unique();
            $table->string('model');
            $table->string('make');
            $table->integer('year');
            $table->enum('type', ['truck', 'van', 'bike', 'container', 'refrigerated', 'tanker'])->default('truck');
            $table->decimal('capacity_kg', 10, 2);
            $table->decimal('capacity_cubic_m', 10, 2)->nullable();
            $table->string('fuel_type')->default('diesel');
            $table->decimal('fuel_efficiency', 5, 2)->nullable();
            $table->string('chassis_number')->unique();
            $table->string('engine_number')->unique();
            $table->date('insurance_expiry');
            $table->date('fitness_expiry');
            $table->decimal('odometer', 10, 2)->default(0);
            $table->foreignId('assigned_driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->enum('status', ['active', 'maintenance', 'retired', 'in_transit'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Routes
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->string('route_name');
            $table->string('origin');
            $table->string('destination');
            $table->decimal('distance_km', 8, 2);
            $table->integer('estimated_duration_min');
            $table->text('waypoints')->nullable();
            $table->enum('type', ['local', 'interstate', 'international'])->default('interstate');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Shipments
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number')->unique();
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('route_id')->nullable()->constrained('routes')->nullOnDelete();
            $table->string('sender_name');
            $table->text('sender_address');
            $table->string('sender_phone');
            $table->string('receiver_name');
            $table->text('receiver_address');
            $table->string('receiver_phone');
            $table->text('goods_description');
            $table->enum('goods_type', ['general', 'fragile', 'hazardous', 'perishable', 'valuable', 'oversized'])->default('general');
            $table->decimal('weight_kg', 10, 2);
            $table->decimal('volume_cbm', 10, 2)->nullable();
            $table->integer('quantity')->default(1);
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('status', ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'returned'])->default('pending');
            $table->date('pickup_date');
            $table->date('delivery_date')->nullable();
            $table->timestamp('actual_pickup_at')->nullable();
            $table->timestamp('actual_delivery_at')->nullable();
            $table->text('special_instructions')->nullable();
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->text('tracking_history')->nullable();
            $table->timestamps();
        });

        // Shipment Tracking Events
        Schema::create('shipment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained('shipments')->cascadeOnDelete();
            $table->enum('event_type', ['created', 'confirmed', 'picked_up', 'in_transit', 'checkpoint', 'out_for_delivery', 'delivered', 'exception', 'cancelled', 'returned']);
            $table->string('location');
            $table->text('description');
            $table->timestamp('event_time');
            $table->timestamps();
        });

        // Invoices
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('shipment_id')->constrained('shipments');
            $table->foreignId('customer_id')->constrained('customers');
            $table->date('invoice_date');
            $table->date('due_date');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_rate', 5, 2)->default(18.00);
            $table->decimal('tax_amount', 10, 2);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partial'])->default('draft');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'upi', 'credit_card', 'pending'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Expenses
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->foreignId('shipment_id')->nullable()->constrained('shipments')->nullOnDelete();
            $table->enum('category', ['fuel', 'maintenance', 'tolls', 'salary', 'insurance', 'rent', 'utilities', 'misc']);
            $table->decimal('amount', 10, 2);
            $table->date('expense_date');
            $table->text('description')->nullable();
            $table->string('receipt_path')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });

        // Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['info', 'success', 'warning', 'error'])->default('info');
            $table->boolean('is_read')->default(false);
            $table->string('link')->nullable();
            $table->timestamps();
        });

        // Settings
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->string('group')->default('general');
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('shipment_events');
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('routes');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('drivers');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('users');
        Schema::dropIfExists('settings');
    }
};
