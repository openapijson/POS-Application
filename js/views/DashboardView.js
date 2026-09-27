const { ref, onMounted } = Vue;

const DashboardView = {
  name: 'DashboardView',
  
  template: `
    <div class="space-y-6 animate-fade-in pb-10">
      
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brandprimary/10 text-[10px] font-bold text-brandprimary mb-2 uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-brandprimary"></span>
            Ringkasan Sistem
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-brandtext mb-1">Dashboard Utama</h1>
          <p class="text-sm text-brandmuted">Ringkasan performa penjualan dan inventori toko hari ini</p>
        </div>
        
        <div class="flex items-center gap-2">
          <button @click="loadDashboardData" :disabled="loading" class="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
            <span class="material-symbols-outlined text-lg" :class="{'animate-spin': loading}">refresh</span>
          </button>
          <!-- Tombol jalan pintas ke POS (Jika User adalah Kasir/Admin) -->
          <button @click="$emit('change-view', 'pos-view')" class="px-4 py-2.5 bg-brandprimary hover:bg-brandprimaryhover text-white text-sm font-semibold rounded-xl shadow-sm shadow-brandprimary/30 transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">point_of_sale</span>
            Buka Mesin Kasir POS
          </button>
        </div>
      </div>

      <div v-if="loading && !summary" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Skeleton Loaders -->
        <div v-for="i in 4" :key="i" class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-32"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
        <span class="material-symbols-outlined">error</span>
        <p class="text-sm font-medium">{{ error }}</p>
      </div>

      <div v-else-if="summary" class="space-y-6">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Metrik 1: Pendapatan -->
          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-24 h-24 bg-brandprimary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div>
              <div class="flex justify-between items-start mb-2">
                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pendapatan</p>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">payments</span>
                </div>
              </div>
              <h3 class="text-3xl font-bold text-slate-800 tracking-tight">{{ formatRupiah(summary.revenue_today) }}</h3>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
               <div>
                 <span class="text-slate-400 block mb-0.5">Volume Order</span>
                 <span class="font-bold text-slate-700">{{ summary.transaction_count_today }} Transaksi</span>
               </div>
               <div class="text-right">
                 <span class="text-slate-400 block mb-0.5">Rata-rata/Basket</span>
                 <span class="font-bold text-slate-700">{{ formatRupiah(summary.average_basket_size) }}</span>
               </div>
            </div>
          </div>

          <!-- Metrik 2: Produk Terlaris -->
          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-3">
                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Produk Terlaris</p>
                <div class="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">local_fire_department</span>
                </div>
              </div>
              
              <div v-if="topProducts.length === 0" class="text-sm text-slate-400 py-2">Belum ada transaksi hari ini</div>
              <ul v-else class="space-y-2">
                <li v-for="(prod, idx) in topProducts.slice(0, 3)" :key="prod.id" class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2 overflow-hidden">
                    <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">{{ idx + 1 }}</span>
                    <span class="truncate text-slate-700 font-medium">{{ prod.name }}</span>
                  </div>
                  <span class="font-bold text-brandprimary text-xs shrink-0 ml-2 bg-emerald-50 px-1.5 py-0.5 rounded">{{ prod.qty_sold }} pcs</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Metrik 3: Nilai Inventori -->
          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
             <div>
              <div class="flex justify-between items-start mb-2">
                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Nilai Inventori</p>
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">inventory_2</span>
                </div>
              </div>
              <h3 class="text-2xl font-bold text-slate-800 tracking-tight">{{ formatRupiah(summary.total_inventory_value) }}</h3>
              <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">storefront</span>
                Tercatat <b>{{ summary.total_active_sku }}</b> SKU Aktif di Toko
              </p>
            </div>
          </div>

          <!-- Metrik 4: Alert Status -->
          <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
               :class="{'border-red-200 bg-red-50/30': lowStockAlerts.total_issues > 0}">
             <div>
              <div class="flex justify-between items-start mb-2">
                <p class="text-[11px] font-bold uppercase tracking-wider" :class="lowStockAlerts.total_issues > 0 ? 'text-red-500' : 'text-slate-500'">Status Perhatian</p>
                <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="lowStockAlerts.total_issues > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'">
                  <span class="material-symbols-outlined text-lg">{{ lowStockAlerts.total_issues > 0 ? 'warning' : 'check_circle' }}</span>
                </div>
              </div>
              <h3 class="text-3xl font-bold tracking-tight" :class="lowStockAlerts.total_issues > 0 ? 'text-red-600' : 'text-slate-800'">
                {{ lowStockAlerts.total_issues }} <span class="text-lg font-medium text-slate-500">SKU</span>
              </h3>
              <p class="text-xs mt-1" :class="lowStockAlerts.total_issues > 0 ? 'text-red-500' : 'text-slate-500'">
                {{ lowStockAlerts.total_issues > 0 ? 'Berada di bawah batas minimum pemesanan.' : 'Semua stok dalam keadaan aman.' }}
              </p>
            </div>
          </div>

        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" :class="lowStockAlerts.total_issues > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'"></span>
              <h2 class="text-base font-bold text-slate-800">Peringatan Stok Menipis</h2>
              <span v-if="lowStockAlerts.total_issues > 0" class="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-xs font-bold">{{ lowStockAlerts.total_issues }} SKU Perlu Tindakan</span>
            </div>
            
            <button v-if="lowStockAlerts.total_issues > 0" @click="$emit('change-view', 'product-view')" class="text-sm text-brandprimary hover:text-brandprimaryhover font-medium flex items-center gap-1 transition-colors">
              Ke Manajemen Produk <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th class="p-4 font-semibold">Barcode / SKU</th>
                  <th class="p-4 font-semibold">Nama Produk</th>
                  <th class="p-4 font-semibold">Kategori</th>
                  <th class="p-4 font-semibold text-center">Stok Tersisa</th>
                  <th class="p-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody v-if="lowStockAlerts.items && lowStockAlerts.items.length > 0" class="text-sm divide-y divide-slate-100">
                <tr v-for="item in lowStockAlerts.items" :key="item.id" class="hover:bg-slate-50 transition-colors">
                  <td class="p-4 text-slate-500 font-mono text-xs">{{ item.barcode }}</td>
                  <td class="p-4 text-slate-800 font-medium">{{ item.name }}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">{{ item.category }}</span>
                  </td>
                  <td class="p-4 text-center">
                    <span class="font-bold" :class="item.stock <= 5 ? 'text-red-600' : 'text-orange-600'">{{ item.stock }} Pcs</span>
                  </td>
                  <td class="p-4 text-center">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border" 
                         :class="item.stock <= 5 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'">
                      <span class="w-1.5 h-1.5 rounded-full" :class="item.stock <= 5 ? 'bg-red-500' : 'bg-orange-500'"></span>
                      {{ item.stock <= 5 ? 'KRITIS' : 'MENIPIS' }}
                    </div>
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr>
                  <td colspan="5" class="p-8 text-center text-slate-400">
                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">check_circle</span>
                    <p class="font-medium text-sm">Semua stok produk dalam kondisi aman.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `,

  setup() {
    const loading = ref(true);
    const error = ref('');
    
    // Data Container
    const summary = ref(null);
    const topProducts = ref([]);
    const lowStockAlerts = ref({ total_issues: 0, items: [] });

    const loadDashboardData = async () => {
      loading.value = true;
      error.value = '';
      
      const res = await apiRequest('reports.dashboard', {}, authState.token);
      
      // Deteksi Sesi Kedaluwarsa terpusat
      if (handleAuthError(res.message)) return;

      if (!res.success) {
        error.value = res.message || 'Gagal memuat data dashboard.';
        loading.value = false;
        return;
      }

      // Masukkan ke State
      summary.value = res.data.summary;
      topProducts.value = res.data.top_products || [];
      lowStockAlerts.value = res.data.low_stock_alerts || { total_issues: 0, items: [] };
      
      loading.value = false;
    };

    onMounted(() => {
      // Ambil data pertama kali saat halaman dimuat
      loadDashboardData();
    });

    return {
      loading,
      error,
      summary,
      topProducts,
      lowStockAlerts,
      formatRupiah,
      loadDashboardData
    };
  }
};