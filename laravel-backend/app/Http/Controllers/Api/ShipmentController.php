<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\ShipmentEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShipmentController extends Controller {

    public function index(Request $request) {
        $query = Shipment::with(['customer', 'driver', 'vehicle', 'route']);
        
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }
        if ($request->has('priority')) {
            $query->byPriority($request->priority);
        }
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }
        if ($request->has('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('tracking_number', 'like', "%{$search}%")
                  ->orWhere('sender_name', 'like', "%{$search}%")
                  ->orWhere('receiver_name', 'like', "%{$search}%");
            });
        }
        
        $shipments = $query->latest()->paginate($request->per_page ?? 20);
        
        return response()->json([
            'success' => true,
            'data' => $shipments
        ]);
    }

    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'sender_name' => 'required|string|max:255',
            'sender_address' => 'required|string',
            'sender_phone' => 'required|string|max:20',
            'receiver_name' => 'required|string|max:255',
            'receiver_address' => 'required|string',
            'receiver_phone' => 'required|string|max:20',
            'goods_description' => 'required|string',
            'goods_type' => 'required|in:general,fragile,hazardous,perishable,valuable,oversized',
            'weight_kg' => 'required|numeric|min:0.01',
            'volume_cbm' => 'nullable|numeric',
            'quantity' => 'required|integer|min:1',
            'priority' => 'required|in:low,normal,high,urgent',
            'pickup_date' => 'required|date',
            'delivery_date' => 'nullable|date|after_or_equal:pickup_date',
            'special_instructions' => 'nullable|string',
            'shipping_cost' => 'required|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $total = ($request->shipping_cost ?? 0) + ($request->tax_amount ?? 0);

        $shipment = Shipment::create([
            ...$request->only([
                'customer_id', 'sender_name', 'sender_address', 'sender_phone',
                'receiver_name', 'receiver_address', 'receiver_phone',
                'goods_description', 'goods_type', 'weight_kg', 'volume_cbm', 'quantity',
                'priority', 'pickup_date', 'delivery_date', 'special_instructions',
                'shipping_cost', 'tax_amount'
            ]),
            'total_amount' => $total,
            'status' => 'pending'
        ]);

        ShipmentEvent::create([
            'shipment_id' => $shipment->id,
            'event_type' => 'created',
            'location' => $request->sender_address,
            'description' => 'Shipment created and pending confirmation',
            'event_time' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shipment created successfully',
            'data' => $shipment->load(['customer'])
        ], 201);
    }

    public function show($id) {
        $shipment = Shipment::with(['customer', 'driver', 'vehicle', 'route', 'events', 'invoice'])->find($id);
        
        if (!$shipment) {
            return response()->json(['success' => false, 'message' => 'Shipment not found'], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $shipment
        ]);
    }

    public function update(Request $request, $id) {
        $shipment = Shipment::find($id);
        if (!$shipment) {
            return response()->json(['success' => false, 'message' => 'Shipment not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'driver_id' => 'nullable|exists:drivers,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'route_id' => 'nullable|exists:routes,id',
            'status' => 'sometimes|in:pending,confirmed,picked_up,in_transit,out_for_delivery,delivered,cancelled,returned',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'delivery_date' => 'nullable|date',
            'shipping_cost' => 'sometimes|numeric|min:0',
            'tax_amount' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $oldStatus = $shipment->status;
        $shipment->update($request->only([
            'driver_id', 'vehicle_id', 'route_id', 'status', 'priority',
            'delivery_date', 'shipping_cost', 'tax_amount', 'special_instructions'
        ]));

        // Update total
        $shipment->total_amount = ($shipment->shipping_cost ?? 0) + ($shipment->tax_amount ?? 0);
        $shipment->save();

        // Create event if status changed
        if ($request->has('status') && $request->status !== $oldStatus) {
            $eventDescriptions = [
                'confirmed' => 'Shipment confirmed and assigned',
                'picked_up' => 'Goods picked up from sender',
                'in_transit' => 'Shipment is in transit to destination',
                'out_for_delivery' => 'Out for delivery to receiver',
                'delivered' => 'Shipment delivered successfully',
                'cancelled' => 'Shipment cancelled',
                'returned' => 'Shipment returned to sender'
            ];

            ShipmentEvent::create([
                'shipment_id' => $shipment->id,
                'event_type' => $request->status,
                'location' => $shipment->receiver_address ?? 'Unknown',
                'description' => $eventDescriptions[$request->status] ?? 'Status updated',
                'event_time' => now()
            ]);

            if ($request->status === 'delivered') {
                $shipment->actual_delivery_at = now();
                $shipment->save();
            }
            if ($request->status === 'picked_up') {
                $shipment->actual_pickup_at = now();
                $shipment->save();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Shipment updated successfully',
            'data' => $shipment->fresh()->load(['customer', 'driver', 'vehicle'])
        ]);
    }

    public function destroy($id) {
        $shipment = Shipment::find($id);
        if (!$shipment) {
            return response()->json(['success' => false, 'message' => 'Shipment not found'], 404);
        }

        $shipment->delete();
        return response()->json([
            'success' => true,
            'message' => 'Shipment deleted successfully'
        ]);
    }

    public function track($trackingNumber) {
        $shipment = Shipment::with(['customer', 'driver', 'vehicle', 'route', 'events'])
            ->where('tracking_number', $trackingNumber)
            ->first();
        
        if (!$shipment) {
            return response()->json(['success' => false, 'message' => 'Tracking number not found'], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $shipment
        ]);
    }

    public function addEvent(Request $request, $id) {
        $validator = Validator::make($request->all(), [
            'event_type' => 'required|in:checkpoint,exception',
            'location' => 'required|string',
            'description' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $event = ShipmentEvent::create([
            'shipment_id' => $id,
            'event_type' => $request->event_type,
            'location' => $request->location,
            'description' => $request->description,
            'event_time' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event added successfully',
            'data' => $event
        ]);
    }
}
