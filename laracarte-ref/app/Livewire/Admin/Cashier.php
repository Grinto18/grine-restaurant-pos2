<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Order;

class Cashier extends Component
{
    use WithPagination;

    public $search = '';
    public $selectedOrder = null; // Menampung pesanan yang sedang diproses
    public $paymentAmount = 0;    // Input uang dari kasir
    public $changeAmount = 0;     // Kembalian

    // Variabel untuk Rincian Harga
    public $subtotal = 0;
    public $tax = 0;
    public $service = 0;
    public $grandTotal = 0;

    // Variabel Modal QRIS
    public $isQrisModalOpen = false;

    protected $queryString = ['search' => ['except' => '']];

    public function updatingSearch()
    {
        $this->resetPage();
    }

    protected function rules()
    {
        return [
            'paymentAmount' => 'required|numeric|min:' . $this->grandTotal,
        ];
    }

    protected $messages = [
        'paymentAmount.min' => 'Uang pembayaran kurang!',
    ];

    /**
     * Buka Modal Detail & Ambil Data Tersimpan
     */
    public function openDetail($orderId)
    {
        $this->selectedOrder = Order::with(['items.product', 'items.selectedVariants', 'table'])->find($orderId);

        if ($this->selectedOrder) {
            // Gunakan nilai yang sudah tersimpan di database saat checkout
            $this->subtotal = $this->selectedOrder->subtotal;
            $this->service = $this->selectedOrder->service_charge;
            $this->tax = $this->selectedOrder->tax_amount;
            $this->grandTotal = $this->selectedOrder->total_price;

            // Reset input pembayaran
            $this->paymentAmount = 0;
            $this->changeAmount = (int)$this->paymentAmount - (int)$this->grandTotal;
            $this->isQrisModalOpen = false;
        }
    }

    /**
     * Tutup Modal & Reset Data
     */
    public function closeDetail()
    {
        $this->selectedOrder = null;
        $this->reset(['paymentAmount', 'changeAmount', 'subtotal', 'tax', 'service', 'grandTotal', 'isQrisModalOpen']);
    }

    /**
     * Hitung Kembalian Real-time
     */
    public function updatedPaymentAmount()
    {
        if (is_numeric($this->paymentAmount)) {
            $this->changeAmount = (int)$this->paymentAmount - (int)$this->grandTotal;
        }
    }

    /**
     * Proses Pembayaran Tunai
     */
    public function markAsPaid()
    {
        if (!$this->selectedOrder) return;

        $this->validate();

        // Update Data Pesanan
        $this->selectedOrder->update([
            'status' => 'paid',
            'updated_at' => now(),
        ]);

        // POTONG STOK (Safe check inside model)
        $this->selectedOrder->reduceStock();

        session()->flash('success', 'Pembayaran berhasil! Stok telah diperbarui.');
    }

    /**
     * Selesaikan Pesanan (Arsip)
     */
    public function markAsCompleted($orderId)
    {
        $order = Order::find($orderId);
        if ($order && $order->status === 'paid') {
            $order->update(['status' => 'completed']);
            session()->flash('success', "Order #{$order->id} telah diselesaikan.");
        }
    }

    /**
     * --- LOGIKA QRIS PRIBADI ---
     */

    public function openQris()
    {
        if ($this->selectedOrder) {
            $this->isQrisModalOpen = true;
        }
    }

    public function closeQris()
    {
        $this->isQrisModalOpen = false;
    }

    public function markAsQrisPaid()
    {
        if ($this->selectedOrder) {
            $this->paymentAmount = $this->grandTotal;
            $this->markAsPaid();
            $this->closeQris();
        }
    }

    /**
     * Pemicu Cetak Langsung
     */
    public function printDirect($orderId)
    {
        $order = Order::with(['items.product', 'table'])->find($orderId);
        
        if ($order) {
            try {
                $printService = new \App\Services\PrintService();
                $printService->printDirect($order);
                session()->flash('success', 'Struk berhasil dikirim ke printer!');
            } catch (\Exception $e) {
                $this->addError('print_error', 'Gagal cetak: ' . $e->getMessage());
            }
        }
    }

    public function render()
    {
        $orders = Order::with('table')
            ->whereIn('status', ['served', 'paid'])
            ->where(function($q) {
                $q->where('customer_name', 'like', '%' . $this->search . '%')
                  ->orWhere('id', 'like', '%' . $this->search . '%');
            })
            ->latest()
            ->paginate(10);

        return view('livewire.admin.cashier', [
            'orders' => $orders
        ])->layout('components.admin-layout', ['header' => 'Kasir & Pembayaran']);
    }
}
