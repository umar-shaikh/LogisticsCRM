<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model {
    protected $fillable = [
        'full_name', 'email', 'phone', 'license_number', 'license_type',
        'license_expiry', 'date_of_birth', 'address',
        'emergency_contact', 'emergency_phone', 'status',
        'experience_level', 'photo', 'notes'
    ];

    protected $casts = [
        'license_expiry' => 'date',
        'date_of_birth' => 'date'
    ];

    public function vehicle(): HasOne {
        return $this->hasOne(Vehicle::class, 'assigned_driver_id');
    }

    public function shipments(): HasMany {
        return $this->hasMany(Shipment::class);
    }

    public function scopeAvailable($query) {
        return $query->where('status', 'available');
    }
}
