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
              <img v-if="prod.image_file_id" :src="'https://drive.google.com/thumbnail?id=' + prod.image_file_id + '&sz=w800'" class="w-full h-full object-cover">
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

      <!-- MODAL SCANNER KHUSUS POS QUAGGAJS (Diteleportasi) -->
      <teleport to="body">
        <div v-if="showScannerModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm" @click.self="stopCamera">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all text-center border border-slate-700 relative">
             
             <div class="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
               <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                 <span class="material-symbols-outlined text-brandprimary text-[18px]">qr_code_scanner</span> 
                 Pemindai Barcode (QuaggaJS)
               </h3>
               <button type="button" @click="stopCamera" class="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors">
                 <span class="material-symbols-outlined text-[18px]">close</span>
               </button>
             </div>
             
             <div class="p-4 bg-slate-900 relative">
                <div id="barcode-scanner" class="w-full rounded-lg overflow-hidden border-2 border-slate-700 bg-black h-[250px] relative flex items-center justify-center [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>canvas]:absolute [&>canvas]:inset-0 [&>canvas]:w-full [&>canvas]:h-full [&>canvas]:object-cover">
                    <span v-if="cameraStarting" class="absolute material-symbols-outlined animate-spin text-white text-4xl z-0">progress_activity</span>
                </div>
             </div>
             
             <div class="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold flex flex-col items-center gap-1 border-t border-emerald-100">
               <span class="material-symbols-outlined animate-pulse">barcode_scanner</span>
               Pastikan garis barcode terlihat jelas di layar.
             </div>
          </div>
        </div>
      </teleport>

      <!-- MODAL STRUK/SUKSES PREMIUM (Diteleportasi) -->
      <teleport to="body">
        <div v-if="showSuccessModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm" @click.self="resetPos">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col transform transition-all">
            
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shadow-sm">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <h2 class="text-xl font-bold text-slate-800">Transaksi Berhasil!</h2>
                    <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-widest uppercase border border-emerald-200">Lunas / Cash</span>
                  </div>
                  <p class="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                    #{{ lastTransaction.receipt_no }} &bull; {{ formatDate(lastTransaction.created_at) }}, {{ formatTime(lastTransaction.created_at) }} &bull; Kasir: {{ authState.user?.full_name || 'Admin' }}
                  </p>
                </div>
              </div>
              <button @click="resetPos" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <!-- Modal Body (2 Columns) -->
            <div class="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
              <div class="flex flex-col lg:flex-row gap-6 p-6">
                
                <!-- KIRI: Aksi & Summary -->
                <div class="flex-1 space-y-4">
                  
                  <!-- Box Summary -->
                  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div class="p-4 space-y-2">
                      <div class="flex justify-between text-sm text-slate-600">
                        <span>Total Belanja ({{ lastTransaction.items?.length || 0 }} Produk / {{ lastTransaction.total_qty || 0 }} Pcs)</span>
                        <span class="font-bold text-slate-800">{{ formatRupiah(lastTransaction.total_amount) }}</span>
                      </div>
                      <div class="flex justify-between text-sm text-slate-600">
                        <span>Uang Diterima (Tunai)</span>
                        <span class="font-bold text-slate-800">{{ formatRupiah(lastTransaction.payment_amount) }}</span>
                      </div>
                    </div>
                    <div class="bg-emerald-100 p-4 flex justify-between items-center border-t border-emerald-200">
                      <span class="font-bold text-emerald-800 flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">payments</span> Kembalian Kasir:
                      </span>
                      <span class="text-2xl font-black text-emerald-700">{{ formatRupiah(lastTransaction.change_amount) }}</span>
                    </div>
                  </div>

                  <!-- Box Cetak Struk -->
                  <div class="bg-white rounded-xl border border-emerald-500 shadow-sm overflow-hidden relative">
                    <div class="p-4">
                      <div class="flex justify-between items-start mb-4">
                        <div class="flex gap-3">
                          <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined">print</span>
                          </div>
                          <div>
                            <h3 class="text-sm font-bold text-slate-800">Cetak Struk Thermal (ESC/POS)</h3>
                            <p class="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Epson TM-T82III (80mm) &bull; Siap Cetak
                            </p>
                          </div>
                        </div>
                        <span class="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded">DEFAULT</span>
                      </div>
                      
                      <div class="flex gap-4 mb-4 text-xs font-medium text-slate-600">
                        <label class="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"> Auto-kick laci kasir (Pin 2)
                        </label>
                        <label class="flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" checked class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"> Potong kertas (Auto-cut)
                        </label>
                      </div>

                      <button @click="printReceipt" class="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm">
                        <span class="material-symbols-outlined text-[18px]">receipt</span> Cetak Struk Thermal (Enter)
                      </button>
                    </div>
                  </div>

                  <!-- Box Kirim WA -->
                  <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <div class="flex gap-3 mb-3">
                      <div class="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                          </div>
                          <div>
                            <h3 class="text-sm font-bold text-slate-800">Kirim Struk via WhatsApp</h3>
                            <p class="text-[11px] text-slate-500 mt-0.5">Struk digital paperless dikirim otomatis dalam format PDF / e-receipt.</p>
                          </div>
                        </div>
                        <div class="flex gap-2">
                          <div class="relative flex-1">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">+62</span>
                            <input type="text" v-model="waNumber" placeholder="812-9842-1088" class="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brandprimary focus:ring-1 focus:ring-brandprimary font-mono">
                          </div>
                          <button @click="sendWA" class="px-4 py-2 bg-brandprimary hover:bg-brandprimaryhover text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors">
                            <span class="material-symbols-outlined text-[16px]">send</span> Kirim WA
                          </button>
                        </div>
                      </div>

                  <!-- Aksi Lainnya -->
                  <div class="flex gap-3">
                    <button @click="downloadPDF" class="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                      <span class="material-symbols-outlined text-[18px]">download</span> Unduh PDF Struk
                    </button>
                    <button @click="sendEmail" class="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                      <span class="material-symbols-outlined text-[18px]">mail</span> Kirim via Email
                    </button>
                  </div>

                  <!-- Tombol Selesai Utama -->
                  <button @click="resetPos" class="w-full py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors mt-4 border border-indigo-100">
                    <span class="material-symbols-outlined text-[20px]">add_circle</span> Selesai & Transaksi Baru (Space / F2)
                  </button>

                </div>
                
                <!-- KANAN: Pratinjau Kertas -->
                <div class="w-full lg:w-[350px] shrink-0 bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center shadow-inner relative">
                  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[14px]">receipt_long</span> Pratinjau Struk Thermal (80mm)
                  </div>
                  
                  <!-- Kertas Thermal -->
                  <div class="w-full bg-white shadow-md relative pb-10">
                    <!-- Gerigi Atas -->
                    <div class="absolute -top-1 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCw4IDQsMCA4LDggMCw4IiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+')] z-10"></div>
                    
                    <div class="p-4 font-mono text-[10px] text-slate-800 leading-tight">
                      <div class="text-center mb-4">
                        <h2 class="font-bold text-sm">DECOUPLED POS RETAIL</h2>
                        <p class="mt-1">PT. DECOUPLED INDONESIA MANDIRI</p>
                        <p>Jl. Boulevard Artha Gading No. 88, Jkt</p>
                        <p>NPWP: 01.345.678.9-012.000</p>
                      </div>
                      
                      <div class="border-b border-dashed border-slate-400 pb-2 mb-2">
                        <div class="flex justify-between"><span>No. Struk</span><span class="font-bold">{{ lastTransaction.receipt_no }}</span></div>
                        <div class="flex justify-between"><span>Waktu</span><span>{{ formatDate(lastTransaction.created_at) }} {{ formatTime(lastTransaction.created_at) }}</span></div>
                        <div class="flex justify-between"><span>Kasir</span><span>{{ authState.user?.full_name || 'Admin' }} (REG#01)</span></div>
                        <div class="flex justify-between"><span>Pembayaran</span><span>TUNAI (CASH)</span></div>
                      </div>

                      <div class="border-b border-dashed border-slate-400 pb-2 mb-2 space-y-1.5">
                        <div v-for="item in lastTransaction.items" :key="item.name">
                          <div class="font-bold">{{ item.name }}</div>
                          <div class="flex justify-between">
                            <span>{{ item.qty }} x {{ formatRupiah(item.unit_price) }}</span>
                            <span>{{ formatRupiah(item.subtotal) }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="space-y-1 mb-2">
                        <div class="flex justify-between"><span>Subtotal ({{ lastTransaction.items?.length || 0 }} items)</span><span>{{ formatRupiah(lastTransaction.total_amount) }}</span></div>
                        <div class="flex justify-between text-[9px] text-slate-600"><span>PPN 11% (Termasuk)</span><span>Rp 0</span></div>
                      </div>

                      <div class="border-t border-b border-dashed border-slate-400 py-2 mb-2 space-y-1">
                        <div class="flex justify-between font-bold text-xs"><span>TOTAL AKHIR</span><span>{{ formatRupiah(lastTransaction.total_amount) }}</span></div>
                        <div class="flex justify-between"><span>TUNAI / DITERIMA</span><span>{{ formatRupiah(lastTransaction.payment_amount) }}</span></div>
                        <div class="flex justify-between font-bold"><span>KEMBALIAN</span><span>{{ formatRupiah(lastTransaction.change_amount) }}</span></div>
                      </div>

                      <div class="flex flex-col items-center mt-4">
                        <div class="w-4/5 h-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIj48cGF0aCBkPSJNMTAgMTBoMTB2ODBIMTB6TTMwIDEwaDIwdjgwSDMweiM2MCAxMGg1djgwSDYweiM3NSAxMGgxMHY4MEg3NXpNOTUgMTBoMTV2ODBIMTV6IiBmaWxsPSIjMzMzIi8+PC9zdmc+')] bg-cover opacity-80 mb-1"></div>
                        <p class="text-[8px] tracking-widest">*{{ lastTransaction.receipt_no }}*</p>
                      </div>

                      <div class="text-center mt-4 text-[9px] text-slate-600">
                        <p>Terima kasih atas kunjungan Anda!</p>
                        <p>Barang dapat ditukar max 1x24 jam</p>
                        <p>Disimpan dengan Decoupled POS Cloud v2.4</p>
                      </div>
                    </div>
                    
                    <!-- Gerigi Bawah -->
                    <div class="absolute -bottom-1 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAgMCwwIiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+')] z-10"></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </teleport>

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

    // Scanner Quagga State
    const showScannerModal = ref(false);
    const cameraStarting = ref(false);
    let lastScanCode = '';
    let lastScanTime = 0; 
    let currentCode = ''; 
    let scanMatchCount = 0;

    // State Cart
    const cart = ref([]);
    const paymentAmount = ref('');
    const isCheckingOut = ref(false);
    const checkoutError = ref('');
    const showSuccessModal = ref(false);
    const lastTransaction = ref({});
    
    // WA Input State
    const waNumber = ref('');

    // Format Helpers
    const formatDate = (iso) => {
        if(!iso) return '';
        return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const formatTime = (iso) => {
        if(!iso) return '';
        return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

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
        cart.value.unshift({ 
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

    // LOGIKA SCANNER KAMERA QUAGGAJS (KHUSUS POS)
    const startCamera = () => {
      scanError.value = '';
      showScannerModal.value = true;
      cameraStarting.value = true;
      scanMatchCount = 0;
      currentCode = '';

      setTimeout(() => {
        if (typeof Quagga === 'undefined') {
          alert("Library QuaggaJS tidak ditemukan. Periksa koneksi internet.");
          cameraStarting.value = false;
          stopCamera();
          return;
        }

        Quagga.init({
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#barcode-scanner'),
            constraints: { 
              facingMode: "environment",
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 }
            }
          },
          locator: {
            patchSize: "medium", 
            halfSample: true
          },
          numOfWorkers: navigator.hardwareConcurrency || 2,
          decoder: {
            readers: [
              "ean_reader", "ean_8_reader", "upc_reader", "code_128_reader", "code_39_reader"
            ]
          },
          locate: true
        }, function(err) {
            cameraStarting.value = false;
            if (err) {
                console.error("[POS] Kamera Gagal:", err);
                alert("Gagal menyalakan kamera: " + err.message);
                stopCamera(); 
                return;
            }
            Quagga.start();
        });

        // Event listener saat barcode ditemukan
        Quagga.onDetected((data) => {
          const code = data.codeResult.code;
          
          if (!code || code.length < 5) return;
          
          if (code === currentCode) {
            scanMatchCount++;
          } else {
            scanMatchCount = 1;
            currentCode = code;
          }

          if (scanMatchCount >= 4) {
            const now = Date.now();
            
            if (code === lastScanCode && (now - lastScanTime) < 2000) return;
            
            lastScanCode = code;
            lastScanTime = now;
            scanMatchCount = 0; 
            
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              osc.connect(ctx.destination);
              osc.frequency.value = 800;
              osc.start();
              osc.stop(ctx.currentTime + 0.1);
            } catch(e) {}
            
            barcodeQuery.value = code;
            stopCamera(); 
            handleScan();
          }
        });
      }, 500);
    };

    const stopCamera = () => {
      try {
        if (typeof Quagga !== 'undefined') {
          Quagga.stop();
        }
      } catch(e) { console.warn("Error stopping scanner", e); }
      showScannerModal.value = false;
      cameraStarting.value = false;
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
      
      // Sisipkan item cart saat ini ke dalam lastTransaction untuk ditampilkan di struk
      lastTransaction.value = {
        ...res.data,
        total_qty: cartTotalItems.value,
        items: cart.value.map(item => ({
          name: item.product.name,
          qty: item.qty,
          unit_price: item.product.price,
          subtotal: item.subtotal
        }))
      };
      
      showSuccessModal.value = true;
      
      // Kurangi stok di katalog lokal diam-diam
      cart.value.forEach(item => {
        const catIdx = catalog.value.findIndex(p => p.id === item.product.id);
        if (catIdx !== -1) catalog.value[catIdx].stock -= item.qty;
      });
      
      // Kosongkan cart
      cart.value = [];
    };

    const resetPos = () => { showSuccessModal.value = false; clearCart(); };
    const printReceipt = () => alert(`Print Command dikirim ke printer ESC/POS untuk struk: ${lastTransaction.value.receipt_no}`);
    const sendWA = () => {
      if(!waNumber.value) { alert("Masukkan nomor WA!"); return; }
      window.open(`https://wa.me/62${waNumber.value}?text=Terima kasih telah berbelanja. Ini e-receipt Anda: ${lastTransaction.value.receipt_no}`, '_blank');
    };
    const downloadPDF = () => alert("Mengunduh e-receipt PDF...");
    const sendEmail = () => alert("Membuka form email...");
    
    const focusScanner = () => {
       if (barcodeInputRef.value && !showScannerModal.value && !showSuccessModal.value) setTimeout(() => barcodeInputRef.value.focus(), 50);
    };

    const handleKeydown = (e) => {
      if (showSuccessModal.value) {
        if (e.key === 'Enter') {
          e.preventDefault();
          printReceipt();
        } else if (e.key === ' ' || e.key === 'F2' || e.key === 'Escape') {
          e.preventDefault();
          resetPos();
        }
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
      showScannerModal, cameraStarting, cart, paymentAmount, isCheckingOut, checkoutError, showSuccessModal, lastTransaction,
      cartTotalAmount, cartTotalItems, changeAmount, waNumber, formatRupiah, formatDate, formatTime, addFromCatalog, increaseQty, decreaseQty,
      removeFromCart, clearCart, handleScan, startCamera, stopCamera, setExactAmount, addAmount, processCheckout,
      resetPos, printReceipt, sendWA, downloadPDF, sendEmail, authState
    };
  }
};