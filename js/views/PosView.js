const { onUnmounted } = Vue;
const PosView = {
  name: 'PosView',
  
  template: `
    <div class="h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-4 animate-fade-in pb-10 lg:pb-0">
      
      <!-- AREA KIRI: Scanner & Katalog -->
      <div class="flex-1 flex flex-col min-w-0 gap-4 h-full">
        
        <!-- Scanner & Search Box -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 shrink-0">
           <div class="flex items-center justify-between mb-1">
             <div class="flex items-center gap-2">
               <span class="w-2.5 h-2.5 rounded-full bg-brandprimary"></span>
               <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Input Produk</h2>
             </div>
             <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-mono">F2: Cari Manual</span>
           </div>

           <!-- Tombol Pop-up Kamera Kasir -->
           <button @click="startCamera" class="w-full py-3 md:py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all group">
              <span class="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">qr_code_scanner</span>
              <span class="text-sm font-bold tracking-wide">Pindai Barcode (Kamera)</span>
           </button>

           <!-- Input Barcode Manual -->
           <div class="relative flex items-center mt-2">
             <div class="absolute left-3 flex items-center justify-center text-slate-400">
                <span class="material-symbols-outlined text-xl">keyboard</span>
             </div>
             <input type="text" ref="barcodeInputRef" v-model="barcodeQuery" @keyup.enter="handleScan" :disabled="isScanning"
               class="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:bg-white transition-all font-mono"
               placeholder="Ketik SKU / Barcode manual...">
             <button @click="handleScan" :disabled="!barcodeQuery || isScanning" class="absolute right-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50">
               <span v-if="isScanning" class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
               <span v-else>ENTER ↵</span>
             </button>
           </div>
           
           <div v-if="scanError" class="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium bg-red-50 p-2 rounded-lg">
             <span class="material-symbols-outlined text-[14px]">error</span> {{ scanError }}
           </div>
        </div>

        <!-- Quick Catalog Grid -->
        <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0">
           <div class="flex items-center justify-between mb-4">
             <h3 class="text-sm font-bold text-slate-800">Katalog Cepat</h3>
             <div class="relative w-48">
               <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">search</span>
               <input type="text" v-model="catalogQuery" placeholder="Cari nama..." 
                 class="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brandprimary/50">
             </div>
           </div>

           <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
             <div v-if="loadingCatalog" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
               <div v-for="i in 8" :key="i" class="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
             </div>
             
             <div v-else-if="filteredCatalog.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                <p class="text-sm font-medium">Katalog kosong atau tidak ditemukan</p>
             </div>

             <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
               <button v-for="prod in filteredCatalog" :key="prod.id" @click="addFromCatalog(prod)" 
                 :disabled="prod.stock <= 0"
                 class="flex flex-col p-2.5 border border-slate-200 rounded-xl text-left transition-all group"
                 :class="prod.stock > 0 ? 'hover:border-brandprimary/50 hover:shadow-md hover:shadow-brandprimary/10 bg-white' : 'bg-slate-50 opacity-60 cursor-not-allowed'">
                 
                 <div class="w-full aspect-square bg-slate-100 rounded-lg mb-2 relative overflow-hidden flex items-center justify-center">
                   <img v-if="prod.image_file_id" :src="'https://drive.google.com/thumbnail?id=' + prod.image_file_id + '&sz=w800'" class="w-full h-full object-cover">
                   <img v-else-if="prod.image_url" :src="prod.image_url" class="w-full h-full object-cover">
                   <span v-else class="material-symbols-outlined text-slate-300 text-3xl">inventory_2</span>
                   
                   <div class="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm backdrop-blur-sm"
                     :class="prod.stock > 5 ? 'bg-white/90 text-slate-700' : (prod.stock > 0 ? 'bg-orange-100/90 text-orange-700' : 'bg-red-100/90 text-red-600')">
                     Stok: {{ prod.stock }}
                   </div>
                 </div>
                 
                 <h4 class="text-xs font-semibold text-slate-700 line-clamp-2 mb-1 flex-1 leading-tight group-hover:text-brandprimary transition-colors">{{ prod.name }}</h4>
                 <div class="flex items-center justify-between w-full mt-auto">
                   <span class="text-sm font-bold text-slate-800">{{ formatRupiah(prod.price) }}</span>
                   <div v-if="prod.stock > 0" class="w-6 h-6 rounded-md bg-brandprimary/10 text-brandprimary flex items-center justify-center group-hover:bg-brandprimary group-hover:text-white transition-colors">
                     <span class="material-symbols-outlined text-[16px]">add</span>
                   </div>
                 </div>
               </button>
             </div>
           </div>
        </div>
      </div>

      <!-- AREA KANAN: Keranjang (Cart) -->
      <div class="w-full lg:w-[380px] xl:w-[420px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col shrink-0 h-full overflow-hidden">
        
        <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-brandprimary">shopping_cart</span>
            <h2 class="text-base font-bold text-slate-800">Keranjang Transaksi</h2>
          </div>
          <button @click="clearCart" :disabled="cart.length === 0 || isCheckingOut" class="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-1 transition-colors">
            <span class="material-symbols-outlined text-[14px]">delete</span> Kosongkan
          </button>
        </div>

        <!-- Item List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
          
          <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 opacity-70">
            <span class="material-symbols-outlined text-5xl mb-3">shopping_cart_checkout</span>
            <p class="text-sm font-medium">Keranjang masih kosong</p>
            <p class="text-xs mt-1 text-center px-6">Scan barcode atau pilih produk dari katalog untuk mulai transaksi.</p>
          </div>

          <div v-else v-for="(item, index) in cart" :key="item.product.id" class="p-3 bg-white border border-slate-200 rounded-xl flex gap-3 shadow-sm relative group animate-fade-in-up" style="animation-duration: 0.2s">
            <div class="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-100">
               <img v-if="item.product.image_file_id" :src="'https://drive.google.com/thumbnail?id=' + item.product.image_file_id + '&sz=w800'" class="w-full h-full object-cover">
               <img v-else-if="item.product.image_url" :src="item.product.image_url" class="w-full h-full object-cover">
               <span v-else class="material-symbols-outlined text-slate-300 flex items-center justify-center w-full h-full text-xl">image</span>
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-between">
              <h4 class="text-xs font-bold text-slate-700 truncate pr-6">{{ item.product.name }}</h4>
              <p class="text-[11px] text-slate-500 mb-2">{{ formatRupiah(item.product.price) }} / unit</p>
              <div class="flex items-center justify-between">
                 <!-- QTY Controls -->
                 <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                   <button @click="decreaseQty(index)" class="w-7 h-6 bg-slate-50 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                     <span class="material-symbols-outlined text-[14px]">remove</span>
                   </button>
                   <span class="w-8 h-6 flex items-center justify-center text-xs font-bold text-slate-800 bg-white">{{ item.qty }}</span>
                   <button @click="increaseQty(index)" :disabled="item.qty >= item.product.stock" class="w-7 h-6 bg-slate-50 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors disabled:opacity-50">
                     <span class="material-symbols-outlined text-[14px]">add</span>
                   </button>
                 </div>
                 <span class="font-bold text-brandtext text-sm">{{ formatRupiah(item.subtotal) }}</span>
              </div>
            </div>
            <!-- Remove Btn -->
            <button @click="removeFromCart(index)" class="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100">
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        </div>

        <!-- Summary & Checkout Board -->
        <div class="border-t border-slate-200 bg-white shrink-0 shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)] z-10 relative">
          
          <div class="p-4 space-y-2 border-b border-slate-100">
             <div class="flex justify-between text-sm">
               <span class="text-slate-500">Subtotal ({{ cartTotalItems }} item)</span>
               <span class="font-semibold text-slate-700">{{ formatRupiah(cartTotalAmount) }}</span>
             </div>
             <div class="flex justify-between items-end pt-2 border-t border-slate-100 border-dashed">
               <span class="text-sm font-bold text-slate-800 uppercase tracking-wide">Total Akhir</span>
               <span class="text-2xl font-black text-brandprimary tracking-tight">{{ formatRupiah(cartTotalAmount) }}</span>
             </div>
          </div>

          <div class="p-4 bg-slate-50">
             <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Uang Diterima (Cash Tender)</label>
             <div class="grid grid-cols-4 gap-2 mb-3">
                <button @click="setExactAmount" class="col-span-2 py-2 bg-white border border-slate-200 hover:border-brandprimary rounded-lg text-xs font-bold text-slate-700 transition-colors shadow-sm">
                  UANG PAS
                </button>
                <button @click="addAmount(50000)" class="py-2 bg-white border border-slate-200 hover:border-brandprimary rounded-lg text-xs font-bold text-slate-700 transition-colors shadow-sm">
                  50K
                </button>
                <button @click="addAmount(100000)" class="py-2 bg-white border border-slate-200 hover:border-brandprimary rounded-lg text-xs font-bold text-slate-700 transition-colors shadow-sm">
                  100K
                </button>
             </div>
             
             <div class="relative mb-3">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                <input type="number" v-model="paymentAmount" min="0" placeholder="0"
                  class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:border-brandprimary shadow-inner">
             </div>

             <div v-if="paymentAmount > 0" class="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg mb-4">
               <span class="text-xs font-bold text-emerald-700">Kembalian</span>
               <span class="text-sm font-black text-emerald-700" :class="{'text-red-600': changeAmount < 0}">
                 {{ changeAmount >= 0 ? formatRupiah(changeAmount) : 'UANG KURANG' }}
               </span>
             </div>

             <div v-if="checkoutError" class="mb-3 p-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-medium flex items-start gap-1.5">
               <span class="material-symbols-outlined text-[16px]">error</span>
               <span>{{ checkoutError }}</span>
             </div>

             <button @click="processCheckout" 
               :disabled="cart.length === 0 || changeAmount < 0 || isCheckingOut"
               class="w-full py-4 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex justify-center items-center gap-2"
               :class="(cart.length === 0 || changeAmount < 0) ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-brandprimary hover:bg-brandprimaryhover shadow-brandprimary/30'">
               <span v-if="isCheckingOut" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
               <span v-else class="material-symbols-outlined text-lg">point_of_sale</span>
               {{ isCheckingOut ? 'MEMPROSES...' : 'SELESAIKAN TRANSAKSI (F10)' }}
             </button>
          </div>

        </div>
      </div>

      <!-- MODAL SCANNER POS (POP-UP) -->
      <div v-if="showScannerModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm" @click.self="stopCamera">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all text-center border border-slate-700">
           <div class="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
               <span class="material-symbols-outlined text-brandprimary text-[18px]">qr_code_scanner</span> 
               Mode Pemindai Kasir Aktif
             </h3>
             <button type="button" @click="stopCamera" class="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors">
               <span class="material-symbols-outlined text-[18px]">close</span>
             </button>
           </div>
           
           <!-- WADAH KAMERA -->
           <div class="p-4 bg-slate-900 relative flex items-center justify-center min-h-[300px]">
              <div id="qr-reader" class="w-full rounded-xl overflow-hidden shadow-inner bg-black"></div>
           </div>
           
           <div class="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold flex flex-col items-center gap-1 border-t border-emerald-100">
             <span class="material-symbols-outlined animate-pulse">barcode_scanner</span>
             Barang yang dipindai akan otomatis ditambahkan ke keranjang!
             <span class="font-normal text-emerald-600 mt-1">Tekan di luar area putih ini untuk menutup kamera.</span>
           </div>
        </div>
      </div>

      <!-- MODAL STRUK/SUKSES -->
      <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm" @click.self="resetPos">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-hidden flex flex-col transform transition-all text-center relative">
          <!-- Ornamen sukses -->
          <div class="absolute -top-16 -left-16 w-32 h-32 bg-emerald-100 rounded-full blur-2xl"></div>
          <div class="absolute -top-16 -right-16 w-32 h-32 bg-blue-100 rounded-full blur-2xl"></div>

          <div class="p-6 pt-10 flex-1 overflow-y-auto custom-scrollbar relative z-10">
            <div class="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30 text-white animate-bounce" style="animation-iteration-count: 1;">
              <span class="material-symbols-outlined text-5xl">check_circle</span>
            </div>
            <h2 class="text-2xl font-black text-slate-800 mb-1">Berhasil!</h2>
            <p class="text-sm text-slate-500 font-mono bg-slate-50 inline-block px-3 py-1 rounded-md mb-6 border border-slate-100">
              #{{ lastTransaction.receipt_no }}
            </p>

            <div class="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 space-y-3 text-left relative overflow-hidden">
              <div class="absolute top-0 left-0 w-full h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjQiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsNCA4LDAiIGZpbGw9IiNmOGZhZmMiLz48L3N2Zz4=')] opacity-50"></div>
              
              <div class="flex justify-between items-center text-sm border-b border-slate-200/50 pb-2">
                <span class="text-slate-500">Total Belanja</span>
                <span class="font-bold text-slate-700">{{ formatRupiah(lastTransaction.total_amount) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm border-b border-slate-200/50 pb-2">
                <span class="text-slate-500">Tunai Diterima</span>
                <span class="font-bold text-slate-700">{{ formatRupiah(lastTransaction.payment_amount) }}</span>
              </div>
              <div class="flex justify-between items-center text-base pt-1">
                <span class="font-bold text-emerald-600">Kembalian</span>
                <span class="font-black text-emerald-600">{{ formatRupiah(lastTransaction.change_amount) }}</span>
              </div>
              
              <div class="absolute bottom-0 left-0 w-full h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjQiPjxwb2x5Z29uIHBvaW50cz0iMCw0IDQsMCA4LDQiIGZpbGw9IiNmOGZhZmMiLz48L3N2Zz4=')] opacity-50"></div>
            </div>
            <p class="text-xs text-slate-400 mb-2">Harap serahkan struk dan uang kembalian ke pelanggan.</p>
          </div>
          
          <div class="p-4 border-t border-slate-100 bg-white grid grid-cols-2 gap-3 z-10">
            <button @click="printReceipt" class="py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">print</span> Cetak Struk
            </button>
            <button @click="resetPos" class="py-3 rounded-xl bg-brandprimary text-white font-bold text-sm hover:bg-brandprimaryhover shadow-lg shadow-brandprimary/30 transition-colors flex items-center justify-center gap-2">
              Transaksi Baru <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,

  setup() {
    const { ref, computed, onMounted, onUnmounted } = Vue;
    
    const catalog = ref([]);
    const loadingCatalog = ref(true);
    const catalogQuery = ref('');
    
    const barcodeInputRef = ref(null);
    const barcodeQuery = ref('');
    const isScanning = ref(false);
    const scanError = ref('');

    // State Kamera Scanner Pop-up
    const showScannerModal = ref(false);
    let html5QrCode = null;
    let lastScanTime = 0; 

    // State Cart
    const cart = ref([]);
    const paymentAmount = ref('');
    const isCheckingOut = ref(false);
    const checkoutError = ref('');
    const showSuccessModal = ref(false);
    const lastTransaction = ref({});

    const filteredCatalog = computed(() => {
      if (!catalogQuery.value) return catalog.value;
      const q = catalogQuery.value.toLowerCase();
      return catalog.value.filter(p => p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q));
    });

    const cartTotalAmount = computed(() => cart.value.reduce((sum, item) => sum + item.subtotal, 0));
    const cartTotalItems = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0));
    const changeAmount = computed(() => (parseFloat(paymentAmount.value) || 0) - cartTotalAmount.value);

    const loadCatalog = async () => {
      loadingCatalog.value = true;
      const res = await apiRequest('products.list', {}, authState.token);
      if (handleAuthError(res.message)) return;
      if (res.success) {
         catalog.value = res.data.filter(p => p.status === 'Active');
      }
      loadingCatalog.value = false;
    };

    const addFromCatalog = (prod) => {
      if (prod.stock <= 0) {
        scanError.value = `Stok ${prod.name} habis.`;
        setTimeout(() => scanError.value = '', 3000);
        return;
      }
      const existingIdx = cart.value.findIndex(item => item.product.id === prod.id);
      if (existingIdx !== -1) {
        if (cart.value[existingIdx].qty + 1 > prod.stock) {
           scanError.value = `Maksimal stok tercapai untuk ${prod.name}`;
           setTimeout(() => scanError.value = '', 3000);
           return;
        }
        cart.value[existingIdx].qty++;
        cart.value[existingIdx].subtotal = cart.value[existingIdx].qty * prod.price;
      } else {
        cart.value.unshift({ // Tambah di paling atas agar terlihat jelas
          product: prod,
          qty: 1,
          unit_price: prod.price,
          subtotal: prod.price
        });
      }
      scanError.value = ''; 
    };

    const increaseQty = (idx) => {
      const item = cart.value[idx];
      if (item.qty < item.product.stock) {
        item.qty++;
        item.subtotal = item.qty * item.product.price;
      }
    };
    const decreaseQty = (idx) => {
      const item = cart.value[idx];
      if (item.qty > 1) {
        item.qty--;
        item.subtotal = item.qty * item.product.price;
      } else {
        removeFromCart(idx);
      }
    };
    const removeFromCart = (idx) => cart.value.splice(idx, 1);
    const clearCart = () => { cart.value = []; paymentAmount.value = ''; scanError.value = ''; checkoutError.value = ''; };

    const handleScan = async () => {
      const code = barcodeQuery.value.trim();
      if (!code) return;

      isScanning.value = true;
      scanError.value = '';

      const localMatch = catalog.value.find(p => p.barcode === code);
      if (localMatch) {
         addFromCatalog(localMatch);
         isScanning.value = false;
         barcodeQuery.value = '';
         return;
      }

      const res = await apiRequest('products.getByBarcode', { barcode: code }, authState.token);
      if (handleAuthError(res.message)) { isScanning.value = false; return; }

      if (res.success) {
         addFromCatalog(res.data);
      } else {
         scanError.value = res.message || 'Barcode tidak dikenali.';
         setTimeout(() => scanError.value = '', 3000);
      }
      isScanning.value = false;
      barcodeQuery.value = '';
    };

    const startCamera = () => {
      scanError.value = '';
      showScannerModal.value = true;
      
      console.log("[POS] Membuka modal kamera...");
      
      // Delay 500ms agar rendering DOM (div #qr-reader) 100% selesai
      setTimeout(() => {
        console.log("[POS] Inisialisasi Html5Qrcode pada elemen 'qr-reader'...");
        try {
          if (!document.getElementById("qr-reader")) {
             console.error("[POS] ERROR: Elemen div 'qr-reader' tidak ditemukan di layar!");
             return;
          }

          html5QrCode = new Html5Qrcode("qr-reader"); 
          console.log("[POS] Library Html5Qrcode berhasil dimuat.");

          html5QrCode.start(
            { facingMode: "environment" }, 
            {
              fps: 10,
              // Perlebar area scan untuk barcode memanjang
              qrbox: { width: 300, height: 150 },
              // FITUR RAHASIA: Gunakan scanner bawaan HP/Chrome jika tersedia (Sangat Cepat)
              experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
              }
              // HAPUS formatsToSupport agar dia mau baca SEMUA jenis barcode
            },
            (decodedText) => {
              console.log("[POS] YES! BARCODE KETEMU: ", decodedText);
              onScanSuccess(decodedText);
            },
            (errorMessage) => { /* Abaikan error per-frame pencarian */ }
          ).then(() => {
             console.log("[POS] Kamera SUKSES menyala.");
          }).catch((err) => {
             console.error("[POS] Kamera GAGAL menyala:", err);
             scanError.value = "Kamera gagal menyala: " + err;
          });
        } catch (err) {
          console.error("[POS] Terjadi error fatal saat setup kamera:", err);
          scanError.value = "Library kamera error. Cek console log.";
        }
      }, 500); 
    };

    const stopCamera = async () => {
      if (html5QrCode) {
        try {
          await html5QrCode.stop();
          html5QrCode.clear();
        } catch (err) {}
      }
      showScannerModal.value = false;
      html5QrCode = null;
    };

    const onScanSuccess = (decodedText) => {
      const now = Date.now();
      if (now - lastScanTime < 2000) return; // Jeda 2 detik antar scan barang yang sama
      lastScanTime = now;

      // Beep Sukses
      try {
         const ctx = new (window.AudioContext || window.webkitAudioContext)();
         const osc = ctx.createOscillator();
         osc.connect(ctx.destination);
         osc.frequency.value = 800; 
         osc.start();
         osc.stop(ctx.currentTime + 0.1); 
      } catch(e) {}

      barcodeQuery.value = decodedText;
      handleScan(); 
      // JANGAN PANGGIL stopCamera() di sini agar kasir bisa terus scan barang berikutnya!
    };

    const setExactAmount = () => paymentAmount.value = cartTotalAmount.value;
    const addAmount = (amt) => paymentAmount.value = (parseFloat(paymentAmount.value) || 0) + amt;

    const processCheckout = async () => {
      if (cart.value.length === 0 || changeAmount.value < 0) return;
      checkoutError.value = '';
      isCheckingOut.value = true;

      const payload = {
        payment_amount: parseFloat(paymentAmount.value),
        items: cart.value.map(item => ({ product_id: item.product.id, qty: item.qty }))
      };

      const res = await apiRequest('pos.checkout', payload, authState.token);
      isCheckingOut.value = false;
      if (handleAuthError(res.message)) return;

      if (!res.success) { checkoutError.value = res.message; return; }
      
      lastTransaction.value = res.data;
      showSuccessModal.value = true;
      
      cart.value.forEach(item => {
        const catIdx = catalog.value.findIndex(p => p.id === item.product.id);
        if (catIdx !== -1) catalog.value[catIdx].stock -= item.qty;
      });
    };

    const resetPos = () => { showSuccessModal.value = false; clearCart(); };
    const printReceipt = () => alert(`Mencetak Struk: ${lastTransaction.value.receipt_no}`);
    
    const focusScanner = () => {
       if (barcodeInputRef.value && !showScannerModal.value) setTimeout(() => barcodeInputRef.value.focus(), 50);
    };

    const handleKeydown = (e) => {
      if (showSuccessModal.value) {
        if (e.key === 'Enter' || e.key === 'Escape') resetPos();
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        focusScanner();
      } else if (e.key === 'F10') {
        e.preventDefault();
        if (cart.value.length > 0 && changeAmount.value >= 0 && !isCheckingOut.value) processCheckout();
      }
    };

    onMounted(() => {
      loadCatalog();
      window.addEventListener('keydown', handleKeydown);
      focusScanner();
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown);
      stopCamera();
    });

    return {
      catalog, loadingCatalog, catalogQuery, filteredCatalog, barcodeInputRef, barcodeQuery, isScanning, scanError,
      showScannerModal, cart, paymentAmount, isCheckingOut, checkoutError, showSuccessModal, lastTransaction,
      cartTotalAmount, cartTotalItems, changeAmount, formatRupiah, addFromCatalog, increaseQty, decreaseQty,
      removeFromCart, clearCart, handleScan, startCamera, stopCamera, setExactAmount, addAmount, processCheckout,
      resetPos, printReceipt
    };
  }
};
