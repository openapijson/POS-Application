const { createApp, ref, computed, onMounted, watch } = Vue;

const app = createApp({
  setup() {
    // --- STATE ROUTING & UI ---
    const currentView = ref('login-view');
    const isCheckingSession = ref(true); // Loading awal saat cek token
    const isMobileMenuOpen = ref(false); // Toggle menu sidebar di mobile
    
    // State untuk Modal Konfirmasi Logout
    const showLogoutModal = ref(false);
    const isLoggingOut = ref(false);

    // --- COMPUTED PROPERTIES: Menu Navigasi Berdasarkan Role ---
    const menuItems = computed(() => {
      if (isAdmin.value) {
        return [
          { id: 'dashboard-view', label: 'Dashboard', icon: 'dashboard' },
          { id: 'pos-view', label: 'POS / Kasir', icon: 'point_of_sale' },
          { id: 'product-view', label: 'Manajemen Produk', icon: 'inventory_2' },
          { id: 'transaction-view', label: 'Riwayat Transaksi', icon: 'receipt_long' },
        ];
      } else if (isKasir.value) {
        return [
          { id: 'pos-view', label: 'POS / Kasir', icon: 'point_of_sale' },
          { id: 'transaction-view', label: 'Riwayat Transaksi', icon: 'receipt_long' },
        ];
      }
      return [];
    });

    const activeMenuTitle = computed(() => {
      const active = menuItems.value.find(m => m.id === currentView.value);
      return active ? active.label : 'Menu';
    });

    // --- METHODS & LIFECYCLE ---
    
    const changeView = (viewId) => {
      currentView.value = viewId;
      isMobileMenuOpen.value = false; // Tutup menu mobile jika navigasi berubah
    };

    const onLoginSuccess = () => {
      // Arahkan ke halaman utama berdasarkan Role
      if (isAdmin.value) {
         changeView('dashboard-view');
      } else {
         changeView('pos-view');
      }
    };

    // Verifikasi Token saat aplikasi pertama kali dimuat
    const checkInitialSession = async () => {
      isCheckingSession.value = true;
      
      if (authState.token) {
        // Ping ke server untuk memastikan token masih valid di CacheService
        // Menggunakan endpoint transactions.list karena ini endpoint ringan yang tersedia untuk kedua Role
        const res = await apiRequest('transactions.list', {}, authState.token);
        
        if (handleAuthError(res.message)) {
           // Jika token basi/ditolak, handleAuthError otomatis menghapus memori lokal
           currentView.value = 'login-view';
        } else {
           // Sesi valid! Buka dashboard
           onLoginSuccess();
        }
      } else {
        currentView.value = 'login-view';
      }
      
      isCheckingSession.value = false;
    };

    const confirmLogout = () => {
      showLogoutModal.value = true;
    };

    const executeLogout = async () => {
      isLoggingOut.value = true;
      await performLogout(false); // Panggil endpoint logout di server
      isLoggingOut.value = false;
      showLogoutModal.value = false;
      // currentView akan otomatis berubah ke login-view berkat watcher di bawah
    };

    // Watcher: Jika state isLoggedIn berubah jadi false (misal karena expired token dari request apapun),
    // langsung kembalikan view ke login screen.
    watch(() => isLoggedIn.value, (newVal) => {
      if (!newVal) {
        currentView.value = 'login-view';
      }
    });

    onMounted(() => {
      checkInitialSession();
    });

    return {
      currentView,
      isCheckingSession,
      isMobileMenuOpen,
      showLogoutModal,
      isLoggingOut,
      menuItems,
      activeMenuTitle,
      isLoggedIn,
      authState,
      APP_CONFIG,
      changeView,
      onLoginSuccess,
      confirmLogout,
      executeLogout
    };
  },

  template: `
    <div class="h-screen w-full bg-brandbg overflow-hidden font-sans text-brandtext flex items-center justify-center relative">
      
      <!-- Layar Loading Awal -->
      <div v-if="isCheckingSession" class="flex flex-col items-center justify-center">
         <span class="material-symbols-outlined text-5xl text-brandprimary animate-spin mb-4">refresh</span>
         <p class="text-sm font-semibold text-slate-500 animate-pulse">Menghubungkan ke Terminal POS...</p>
      </div>

      <!-- Halaman Login -->
      <login-view v-else-if="!isLoggedIn" @login-success="onLoginSuccess" class="w-full h-full"></login-view>

      <!-- Layout Utama Aplikasi (Authenticated) -->
      <div v-else class="flex h-full w-full">
        
        <!-- Backdrop Menu Mobile -->
        <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm"></div>

        <!-- Sidebar Navigasi -->
        <aside class="fixed lg:static inset-y-0 left-0 w-[260px] bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 flex flex-col"
               :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
          
          <!-- Logo & Brand -->
          <div class="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
             <div class="w-8 h-8 rounded-lg bg-brandprimary/10 text-brandprimary flex items-center justify-center mr-3">
               <span class="material-symbols-outlined text-[20px]">point_of_sale</span>
             </div>
             <div>
               <h1 class="font-bold text-slate-800 text-sm leading-tight">{{ APP_CONFIG.APP_NAME }}</h1>
               <p class="text-[10px] text-slate-500 font-mono">STORE ENGINE V{{ APP_CONFIG.VERSION }}</p>
             </div>
          </div>

          <!-- Menu Link -->
          <div class="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
            <p class="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Terminal Navigation</p>
            
            <button v-for="menu in menuItems" :key="menu.id" @click="changeView(menu.id)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
                    :class="currentView === menu.id ? 'bg-brandprimary text-white shadow-md shadow-brandprimary/20' : 'text-slate-600 hover:bg-slate-50 hover:text-brandprimary'">
              <span class="material-symbols-outlined text-[20px]" 
                    :class="currentView === menu.id ? 'text-white' : 'text-slate-400 group-hover:text-brandprimary'">
                {{ menu.icon }}
              </span>
              {{ menu.label }}
            </button>
          </div>

          <!-- Indikator Koneksi Bawah -->
          <div class="p-4 border-t border-slate-100 shrink-0">
             <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-xs font-mono text-slate-600">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>LAN 192.168.1.14</span>
                <span class="ml-auto text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-bold">ONLINE</span>
             </div>
          </div>
        </aside>

        <!-- Area Konten Utama -->
        <main class="flex-1 flex flex-col min-w-0 h-full relative">
          
          <!-- Top Header -->
          <header class="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
            <div class="flex items-center gap-3">
              <button @click="isMobileMenuOpen = true" class="w-10 h-10 flex lg:hidden items-center justify-center rounded-lg hover:bg-slate-50 text-slate-600">
                <span class="material-symbols-outlined">menu</span>
              </button>
              <h2 class="font-bold text-slate-800 sm:text-lg hidden sm:block">{{ activeMenuTitle }}</h2>
            </div>

            <div class="flex items-center gap-4">
               <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                 <span class="material-symbols-outlined text-[16px] text-brandprimary">check_circle</span>
                 STATUS: ONLINE
               </div>

               <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>
               
               <div class="flex items-center gap-3 text-right">
                  <div class="hidden sm:block">
                     <p class="text-sm font-bold text-slate-800 leading-none">{{ authState.user?.full_name || 'Kasir' }}</p>
                     <p class="text-[10px] text-slate-500 font-mono mt-1">
                       <span class="bg-brandprimary/10 text-brandprimary px-1 rounded uppercase mr-1 font-bold">{{ authState.user?.role }}</span> 
                       [Shift Aktif]
                     </p>
                  </div>
                  <div class="w-9 h-9 rounded-full bg-brandprimary/10 text-brandprimary flex items-center justify-center font-bold">
                    {{ authState.user?.full_name ? authState.user.full_name.charAt(0).toUpperCase() : 'K' }}
                  </div>
               </div>

               <button @click="confirmLogout" class="w-10 h-10 rounded-xl border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-all ml-1 tooltip-trigger" title="Keluar dari Sistem">
                  <span class="material-symbols-outlined text-[20px]">logout</span>
               </button>
            </div>
          </header>

          <!-- Konten View Dinamis -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-brandbg">
             <keep-alive include="PosView">
                <!-- Gunakan Keep-Alive khusus PosView agar keranjang tidak hilang jika kasir pindah tab ke riwayat sebentar -->
                <component :is="currentView" @change-view="changeView"></component>
             </keep-alive>
          </div>
        </main>
      </div>
      
      <!-- MODAL LOGOUT CUSTOM (Aturan Wajib 10.2.1 - Anti Native Alert) -->
      <div v-if="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" @click.self="showLogoutModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto transform transition-all text-center">
           
           <div class="p-6 pt-8">
             <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
               <span class="material-symbols-outlined text-3xl">power_settings_new</span>
             </div>
             <h3 class="text-xl font-bold text-slate-800 mb-2">Akhiri Shift?</h3>
             <p class="text-sm text-slate-500">Anda yakin ingin keluar dari Terminal POS? Anda harus masuk kembali untuk memulai transaksi.</p>
           </div>
           
           <div class="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
             <button @click="showLogoutModal = false" :disabled="isLoggingOut" class="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors disabled:opacity-50">
               Batal
             </button>
             <button @click="executeLogout" :disabled="isLoggingOut" class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm shadow-red-600/20 transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
               <span v-if="isLoggingOut" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
               Keluar Sistem
             </button>
           </div>

        </div>
      </div>

    </div>
  `
});

// Daftarkan semua View sebagai komponen global
app.component('login-view', LoginView);
app.component('dashboard-view', DashboardView);
app.component('product-view', ProductView);
app.component('pos-view', PosView);
app.component('transaction-view', TransactionView);

// Mount aplikasi ke dalam div #app di index.html
app.mount('#app');