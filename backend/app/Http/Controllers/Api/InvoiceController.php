<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends Controller {

    public function index(Request $request) {
        $query = Invoice::with(['shipment', 'customer']);
        
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%");
            });
        }
        
        $invoices = $query->latest()->paginate($request->per_page ?? 20);
        
        return response()->json([
            'success' => true,
            'data' => $invoices
        ]);
    }

    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'shipment_id' => 'required|exists:shipments,id',
            'customer_id' => 'required|exists:customers,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'subtotal' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $subtotal = $request->subtotal ?? 0;
        $taxRate = $request->tax_rate ?? 18;
        $taxAmount = $request->tax_amount ?? ($subtotal * $taxRate / 100);
        $discount = $request->discount ?? 0;
        $total = $subtotal + $taxAmount - $discount;

        $invoice = Invoice::create([
            ...$request->only(['shipment_id', 'customer_id', 'invoice_date', 'due_date', 'notes']),
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'discount' => $discount,
            'total_amount' => $total,
            'status' => 'draft'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Invoice created successfully',
            'data' => $invoice->load(['shipment', 'customer'])
        ], 201);
    }

    public function show($id) {
        $invoice = Invoice::with(['shipment', 'customer'])->find($id);
        
        if (!$invoice) {
            return response()->json(['success' => false, 'message' => 'Invoice not found'], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $invoice
        ]);
    }

    public function update(Request $request, $id) {
        $invoice = Invoice::find($id);
        if (!$invoice) {
            return response()->json(['success' => false, 'message' => 'Invoice not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:draft,sent,paid,overdue,cancelled,partial',
            'payment_method' => 'sometimes|in:cash,bank_transfer,cheque,upi,credit_card,pending',
            'paid_amount' => 'sometimes|numeric|min:0',
            'discount' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        if ($request->has('paid_amount')) {
            $invoice->paid_amount = $request->paid_amount;
            if ($invoice->paid_amount >= $invoice->total_amount) {
                $invoice->status = 'paid';
            } elseif ($invoice->paid_amount > 0) {
                $invoice->status = 'partial';
            }
        }

        $invoice->update($request->except('paid_amount'));
        $invoice->save();

        return response()->json([
            'success' => true,
            'message' => 'Invoice updated successfully',
            'data' => $invoice->load(['shipment', 'customer'])
        ]);
    }

    public function destroy($id) {
        $invoice = Invoice::find($id);
        if (!$invoice) {
            return response()->json(['success' => false, 'message' => 'Invoice not found'], 404);
        }

        $invoice->delete();
        return response()->json([
            'success' => true,
            'message' => 'Invoice deleted successfully'
        ]);
    }

    public function generateFromShipment($shipmentId) {
        $shipment = Shipment::with('customer')->find($shipmentId);
        
        if (!$shipment) {
            return response()->json(['success' => false, 'message' => 'Shipment not found'], 404);
        }

        if ($shipment->invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice already exists for this shipment',
                'data' => $shipment->invoice
            ], 422);
        }

        $subtotal = $shipment->shipping_cost ?? 0;
        $taxRate = 18;
        $taxAmount = $subtotal * $taxRate / 100;
        $total = $subtotal + $taxAmount;

        $invoice = Invoice::create([
            'shipment_id' => $shipment->id,
            'customer_id' => $shipment->customer_id,
            'invoice_date' => now(),
            'due_date' => now()->addDays(30),
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'discount' => 0,
            'total_amount' => $total,
            'status' => 'draft'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Invoice generated from shipment',
            'data' => $invoice->load(['shipment', 'customer'])
        ]);
    }

    public function markAsPaid(Request $request, $id) {
        $invoice = Invoice::find($id);
        if (!$invoice) {
            return response()->json(['success' => false, 'message' => 'Invoice not found'], 404);
        }

        $invoice->update([
            'status' => 'paid',
            'paid_amount' => $invoice->total_amount,
            'payment_method' => $request->payment_method ?? 'cash'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Invoice marked as paid',
            'data' => $invoice
        ]);
    }
}
