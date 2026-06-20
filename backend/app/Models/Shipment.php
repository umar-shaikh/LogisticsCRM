<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Shipment extends Model {
    protected $fillable = [
        'tracking_number', 'customer_id', 'driver_id', 'vehicle_id', 'route_id',
        'sender_name', 'sender_address', 'sender_phone',
        'receiver_name', 'receiver_address', 'receiver_phone',
        'goods_description', 'goods_type', 'weight_kg', 'volume_cbm', 'quantity',
        'priority', 'status', 'pickup_date', 'delivery_date',
        'actual_pickup_at', 'actual_delivery_at', 'special_instructions',
        'shipping_cost', 'tax_amount', 'total_amount', 'tracking_history'
    ];

    protected $casts = [
        'pickup_date' => 'date',
        'delivery_date' => 'date',
        'actual_pickup_at' => 'datetime',
        'actual_delivery_at' => 'datetime',
        'weight_kg' => 'decimal:2',
        'volume_cbm' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2'
    ];

    protected static function boot() {
        parent::boot();
        static::creating(function ($shipment) {
            if (empty($shipment->tracking_number)) {
                $shipment->tracking_number = 'TRK' . date('Y') . strtoupper(substr(uniqid(), -6));
            }
        });
    }

    public function customer(): BelongsTo {
        return $this->belongsTo(Customer::class);
    }

    public function driver(): BelongsTo {
        return $this->belongsTo(Driver::class);
    }

    public function vehicle(): BelongsTo {
        return $this->belongsTo(Vehicle::class);
    }

    public function route(): BelongsTo {
        return $this->belongsTo(Route::class);
    }

    public function events(): HasMany {
        return $this->hasMany(ShipmentEvent::class);
    }

    public function invoice(): HasOne {
        return $this->hasOne(Invoice::class);
    }

    public function scopeByStatus($query, $status) {
        return $status ? $query->where('status', $status) : $query;
    }

    public function scopeByPriority($query, $priority) {
        return $priority ? $query->where('priority', $priority) : $query;
    }

    public function scopeThisMonth($query) {
        return $query->whereMonth('created_at', now()->month)
                     ->whereYear('created_at', now()->year);
    }
}
