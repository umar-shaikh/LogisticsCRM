<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model {
    protected $fillable = [
        'invoice_number', 'shipment_id', 'customer_id',
        'invoice_date', 'due_date', 'subtotal', 'tax_rate',
        'tax_amount', 'discount', 'total_amount', 'paid_amount',
        'status', 'payment_method', 'notes'
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2'
    ];

    protected static function boot() {
        parent::boot();
        static::creating(function ($invoice) {
            if (empty($invoice->invoice_number)) {
                $invoice->invoice_number = 'INV-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));
            }
        });
    }

    public function shipment(): BelongsTo {
        return $this->belongsTo(Shipment::class);
    }

    public function customer(): BelongsTo {
        return $this->belongsTo(Customer::class);
    }

    public function scopeByStatus($query, $status) {
        return $status ? $query->where('status', $status) : $query;
    }

    public function scopeOverdue($query) {
        return $query->where('due_date', '<', now())
                     ->where('status', '!=', 'paid');
    }
}
