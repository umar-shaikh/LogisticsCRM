<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ExpenseController extends Controller {

    public function index(Request $request) {
        $query = Expense::with(['vehicle', 'shipment']);
        
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }
        
        $expenses = $query->latest()->paginate($request->per_page ?? 20);
        
        return response()->json([
            'success' => true,
            'data' => $expenses
        ]);
    }

    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'shipment_id' => 'nullable|exists:shipments,id',
            'category' => 'required|in:fuel,maintenance,tolls,salary,insurance,rent,utilities,misc',
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'description' => 'nullable|string',
            'receipt_path' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $expense = Expense::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Expense recorded successfully',
            'data' => $expense->load(['vehicle', 'shipment'])
        ], 201);
    }

    public function show($id) {
        $expense = Expense::with(['vehicle', 'shipment'])->find($id);
        
        if (!$expense) {
            return response()->json(['success' => false, 'message' => 'Expense not found'], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $expense
        ]);
    }

    public function update(Request $request, $id) {
        $expense = Expense::find($id);
        if (!$expense) {
            return response()->json(['success' => false, 'message' => 'Expense not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'category' => 'sometimes|in:fuel,maintenance,tolls,salary,insurance,rent,utilities,misc',
            'amount' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,approved,rejected',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $expense->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Expense updated successfully',
            'data' => $expense
        ]);
    }

    public function destroy($id) {
        $expense = Expense::find($id);
        if (!$expense) {
            return response()->json(['success' => false, 'message' => 'Expense not found'], 404);
        }

        $expense->delete();
        return response()->json([
            'success' => true,
            'message' => 'Expense deleted successfully'
        ]);
    }

    public function summary() {
        $thisMonth = Expense::where('status', 'approved')
            ->whereMonth('expense_date', now()->month)
            ->whereYear('expense_date', now()->year)
            ->sum('amount');
        
        $lastMonth = Expense::where('status', 'approved')
            ->whereMonth('expense_date', now()->subMonth()->month)
            ->whereYear('expense_date', now()->subMonth()->year)
            ->sum('amount');

        $byCategory = Expense::selectRaw('category, SUM(amount) as total')
            ->where('status', 'approved')
            ->groupBy('category')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'this_month' => $thisMonth,
                'last_month' => $lastMonth,
                'by_category' => $byCategory
            ]
        ]);
    }
}
