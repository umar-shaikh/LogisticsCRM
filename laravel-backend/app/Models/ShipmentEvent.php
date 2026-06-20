<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentEvent extends Model {
    protected $fillable = [
        'shipment_id', 'event_type', 'location', 'description', 'event_time'
    ];

    protected $casts = [
        'event_time' => 'datetime'
    ];

    public function shipment(): BelongsTo {
        return $this->belongsTo(Shipment::class);
    }
}
