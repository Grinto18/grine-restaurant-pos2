<div class="p-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 class="text-3xl font-black text-slate-800 tracking-tight">Dapur (KDS)</h1>
            <p class="text-slate-500 text-sm">Kitchen Display System - Monitor pesanan masuk secara real-time.</p>
        </div>
        
        <div wire:poll.10s class="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
            <div class="flex h-3 w-3 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
            </div>
            <span class="text-xs font-bold text-indigo-700 uppercase tracking-wider">Antrian Aktif: {{ $orders->count() }}</span>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @forelse($orders as $order)
            <div class="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full group hover:border-indigo-200 transition-all duration-300">
                
                {{-- HEADER ORDER --}}
                <div class="p-6 border-b border-slate-50 {{ $order->status === 'cooking' ? 'bg-orange-50/50' : 'bg-blue-50/50' }} transition-colors">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-2xl font-black text-slate-800">#{{ $order->id }}</span>
                            <span class="block text-sm font-bold text-indigo-600 uppercase tracking-widest mt-1">{{ $order->table->name ?? 'Takeaway' }}</span>
                        </div>
                        <div class="text-right">
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                {{ $order->status === 'cooking' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-blue-100 text-blue-700 border border-blue-200' }}">
                                {{ $order->status === 'cooking' ? 'Sedang Dimasak' : 'Menunggu' }}
                            </span>
                            <span class="text-[10px] font-bold text-slate-400 block mt-2 uppercase">{{ $order->created_at->diffForHumans() }}</span>
                        </div>
                    </div>
                </div>
                
                {{-- DAFTAR ITEM --}}
                <div class="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <div class="space-y-5">
                        @foreach($order->items as $item)
                            <div class="relative pl-4 border-l-4 border-slate-100 group-hover:border-indigo-100 transition-colors">
                                <div class="flex justify-between items-start">
                                    <span class="font-black text-slate-800 text-lg leading-tight">{{ $item->quantity }}x {{ $item->product->name }}</span>
                                </div>
                                
                                {{-- TAMPILKAN VARIAN / OPSIONAL --}}
                                @if($item->selectedVariants->isNotEmpty())
                                    <div class="mt-2 flex flex-wrap gap-1">
                                        @foreach($item->selectedVariants as $variant)
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                {{ $variant->option_name }}
                                            </span>
                                        @endforeach
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </div>

                    {{-- CATATAN ORDER (GLOBAL) --}}
                    @if($order->note)
                        <div class="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                            <div class="flex items-center gap-2 mb-1 text-amber-700">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                                <span class="text-[10px] font-black uppercase tracking-wider">Catatan Pesanan:</span>
                            </div>
                            <p class="text-sm font-medium text-amber-800 leading-relaxed">{{ $order->note }}</p>
                        </div>
                    @endif
                </div>

                {{-- ACTION BUTTONS --}}
                <div class="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
                    @if($order->status === 'pending')
                        <button wire:click="markAsCooking({{ $order->id }})" 
                                wire:loading.attr="disabled"
                                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2">
                            <svg wire:loading.remove wire:target="markAsCooking" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            <svg wire:loading wire:target="markAsCooking" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            PROSES MASAK
                        </button>
                    @elseif($order->status === 'cooking')
                        <button wire:click="markAsServed({{ $order->id }})" 
                                wire:loading.attr="disabled"
                                class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2">
                            <svg wire:loading.remove wire:target="markAsServed" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            <svg wire:loading wire:target="markAsServed" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            SIAP SAJI
                        </button>
                    @endif
                </div>
            </div>
        @empty
            <div class="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <div class="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p class="text-xl font-bold text-slate-400 uppercase tracking-widest">Dapur Masih Kosong</p>
                <p class="text-slate-400 text-sm mt-2">Menunggu pesanan baru masuk dari meja...</p>
            </div>
        @endforelse
    </div>
</div>
