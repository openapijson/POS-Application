const { onUnmounted, useAuth } = Vue;
const PosView = {
  template: `
    <div class="h-full flex flex-col md:flex-row gap-6">
      <!-- Area Kiri: Daftar Produk (Katalog) -->
      <div class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Header Katalog & Pencarian -->
        <div class="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <h2 class="text-lg font-bold text-gray-800">Katalog Cepat</h2>
            <button 
              @click="startCamera"
              class="flex-shrink-0 flex items-center gap-2 bg-brandprimary hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <span class="material-symbols-outlined text-[18px]">barcode_scanner</span>
              <span>Scan (F2)</span>
            </button>
          </div>
          <div class="relative w-full sm:w-64">
            <span class="material-symbols-outlined absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-[18px]">search</span>
            <input v-model="searchQuery" type="text" placeholder="Cari nama atau SKU..." 
              class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brandprimary focus:ring-1 focus:ring-brandprimary text-sm transition-shadow">
          </div>
        </div>

        <!-- Grid Produk -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div v-if="loading" class="flex justify-center items-center h-32">
            <span class="material-symbols-outlined animate-spin text-3xl text-brandprimary">progress_activity</span>
          </div>
          <div v-else-if="filteredProducts.length === 0" class="text-center text-gray-500 mt-10">
            <p>Tidak ada produk ditemukan.</p>
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="product in filteredProducts" :key="product.id" 
                 @click="addToCart(product)"
                 class="group bg-white border border-gray-100 rounded-xl p-3 cursor-pointer hover:border-brandprimary hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full">
              
              <div class="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10"
                   :class="product.stock <= 10 ? 'text-red-600' : 'text-gray-700'">
                Stok: {{ product.stock }}
              </div>
              
              <div class="aspect-square w-full bg-gray-50 rounded-lg mb-3 overflow-hidden flex items-center justify-center relative">
                <img v-if="product.image_file_id" :src="'https://drive.google.com/thumbnail?id=' + product.image_file_id + '&sz=w400'" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" loading="lazy">
                <span v-else class="material-symbols-outlined text-4xl text-gray-300">inventory_2</span>
              </div>
              
              <div class="flex-1 flex flex-col justify-between">
                <h3 class="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">{{ product.name }}</h3>
                <div class="flex justify-between items-center mt-2">
                  <p class="text-brandprimary font-bold text-sm">{{ formatRupiah(product.price) }}</p>
                  <div class="w-6 h-6 rounded-full bg-emerald-50 text-brandprimary flex items-center justify-center group-hover:bg-brandprimary group-hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-[16px]">add</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Area Kanan: Keranjang (Cart) -->
      <div class="w-full md:w-96 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
        <div class="p-4 bg-gray-800 text-white border-b border-gray-700 flex justify-between items-center">
          <h2 class="font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-gray-300">shopping_cart</span>
            Keranjang Belanja
          </h2>
          <span class="bg-gray-700 text-xs px-2 py-1 rounded font-mono">{{ cart.length }} Item</span>
        </div>

        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
          <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
            <span class="material-symbols-outlined text-6xl opacity-20">shopping_cart_checkout</span>
            <p class="text-sm">Belum ada produk di keranjang</p>
          </div>
          
          <div v-else class="space-y-3">
            <div v-for="(item, index) in cart" :key="index" class="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex gap-3 relative group">
              <div class="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img v-if="item.image_file_id" :src="'https://drive.google.com/thumbnail?id=' + item.image_file_id + '&sz=w150'" class="w-full h-full object-cover">
                <span v-else class="material-symbols-outlined text-gray-400">image</span>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-gray-800 truncate pr-6">{{ item.name }}</h4>
                <p class="text-xs text-brandprimary font-medium mt-0.5">{{ formatRupiah(item.price) }}</p>
                <div class="flex items-center gap-3 mt-2">
                  <div class="flex items-center border border-gray-200 rounded-md bg-gray-50">
                    <button @click="updateQty(index, -1)" class="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-brandprimary hover:bg-emerald-50 rounded-l-md transition-colors">-</button>
                    <input type="number" v-model.number="item.qty" @change="validateQty(index)" class="w-10 h-7 text-center text-sm font-medium bg-transparent border-x border-gray-200 focus:outline-none focus:bg-white" min="1">
                    <button @click="updateQty(index, 1)" class="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-brandprimary hover:bg-emerald-50 rounded-r-md transition-colors">+</button>
                  </div>
                  <span class="text-sm font-bold text-gray-700 ml-auto">{{ formatRupiah(item.price * item.qty) }}</span>
                </div>
              </div>
              <button @click="removeFromCart(index)" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors p-1">
                <span class="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white border-t border-gray-100 space-y-4">
          <div class="flex justify-between items-end">
            <span class="text-gray-500 text-sm font-medium">Total Tagihan</span>
            <span class="text-2xl font-bold text-gray-800 leading-none">{{ formatRupiah(cartTotal) }}</span>
          </div>
          <button 
            @click="processPayment" 
            :disabled="cart.length === 0 || loading"
            class="w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
            :class="cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-brandprimary hover:bg-emerald-600 hover:shadow-emerald-500/30 transform hover:-translate-y-0.5'">
            <span v-if="loading" class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            <span v-else class="material-symbols-outlined text-[20px]">point_of_sale</span>
            {{ loading ? 'Memproses...' : 'Proses Pembayaran' }}
          </button>
        </div>
      </div>

      <!-- MODAL KAMERA SCANNER QUAGGAJS -->
      <div v-if="showScannerModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" @click.self="stopCamera">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div class="flex items-center gap-2 text-brandprimary">
              <span class="material-symbols-outlined">qr_code_scanner</span>
              <h3 class="text-lg font-bold">Pemindai Barcode (QuaggaJS)</h3>
            </div>
            <button @click="stopCamera" class="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white rounded-md border shadow-sm">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <div class="p-4 bg-gray-900 relative">
            <!-- WADAH QUAGGA -->
            <div id="barcode-scanner" class="w-full rounded-lg overflow-hidden border-2 border-gray-700 bg-black h-[350px] relative flex items-center justify-center">
               <span v-if="cameraStarting" class="absolute material-symbols-outlined animate-spin text-white text-4xl z-0">progress_activity</span>
            </div>
            
            <div v-if="scanError" class="absolute bottom-6 left-0 right-0 text-center z-20">
              <span class="bg-red-500/90 text-white text-xs px-3 py-1 rounded-full shadow-lg">{{ scanError }}</span>
            </div>
          </div>
          
          <div class="p-4 bg-gray-50 border-t flex justify-between items-center text-sm">
            <span class="text-gray-500">Pastikan garis barcode terlihat jelas dan sejajar horisontal.</span>
            <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold animate-pulse">Quagga Engine Active</span>
          </div>
        </div>
      </div>
    </div>
  `,
  setup(props, { emit }) {
    const { ref, computed, onMounted, onUnmounted } = Vue;
    const { token, logout } = authState;
    
    const products = ref([]);
    const cart = ref([]);
    const searchQuery = ref('');
    const loading = ref(false);
    
    // Scanner State
    const showScannerModal = ref(false);
    const cameraStarting = ref(false);
    const scanError = ref('');
    let lastScanCode = '';
    let lastScanTime = 0;

    const filteredProducts = computed(() => {
      if (!searchQuery.value) return products.value;
      const q = searchQuery.value.toLowerCase();
      return products.value.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.barcode.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    });

    const cartTotal = computed(() => {
      return cart.value.reduce((total, item) => total + (item.price * item.qty), 0);
    });

    const fetchProducts = async () => {
      loading.value = true;
      const res = await apiRequest('products.list', {}, token.value);
      loading.value = false;
      if (res.success) {
        products.value = res.data.filter(p => p.status === 'Active');
      } else {
        if (res.message.includes('AUTH_ERROR')) logout();
        alert(res.message);
      }
    };

    const addToCart = (product) => {
      if (product.stock <= 0) {
        scanError.value = `Stok produk ${product.name} habis!`;
        setTimeout(() => scanError.value = '', 2000);
        return;
      }
      const existing = cart.value.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          scanError.value = 'Maksimal stok tercapai!';
          setTimeout(() => scanError.value = '', 2000);
          return;
        }
        existing.qty++;
      } else {
        cart.value.unshift({ ...product, qty: 1 });
      }
      scanError.value = ''; // clear error kalau sukses masuk
    };

    const removeFromCart = (index) => {
      cart.value.splice(index, 1);
    };

    const updateQty = (index, delta) => {
      const item = cart.value[index];
      const newQty = item.qty + delta;
      if (newQty > 0 && newQty <= item.stock) {
        item.qty = newQty;
      } else if (newQty > item.stock) {
        alert('Maksimal stok tercapai!');
      }
    };

    const validateQty = (index) => {
      const item = cart.value[index];
      if (item.qty < 1 || isNaN(item.qty)) item.qty = 1;
      if (item.qty > item.stock) {
        alert('Maksimal stok tercapai!');
        item.qty = item.stock;
      }
    };

    const formatRupiah = (number) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    // --- INTEGRASI QUAGGAJS ---
    const startCamera = () => {
      scanError.value = '';
      showScannerModal.value = true;
      cameraStarting.value = true;
      
      console.log("[QUAGGA] Menyiapkan QuaggaJS...");
      
      setTimeout(() => {
        if (typeof Quagga === 'undefined') {
          scanError.value = "Library QuaggaJS gagal dimuat!";
          cameraStarting.value = false;
          return;
        }

        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#barcode-scanner'), 
            constraints: {
              facingMode: "environment" // Paksa kamera belakang
            }
          },
          decoder: {
            // Fokus ke format barcode minimarket umum
            readers: [
              "ean_reader", 
              "ean_8_reader", 
              "upc_reader", 
              "code_128_reader", 
              "code_39_reader"
            ]
          },
          locate: true // Fitur pencari lokasi kotak barcode
        }, function(err) {
            cameraStarting.value = false;
            if (err) {
                console.error("[QUAGGA] Error Init:", err);
                scanError.value = "Kamera gagal diakses: " + err.name;
                return;
            }
            console.log("[QUAGGA] Initialization finished. Ready to start");
            Quagga.start();
        });

        // Trigger saat Barcode Ketemu
        Quagga.onDetected((data) => {
          const code = data.codeResult.code;
          const now = Date.now();
          
          // Debounce 2 detik agar tidak spam masukin barang yg sama
          if (code === lastScanCode && (now - lastScanTime) < 2000) return;
          
          lastScanCode = code;
          lastScanTime = now;
          console.log("[QUAGGA] BARCODE KETEMU:", code);

          // Bunyi Beep
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.connect(ctx.destination);
            osc.frequency.value = 800;
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
          } catch(e) {}

          // Cari di katalog
          const product = products.value.find(p => p.barcode === code);
          if (product) {
            addToCart(product);
          } else {
            scanError.value = `Barcode ${code} tidak ada di sistem!`;
            setTimeout(() => scanError.value = '', 3000);
          }
        });

      }, 500); // jeda agar DOM modal siap
    };

    const stopCamera = () => {
      try {
        if (typeof Quagga !== 'undefined') {
          Quagga.stop();
        }
      } catch (err) {
        console.error("Gagal stop Quagga:", err);
      }
      showScannerModal.value = false;
    };

    // Hotkey F2 untuk buka scanner
    const handleKeydown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        startCamera();
      }
    };

    // --- PROSES TRANSAKSI ---
    const processPayment = async () => {
      if (cart.value.length === 0) return;
      loading.value = true;
      
      const payload = {
        items: cart.value.map(item => ({
          product_id: item.id,
          qty: item.qty,
          price: item.price
        })),
        total_amount: cartTotal.value,
        payment_method: 'CASH'
      };

      const res = await apiRequest('pos.checkout', payload, token.value);
      loading.value = false;

      if (res.success) {
        alert('Transaksi Berhasil!\nKembalian: Rp 0\n(Fitur bayar pas)');
        cart.value = [];
        // Refresh stok produk dari server secara diam-diam
        const refreshRes = await apiRequest('products.list', {}, token.value);
        if (refreshRes.success) products.value = refreshRes.data.filter(p => p.status === 'Active');
      } else {
        if (res.message.includes('AUTH_ERROR')) logout();
        alert('Gagal: ' + res.message);
      }
    };

    onMounted(() => {
      fetchProducts();
      window.addEventListener('keydown', handleKeydown);
    });

    onUnmounted(() => {
      stopCamera();
      window.removeEventListener('keydown', handleKeydown);
    });

    return {
      products, cart, searchQuery, loading, filteredProducts, cartTotal,
      addToCart, removeFromCart, updateQty, validateQty, formatRupiah, processPayment,
      showScannerModal, cameraStarting, scanError, startCamera, stopCamera
    };
  }
};
