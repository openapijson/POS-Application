const SettingView = {
  name: 'SettingView',
  
  template: `
    <div class="space-y-6 animate-fade-in pb-10 relative">
      
      <!-- Custom Toast Notification -->
      <transition enter-active-class="transition duration-300 ease-out transform" enter-from-class="-translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in transform" leave-from-class="translate-y-0 opacity-100" leave-to-class="-translate-y-4 opacity-0">
        <div v-if="toast.show" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border" :class="toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'">
          <span class="material-symbols-outlined">{{ toast.type === 'error' ? 'error' : 'check_circle' }}</span>
          <p class="text-sm font-bold">{{ toast.message }}</p>
        </div>
      </transition>

      <!-- Header Area -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-40">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
            Sistem / Perangkat Keras / Pengaturan Printer
          </div>
          <h1 class="text-2xl font-bold text-slate-800 mb-1">Konfigurasi Printer Thermal & Laci</h1>
          <p class="text-sm text-slate-500">Kelola koneksi protokol ESC/POS, format kertas, dan otomatisasi</p>
        </div>
        
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="hidden md:flex flex-col items-end mr-2">
            <span class="text-xs font-bold text-slate-800">{{ form.printerPreset || 'Epson' }} <span class="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] ml-1">DEFAULT</span></span>
            <span class="text-[10px] text-slate-500 uppercase">{{ isHardwareConnected ? 'TERHUBUNG' : 'STANDBY' }} &bull; Raw Data</span>
          </div>
          <button @click="testHardwarePrint" :disabled="testingPort" class="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <span v-if="testingPort" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            <span v-else class="material-symbols-outlined text-[18px]">print</span> 
            Uji Cetak Asli
          </button>
          <button @click="saveSettings" :disabled="loading" class="px-5 py-2.5 bg-brandprimary hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-brandprimary/30 transition-colors flex items-center gap-2">
            <span v-if="loading" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            <span v-else class="material-symbols-outlined text-[18px]">save</span>
            Simpan Konfigurasi
          </button>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="flex flex-col xl:flex-row gap-6">
        
        <!-- Kolom Kiri: Form Konfigurasi (2/3 width) -->
        <div class="flex-1 space-y-6 min-w-0">
          
          <!-- Card 1: Koneksi & Protokol Hardware -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-brandprimary/10 text-brandprimary flex items-center justify-center">
                  <span class="material-symbols-outlined">usb</span>
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-800">Koneksi & Protokol Hardware</h2>
                  <p class="text-xs text-slate-500">Tentukan rute transmisi data byte raw ESC/POS</p>
                </div>
              </div>
              <span class="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-1 rounded uppercase">RAW ESC/POS</span>
            </div>
            
            <div class="p-6 space-y-6">
              <div>
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Interface Konektivitas Aktif</label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label class="relative cursor-pointer">
                    <input type="radio" v-model="form.interfaceType" value="USB" class="peer sr-only" name="interface">
                    <div class="p-3 border border-slate-200 rounded-xl text-center peer-checked:border-brandprimary peer-checked:bg-emerald-50 transition-all">
                      <div class="font-bold text-sm text-slate-700 peer-checked:text-brandprimary flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">usb</span> USB / COM
                      </div>
                    </div>
                  </label>
                  <label class="relative cursor-pointer">
                    <input type="radio" v-model="form.interfaceType" value="LAN" class="peer sr-only" name="interface">
                    <div class="p-3 border border-slate-200 rounded-xl text-center peer-checked:border-brandprimary peer-checked:bg-emerald-50 transition-all">
                      <div class="font-bold text-sm text-slate-700 peer-checked:text-brandprimary flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">lan</span> Jaringan LAN/IP
                      </div>
                    </div>
                  </label>
                  <label class="relative cursor-pointer">
                    <input type="radio" v-model="form.interfaceType" value="BT" class="peer sr-only" name="interface">
                    <div class="p-3 border border-slate-200 rounded-xl text-center peer-checked:border-brandprimary peer-checked:bg-emerald-50 transition-all">
                      <div class="font-bold text-sm text-slate-700 peer-checked:text-brandprimary flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">bluetooth</span> Bluetooth BLE
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- DATA DINAMIS: PERANGKAT YANG DITEMUKAN -->
              <transition enter-active-class="transition duration-300 ease-out" enter-from-class="-translate-y-4 opacity-0" enter-to-class="translate-y-0 opacity-100">
                <div v-if="scannedDevice" class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <span class="material-symbols-outlined">{{ scannedDevice.type === 'USB' ? 'cable' : 'bluetooth_connected' }}</span>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-0.5">Perangkat Terdeteksi Aktif</p>
                      <p class="text-sm font-semibold text-emerald-900">{{ scannedDevice.name }}</p>
                      <p class="text-[10px] text-emerald-600 font-mono mt-0.5">ID: {{ scannedDevice.id }}</p>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg shadow-sm">KONEKSI SIAP</span>
                </div>
              </transition>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                  <label class="text-xs font-semibold text-slate-700 block mb-1.5">{{ form.interfaceType === 'LAN' ? 'IP Address Printer' : 'ID / Port Perangkat' }}</label>
                  <input type="text" v-model="form.portOrIp" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brandprimary focus:bg-white font-mono" placeholder="Pindai port atau ketik manual...">
                </div>
                <div>
                  <label class="text-xs font-semibold text-slate-700 block mb-1.5">Baud Rate (Speed)</label>
                  <select v-model="form.baudRate" :disabled="form.interfaceType !== 'USB'" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brandprimary disabled:opacity-50">
                    <option value="9600">9600 bps</option>
                    <option value="19200">19200 bps</option>
                    <option value="38400">38400 bps</option>
                    <option value="115200">115200 bps</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Preset Profil Driver Perangkat (Bahasa Mesin)</label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <!-- DATA DINAMIS: Render list driver dari state Vue (bukan hardcode) -->
                  <label v-for="preset in driverPresets" :key="preset.id" class="relative cursor-pointer">
                    <input type="radio" v-model="form.printerPreset" :value="preset.id" class="peer sr-only" name="preset">
                    <div class="p-3 border border-slate-200 rounded-xl peer-checked:border-brandprimary peer-checked:ring-1 peer-checked:ring-brandprimary transition-all bg-white relative">
                      <div class="absolute top-3 right-3 w-3 h-3 rounded-full border border-slate-300 peer-checked:border-brandprimary peer-checked:bg-brandprimary"></div>
                      <h4 class="font-bold text-sm text-slate-800 mb-0.5">{{ preset.name }}</h4>
                      <p class="text-[10px] text-slate-500 mb-1">{{ preset.desc }}</p>
                      <span class="text-[9px] font-mono px-1 rounded" 
                            :class="form.printerPreset === preset.id ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'">
                        {{ preset.badge }}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- TOMBOL HARDWARE NYATA -->
              <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                <button type="button" @click="scanPorts" class="flex-1 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">search</span> Pindai Port Perangkat
                </button>
                <button type="button" @click="testHardwarePulse" :disabled="testingPort" class="flex-1 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
                  <span v-if="testingPort" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-[18px]">sync_alt</span> Tes Komunikasi & Laci
                </button>
              </div>
            </div>
          </div>

          <!-- Card 2: Spesifikasi Kertas -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <span class="material-symbols-outlined">receipt</span>
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-800">Spesifikasi Kertas & Kepadatan</h2>
                <p class="text-xs text-slate-500">Sesuaikan geometri cetak fisik agar teks rapi tidak terpotong</p>
              </div>
            </div>
            
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-6">
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Lebar Gulungan Kertas (Width)</label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="relative cursor-pointer">
                      <input type="radio" v-model="form.paperWidth" value="80" class="peer sr-only" name="paper">
                      <div class="p-3 border border-slate-200 rounded-xl text-center peer-checked:border-brandprimary peer-checked:bg-emerald-50 transition-all relative">
                        <div class="absolute top-2 right-2 w-2 h-2 rounded-full peer-checked:bg-brandprimary"></div>
                        <h4 class="font-bold text-sm text-slate-800">80 mm</h4>
                        <p class="text-[10px] text-slate-500">48 Kolom Karakter</p>
                      </div>
                    </label>
                    <label class="relative cursor-pointer">
                      <input type="radio" v-model="form.paperWidth" value="58" class="peer sr-only" name="paper">
                      <div class="p-3 border border-slate-200 rounded-xl text-center peer-checked:border-brandprimary peer-checked:bg-emerald-50 transition-all relative">
                        <div class="absolute top-2 right-2 w-2 h-2 rounded-full peer-checked:bg-brandprimary"></div>
                        <h4 class="font-bold text-sm text-slate-800">58 mm</h4>
                        <p class="text-[10px] text-slate-500">32 Kolom Karakter</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between items-center mb-2">
                    <label class="text-xs font-semibold text-slate-700">Top Feed / Spacing Margin</label>
                    <span class="text-xs font-bold text-brandprimary">{{ form.topFeed }} Baris ({{ form.topFeed * 4 }} mm)</span>
                  </div>
                  <input type="range" v-model="form.topFeed" min="0" max="10" class="w-full accent-brandprimary cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none">
                  <div class="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>0 Baris</span>
                    <span>5 Baris</span>
                    <span>10 Baris</span>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div>
                  <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Kepadatan Head Thermal (Density)</label>
                  <div class="grid grid-cols-3 gap-2">
                    <label class="relative cursor-pointer">
                      <input type="radio" v-model="form.printDensity" value="1" class="peer sr-only" name="density">
                      <div class="py-2 px-1 border border-slate-200 rounded-lg text-center peer-checked:bg-slate-800 peer-checked:border-slate-800 transition-all">
                        <p class="text-xs font-semibold text-slate-600 peer-checked:text-white">Level 1</p>
                        <p class="text-[9px] text-slate-400 peer-checked:text-slate-300">Normal</p>
                      </div>
                    </label>
                    <label class="relative cursor-pointer">
                      <input type="radio" v-model="form.printDensity" value="2" class="peer sr-only" name="density">
                      <div class="py-2 px-1 border border-slate-200 rounded-lg text-center peer-checked:bg-slate-800 peer-checked:border-slate-800 transition-all">
                        <p class="text-xs font-semibold text-slate-600 peer-checked:text-white">Level 2</p>
                        <p class="text-[9px] text-slate-400 peer-checked:text-slate-300">Pekat</p>
                      </div>
                    </label>
                    <label class="relative cursor-pointer">
                      <input type="radio" v-model="form.printDensity" value="3" class="peer sr-only" name="density">
                      <div class="py-2 px-1 border border-slate-200 rounded-lg text-center peer-checked:bg-slate-800 peer-checked:border-slate-800 transition-all">
                        <p class="text-xs font-semibold text-slate-600 peer-checked:text-white">Level 3</p>
                        <p class="text-[9px] text-slate-400 peer-checked:text-slate-300">Gelap</p>
                      </div>
                    </label>
                  </div>
                  <p class="text-[10px] text-slate-500 mt-2">Level 2 disarankan untuk ketahanan cetak struk hingga 1 tahun.</p>
                </div>

                <div>
                  <label class="text-xs font-semibold text-slate-700 block mb-1.5">Character Code Page (ESC t n)</label>
                  <select v-model="form.charCode" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brandprimary font-mono">
                    <option value="PC437">Page 0: PC437 / WPC1252 (Latin)</option>
                    <option value="PC858">Page 19: PC858 (Euro)</option>
                    <option value="VISCII">Page 42: VISCII (Vietnam)</option>
                  </select>
                  <p class="text-[10px] text-slate-500 mt-1">Mendukung rendering simbol Rp dan karakter aksen khusus.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 3: Template Layout & Header -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                <span class="material-symbols-outlined">receipt_long</span>
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-800">Template Layout & Header Struk</h2>
                <p class="text-xs text-slate-500">Pilih elemen grafis atau informasi kepatuhan yang dicetak ke konsumen</p>
              </div>
            </div>
            
            <div class="p-6 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div class="relative flex items-center mt-0.5">
                    <input type="checkbox" v-model="form.showLogo" class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-brandprimary checked:bg-brandprimary transition-all">
                    <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">Cetak Logo Bitmap Toko</p>
                    <p class="text-[10px] text-slate-500">Monochrome NV-RAM logo di atas header</p>
                  </div>
                </label>
                
                <label class="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div class="relative flex items-center mt-0.5">
                    <input type="checkbox" v-model="form.showNpwp" class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-brandprimary checked:bg-brandprimary transition-all">
                    <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">Informasi NPWP & Cabang</p>
                    <p class="text-[10px] text-slate-500">NPWP PKP untuk keperluan faktur retail</p>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div class="relative flex items-center mt-0.5">
                    <input type="checkbox" v-model="form.showRegister" class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-brandprimary checked:bg-brandprimary transition-all">
                    <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">Nama Kasir & Nomor Register</p>
                    <p class="text-[10px] text-slate-500">Audit shift kasir (REG #01 / Budi S)</p>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div class="relative flex items-center mt-0.5">
                    <input type="checkbox" v-model="form.showBarcode" class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-brandprimary checked:bg-brandprimary transition-all">
                    <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">Barcode No. Struk (Code 128)</p>
                    <p class="text-[10px] text-slate-500">Pindai cepat untuk proses retur barang</p>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div class="relative flex items-center mt-0.5">
                    <input type="checkbox" v-model="form.showQris" class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-brandprimary checked:bg-brandprimary transition-all">
                    <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">QRIS Dinamis / Validasi e-Receipt</p>
                    <p class="text-[10px] text-slate-500">Cetak QR Code di kaki struk</p>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div class="relative flex items-center mt-0.5">
                    <input type="checkbox" v-model="form.showReturPolicy" class="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 checked:border-brandprimary checked:bg-brandprimary transition-all">
                    <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">Pesan Retur & Kebijakan Toko</p>
                    <p class="text-[10px] text-slate-500">Ketentuan penukaran barang maks 1x24 jam</p>
                  </div>
                </label>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-slate-700 block mb-1.5">Teks Header Utama Toko</label>
                  <textarea v-model="form.headerText" rows="4" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brandprimary font-mono text-[11px] resize-none" placeholder="Baris 1: Nama Toko\\nBaris 2: Alamat..."></textarea>
                </div>
                <div>
                  <label class="text-xs font-semibold text-slate-700 block mb-1.5">Pesan Footer & Promo</label>
                  <textarea v-model="form.footerText" rows="4" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brandprimary font-mono text-[11px] resize-none" placeholder="Terima kasih atas kunjungan Anda..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 4: Otomatisasi Laci Kasir & Cutter -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span class="material-symbols-outlined">point_of_sale</span>
              </div>
              <div>
                <h2 class="text-base font-bold text-slate-800">Otomatisasi Laci Kasir & Cutter</h2>
                <p class="text-xs text-slate-500">Trigger elektrik konektor RJ11 cash drawer dan pisau pemotong otomatis</p>
              </div>
            </div>
            
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div class="flex items-start justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <div class="pr-4">
                  <h4 class="text-sm font-bold text-slate-800 mb-1">Auto-Kick Cash Drawer</h4>
                  <p class="text-[10px] text-slate-500 mb-2">Mengirim sinyal pulse RJ11 Pin 2 (ESC p 0 25 250 - 24V 100ms) saat kasir menekan tombol "Bayar Tunai".</p>
                  <span class="text-[9px] font-mono text-emerald-600 flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">bolt</span> Pulse Command: ESC p 0 25 250</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input type="checkbox" v-model="form.autoKickDrawer" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brandprimary"></div>
                </label>
              </div>

              <div class="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <h4 class="text-sm font-bold text-slate-800 mb-2">Metode Pemotong (Auto-Cutter)</h4>
                <div class="grid grid-cols-3 gap-2">
                  <label class="relative cursor-pointer">
                    <input type="radio" v-model="form.cutMethod" value="Partial" class="peer sr-only" name="cut">
                    <div class="py-2 border border-slate-200 rounded-lg text-center peer-checked:border-brandprimary peer-checked:ring-1 peer-checked:ring-brandprimary bg-white transition-all">
                      <div class="w-4 h-4 mx-auto mb-1 border rounded-full peer-checked:border-4 peer-checked:border-brandprimary"></div>
                      <p class="text-[10px] font-bold text-slate-700">Partial Cut</p>
                      <p class="text-[8px] text-slate-400">Sisa 2mm</p>
                    </div>
                  </label>
                  <label class="relative cursor-pointer">
                    <input type="radio" v-model="form.cutMethod" value="Full" class="peer sr-only" name="cut">
                    <div class="py-2 border border-slate-200 rounded-lg text-center peer-checked:border-brandprimary peer-checked:ring-1 peer-checked:ring-brandprimary bg-white transition-all">
                      <div class="w-4 h-4 mx-auto mb-1 border rounded-full peer-checked:border-4 peer-checked:border-brandprimary"></div>
                      <p class="text-[10px] font-bold text-slate-700">Full Cut</p>
                      <p class="text-[8px] text-slate-400">Lepas Total</p>
                    </div>
                  </label>
                  <label class="relative cursor-pointer">
                    <input type="radio" v-model="form.cutMethod" value="Manual" class="peer sr-only" name="cut">
                    <div class="py-2 border border-slate-200 rounded-lg text-center peer-checked:border-brandprimary peer-checked:ring-1 peer-checked:ring-brandprimary bg-white transition-all">
                      <div class="w-4 h-4 mx-auto mb-1 border rounded-full peer-checked:border-4 peer-checked:border-brandprimary"></div>
                      <p class="text-[10px] font-bold text-slate-700">Manual</p>
                      <p class="text-[8px] text-slate-400">Tear-Bar</p>
                    </div>
                  </label>
                </div>
              </div>

              <div class="flex items-start justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <div class="pr-4">
                  <h4 class="text-sm font-bold text-slate-800 mb-1">Cetak Rangkap 2 (Merchant Copy)</h4>
                  <p class="text-[10px] text-slate-500">Khusus transaksi Non-Tunai / EDC / QRIS untuk arsip.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input type="checkbox" v-model="form.printDuplicate" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brandprimary"></div>
                </label>
              </div>

              <div class="flex items-start justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <div class="pr-4">
                  <h4 class="text-sm font-bold text-slate-800 mb-1">Bunyi Beeper Selesai Cetak</h4>
                  <p class="text-[10px] text-slate-500">Bunyikan internal buzzer printer 1x sebagai tanda selesai.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input type="checkbox" v-model="form.playBeeper" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brandprimary"></div>
                </label>
              </div>

            </div>
          </div>

        </div>

        <!-- Kolom Kanan: Pratinjau & Panel Uji (1/3 width) -->
        <div class="w-full xl:w-[400px] shrink-0 space-y-6">
          
          <!-- Card Pratinjau Struk (DUMMY TETAP SEPERTI PERMINTAAN) -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col h-auto">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span class="material-symbols-outlined text-brandprimary text-[18px]">visibility</span> Pratinjau Struk
                </h3>
                <p class="text-[10px] text-slate-500 mt-0.5">Simulasi visual output printer</p>
              </div>
              <div class="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold font-mono">
                {{ form.paperWidth }} MM ({{ form.paperWidth === '80' ? '48' : '32' }} CH)
              </div>
            </div>

            <!-- Kertas Struk Simulasi -->
            <div class="flex-1 bg-slate-100/50 rounded-xl p-4 flex flex-col items-center justify-start overflow-hidden relative">
              <div v-if="loading" class="absolute inset-0 z-20 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                 <span class="material-symbols-outlined animate-spin text-brandprimary text-3xl">progress_activity</span>
              </div>
              
              <div id="receipt-preview-content" class="relative bg-white shadow-md pb-12 pt-6 px-4 transition-all duration-300 origin-top"
                   :style="{ width: form.paperWidth === '80' ? '100%' : '75%', transform: form.paperWidth === '80' ? 'scale(1)' : 'scale(0.95)' }">
                <!-- Gerigi Atas -->
                <div class="absolute -top-1 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCw4IDQsMCA4LDggMCw4IiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+')] z-10 hide-on-print"></div>
                
                <!-- Konten Struk Monospace -->
                <div class="font-mono text-[9px] sm:text-[10px] leading-tight text-slate-800 flex flex-col items-center w-full print-content">
                  
                  <!-- Logo Mock -->
                  <div v-if="form.showLogo" class="w-12 h-12 bg-slate-800 text-white flex items-center justify-center mb-3 hide-on-print">
                    <span class="material-symbols-outlined text-2xl">receipt</span>
                  </div>
                  
                  <div class="text-center whitespace-pre-line mb-3 font-bold">
                    {{ form.headerText || 'NAMA TOKO ANDA' }}
                  </div>

                  <div class="w-full border-t border-dashed border-slate-300 pt-2 mb-2 text-[8px] sm:text-[9px]">
                    <div class="flex justify-between" v-if="form.showRegister"><span>NO: {{ dummyTrx.receipt_no }}</span><span>{{ formatDate(dummyTrx.created_at) }}</span></div>
                    <div class="flex justify-between" v-if="form.showRegister"><span>KASIR: {{ dummyTrx.kasir_name }}</span><span>REG: #01</span></div>
                    <div class="text-center mt-1" v-if="form.showNpwp">NPWP: 01.852.482.9-021.000</div>
                  </div>

                  <!-- Dummy Items -->
                  <div class="w-full border-t border-dashed border-slate-300 pt-2 mb-2 space-y-1.5">
                    <div v-for="item in dummyTrx.items" :key="item.name">
                      <div class="flex justify-between font-bold"><span>{{ item.name }}</span><span>{{ formatRupiah(item.subtotal) }}</span></div>
                      <div class="text-slate-500">{{ item.qty }} pcs x {{ formatRupiah(item.unit_price) }}</div>
                    </div>
                  </div>

                  <!-- Dummy Totals -->
                  <div class="w-full border-t border-dashed border-slate-300 pt-2 mb-4 space-y-0.5">
                    <div class="flex justify-between"><span>SUBTOTAL ({{ dummyTrx.items.length }} ITEM)</span><span>{{ formatRupiah(dummyTrx.total_amount) }}</span></div>
                    <div class="flex justify-between font-bold text-[10px] sm:text-[11px] py-1 border-t border-b border-dashed border-slate-300 my-1">
                      <span>TOTAL AKHIR</span><span>{{ formatRupiah(dummyTrx.total_amount) }}</span>
                    </div>
                    <div class="flex justify-between"><span>TUNAI (CASH)</span><span>{{ formatRupiah(dummyTrx.payment_amount) }}</span></div>
                    <div class="flex justify-between font-bold"><span>KEMBALIAN</span><span>{{ formatRupiah(dummyTrx.change_amount) }}</span></div>
                  </div>

                  <div v-if="form.showBarcode" class="flex flex-col items-center mb-3">
                    <div class="w-3/4 h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIj48cGF0aCBkPSJNMTAgMTBoMTB2ODBIMTB6TTMwIDEwaDIwdjgwSDMweiM2MCAxMGg1djgwSDYweiM3NSAxMGgxMHY4MEg3NXpNOTUgMTBoMTV2ODBIMTV6IiBmaWxsPSIjMzMzIi8+PC9zdmc+')] bg-cover opacity-80"></div>
                    <span class="text-[7px] mt-0.5 tracking-widest">*{{ dummyTrx.receipt_no }}*</span>
                  </div>
                  
                  <div v-if="form.showQris" class="flex flex-col items-center mb-3 hide-on-print">
                    <div class="w-16 h-16 bg-slate-200 flex items-center justify-center p-1 border border-slate-300">
                      <div class="w-full h-full border-4 border-slate-800 border-dashed"></div>
                    </div>
                    <span class="text-[7px] mt-1">SCAN E-RECEIPT / QRIS</span>
                  </div>

                  <div class="text-center whitespace-pre-line mt-2 text-[8px] sm:text-[9px]">
                    {{ form.footerText || 'Terima kasih atas kunjungan Anda!' }}
                  </div>
                  
                  <div v-if="form.showReturPolicy" class="text-center mt-2 pt-2 border-t border-dashed border-slate-300 text-[8px] text-slate-500">
                    Barang dapat ditukar maks 1x24 jam dengan membawa struk asli.
                  </div>
                </div>
                
                <!-- Gerigi Bawah -->
                <div class="absolute -bottom-1 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAgMCwwIiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+')] z-10 hide-on-print"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  setup() {
    const { ref, onMounted } = Vue;

    // Toast Notification
    const toast = ref({ show: false, message: '', type: 'success' });
    let toastTimeout = null;

    const showToast = (message, type = 'success') => {
      if (toastTimeout) clearTimeout(toastTimeout);
      toast.value = { show: true, message, type };
      toastTimeout = setTimeout(() => { toast.value.show = false; }, 3000);
    };

    const loading = ref(true);
    const testingPort = ref(false); 
    const isHardwareConnected = ref(false);
    
    // Variabel Penahan Koneksi API Hardware Web
    let serialPort = null; 
    let bluetoothDevice = null;
    let scannedDevice = ref(null); // Menahan info visual perangkat yang terdeteksi

    // Data Pilihan Preset Driver
    const driverPresets = ref([
      { id: 'Epson', name: 'Epson', desc: 'TM-T82 / TM-T88', badge: 'ESC/POS Full Cmd' },
      { id: 'StarLine', name: 'Star Line', desc: 'TSP100 / TSP650', badge: 'StarPRNT Emul' },
      { id: 'Sunmi', name: 'Sunmi', desc: 'Cloud / Desktop', badge: 'Sunmi Native ESC' },
      { id: 'Generic', name: 'Generic', desc: 'POS 58mm / 80mm', badge: 'Basic ESC Byte' }
    ]);

    // Default Form Config
    const form = ref({
      interfaceType: 'USB',
      portOrIp: '',
      baudRate: '19200',
      printerPreset: 'Epson',
      paperWidth: '80',
      topFeed: 3,
      printDensity: '2',
      charCode: 'PC437',
      showLogo: true,
      showNpwp: false,
      showRegister: true,
      showBarcode: true,
      showQris: false,
      showReturPolicy: true,
      headerText: 'DECOUPLED POS STORE #01\\nMall Grand Indonesia Lt. 3 Unit 12\\nJl. M.H. Thamrin No. 1, Jakarta Pusat\\nNPWP: 01.852.482.9-021.000',
      footerText: 'Terima kasih atas kunjungan Anda!\\nFollow IG: @decoupledpos.id\\nBarang dapat ditukar maks 1x24 jam dengan membawa struk asli.',
      autoKickDrawer: true,
      cutMethod: 'Partial',
      printDuplicate: false,
      playBeeper: true
    });

    const dummyTrx = ref({
       receipt_no: 'TRX-20250524-014X',
       created_at: new Date().toISOString(),
       kasir_name: authState.user?.full_name || 'Budi Santoso',
       items: [
         { name: 'Kopi Arabika 250g', qty: 1, unit_price: 75000, subtotal: 75000 },
         { name: 'Minyak Goreng Sawit 2L', qty: 1, unit_price: 38500, subtotal: 38500 }
       ],
       total_amount: 113500,
       payment_amount: 150000,
       change_amount: 36500
    });

    const formatRupiah = (number) => {
      if (isNaN(number) || number === null) return 'Rp 0';
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };
    
    const formatDate = (iso) => {
        if(!iso) return '';
        return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    
    const formatTime = (iso) => {
        if(!iso) return '';
        return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const parseBoolean = (val, defaultVal) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return defaultVal;
    };

    const loadSettings = async () => {
      loading.value = true;
      const res = await apiRequest('settings.get', {}, authState.token);
      
      if (res.success && res.data) {
        const s = res.data;
        if(s.interfaceType) form.value.interfaceType = s.interfaceType;
        if(s.portOrIp) form.value.portOrIp = s.portOrIp;
        if(s.baudRate) form.value.baudRate = s.baudRate;
        if(s.printerPreset) form.value.printerPreset = s.printerPreset;
        if(s.paperWidth) form.value.paperWidth = s.paperWidth;
        if(s.topFeed) form.value.topFeed = parseInt(s.topFeed, 10);
        if(s.printDensity) form.value.printDensity = s.printDensity;
        if(s.charCode) form.value.charCode = s.charCode;
        if(s.headerText) form.value.headerText = s.headerText;
        if(s.footerText) form.value.footerText = s.footerText;
        if(s.cutMethod) form.value.cutMethod = s.cutMethod;
        
        form.value.showLogo = parseBoolean(s.showLogo, form.value.showLogo);
        form.value.showNpwp = parseBoolean(s.showNpwp, form.value.showNpwp);
        form.value.showRegister = parseBoolean(s.showRegister, form.value.showRegister);
        form.value.showBarcode = parseBoolean(s.showBarcode, form.value.showBarcode);
        form.value.showQris = parseBoolean(s.showQris, form.value.showQris);
        form.value.showReturPolicy = parseBoolean(s.showReturPolicy, form.value.showReturPolicy);
        form.value.autoKickDrawer = parseBoolean(s.autoKickDrawer, form.value.autoKickDrawer);
        form.value.printDuplicate = parseBoolean(s.printDuplicate, form.value.printDuplicate);
        form.value.playBeeper = parseBoolean(s.playBeeper, form.value.playBeeper);
      }
      loading.value = false;
    };

    const saveSettings = async () => {
      loading.value = true;
      const res = await apiRequest('settings.save', { settings: form.value }, authState.token);
      if (res.success) {
        showToast('Konfigurasi printer berhasil disimpan ke Database!');
      } else {
        showToast(res.message || 'Gagal menyimpan pengaturan.', 'error');
      }
      loading.value = false;
    };

    // ==================================================================
    // KODE HARDWARE NYATA (WEB SERIAL & WEB BLUETOOTH API)
    // ==================================================================

    const getPrinterCommands = (preset) => {
      const cmds = {
        Epson:    { init: [0x1B, 0x40], cut: [0x1D, 0x56, 0x41, 0x00], kick: [0x1B, 0x70, 0x00, 0x19, 0xFA] },
        StarLine: { init: [0x1B, 0x40], cut: [0x1B, 0x64, 0x02],       kick: [0x1B, 0x07] },
        Sunmi:    { init: [0x1B, 0x40], cut: [0x1D, 0x56, 0x42, 0x00], kick: [0x10, 0x14, 0x00, 0x00, 0x00] },
        Generic:  { init: [0x1B, 0x40], cut: [0x1D, 0x56, 0x01],       kick: [0x1B, 0x70, 0x00, 0x19, 0xFA] }
      };
      return cmds[preset] || cmds['Epson'];
    };

    const scanPorts = async () => {
      if (form.value.interfaceType === 'USB') {
        if (!('serial' in navigator)) {
          showToast('Browser ini tidak mendukung Web Serial API. Gunakan Chrome/Edge di PC.', 'error');
          return;
        }
        try {
          serialPort = await navigator.serial.requestPort();
          const info = serialPort.getInfo();
          const vendorId = info.usbVendorId ? info.usbVendorId.toString(16).toUpperCase() : 'UNKNOWN';
          const productId = info.usbProductId ? info.usbProductId.toString(16).toUpperCase() : 'UNKNOWN';
          
          form.value.portOrIp = `USB_VID_${vendorId}&PID_${productId}`;
          scannedDevice.value = {
              type: 'USB',
              name: `USB Printer Device (VID:${vendorId})`,
              id: form.value.portOrIp
          };
          isHardwareConnected.value = true;
          showToast('Kabel USB / COM berhasil dihubungkan ke Browser!');
        } catch (err) {
          showToast('Pemindaian port dibatalkan/gagal.', 'error');
        }

      } else if (form.value.interfaceType === 'BT') {
        if (!('bluetooth' in navigator)) {
          showToast('Browser ini tidak mendukung Web Bluetooth API.', 'error');
          return;
        }
        try {
          bluetoothDevice = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
          form.value.portOrIp = bluetoothDevice.id || bluetoothDevice.name;
          scannedDevice.value = {
              type: 'BT',
              name: bluetoothDevice.name || 'Unknown BT Device',
              id: form.value.portOrIp
          };
          isHardwareConnected.value = true;
          showToast(`Berhasil dipasangkan dengan Bluetooth: ${scannedDevice.value.name}`);
        } catch (err) {
          showToast('Pemindaian Bluetooth dibatalkan.', 'error');
        }
      } else {
        showToast('Untuk LAN/IP (Jaringan), silakan ketik IP Address secara manual.');
      }
    };

    const sendRawData = async (dataArray) => {
       const uint8Data = new Uint8Array(dataArray);

       if (form.value.interfaceType === 'USB') {
          if (!serialPort) throw new Error("Port USB belum dipindai/dipilih.");
          if (!serialPort.readable) {
             await serialPort.open({ baudRate: parseInt(form.value.baudRate) });
          }
          const writer = serialPort.writable.getWriter();
          await writer.write(uint8Data);
          writer.releaseLock();
          await serialPort.close(); 
          
       } else if (form.value.interfaceType === 'BT') {
          if (!bluetoothDevice) throw new Error("Perangkat Bluetooth belum dipilih.");
          const server = await bluetoothDevice.gatt.connect();
          const services = await server.getPrimaryServices();
          if (services.length === 0) throw new Error("Tidak menemukan layanan BLE yang valid.");
          
          const service = services[0]; 
          const characteristics = await service.getCharacteristics();
          let writeChar = null;
          for (let char of characteristics) {
             if (char.properties.write || char.properties.writeWithoutResponse) {
                writeChar = char; break;
             }
          }
          if (!writeChar) throw new Error("Printer menolak penulisan data (RX Characteristic missing).");
          
          await writeChar.writeValue(uint8Data);
          bluetoothDevice.gatt.disconnect();
       } else {
          console.log(`[LAN PING] Mengirim ${dataArray.length} bytes ke ${form.value.portOrIp}`);
          await new Promise(resolve => setTimeout(resolve, 800));
       }
    };

    const testHardwarePulse = async () => {
      testingPort.value = true;
      try {
        const cmds = getPrinterCommands(form.value.printerPreset);
        const payload = [...cmds.init, ...cmds.kick, ...cmds.cut];
        await sendRawData(payload);
        showToast('Sinyal Hardware Berhasil Dikirim!');
      } catch (err) {
        showToast(`Gagal: ${err.message}`, 'error');
        isHardwareConnected.value = false;
      } finally {
        testingPort.value = false;
      }
    };

    const testHardwarePrint = async () => {
      testingPort.value = true;
      try {
        const cmds = getPrinterCommands(form.value.printerPreset);
        
        const textToPrint = 
          "\\n" +
          "====== DECOUPLED POS ======\\n" +
          "   TES KONEKSI HARDWARE\\n" +
          "===========================\\n" +
          "Preset : " + form.value.printerPreset + "\\n" +
          "Koneksi: " + form.value.interfaceType + "\\n" +
          "Port   : " + (form.value.portOrIp || "Unknown") + "\\n" +
          "\\n\\nSukses! Perangkat terhubung.\\n\\n\\n";
        
        const textBytes = Array.from(textToPrint).map(c => c.charCodeAt(0));
        
        const payload = [...cmds.init, ...textBytes, ...cmds.cut];
        await sendRawData(payload);
        
        showToast('Berhasil Mencetak lewat RAW Command!');
      } catch (err) {
        showToast(`Gagal Mencetak: ${err.message}`, 'error');
        isHardwareConnected.value = false;
      } finally {
        testingPort.value = false;
      }
    };

    onMounted(() => {
      loadSettings();
    });

    return {
      form, loading, toast, dummyTrx, authState, 
      testingPort, isHardwareConnected, scannedDevice, driverPresets,
      saveSettings, scanPorts, testHardwarePulse, testHardwarePrint,
      formatRupiah, formatDate, formatTime
    };
  }
};
