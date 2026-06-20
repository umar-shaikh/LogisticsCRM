<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VehicleController extends Controller {

    public function index(Request $request) {
        $query = Vehicle::with('driver');
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('registration_number', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('make', 'like', "%{$search}%");
            });
        }
        
        $vehicles = $query->latest()->paginate($request->per_page ?? 20);
        
        return response()->json([
            'success' => true,
            'data' => $vehicles
        ]);
    }

    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'registration_number' => 'required|string|unique:vehicles',
            'model' => 'required|string|max:255',
            'make' => 'required|string|max:255',
            'year' => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'type' => 'required|in:truck,van,bike,container,refrigerated,tanker',
            'capacity_kg' => 'required|numeric|min:1',
            'capacity_cubic_m' => 'nullable|numeric',
            'fuel_type' => 'nullable|string|max:20',
            'fuel_efficiency' => 'nullable|numeric',
            'chassis_number' => 'required|string|unique:vehicles',
            'engine_number' => 'required|string|unique:vehicles',
            'insurance_expiry' => 'required|date',
            'fitness_expiry' => 'required|date',
            'assigned_driver_id' => 'nullable|exists:drivers,id',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $vehicle = Vehicle::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Vehicle created successfully',
            'data' => $vehicle->load('driver')
        ], 201);
    }

    public function show($id) {
        $vehicle = Vehicle::with(['driver', 'shipments' => fn($q) => $q->latest()->limit(10), 'expenses'])->find($id);
        
        if (!$vehicle) {
            return response()->json(['success' => false, 'message' => 'Vehicle not found'], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $vehicle
        ]);
    }

    public function update(Request $request, $id) {
        $vehicle = Vehicle::find($id);
        if (!$vehicle) {
            return response()->json(['success' => false, 'message' => 'Vehicle not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'registration_number' => 'sometimes|string|unique:vehicles,registration_number,' . $id,
            'status' => 'sometimes|in:active,maintenance,retired,in_transit',
            'assigned_driver_id' => 'nullable|exists:drivers,id',
            'odometer' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $vehicle->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Vehicle updated successfully',
            'data' => $vehicle->load('driver')
        ]);
    }

    public function destroy($id) {
        $vehicle = Vehicle::find($id);
        if (!$vehicle) {
            return response()->json(['success' => false, 'message' => 'Vehicle not found'], 404);
        }

        $vehicle->delete();
        return response()->json([
            'success' => true,
            'message' => 'Vehicle deleted successfully'
        ]);
    }

    public function dropdown() {
        $vehicles = Vehicle::active()->select('id', 'registration_number', 'model')->get();
        return response()->json([
            'success' => true,
            'data' => $vehicles
        ]);
    }
}
