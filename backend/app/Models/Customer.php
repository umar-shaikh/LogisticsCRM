<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model {
    protected $fillable = [
        'company_name', 'contact_person', 'email', 'phone', 'alt_phone',
        'address', 'city', 'state', 'country', 'pincode',
        'type', 'status', 'notes'
    ];

    public function shipments(): HasMany {
        return $this->hasMany(Shipment::class);
    }

    public function invoices(): HasMany {
        return $this->hasMany(Invoice::class);
    }

    public function scopeActive($query) {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, $type) {
        return $type ? $query->where('type', $type) : $query;
    }
}
