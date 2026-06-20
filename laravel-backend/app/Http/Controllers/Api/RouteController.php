<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RouteController extends Controller {

    public function index(Request $request) {
        $query = Route::query();
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('route_name', 'like', "%{$search}%")
                  ->orWhere('origin', 'like', "%{$search}%")
                  ->orWhere('destination', 'like', "%{$search}%");
            });
        }
        
        $routes = $query->latest()->paginate($request->per_page ?? 20);
        
        return response()->json([
            'success' => true,
            'data' => $routes
        ]);
    }

    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'route_name' => 'required|string|max:255',
            'origin' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'distance_km' => 'required|numeric|min:0.1',
            'estimated_duration_min' => 'required|integer|min:1',
            'waypoints' => 'nullable|string',
            'type' => 'required|in:local,interstate,international',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $route = Route::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Route created successfully',
            'data' => $route
        ], 201);
    }

    public function show($id) {
        $route = Route::with(['shipments' => fn($q) => $q->latest()->limit(10)])->find($id);
        
        if (!$route) {
            return response()->json(['success' => false, 'message' => 'Route not found'], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $route
        ]);
    }

    public function update(Request $request, $id) {
        $route = Route::find($id);
        if (!$route) {
            return response()->json(['success' => false, 'message' => 'Route not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'route_name' => 'sometimes|string|max:255',
            'origin' => 'sometimes|string|max:255',
            'destination' => 'sometimes|string|max:255',
            'distance_km' => 'sometimes|numeric',
            'estimated_duration_min' => 'sometimes|integer',
            'type' => 'sometimes|in:local,interstate,international',
            'status' => 'sometimes|in:active,inactive',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $route->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Route updated successfully',
            'data' => $route
        ]);
    }

    public function destroy($id) {
        $route = Route::find($id);
        if (!$route) {
            return response()->json(['success' => false, 'message' => 'Route not found'], 404);
        }

        $route->delete();
        return response()->json([
            'success' => true,
            'message' => 'Route deleted successfully'
        ]);
    }

    public function dropdown() {
        $routes = Route::active()->select('id', 'route_name', 'origin', 'destination')->get();
        return response()->json([
            'success' => true,
            'data' => $routes
        ]);
    }
}
