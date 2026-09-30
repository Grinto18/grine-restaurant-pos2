<?php

namespace App\Livewire\Admin;

use App\Models\Order;
use Livewire\Component;
use Livewire\Attributes\On;
use Livewire\Attributes\Title;

#[Title('Kitchen Display System')]
class Kitchen extends Component
{
    // Listen for the OrderCreated event on the 'kitchen' channel
    #[On('echo:kitchen,OrderCreated')]
    public function refreshOrders()
    {
        // This method just triggers a re-render
    }

    public function markAsCooking($orderId)
    {
        $order = Order::find($orderId);

        if ($order && $order->status === 'pending') {
            $order->update(['status' => 'cooking']);
            // Optionally dispatch an event for the waiter view
        }
    }

    public function markAsServed($orderId)
    {
        $order = Order::find($orderId);

        if ($order && $order->status === 'cooking') {
            $order->update(['status' => 'served']);
            
            // Deduct stock here if not already handled by an observer/event
            $order->reduceStock(); 
        }
    }

    public function render()
    {
        return view('livewire.admin.kitchen', [
            'orders' => Order::with(['items.product', 'table'])
                ->whereIn('status', ['pending', 'cooking'])
                ->orderBy('created_at', 'asc')
                ->get()
        ]);
    }
}
