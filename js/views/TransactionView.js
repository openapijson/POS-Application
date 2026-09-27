const { onMounted } = Vue;

const TransactionView = {
  name: 'TransactionView',
  
  template: `
    <div class="space-y-6 animate-fade-in pb-10">
      
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brandprimary/10 text-[10px] font-bold text-brandprimary mb-2 uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-brandprimary"></span>
            Store Log &bull; Sinkronisasi Aktif
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-brandtext mb-1">Riwayat Transaksi Penjualan</h1>
          <p class="text-sm text-brandmuted">Pantau seluruh rekaman struk transaksi kasir secara real-time</p>
        </div>
        
        <div class="flex items-center gap-2">
          <button @click="loadTransactions" :disabled="loading" class="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
            <span class="material-symbols-outlined text-lg" :class="{'animate-spin': loading}">refresh</span>
          </button>
        </div>
      </div>

      <div v-if="globalError" class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 shadow-sm">
        <span class="material-symbols-outlined">error</span>
        <p class="text-sm font-medium">{{ globalError }}</p>
        <button @click="globalError = ''" class="ml-auto text-red-400 hover:text-red-600">
           <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        <!-- Toolbar Bar -->
        <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
           <div class="relative flex-1">
             <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
             <input type="text" v-model="searchQuery" placeholder="Ketik No Struk..." 
               class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:border-brandprimary transition-colors font-mono placeholder:font-sans">
           </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th class="p-4 font-semibold w-48">No Struk</th>
                <th class="p-4 font-semibold">Waktu Transaksi</th>
                <th class="p-4 font-semibold text-right">Total Belanja</th>
                <th class="p-4 font-semibold text-center">Metode</th>
                <th class="p-4 font-semibold text-center">Status</th>
                <th class="p-4 font-semibold text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody v-if="loading" class="divide-y divide-slate-100">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td class="p-4"><div class="w-32 h-4 bg-slate-200 rounded"></div></td>
                <td class="p-4"><div class="w-32 h-4 bg-slate-200 rounded"></div></td>
                <td class="p-4"><div class="w-24 h-4 bg-slate-200 rounded ml-auto"></div></td>
                <td class="p-4"><div class="w-16 h-6 bg-slate-200 rounded-full mx-auto"></div></td>
                <td class="p-4"><div class="w-16 h-6 bg-slate-200 rounded-full mx-auto"></div></td>
                <td class="p-4"><div class="w-10 h-8 bg-slate-200 rounded mx-auto"></div></td>
              </tr>
            </tbody>
            <tbody v-else-if="filteredTransactions.length === 0" class="divide-y divide-slate-100">
              <tr>
                <td colspan="6" class="p-12 text-center text-slate-400">
                  <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span class="material-symbols-outlined text-3xl opacity-50">receipt_long</span>
                  </div>
                  <p class="font-medium text-sm text-slate-600 mb-1">Belum ada transaksi</p>
                  <p class="text-xs">Data transaksi akan muncul di sini setelah checkout di modul POS.</p>
                </td>
              </tr>
            </tbody>
            <tbody v-else class="text-sm divide-y divide-slate-100">
              <tr v-for="trx in filteredTransactions" :key="trx.id" class="hover:bg-slate-50 transition-colors group">
                <td class="p-4">
                  <p class="font-mono text-xs font-bold text-brandprimary">{{ trx.receipt_no }}</p>
                </td>
                <td class="p-4">
                  <p class="text-slate-800 font-medium">{{ formatDate(trx.created_at) }}</p>
                  <p class="text-[11px] text-slate-500">{{ formatTime(trx.created_at) }} WIB</p>
                </td>
                <td class="p-4 text-right">
                  <p class="font-bold text-slate-800">{{ formatRupiah(trx.total_amount) }}</p>
                </td>
                <td class="p-4 text-center">
                  <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-semibold text-slate-600 bg-white">
                    <span class="material-symbols-outlined text-[14px]">payments</span> Tunai
                  </div>
                </td>
                <td class="p-4 text-center">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Lunas
                  </div>
                </td>
                <td class="p-4 text-center">
                  <button @click="openReceipt(trx)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-brandprimary/10 text-slate-500 hover:text-brandprimary flex items-center justify-center transition-colors tooltip-trigger mx-auto" title="Lihat Struk">
                    <span class="material-symbols-outlined text-[18px]">receipt</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
           <span>Menampilkan <b>{{ filteredTransactions.length }}</b> transaksi.</span>
        </div>
      </div>

      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm" @click.self="closeModal">
        <div class="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col transform transition-all relative">
          
          <div class="px-5 py-4 bg-white flex items-center justify-between z-20 shadow-sm">
            <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span class="material-symbols-outlined text-brandprimary text-lg">receipt_long</span> 
              Preview Struk Digital
            </h3>
            <button @click="closeModal" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <!-- Konten Struk Termal Ber-scroll -->
          <div class="p-6 overflow-y-auto flex-1 custom-scrollbar flex justify-center bg-slate-200 relative">
            
            <div v-if="modalLoading" class="flex flex-col items-center justify-center h-48 text-slate-500">
              <span class="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
              <p class="text-xs font-medium">Menarik detail transaksi...</p>
            </div>
            
            <div v-else-if="modalError" class="p-4 bg-red-50 text-red-600 rounded-lg text-sm w-full text-center border border-red-200">
              {{ modalError }}
            </div>

            <div v-else class="w-full max-w-[320px] bg-white shadow-lg relative pb-8">
              <!-- Efek zig-zag atas -->
              <div class="absolute -top-1 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCw4IDQsMCA4LDggMCw4IiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+')] z-10"></div>
              
              <div class="p-6 font-mono text-[11px] text-slate-800 leading-relaxed">
                <!-- Header Toko -->
                <div class="text-center mb-4">
                  <h2 class="font-bold text-base mb-1 uppercase">{{ APP_CONFIG.APP_NAME }}</h2>
                  <p class="text-[10px] text-slate-500">Pusat Ritel & Inventori<br>Sistem Decoupled V2</p>
                </div>
                
                <div class="border-b border-dashed border-slate-300 pb-2 mb-2 space-y-1">
                  <div class="flex justify-between"><span class="text-slate-500">NO. STRUK</span><span class="font-bold">{{ selectedTrx.receipt_no }}</span></div>
                  <div class="flex justify-between"><span class="text-slate-500">TANGGAL</span><span>{{ formatDate(selectedTrx.created_at) }}</span></div>
                  <div class="flex justify-between"><span class="text-slate-500">WAKTU</span><span>{{ formatTime(selectedTrx.created_at) }}</span></div>
                  <div class="flex justify-between"><span class="text-slate-500">KASIR</span><span class="truncate max-w-[120px]">{{ selectedTrx.kasir_name || 'System' }}</span></div>
                </div>

                <div class="border-b border-dashed border-slate-300 pb-2 mb-2">
                  <div class="flex justify-between font-bold mb-1">
                    <span>ITEM PRODUK</span>
                    <span>TOTAL</span>
                  </div>
                  
                  <div v-for="item in selectedTrx.items" :key="item.id" class="mb-2">
                    <div class="truncate font-medium">{{ item.name }}</div>
                    <div class="flex justify-between text-slate-500">
                      <span>{{ item.qty }} x {{ formatRupiah(item.unit_price) }}</span>
                      <span class="text-slate-800">{{ formatRupiah(item.subtotal) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="space-y-1 mb-4">
                  <div class="flex justify-between">
                    <span class="text-slate-500">Subtotal ({{ selectedTrx.items?.length || 0 }} Item)</span>
                    <span>{{ formatRupiah(selectedTrx.total_amount) }}</span>
                  </div>
                  <div class="flex justify-between text-sm font-bold pt-1 border-t border-dashed border-slate-300 mt-1">
                    <span>TOTAL AKHIR</span>
                    <span>{{ formatRupiah(selectedTrx.total_amount) }}</span>
                  </div>
                </div>

                <div class="space-y-1 pt-2 border-t border-dashed border-slate-300">
                  <div class="flex justify-between">
                    <span class="text-slate-500">TUNAI (CASH)</span>
                    <span>{{ formatRupiah(selectedTrx.payment_amount) }}</span>
                  </div>
                  <div class="flex justify-between font-bold">
                    <span>KEMBALIAN</span>
                    <span>{{ formatRupiah(selectedTrx.change_amount) }}</span>
                  </div>
                </div>
                
                <!-- Footer & Barcode Dummy -->
                <div class="mt-8 text-center text-slate-500">
                  <p class="mb-3">*** TERIMA KASIH ***</p>
                  <div class="w-full h-12 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIj48cGF0aCBkPSJNMTAgMTBoMTB2ODBIMTB6TTMwIDEwaDIwdjgwSDMweiM2MCAxMGg1djgwSDYweiM3NSAxMGgxMHY4MEg3NXpNOTUgMTBoMTV2ODBIMTV6IiBmaWxsPSIjMzMzIi8+PC9zdmc+')] bg-contain bg-center bg-no-repeat opacity-50 mb-1"></div>
                  <p class="text-[9px] tracking-widest">{{ selectedTrx.receipt_no }}</p>
                </div>
              </div>
              
              <!-- Efek zig-zag bawah -->
              <div class="absolute -bottom-1 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAgMCwwIiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+')] z-10"></div>
            </div>

          </div>
          
          <div class="px-5 py-4 bg-white flex justify-end gap-3 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-slate-100">
             <button @click="closeModal" class="px-5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors">
               Tutup
             </button>
             <button @click="printReceipt" :disabled="modalLoading || modalError" class="px-6 py-2 rounded-xl bg-brandprimary hover:bg-brandprimaryhover text-white text-sm font-semibold shadow-sm shadow-brandprimary/30 transition-colors disabled:opacity-70 flex items-center gap-2">
               <span class="material-symbols-outlined text-[18px]">print</span> Cetak
             </button>
          </div>
        </div>
      </div>

    </div>
  `,

  setup() {
    const loading = ref(true);
    const globalError = ref('');
    const searchQuery = ref('');
    
    const transactions = ref([]);
    
    // Modal State
    const showModal = ref(false);
    const modalLoading = ref(false);
    const modalError = ref('');
    const selectedTrx = ref({});

    const filteredTransactions = computed(() => {
      if (!searchQuery.value) return transactions.value;
      const q = searchQuery.value.toLowerCase();
      return transactions.value.filter(t => 
        (t.receipt_no && t.receipt_no.toLowerCase().includes(q))
      );
    });

    const loadTransactions = async () => {
      loading.value = true;
      globalError.value = '';
      
      const res = await apiRequest('transactions.list', {}, authState.token);
      
      if (handleAuthError(res.message)) return;

      if (!res.success) {
        globalError.value = res.message || 'Gagal memuat histori transaksi.';
      } else {
        transactions.value = res.data || [];
      }
      loading.value = false;
    };

    const openReceipt = async (trx) => {
      showModal.value = true;
      modalLoading.value = true;
      modalError.value = '';
      selectedTrx.value = {}; // Reset

      // Tarik detail lengkap dari server (termasuk item dan join nama kasir)
      const res = await apiRequest('transactions.get', { id: trx.id }, authState.token);
      
      modalLoading.value = false;
      
      if (handleAuthError(res.message)) {
         showModal.value = false;
         return;
      }

      if (!res.success) {
        modalError.value = res.message || 'Gagal memuat detail struk.';
      } else {
        selectedTrx.value = res.data;
      }
    };

    const closeModal = () => {
      showModal.value = false;
      setTimeout(() => {
         selectedTrx.value = {};
      }, 300); // clear after animation
    };

    const printReceipt = () => {
      // Dummy integrasi printer lokal
      const docNo = selectedTrx.value.receipt_no;
      if(docNo) {
        alert(`Perintah cetak dikirim ke printer kasir untuk struk: ${docNo}`);
      }
    };

    // Helper Formatting (bisa diekstraksi ke utils.js, tapi simpan lokal untuk isolated component)
    const formatDate = (isoString) => {
      if (!isoString) return '-';
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (isoString) => {
      if (!isoString) return '-';
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    onMounted(() => {
      loadTransactions();
    });

    return {
      loading,
      globalError,
      searchQuery,
      transactions,
      filteredTransactions,
      showModal,
      modalLoading,
      modalError,
      selectedTrx,
      APP_CONFIG,
      formatRupiah,
      formatDate,
      formatTime,
      loadTransactions,
      openReceipt,
      closeModal,
      printReceipt
    };
  }
};