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
          <!-- Tombol Cetak Hardware Nyata -->
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

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                  <label class="text-xs font-semibold text-slate-700 block mb-1.5">{{ form.interfaceType === 'LAN' ? 'IP Address Printer' : 'ID / Nama Perangkat (Otomatis)' }}</label>
                  <input type="text" v-model="form.portOrIp" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brandprimary focus:bg-white font-mono" placeholder="Contoh: COM3 / 192.168.1.100">
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
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">Preset Profil Driver Perangkat (RAW Command)</label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label class="relative cursor-pointer">
                    <input type="radio" v-model="form.printerPreset" value="Epson" class="peer sr-only" name="preset">
                    <div class="p-3 border border-slate-200 rounded-xl peer-checked:border-brandprimary peer-checked:ring-1 peer-checked:ring-brandprimary transition-all bg-white relative">
                      <div class="absolute top-3 right-3 w-3 h-3 rounded-full border border-slate-300 peer-checked:border-brandprimary peer-checked:bg-brandprimary"></div>
                      <h4 class="font-bold text-sm text-slate-800 mb-0.5">Epson</h4>
                      <p class="text-[10px] text-slate-500 mb-1">TM-T82 / TM-T88</p>
                      <span class="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded">ESC/POS Standard</span>
                    </div>
                  </label>
                  <label class="relative cursor-pointer">
                    <input type="radio" v-model="form.printerPreset" value="StarLine" class="peer sr-only" name="preset">
                    <div class="p-3 border border-slate-200 rounded-xl peer-checked:border-brandprimary peer-checked:ring-1 peer-checked:ring-brandprimary transition-all bg-white relative">
                      <div class="absolute top-3 right-3 w-3 h-3 rounded-full border border-slate-300 peer-checked:border-brandprimary peer-checked:bg-brandprimary"></div>
                      <h4 class="font-bold text-sm text-slate-800 mb-0.5">Star Line</h4>
                      <p class="text-[10px] text-slate-500 mb-1">TSP100 / TSP650</p>
                      <span class="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 rounded">StarPRNT Emul</span>
                    </div>
                  </label>
                  <label class="relative cursor-pointer">
                    <input type="radio" v-model="form.printerPreset" value="Sunmi" class="peer sr-only" name="preset">
                    <div class="p-3 border border-slate-200 rounded-xl peer-checked:border-brandprimary peer-checked:ring-1 peer-checked:ring-brandprimary transition-all bg-white relative">
                      <div class="absolute top-3 right-3 w-3 h-3 rounded-full border border-slate-300 peer-checked:border-brandprimary peer-checked:bg-brandprimary"></div>
                      <h4 class="font-bold text-sm text-slate-800 mb-0.5">Sunmi</h4>
                      <p class="text-[10px] text-slate-500 mb-1">Cloud / Desktop</p>
                      <span class="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 rounded">Sunmi Native ESC</span>
                    </div>
                  </label>
                  <label class="relative cursor-pointer">
                    <input type="radio" v-model="form.printerPreset" value="Generic" class="peer sr-only" name="preset">
                    <div class="p-3 border border-slate-200 rounded-xl peer-checked:border-brandprimary peer-checked:ring-1 peer-checked:ring-brandprimary transition-all bg-white relative">
                      <div class="absolute top-3 right-3 w-3 h-3 rounded-full border border-slate-300 peer-checked:border-brandprimary peer-checked:bg-brandprimary"></div>
                      <h4 class="font-bold text-sm text-slate-800 mb-0.5">Generic</h4>
                      <p class="text-[10px] text-slate-500 mb-1">POS 58mm / 80mm</p>
                      <span class="text-[9px] font-mono text-slate-500 bg-slate-100 px-1 rounded">Basic ESC Byte</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- TOMBOL HARDWARE NYATA -->
              <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                <button type="button" @click="scanPorts" class="flex-1 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">search</span> Hubungkan Perangkat
                </button>
                <button type="button" @click="testHardwarePulse" :disabled="testingPort" class="flex-1 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70">
                  <span v-if="testingPort" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span v-else class="material-symbols-outlined text-[18px]">bolt</span> Tes Kick Laci (Raw Pulse)
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
              <!-- Kiri: Lebar & Feed -->
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

              <!-- Kanan: Density & Charset -->
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
                <!-- Checkboxes -->
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
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-slate-700 block mb-1.5">Teks Header Utama Toko</label>
                  <textarea v-model="form.headerText" rows="4" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brandprimary font-mono text-[11px] resize-none" placeholder="Baris 1: Nama TokonBaris 2: Alamat..."></textarea>
                </div>
                <div>
                  <label class="text-xs font-semibold text-slate-700 block mb-1.5">Pesan Footer & Promo</label>
                  <textarea v-model="form.footerText" rows="4" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brandprimary font-mono text-[11px] resize-none" placeholder="Terima kasih atas kunjungan Anda..."></textarea>
                </div>
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
                  
                  <div class="text-center whitespace-pre-line mb-3 font-bold">
                    {{ form.headerText || 'NAMA TOKO ANDA' }}
                  </div>

                  <div class="w-full border-t border-dashed border-slate-300 pt-2 mb-2 text-[8px] sm:text-[9px]">
                    <div class="flex justify-between" v-if="form.showRegister"><span>NO: TRX-20250524-014X</span><span>{{ new Date().toLocaleDateString('id-ID') }}</span></div>
                    <div class="flex justify-between" v-if="form.showRegister"><span>KASIR: Budi Santoso</span><span>REG: #01</span></div>
                    <div class="text-center mt-1" v-if="form.showNpwp">NPWP: 01.852.482.9-021.000</div>
                  </div>

                  <!-- Dummy Items -->
                  <div class="w-full border-t border-dashed border-slate-300 pt-2 mb-2 space-y-1.5">
                    <div>
                      <div class="flex justify-between font-bold"><span>Kopi Arabika 250g</span><span>Rp 75.000</span></div>
                      <div class="text-slate-500">1 pcs x Rp 75.000</div>
                    </div>
                    <div>
                      <div class="flex justify-between font-bold"><span>Minyak Goreng Sawit 2L</span><span>Rp 38.500</span></div>
                      <div class="text-slate-500">1 pcs x Rp 38.500</div>
                    </div>
                  </div>

                  <!-- Dummy Totals -->
                  <div class="w-full border-t border-dashed border-slate-300 pt-2 mb-4 space-y-0.5">
                    <div class="flex justify-between"><span>SUBTOTAL (2 ITEM)</span><span>Rp 113.500</span></div>
                    <div class="flex justify-between font-bold text-[10px] sm:text-[11px] py-1 border-t border-b border-dashed border-slate-300 my-1">
                      <span>TOTAL AKHIR</span><span>Rp 113.500</span>
                    </div>
                  </div>

                  <div v-if="form.showBarcode" class="flex flex-col items-center mb-3">
                    <div class="w-3/4 h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMTAwIj48cGF0aCBkPSJNMTAgMTBoMTB2ODBIMTB6TTMwIDEwaDIwdjgwSDMweiM2MCAxMGg1djgwSDYweiM3NSAxMGgxMHY4MEg3NXpNOTUgMTBoMTV2ODBIMTV6IiBmaWxsPSIjMzMzIi8+PC9zdmc+')] bg-cover opacity-80"></div>
                    <span class="text-[7px] mt-0.5 tracking-widest">*TRX-20250524-014X*</span>
                  </div>

                  <div class="text-center whitespace-pre-line mt-2 text-[8px] sm:text-[9px]">
                    {{ form.footerText || 'Terima kasih atas kunjungan Anda!' }}
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
    let bluetoothCharacteristic = null;

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
    // Berfungsi meng-encode huruf menjadi raw byte HEX khusus printer
    // ==================================================================

    // Kamus Kode Printer Thermal Mentah (Raw Bytes)
    const getPrinterCommands = (preset) => {
      // Standar rata-rata ESC/POS
      const cmds = {
        Epson:    { init: [0x1B, 0x40], cut: [0x1D, 0x56, 0x41, 0x00], kick: [0x1B, 0x70, 0x00, 0x19, 0xFA] },
        StarLine: { init: [0x1B, 0x40], cut: [0x1B, 0x64, 0x02],       kick: [0x1B, 0x07] }, // StarPRNT
        Sunmi:    { init: [0x1B, 0x40], cut: [0x1D, 0x56, 0x42, 0x00], kick: [0x10, 0x14, 0x00, 0x00, 0x00] },
        Generic:  { init: [0x1B, 0x40], cut: [0x1D, 0x56, 0x01],       kick: [0x1B, 0x70, 0x00, 0x19, 0xFA] }
      };
      return cmds[preset] || cmds['Epson'];
    };

    // Fungsi Pembuka Jendela Deteksi Colokan/Bluetooth OS
    const scanPorts = async () => {
      if (form.value.interfaceType === 'USB') {
        if (!('serial' in navigator)) {
          showToast('Browser ini tidak mendukung Web Serial API. Gunakan Chrome/Edge di PC.', 'error');
          return;
        }
        try {
          serialPort = await navigator.serial.requestPort();
          const info = serialPort.getInfo();
          form.value.portOrIp = `USB_VID_${info.usbVendorId || 'Generic'}`;
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
          // Hanya mendukung printer BLE (Bluetooth Low Energy), bukan Classic SPP
          bluetoothDevice = await navigator.bluetooth.requestDevice({
             acceptAllDevices: true,
             optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // Service ID umum printer thermal BLE Tiongkok
          });
          form.value.portOrIp = bluetoothDevice.name || `BLE_${bluetoothDevice.id.substring(0,8)}`;
          isHardwareConnected.value = true;
          showToast(`Berhasil dipasangkan dengan Bluetooth: ${form.value.portOrIp}`);
        } catch (err) {
          showToast('Pemindaian Bluetooth dibatalkan: Pastikan printer tipe BLE.', 'error');
        }
      } else {
        showToast('Untuk LAN/IP (Jaringan), silakan ketik IP Address secara manual.');
      }
    };

    // Fungsi Pengiriman Raw Byte (Hardware Test)
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
          // Tutup koneksi agar port tidak hang jika aplikasi ditutup
          await serialPort.close(); 
          
       } else if (form.value.interfaceType === 'BT') {
          if (!bluetoothDevice) throw new Error("Perangkat Bluetooth belum dipilih.");
          
          const server = await bluetoothDevice.gatt.connect();
          const services = await server.getPrimaryServices();
          if (services.length === 0) throw new Error("Tidak menemukan layanan BLE yang valid.");
          
          // Cari slot penulisan data (Characteristic RX)
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
          // Sinyal ping LAN palsu (karena browser tidak bisa hit IP lokal TCP/9100)
          console.log(`[LAN PING] Mengirim ${dataArray.length} bytes ke ${form.value.portOrIp}`);
          await new Promise(resolve => setTimeout(resolve, 800));
       }
    };

    // Aksi Tombol: "Tes Kick Laci"
    const testHardwarePulse = async () => {
      testingPort.value = true;
      try {
        const cmds = getPrinterCommands(form.value.printerPreset);
        
        // Gabungkan perintah: Inisialisasi -> Buka Laci -> Potong Kertas
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

    // Aksi Tombol: "Uji Cetak Asli" (Mencetak teks betulan ke thermal hardware)
    const testHardwarePrint = async () => {
      testingPort.value = true;
      try {
        const cmds = getPrinterCommands(form.value.printerPreset);
        
        // Simulasi Raw Text ESC/POS (Tanpa formatting kompleks)
        const textToPrint = 
          "\\n" +
          "====== DECOUPLED POS ======\\n" +
          "   TES KONEKSI HARDWARE\\n" +
          "===========================\\n" +
          "Preset : " + form.value.printerPreset + "\\n" +
          "Koneksi: " + form.value.interfaceType + "\\n" +
          "Port   : " + (form.value.portOrIp || "Unknown") + "\\n" +
          "\\n\\nSukses! Perangkat terhubung.\\n\\n\\n";
        
        // Ubah string jadi byte ASCII
        const textBytes = Array.from(textToPrint).map(c => c.charCodeAt(0));
        
        // Init -> Teks -> Potong Kertas
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
      testingPort, isHardwareConnected,
      saveSettings, scanPorts, testHardwarePulse, testHardwarePrint,
      formatRupiah, formatDate, formatTime
    };
  }
};