const { onMounted } = Vue;

const ProductView = {
  name: 'ProductView',
  
  template: `
    <div class="space-y-6 animate-fade-in pb-10">
      
      <!-- Header Area -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brandprimary/10 text-[10px] font-bold text-brandprimary mb-2 uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-brandprimary"></span>
            Manajemen Produk
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-brandtext mb-1">Katalog & Inventori</h1>
          <p class="text-sm text-brandmuted">Kelola data SKU, harga, dan pantau stok barang secara real-time</p>
        </div>
        
        <div class="flex items-center gap-2">
          <button @click="loadProducts" :disabled="loading" class="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
            <span class="material-symbols-outlined text-lg" :class="{'animate-spin': loading}">refresh</span>
          </button>
          <button @click="openAddModal" class="px-4 py-2.5 bg-brandprimary hover:bg-brandprimaryhover text-white text-sm font-semibold rounded-xl shadow-sm shadow-brandprimary/30 transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">add</span>
            Tambah Produk
          </button>
        </div>
      </div>

      <!-- Error Global -->
      <div v-if="globalError" class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 shadow-sm">
        <span class="material-symbols-outlined">error</span>
        <p class="text-sm font-medium">{{ globalError }}</p>
        <button @click="globalError = ''" class="ml-auto text-red-400 hover:text-red-600">
           <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <!-- Content Area -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        <!-- Toolbar Bar -->
        <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
           <div class="relative flex-1">
             <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
             <input type="text" v-model="searchQuery" placeholder="Cari berdasarkan Nama Produk atau Barcode..." 
               class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:border-brandprimary transition-colors">
           </div>
           <div class="flex gap-2">
             <select v-model="filterCategory" class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-brandprimary">
               <option value="">Semua Kategori</option>
               <option v-for="cat in uniqueCategories" :key="cat" :value="cat">{{ cat }}</option>
             </select>
           </div>
        </div>

        <!-- Table Data -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th class="p-4 font-semibold w-16">Foto</th>
                <th class="p-4 font-semibold">Barcode / Nama Produk</th>
                <th class="p-4 font-semibold">Kategori</th>
                <th class="p-4 font-semibold text-right">Harga Jual</th>
                <th class="p-4 font-semibold text-center">Kondisi Stok</th>
                <th class="p-4 font-semibold text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody v-if="loading" class="divide-y divide-slate-100">
              <tr v-for="i in 5" :key="i" class="animate-pulse">
                <td class="p-4"><div class="w-10 h-10 bg-slate-200 rounded-lg"></div></td>
                <td class="p-4"><div class="w-32 h-4 bg-slate-200 rounded mb-2"></div><div class="w-48 h-3 bg-slate-100 rounded"></div></td>
                <td class="p-4"><div class="w-20 h-5 bg-slate-200 rounded-full"></div></td>
                <td class="p-4"><div class="w-24 h-4 bg-slate-200 rounded ml-auto"></div></td>
                <td class="p-4"><div class="w-20 h-6 bg-slate-200 rounded-full mx-auto"></div></td>
                <td class="p-4"><div class="w-16 h-8 bg-slate-200 rounded mx-auto"></div></td>
              </tr>
            </tbody>
            <tbody v-else-if="filteredProducts.length === 0" class="divide-y divide-slate-100">
              <tr>
                <td colspan="6" class="p-12 text-center text-slate-400">
                  <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span class="material-symbols-outlined text-3xl opacity-50">inventory_2</span>
                  </div>
                  <p class="font-medium text-sm text-slate-600 mb-1">Tidak ada produk ditemukan</p>
                  <p class="text-xs">Ubah pencarian atau tambahkan produk baru.</p>
                </td>
              </tr>
            </tbody>
            <tbody v-else class="text-sm divide-y divide-slate-100">
              <tr v-for="prod in filteredProducts" :key="prod.id" class="hover:bg-slate-50 transition-colors group">
                <td class="p-4">
                  <div class="w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                    <img v-if="prod.image_url" :src="prod.image_url" :alt="prod.name" class="w-full h-full object-cover">
                    <span v-else class="material-symbols-outlined text-slate-400 text-lg">image</span>
                  </div>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-1.5 mb-0.5">
                    <span class="material-symbols-outlined text-[14px] text-slate-400">barcode</span>
                    <span class="text-xs font-mono text-slate-500">{{ prod.barcode }}</span>
                  </div>
                  <p class="font-medium text-slate-800">{{ prod.name }}</p>
                </td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wide">{{ prod.category || 'Uncategorized' }}</span>
                </td>
                <td class="p-4 text-right">
                  <p class="font-bold text-slate-800">{{ formatRupiah(prod.price) }}</p>
                </td>
                <td class="p-4 text-center">
                  <div class="inline-flex flex-col items-center">
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border" 
                         :class="getStockStatusClass(prod.stock)">
                      <span class="w-1.5 h-1.5 rounded-full" :class="getStockStatusDotClass(prod.stock)"></span>
                      {{ prod.stock }} PCS
                    </div>
                    <span class="text-[10px] mt-1" :class="getStockStatusTextClass(prod.stock)">
                      {{ getStockStatusLabel(prod.stock) }}
                    </span>
                  </div>
                </td>
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openEditModal(prod)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-brandprimary/10 text-slate-500 hover:text-brandprimary flex items-center justify-center transition-colors tooltip-trigger" title="Edit Produk">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button @click="confirmDelete(prod)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors tooltip-trigger" title="Hapus Produk">
                      <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Footer Info -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
           <span>Menampilkan <b>{{ filteredProducts.length }}</b> dari total <b>{{ products.length }}</b> SKU Aktif.</span>
        </div>
      </div>

      <!-- MODAL FORM PRODUK (Strict Structure) -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" @click.self="closeModal">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all">
          
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-xl bg-brandprimary/10 text-brandprimary flex items-center justify-center">
                 <span class="material-symbols-outlined">{{ modalMode === 'add' ? 'add_circle' : 'edit_square' }}</span>
               </div>
               <div>
                 <h3 class="text-lg font-bold text-slate-800">{{ modalMode === 'add' ? 'Tambah Produk Baru' : 'Edit Produk' }}</h3>
                 <p class="text-xs text-slate-500">Lengkapi spesifikasi komoditas ritel dan harga pokok.</p>
               </div>
            </div>
            <button @click="closeModal" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <!-- Scrollable Content -->
          <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
            
            <div v-if="modalError" class="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2">
              <span class="material-symbols-outlined text-base">error</span>
              <p>{{ modalError }}</p>
            </div>

            <form @submit.prevent="submitForm" id="productForm" class="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <!-- Kolom Kiri: Input Data Utama -->
              <div class="md:col-span-2 space-y-5">
                
                <div class="p-5 border border-slate-200 rounded-xl bg-slate-50/30 space-y-4">
                  <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span class="material-symbols-outlined text-base text-slate-400">qr_code_scanner</span> Identitas & Barcode
                  </h4>
                  
                  <div>
                    <label class="text-xs font-semibold text-slate-700 block mb-1.5">Barcode / Kode Batang <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <input type="text" v-model="formData.barcode" required :disabled="actionLoading"
                        class="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:border-brandprimary font-mono placeholder:font-sans" 
                        placeholder="Scan atau ketik barcode...">
                      <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">barcode_reader</span>
                    </div>
                  </div>

                  <div>
                    <label class="text-xs font-semibold text-slate-700 block mb-1.5">Nama Resmi Produk <span class="text-red-500">*</span></label>
                    <input type="text" v-model="formData.name" required :disabled="actionLoading"
                      class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:border-brandprimary" 
                      placeholder="Misal: Kopi Bubuk Arabika 250g">
                  </div>
                  
                  <div>
                    <label class="text-xs font-semibold text-slate-700 block mb-1.5">Kategori Toko</label>
                    <input type="text" v-model="formData.category" list="category-list" :disabled="actionLoading"
                      class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:border-brandprimary" 
                      placeholder="Pilih atau ketik kategori baru...">
                    <datalist id="category-list">
                      <option v-for="cat in uniqueCategories" :key="cat" :value="cat"></option>
                    </datalist>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="p-5 border border-slate-200 rounded-xl bg-slate-50/30">
                     <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <span class="material-symbols-outlined text-base text-slate-400">payments</span> Harga Jual
                     </h4>
                     <label class="text-xs font-semibold text-slate-700 block mb-1.5">Harga Satuan (Rp) <span class="text-red-500">*</span></label>
                     <input type="number" v-model="formData.price" required min="0" :disabled="actionLoading"
                       class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:border-brandprimary font-bold text-slate-800" 
                       placeholder="0">
                  </div>
                  
                  <div class="p-5 border border-slate-200 rounded-xl bg-slate-50/30">
                     <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <span class="material-symbols-outlined text-base text-slate-400">inventory</span> Stok Gudang
                     </h4>
                     <label class="text-xs font-semibold text-slate-700 block mb-1.5">Jumlah Stok Tersedia <span class="text-red-500">*</span></label>
                     <input type="number" v-model="formData.stock" required min="0" :disabled="actionLoading"
                       class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:border-brandprimary font-bold text-slate-800" 
                       placeholder="0">
                  </div>
                </div>

              </div>
              
              <!-- Kolom Kanan: Upload Foto -->
              <div class="md:col-span-1 space-y-4">
                 <div class="p-5 border border-slate-200 rounded-xl bg-slate-50/30 h-full flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                       <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                         <span class="material-symbols-outlined text-base text-slate-400">image</span> Foto Produk
                       </h4>
                       <span class="text-[10px] text-slate-400 font-medium">Max 2MB</span>
                    </div>

                    <div class="flex-1 w-full border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden relative group transition-colors hover:border-brandprimary/50 flex items-center justify-center min-h-[200px]">
                      
                      <!-- Image Preview -->
                      <img v-if="formData.image_preview" :src="formData.image_preview" class="w-full h-full object-cover absolute inset-0 z-0">
                      
                      <!-- Overlay Upload (Visible on hover or if empty) -->
                      <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 transition-opacity bg-white/80"
                           :class="formData.image_preview ? 'opacity-0 group-hover:opacity-100 backdrop-blur-sm' : 'opacity-100'">
                        <span class="material-symbols-outlined text-4xl text-slate-400 mb-2 group-hover:text-brandprimary transition-colors">cloud_upload</span>
                        <p class="text-xs font-medium text-slate-600 mb-1">Klik atau seret foto ke sini</p>
                        <p class="text-[10px] text-slate-400">JPG/PNG rasio 1:1 direkomendasikan</p>
                      </div>

                      <input type="file" accept="image/jpeg, image/png, image/webp" @change="handleImageUpload" :disabled="actionLoading"
                             class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20">
                    </div>
                    
                    <button v-if="formData.image_preview && !actionLoading" @click="clearImage" type="button" class="mt-3 w-full py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                      Hapus Foto
                    </button>
                 </div>
              </div>

            </form>
          </div>
          
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-2xl">
             <span v-if="actionLoading" class="text-xs text-brandprimary font-medium flex items-center gap-1.5 mr-auto">
               <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
               Menyimpan data & sinkronisasi cloud...
             </span>
             
             <button type="button" @click="closeModal" :disabled="actionLoading" class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors disabled:opacity-50">
               Batal
             </button>
             <button type="submit" form="productForm" :disabled="actionLoading" class="px-6 py-2.5 rounded-xl bg-brandprimary hover:bg-brandprimaryhover text-white text-sm font-semibold shadow-sm shadow-brandprimary/30 transition-colors disabled:opacity-70 flex items-center gap-2">
               <span class="material-symbols-outlined text-lg">save</span>
               {{ modalMode === 'add' ? 'Simpan Produk Baru' : 'Simpan Perubahan' }}
             </button>
          </div>
        </div>
      </div>

      <!-- MODAL HAPUS (Strict Structure) -->
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" @click.self="showDeleteModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-hidden transform transition-all text-center">
          <div class="p-6">
            <div class="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h3 class="text-lg font-bold text-slate-800 mb-2">Hapus Produk?</h3>
            <p class="text-sm text-slate-500 mb-1">Anda yakin ingin menghapus produk <br><b class="text-slate-800">{{ productToDelete?.name }}</b>?</p>
            <p class="text-xs text-red-500 bg-red-50 p-2 rounded-lg mt-3 inline-block">Data yang sudah dihapus akan disembunyikan dari modul POS.</p>
          </div>
          <div class="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
            <button @click="showDeleteModal = false" :disabled="actionLoading" class="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors">
              Batal
            </button>
            <button @click="executeDelete" :disabled="actionLoading" class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
              <span v-if="actionLoading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              Hapus
            </button>
          </div>
        </div>
      </div>

    </div>
  `,

  setup() {
    // UI State
    const loading = ref(true);
    const actionLoading = ref(false);
    const globalError = ref('');
    const searchQuery = ref('');
    const filterCategory = ref('');
    
    // Data State
    const products = ref([]);
    
    // Modal Form State
    const showModal = ref(false);
    const modalMode = ref('add');
    const modalError = ref('');
    const formData = ref({
      id: '',
      barcode: '',
      name: '',
      category: '',
      price: '',
      stock: '',
      image_base64: null, // Dikirim ke server
      image_preview: null // Preview lokal
    });

    // Delete Modal State
    const showDeleteModal = ref(false);
    const productToDelete = ref(null);

    // Helpers UI Computed
    const uniqueCategories = computed(() => {
      const cats = products.value.map(p => p.category).filter(c => c);
      return [...new Set(cats)].sort();
    });

    const filteredProducts = computed(() => {
      let result = products.value;
      
      // Filter produk aktif saja (Soft delete protection dari frontend walau backend jg filter)
      result = result.filter(p => p.status === 'Active');

      if (filterCategory.value) {
        result = result.filter(p => p.category === filterCategory.value);
      }
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.barcode.toLowerCase().includes(q)
        );
      }
      return result;
    });

    const getStockStatusClass = (stock) => {
      const s = parseInt(stock) || 0;
      if (s <= 5) return 'bg-red-50 text-red-700 border-red-200';
      if (s <= 20) return 'bg-orange-50 text-orange-700 border-orange-200';
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    };

    const getStockStatusDotClass = (stock) => {
      const s = parseInt(stock) || 0;
      if (s <= 5) return 'bg-red-500';
      if (s <= 20) return 'bg-orange-500';
      return 'bg-emerald-500';
    };

    const getStockStatusTextClass = (stock) => {
       const s = parseInt(stock) || 0;
       if (s <= 5) return 'text-red-500 font-bold';
       if (s <= 20) return 'text-orange-500 font-bold';
       return 'text-emerald-600 font-medium';
    };

    const getStockStatusLabel = (stock) => {
       const s = parseInt(stock) || 0;
       if (s <= 5) return 'KRITIS (<5)';
       if (s <= 20) return 'MENIPIS (<20)';
       return 'AMAN (>20)';
    };

    const loadProducts = async () => {
      loading.value = true;
      globalError.value = '';
      
      const res = await apiRequest('products.list', {}, authState.token);
      
      if (handleAuthError(res.message)) return;

      if (!res.success) {
        globalError.value = res.message || 'Gagal memuat katalog produk.';
      } else {
        products.value = res.data || [];
      }
      
      loading.value = false;
    };

    // Modal Handling
    const openAddModal = () => {
      modalMode.value = 'add';
      modalError.value = '';
      formData.value = {
        id: '', barcode: '', name: '', category: '', price: '', stock: '', image_base64: null, image_preview: null
      };
      showModal.value = true;
    };

    const openEditModal = (prod) => {
      modalMode.value = 'edit';
      modalError.value = '';
      formData.value = {
        id: prod.id,
        barcode: prod.barcode,
        name: prod.name,
        category: prod.category,
        price: prod.price,
        stock: prod.stock,
        image_base64: null, // Jangan kirim gambar lama, kecuali user upload ulang
        image_preview: prod.image_url // Tampilkan gambar dari DB untuk preview
      };
      showModal.value = true;
    };

    const closeModal = () => {
      if (actionLoading.value) return; // Kunci modal jika sedang proses
      showModal.value = false;
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validasi ukuran max 2MB (2 * 1024 * 1024 bytes)
      if (file.size > 2097152) {
        modalError.value = 'Ukuran foto maksimal 2MB. Silakan pilih foto lain yang lebih kecil.';
        event.target.value = ''; // reset input
        return;
      }
      
      modalError.value = '';
      
      // Konversi ke Base64 menggunakan FileReader (Standar HTML5)
      const reader = new FileReader();
      reader.onload = (e) => {
         formData.value.image_preview = e.target.result;
         formData.value.image_base64 = e.target.result;
      };
      reader.onerror = () => {
         modalError.value = 'Gagal membaca file gambar.';
      };
      reader.readAsDataURL(file);
    };

    const clearImage = () => {
      formData.value.image_preview = null;
      formData.value.image_base64 = null;
    };

    const submitForm = async () => {
      modalError.value = '';
      actionLoading.value = true;
      
      const payload = {
        id: formData.value.id,
        barcode: formData.value.barcode,
        name: formData.value.name,
        category: formData.value.category,
        price: formData.value.price,
        stock: formData.value.stock,
        image_base64: formData.value.image_base64 // Hanya terisi jika ada upload baru
      };

      const action = modalMode.value === 'add' ? 'products.create' : 'products.update';
      const res = await apiRequest(action, payload, authState.token);
      
      actionLoading.value = false;

      if (handleAuthError(res.message)) return;

      if (!res.success) {
        modalError.value = res.message;
        return;
      }

      // GRANULAR UPDATE: Mutasi state lokal, JANGAN over-fetch (fetch ulang seluruh tabel)
      if (modalMode.value === 'add') {
        products.value.unshift(res.data); // Taruh di paling atas
      } else {
        const idx = products.value.findIndex(p => p.id === res.data.id);
        if (idx !== -1) {
          products.value[idx] = res.data;
        }
      }

      closeModal();
    };

    const confirmDelete = (prod) => {
      productToDelete.value = prod;
      showDeleteModal.value = true;
    };

    const executeDelete = async () => {
      actionLoading.value = true;
      
      const res = await apiRequest('products.delete', { id: productToDelete.value.id }, authState.token);
      actionLoading.value = false;

      if (handleAuthError(res.message)) return;

      if (!res.success) {
        globalError.value = res.message;
        showDeleteModal.value = false;
        return;
      }

      // GRANULAR UPDATE: Hapus dari array lokal
      products.value = products.value.filter(p => p.id !== productToDelete.value.id);
      
      showDeleteModal.value = false;
      productToDelete.value = null;
    };

    onMounted(() => {
      loadProducts();
    });

    return {
      loading,
      actionLoading,
      globalError,
      searchQuery,
      filterCategory,
      products,
      uniqueCategories,
      filteredProducts,
      showModal,
      modalMode,
      modalError,
      formData,
      showDeleteModal,
      productToDelete,
      formatRupiah,
      getStockStatusClass,
      getStockStatusDotClass,
      getStockStatusTextClass,
      getStockStatusLabel,
      loadProducts,
      openAddModal,
      openEditModal,
      closeModal,
      handleImageUpload,
      clearImage,
      submitForm,
      confirmDelete,
      executeDelete
    };
  }
};