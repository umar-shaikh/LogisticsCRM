<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model {
    protected $fillable = [
        'title', 'vehicle_id', 'shipment_id', 'category',
        'amount', 'expense_date', 'description', 'receipt_path', 'status'
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2'
    ];

    public function vehicle(): BelongsTo {
        return $this->belongsTo(Vehicle::class);
    }

    public function shipment(): BelongsTo {
        return $this->belongsTo(Shipment::class);
    }

    public function scopeByCategory($query, $category) {
        return $category ? $query->where('category', $category) : $query;
    }

    public function scopeThisMonth($query) {
        return $query->whereMonth('expense_date', now()->month)
                     ->whereYear('expense_date', now()->year);
    }
}
