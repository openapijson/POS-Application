// const { ref } = Vue;

const LoginView = {
  name: 'LoginView',
  // Kita emit event 'login-success' agar App.js bisa memindahkan halaman ke Dashboard
  emits: ['login-success'], 
  
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      
      <div class="w-full max-w-md bg-brandsurface rounded-2xl shadow-xl overflow-hidden border border-brandborder">
        
        <!-- Header Section -->
        <div class="p-8 pb-6 text-center">
          <div class="w-16 h-16 bg-brandprimary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-4xl text-brandprimary">point_of_sale</span>
          </div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 mb-4">
            <span class="w-2 h-2 rounded-full bg-brandprimary"></span>
            TERMINAL POS &bull; SHIFT AKTIF
          </div>
          <h1 class="text-2xl font-bold text-brandtext mb-1">Decoupled POS</h1>
          <p class="text-sm text-brandmuted">Sistem Kasir & Manajemen Inventori Terintegrasi</p>
        </div>

        <div class="px-8 pb-8">
          
          <div v-if="!authState.mustChangePassword">
            
            <!-- Alert Error -->
            <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 text-branddanger text-sm rounded-lg border border-red-100 flex items-start gap-2">
              <span class="material-symbols-outlined text-base">error</span>
              <span>{{ errorMsg }}</span>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-5">
              <div>
                <div class="flex justify-between mb-1.5">
                  <label class="text-sm font-medium text-brandtext">Username / ID Karyawan</label>
                  <span class="text-[10px] text-brandmuted font-mono bg-slate-100 px-1.5 rounded">AUTH-MODE</span>
                </div>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">account_circle</span>
                  <input type="text" v-model="username" required :disabled="loading"
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:border-brandprimary transition-colors"
                    placeholder="Masukkan username">
                </div>
              </div>

              <div>
                <label class="text-sm font-medium text-brandtext block mb-1.5">Password</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input :type="showPassword ? 'text' : 'password'" v-model="password" required :disabled="loading"
                    class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:border-brandprimary transition-colors"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;">
                  <button type="button" @click="showPassword = !showPassword" tabindex="-1"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <span class="material-symbols-outlined text-xl">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="w-4 h-4 text-brandprimary rounded border-slate-300 focus:ring-brandprimary">
                  <span class="text-sm text-brandmuted">Ingat sesi login</span>
                </label>
                <a href="#" class="text-sm text-brandprimary hover:text-brandprimaryhover font-medium">Lupa password?</a>
              </div>

              <button type="submit" :disabled="loading"
                class="w-full py-3 px-4 bg-brandprimary hover:bg-brandprimaryhover text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-brandprimary/20">
                <span v-if="loading" class="material-symbols-outlined animate-spin">progress_activity</span>
                <span>{{ loading ? 'Memverifikasi...' : 'Masuk ke Sistem' }}</span>
                <span v-if="!loading" class="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </form>

            <!-- Fitur Akses Cepat untuk Demo (Sesuai Mockup) -->
            <div class="mt-8 pt-6 border-t border-slate-100">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-4">Akun Akses Cepat (Demo)</p>
              <div class="grid grid-cols-2 gap-3">
                <button @click="fillDemo('admin', 'Admin123!')" type="button" class="flex flex-col items-start p-3 bg-slate-50 border border-slate-200 hover:border-brandprimary rounded-lg transition-colors text-left group">
                  <div class="flex justify-between w-full mb-1">
                    <span class="text-xs font-bold text-brandprimary">ADMIN</span>
                    <span class="material-symbols-outlined text-sm text-slate-400 group-hover:text-brandprimary transition-colors">login</span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-500">admin</span>
                </button>
                <button @click="fillDemo('kasir', 'Kasir123!')" type="button" class="flex flex-col items-start p-3 bg-slate-50 border border-slate-200 hover:border-brandwarning rounded-lg transition-colors text-left group">
                  <div class="flex justify-between w-full mb-1">
                    <span class="text-xs font-bold text-brandwarning">KASIR</span>
                    <span class="material-symbols-outlined text-sm text-slate-400 group-hover:text-brandwarning transition-colors">login</span>
                  </div>
                  <span class="text-[10px] font-mono text-slate-500">kasir (contoh)</span>
                </button>
              </div>
            </div>
          </div>

          <div v-else>
            <div class="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
              <span class="material-symbols-outlined text-brandwarning mt-0.5">warning</span>
              <div class="text-sm text-yellow-800">
                <p class="font-bold mb-1">Tindakan Diperlukan</p>
                <p>Anda masih menggunakan sandi bawaan (default). Untuk alasan keamanan, Anda wajib menggantinya sebelum dapat mengakses sistem.</p>
              </div>
            </div>

            <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 text-branddanger text-sm rounded-lg border border-red-100">
              {{ errorMsg }}
            </div>

            <form @submit.prevent="handleChangePasswordSubmit" class="space-y-4">
              <div>
                <label class="text-sm font-medium text-brandtext block mb-1">Password Lama</label>
                <input type="password" v-model="oldPassword" required :disabled="loading"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50">
              </div>
              <div>
                <label class="text-sm font-medium text-brandtext block mb-1">Password Baru (Min. 8 Karakter)</label>
                <input type="password" v-model="newPassword" required minlength="8" :disabled="loading"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50">
              </div>
              <div>
                <label class="text-sm font-medium text-brandtext block mb-1">Konfirmasi Password Baru</label>
                <input type="password" v-model="confirmPassword" required minlength="8" :disabled="loading"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50">
              </div>

              <button type="submit" :disabled="loading"
                class="w-full py-3 mt-2 bg-brandwarning hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                <span v-if="loading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                <span>{{ loading ? 'Menyimpan...' : 'Simpan & Lanjutkan' }}</span>
              </button>
            </form>
          </div>

        </div>
      </div>
      
      <!-- Footer Copyright -->
      <div class="fixed bottom-6 left-0 right-0 text-center">
         <div class="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <span class="material-symbols-outlined text-[14px]">shield</span>
            KONEKSI TERENKRIPSI SSL 256-BIT
         </div>
         <p class="text-[11px] text-slate-400 font-mono">Versi POS {{ APP_CONFIG.VERSION }}-Production</p>
      </div>

    </div>
  `,

  setup(props, { emit }) {
    // State Form Login
    const username = ref('');
    const password = ref('');
    const showPassword = ref(false);
    
    // State Form Change Password
    const oldPassword = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');

    // State Global UI
    const loading = ref(false);
    const errorMsg = ref('');

    // Mengisi otomatis untuk kebutuhan testing/demo
    const fillDemo = (u, p) => {
      username.value = u;
      password.value = p;
      errorMsg.value = '';
    };

    const handleLogin = async () => {
      errorMsg.value = '';
      loading.value = true;
      
      // performLogin() berasal dari file js/auth.js (global)
      const res = await performLogin(username.value, password.value);
      loading.value = false;

      if (!res.success) {
        errorMsg.value = res.message;
        return;
      }

      // Jika berhasil tapi wajib ganti password, 
      // UI otomatis berubah karena state authState.mustChangePassword menjadi true.
      if (!authState.mustChangePassword) {
        // Jika tidak perlu ganti password, beri sinyal ke App.js untuk masuk ke Dashboard
        emit('login-success');
      }
    };

    const handleChangePasswordSubmit = async () => {
      errorMsg.value = '';
      
      if (newPassword.value !== confirmPassword.value) {
        errorMsg.value = 'Konfirmasi password tidak cocok dengan password baru.';
        return;
      }
      
      if (newPassword.value.length < 8) {
        errorMsg.value = 'Password baru minimal harus 8 karakter.';
        return;
      }

      loading.value = true;
      
      // performChangePassword() memanggil endpoint backend sesungguhnya di js/auth.js
      const res = await performChangePassword(oldPassword.value, newPassword.value);
      loading.value = false;

      if (!res.success) {
        errorMsg.value = res.message;
        return;
      }

      // Sukses ganti sandi! Lanjut masuk ke Dashboard.
      alert('Password berhasil diubah. Selamat datang!');
      emit('login-success');
    };

    return {
      username,
      password,
      showPassword,
      oldPassword,
      newPassword,
      confirmPassword,
      loading,
      errorMsg,
      authState,
      APP_CONFIG,
      fillDemo,
      handleLogin,
      handleChangePasswordSubmit
    };
  }
};