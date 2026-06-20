<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model {
    protected $fillable = [
        'registration_number', 'model', 'make', 'year', 'type',
        'capacity_kg', 'capacity_cubic_m', 'fuel_type', 'fuel_efficiency',
        'chassis_number', 'engine_number', 'insurance_expiry',
        'fitness_expiry', 'odometer', 'assigned_driver_id', 'status', 'notes'
    ];

    protected $casts = [
        'insurance_expiry' => 'date',
        'fitness_expiry' => 'date',
        'capacity_kg' => 'decimal:2',
        'odometer' => 'decimal:2'
    ];

    public function driver(): BelongsTo {
        return $this->belongsTo(Driver::class, 'assigned_driver_id');
    }

    public function shipments(): HasMany {
        return $this->hasMany(Shipment::class);
    }

    public function expenses(): HasMany {
        return $this->hasMany(Expense::class);
    }

    public function scopeActive($query) {
        return $query->where('status', 'active');
    }
}
