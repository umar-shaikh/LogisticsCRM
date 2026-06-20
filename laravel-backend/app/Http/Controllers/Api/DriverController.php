<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DriverController extends Controller {

    public function index(Request $request) {
        $query = Driver::with('vehicle');
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('license_number', 'like', "%{$search}%");
            });
        }
        
        $drivers = $query->latest()->paginate($request->per_page ?? 20);
        
        return response()->json([
            'success' => true,
            'data' => $drivers
        ]);
    }

    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:drivers',
            'phone' => 'required|string|max:20',
            'license_number' => 'required|string|unique:drivers',
            'license_type' => 'nullable|string|max:20',
            'license_expiry' => 'required|date',
            'date_of_birth' => 'required|date',
            'address' => 'required|string',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:20',
            'experience_level' => 'required|in:beginner,intermediate,expert',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $driver = Driver::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Driver created successfully',
            'data' => $driver
        ], 201);
    }

    public function show($id) {
        $driver = Driver::with(['vehicle', 'shipments' => fn($q) => $q->latest()->limit(10)])->find($id);
        
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $driver
        ]);
    }

    public function update(Request $request, $id) {
        $driver = Driver::find($id);
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:drivers,email,' . $id,
            'phone' => 'sometimes|string|max:20',
            'license_number' => 'sometimes|string|unique:drivers,license_number,' . $id,
            'license_expiry' => 'sometimes|date',
            'status' => 'sometimes|in:available,on_duty,on_leave,suspended',
            'experience_level' => 'sometimes|in:beginner,intermediate,expert',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $driver->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Driver updated successfully',
            'data' => $driver
        ]);
    }

    public function destroy($id) {
        $driver = Driver::find($id);
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
        }

        $driver->delete();
        return response()->json([
            'success' => true,
            'message' => 'Driver deleted successfully'
        ]);
    }

    public function dropdown() {
        $drivers = Driver::available()->select('id', 'full_name', 'phone')->get();
        return response()->json([
            'success' => true,
            'data' => $drivers
        ]);
    }
}
