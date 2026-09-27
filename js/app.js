const app = Vue.createApp({
  setup() {
    const { ref, computed, onMounted, watch, nextTick } = Vue;
    
    const currentView = ref('login-view');
    const isCheckingSession = ref(true);
    const isMobileMenuOpen = ref(false);
    
    const showLogoutModal = ref(false);
    const isLoggingOut = ref(false);

    const menuItems = computed(() => {
      if (isAdmin.value) {
        return [
          { id: 'dashboard-view', label: 'Dashboard', icon: 'dashboard' },
          { id: 'pos-view', label: 'POS / Kasir', icon: 'point_of_sale' },
          { id: 'product-view', label: 'Manajemen Produk', icon: 'inventory_2' },
          { id: 'transaction-view', label: 'Riwayat Transaksi', icon: 'receipt_long' },
          { id: 'user-view', label: 'Kelola Pengguna', icon: 'manage_accounts' },
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

    const changeView = (viewId) => {
      currentView.value = viewId;
      // SIMPAN POSISI HALAMAN TERAKHIR KE LOCAL STORAGE
      localStorage.setItem('pos_last_view', viewId);
      isMobileMenuOpen.value = false; // Tutup menu saat navigasi (mobile)
    };

    const onLoginSuccess = () => {
      // BACA POSISI HALAMAN TERAKHIR DARI LOCAL STORAGE
      const savedView = localStorage.getItem('pos_last_view');
      const validViews = menuItems.value.map(m => m.id);

      // Jika ada histori halaman dan halaman itu diizinkan untuk rolenya, buka itu
      if (savedView && validViews.includes(savedView)) {
        changeView(savedView);
      } else {
        // Jika tidak ada histori, gunakan default
        if (isAdmin.value) {
           changeView('dashboard-view');
        } else {
           changeView('pos-view');
        }
      }
    };

    const checkInitialSession = async () => {
      isCheckingSession.value = true;
      if (authState.token) {
        // Panggil endpoint ringan untuk cek token masih valid atau tidak
        const res = await apiRequest('transactions.list', {}, authState.token);
        if (handleAuthError(res.message)) {
           currentView.value = 'login-view';
        } else {
           if (!authState.mustChangePassword) {
             onLoginSuccess();
           }
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
      // Hapus memori halaman terakhir agar user baru tidak nyasar
      localStorage.removeItem('pos_last_view'); 
      await performLogout(false);
      isLoggingOut.value = false;
      showLogoutModal.value = false;
    };

    // Watcher: Jika state isLoggedIn berubah
    watch(() => isLoggedIn.value, (newVal) => {
      if (!newVal) {
        currentView.value = 'login-view';
        isMobileMenuOpen.value = false;
      } else if (!authState.mustChangePassword) {
        // Gunakan nextTick untuk mencegah DOM race condition (bug UI nyangkut)
        nextTick(() => {
          onLoginSuccess();
        });
      }
    });

    // Watcher: Jika user baru saja selesai ganti password wajib
    watch(() => authState.mustChangePassword, (newVal) => {
      if (!newVal && isLoggedIn.value) {
        nextTick(() => {
          onLoginSuccess();
        });
      }
    });

    onMounted(() => {
      checkInitialSession();
    });

    return {
      currentView, isCheckingSession, isMobileMenuOpen, showLogoutModal, isLoggingOut,
      menuItems, activeMenuTitle, isLoggedIn, authState, APP_CONFIG,
      changeView, onLoginSuccess, confirmLogout, executeLogout
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
      <login-view v-else-if="!isLoggedIn || authState.mustChangePassword" @login-success="onLoginSuccess" class="w-full h-full"></login-view>

      <!-- Layout Utama Aplikasi (Authenticated) -->
      <div v-else class="flex h-full w-full">
        
        <!-- Backdrop Menu Mobile -->
        <transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100" leave-to-class="opacity-0">
          <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm cursor-pointer"></div>
        </transition>

        <!-- Sidebar Navigasi -->
        <aside class="fixed lg:static inset-y-0 left-0 w-[260px] bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 flex flex-col shadow-2xl lg:shadow-none"
               :class="[isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full', 'lg:translate-x-0']">
          
          <!-- Logo & Brand -->
          <div class="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
             <div class="flex items-center">
               <div class="w-8 h-8 rounded-lg bg-brandprimary/10 text-brandprimary flex items-center justify-center mr-3">
                 <span class="material-symbols-outlined text-[20px]">point_of_sale</span>
               </div>
               <div>
                 <h1 class="font-bold text-slate-800 text-sm leading-tight">{{ APP_CONFIG.APP_NAME }}</h1>
                 <p class="text-[10px] text-slate-500 font-mono">STORE ENGINE V{{ APP_CONFIG.VERSION }}</p>
               </div>
             </div>
             
             <!-- Tombol Tutup Mobile (Baru ditambahkan agar rapi) -->
             <button @click="isMobileMenuOpen = false" class="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <span class="material-symbols-outlined text-[20px]">close</span>
             </button>
          </div>

          <!-- User Info Mini -->
          <div class="p-4 border-b border-slate-100 bg-slate-50/50">
            <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-500 overflow-hidden">
                 <span class="material-symbols-outlined">person</span>
               </div>
               <div class="overflow-hidden">
                 <p class="text-xs font-bold text-slate-800 truncate">{{ authState.user?.full_name || 'User' }}</p>
                 <p class="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                   <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                 </p>
               </div>
            </div>
          </div>
          
          <!-- Menu Navigasi -->
          <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
             <button v-for="item in menuItems" :key="item.id" @click="changeView(item.id)"
               class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group"
               :class="currentView === item.id ? 'bg-brandprimary text-white shadow-md shadow-brandprimary/20' : 'text-slate-600 hover:bg-slate-50 hover:text-brandprimary'">
               <span class="material-symbols-outlined text-[20px]" :class="currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-brandprimary'">{{ item.icon }}</span>
               {{ item.label }}
             </button>
          </nav>
          
          <!-- Footer Sidebar -->
          <div class="p-4 border-t border-slate-100">
             <button @click="confirmLogout" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors">
               <span class="material-symbols-outlined text-[18px]">logout</span> Akhiri Shift
             </button>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col min-w-0 h-full relative z-0">
          
          <!-- Top Header -->
          <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10">
            <div class="flex items-center gap-3">
              <button @click="isMobileMenuOpen = true" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
                <span class="material-symbols-outlined text-[24px]">menu</span>
              </button>
              <h2 class="text-sm font-bold text-slate-800 hidden sm:block">{{ activeMenuTitle }}</h2>
            </div>
            
            <div class="flex items-center gap-3">
               <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                 <span class="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                 <span class="text-xs font-bold text-emerald-700">STATUS: ONLINE</span>
               </div>
               
               <div class="flex items-center gap-2 text-right">
                  <div>
                    <p class="text-xs font-bold text-slate-800">{{ authState.user?.username || 'Unknown' }}</p>
                    <p class="text-[10px] text-brandprimary font-bold uppercase tracking-widest">{{ authState.user?.role || 'KASIR' }} <span class="text-slate-400 font-normal ml-1">[Shift Aktif]</span></p>
                  </div>
                  <div class="w-8 h-8 rounded-lg bg-brandprimary/10 text-brandprimary flex items-center justify-center font-bold text-sm">
                    {{ (authState.user?.username || 'U').charAt(0).toUpperCase() }}
                  </div>
               </div>
            </div>
          </header>

          <!-- Komponen View Dinamis -->
          <div class="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
             <!-- Gunakan KeepAlive agar state (seperti input pencarian) tidak hilang saat pindah menu -->
             <keep-alive include="PosView">
               <component :is="currentView" @change-view="changeView"></component>
             </keep-alive>
          </div>
        </main>
      </div>

      <!-- Modal Logout Global -->
      <div v-if="showLogoutModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" @click.self="showLogoutModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all text-center">
          <div class="p-6">
            <div class="w-16 h-16 rounded-full bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-3xl">logout</span>
            </div>
            <h3 class="text-lg font-bold text-slate-800 mb-2">Akhiri Shift Kasir?</h3>
            <p class="text-sm text-slate-500 mb-1">Anda akan keluar dari sistem POS. Pastikan semua transaksi sudah diselesaikan.</p>
          </div>
          <div class="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
            <button @click="showLogoutModal = false" :disabled="isLoggingOut" class="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors">
              Batal
            </button>
            <button @click="executeLogout" :disabled="isLoggingOut" class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-sm shadow-red-600/20 transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
              <span v-if="isLoggingOut" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              Keluar
            </button>
          </div>
        </div>
      </div>

    </div>
  `
});

// Registrasi semua view/komponen agar bisa dirender dinamis oleh <component :is="...">
app.component('login-view', LoginView);
app.component('dashboard-view', DashboardView);
app.component('product-view', ProductView);
app.component('pos-view', PosView);
app.component('transaction-view', TransactionView);
app.component('user-view', UserView);

// Mount aplikasi
app.mount('#app');