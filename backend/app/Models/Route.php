<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Route extends Model {
    protected $table = 'routes';
    protected $fillable = [
        'route_name', 'origin', 'destination', 'distance_km',
        'estimated_duration_min', 'waypoints', 'type', 'status', 'notes'
    ];

    public function shipments(): HasMany {
        return $this->hasMany(Shipment::class);
    }

    public function scopeActive($query) {
        return $query->where('status', 'active');
    }
}
