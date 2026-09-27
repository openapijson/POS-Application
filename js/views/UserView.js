const UserView = {
  name: 'UserView',
  
  template: `
    <div class="space-y-6 animate-fade-in pb-10">
      
      <!-- Header Area -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
            <span>Sistem</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Akses & Autentikasi</span>
            <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            <span class="text-brandprimary">Kelola Pengguna</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-brandtext mb-1">Manajemen Pengguna & Hak Akses</h1>
          <p class="text-sm text-brandmuted">Atur akun staf, kredensial kasir, peran akses, dan monitor sesi aktif.</p>
        </div>
        
        <div class="flex items-center gap-3">
          <button @click="loadUsers" :disabled="loading" class="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50">
            <span class="material-symbols-outlined text-lg" :class="{'animate-spin': loading}">refresh</span>
          </button>
          <button @click="openAddModal" class="px-4 py-2.5 bg-brandprimary hover:bg-brandprimaryhover text-white text-sm font-semibold rounded-xl shadow-sm shadow-brandprimary/30 transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">person_add</span>
            Tambah Pengguna Baru
          </button>
        </div>
      </div>

      <div v-if="globalError" class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 shadow-sm">
        <span class="material-symbols-outlined">error</span>
        <p class="text-sm font-medium">{{ globalError }}</p>
        <button @click="globalError = ''" class="ml-auto text-red-400 hover:text-red-600">
           <span class="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <!-- Main Layout: Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        <!-- Kolom Kiri & Tengah: Summary & Table -->
        <div class="xl:col-span-2 space-y-6">
          
          <!-- Dashboard Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div class="flex justify-between items-start mb-4">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Akun Terdaftar</p>
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[18px]">group</span>
                </div>
              </div>
              <div class="flex items-baseline gap-2">
                <h3 class="text-3xl font-black text-slate-800">{{ users.length }}</h3>
                <span class="text-sm font-medium text-slate-500">Pengguna</span>
              </div>
              <div class="mt-4 flex gap-2 text-[10px] font-bold">
                 <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded">{{ totalAdmin }} Admin</span>
                 <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded">{{ totalKasir }} Kasir</span>
              </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div class="flex justify-between items-start mb-4">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pengguna Aktif Saat Ini</p>
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
              </div>
              <div class="flex items-baseline gap-2">
                <h3 class="text-3xl font-black text-slate-800">{{ totalActive }}</h3>
                <span class="text-sm font-medium text-slate-500">Akun Aktif</span>
              </div>
              <p class="mt-4 text-xs font-medium text-emerald-600 flex items-center gap-1">
                 <span class="material-symbols-outlined text-[14px]">point_of_sale</span> Terminal POS Ready
              </p>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div class="flex justify-between items-start mb-4">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Keamanan & Akses</p>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
              </div>
              <div class="flex items-baseline gap-2">
                <h3 class="text-3xl font-black text-emerald-600">100%</h3>
                <span class="text-sm font-medium text-slate-500">Terverifikasi</span>
              </div>
              <p class="mt-4 text-xs font-medium text-slate-500 flex items-center gap-1">
                 <span class="material-symbols-outlined text-[14px]">key</span> Enkripsi Bcrypt Aktif
              </p>
            </div>
          </div>

          <!-- Table Section -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <!-- Toolbar -->
            <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
              <div class="relative flex-1">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <input type="text" v-model="searchQuery" placeholder="Cari staf, email, atau username..." 
                  class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:border-brandprimary transition-colors">
              </div>
              <div class="flex gap-2">
                <select v-model="filterRole" class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-brandprimary">
                  <option value="">Semua Peran</option>
                  <option value="Admin">Admin</option>
                  <option value="Kasir">Kasir</option>
                </select>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr class="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th class="p-4 font-semibold">Pengguna</th>
                    <th class="p-4 font-semibold">ID / Username</th>
                    <th class="p-4 font-semibold">Peran Utama</th>
                    <th class="p-4 font-semibold text-center">Status</th>
                    <th class="p-4 font-semibold text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody v-if="loading" class="divide-y divide-slate-100">
                  <tr v-for="i in 4" :key="i" class="animate-pulse">
                    <td class="p-4 flex gap-3"><div class="w-10 h-10 bg-slate-200 rounded-full"></div><div class="flex-1"><div class="w-24 h-4 bg-slate-200 rounded mb-2"></div><div class="w-32 h-3 bg-slate-100 rounded"></div></div></td>
                    <td class="p-4"><div class="w-20 h-4 bg-slate-200 rounded"></div></td>
                    <td class="p-4"><div class="w-16 h-6 bg-slate-200 rounded-full"></div></td>
                    <td class="p-4"><div class="w-16 h-6 bg-slate-200 rounded-full mx-auto"></div></td>
                    <td class="p-4"><div class="w-10 h-8 bg-slate-200 rounded mx-auto"></div></td>
                  </tr>
                </tbody>
                <tbody v-else-if="filteredUsers.length === 0" class="divide-y divide-slate-100">
                  <tr>
                    <td colspan="5" class="p-12 text-center text-slate-400">
                      <span class="material-symbols-outlined text-4xl mb-2 opacity-50">person_off</span>
                      <p class="font-medium text-sm">Tidak ada pengguna ditemukan.</p>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else class="text-sm divide-y divide-slate-100">
                  <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50 transition-colors group">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                         <div class="w-10 h-10 rounded-full bg-brandprimary/10 text-brandprimary flex items-center justify-center font-bold shadow-sm shrink-0">
                           {{ user.full_name.charAt(0).toUpperCase() }}
                         </div>
                         <div>
                           <p class="font-bold text-slate-800">{{ user.full_name }}</p>
                           <p class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                             <span v-if="user.force_password_change" class="text-orange-500 material-symbols-outlined text-[12px]" title="Belum ganti password awal">warning</span>
                             Ditambahkan {{ formatDate(user.created_at) }}
                           </p>
                         </div>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{{ user.username }}</span>
                    </td>
                    <td class="p-4">
                      <span class="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide"
                            :class="user.role === 'Admin' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="p-4 text-center">
                      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border" 
                           :class="user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'">
                        <span class="w-1.5 h-1.5 rounded-full" :class="user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'"></span>
                        {{ user.status === 'Active' ? 'Aktif' : 'Non-aktif' }}
                      </div>
                    </td>
                    <td class="p-4 text-center">
                      <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="openEditModal(user)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-brandprimary/10 text-slate-500 hover:text-brandprimary flex items-center justify-center transition-colors tooltip-trigger" title="Edit Akses">
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button v-if="user.id !== authState.user.user_id" @click="confirmDelete(user)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors tooltip-trigger" title="Nonaktifkan Akun">
                          <span class="material-symbols-outlined text-[18px]">block</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Matriks Peran (Sesuai Desain) -->
        <div class="xl:col-span-1">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
             <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                  <span class="material-symbols-outlined text-brandprimary">admin_panel_settings</span>
                  Matriks Hak Akses
                </h3>
                <span class="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">RBAC Preset</span>
             </div>
             
             <p class="text-xs text-slate-500 mb-4 leading-relaxed">
               Perbandingan hak istimewa operasional kasir dan manajer toko secara langsung dalam sistem Decoupled POS.
             </p>

             <div class="border border-slate-200 rounded-xl overflow-hidden">
               <table class="w-full text-xs text-left">
                 <thead class="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500">
                   <tr>
                     <th class="p-3 font-bold">Aksi Operasional</th>
                     <th class="p-3 font-bold text-center">Kasir</th>
                     <th class="p-3 font-bold text-center">Admin</th>
                   </tr>
                 </thead>
                 <tbody class="divide-y divide-slate-100">
                   <tr class="hover:bg-slate-50">
                     <td class="p-3 text-slate-700">Akses Modul POS</td>
                     <td class="p-3 text-center text-emerald-500"><span class="material-symbols-outlined text-[16px]">check</span></td>
                     <td class="p-3 text-center text-emerald-500"><span class="material-symbols-outlined text-[16px]">check</span></td>
                   </tr>
                   <tr class="hover:bg-slate-50">
                     <td class="p-3 text-slate-700">Riwayat Struk Pribadi</td>
                     <td class="p-3 text-center text-emerald-500"><span class="material-symbols-outlined text-[16px]">check</span></td>
                     <td class="p-3 text-center text-emerald-500"><span class="material-symbols-outlined text-[16px]">check</span></td>
                   </tr>
                   <tr class="hover:bg-slate-50">
                     <td class="p-3 text-slate-700">Tambah/Edit Master SKU</td>
                     <td class="p-3 text-center text-red-400"><span class="material-symbols-outlined text-[16px]">close</span></td>
                     <td class="p-3 text-center text-emerald-500"><span class="material-symbols-outlined text-[16px]">check</span></td>
                   </tr>
                   <tr class="hover:bg-slate-50">
                     <td class="p-3 text-slate-700">Laporan Rekap & Laba</td>
                     <td class="p-3 text-center text-red-400"><span class="material-symbols-outlined text-[16px]">close</span></td>
                     <td class="p-3 text-center text-emerald-500"><span class="material-symbols-outlined text-[16px]">check</span></td>
                   </tr>
                   <tr class="hover:bg-slate-50">
                     <td class="p-3 text-slate-700">Kelola Akun Karyawan</td>
                     <td class="p-3 text-center text-red-400"><span class="material-symbols-outlined text-[16px]">close</span></td>
                     <td class="p-3 text-center text-emerald-500"><span class="material-symbols-outlined text-[16px]">check</span></td>
                   </tr>
                 </tbody>
               </table>
             </div>
             
             <div class="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
               <h4 class="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1.5">
                 <span class="material-symbols-outlined text-[16px]">info</span> Keamanan Kredensial
               </h4>
               <p class="text-[11px] text-blue-600 leading-relaxed">
                 Pengguna baru yang didaftarkan akan dipaksa mengubah kata sandi / PIN mereka pada saat login pertama kali.
               </p>
             </div>
          </div>
        </div>

      </div>

      <!-- MODAL FORM PENGGUNA -->
      <teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" @click.self="closeModal">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col transform transition-all">
          
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-xl bg-brandprimary/10 text-brandprimary flex items-center justify-center">
                 <span class="material-symbols-outlined">{{ modalMode === 'add' ? 'person_add' : 'manage_accounts' }}</span>
               </div>
               <div>
                 <h3 class="text-base font-bold text-slate-800">{{ modalMode === 'add' ? 'Tambah Staf Baru' : 'Edit Pengguna' }}</h3>
                 <p class="text-[11px] text-slate-500">Atur kredensial dan peran akses sistem.</p>
               </div>
            </div>
            <button type="button" @click="closeModal" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div v-if="modalError" class="mb-5 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2">
              <span class="material-symbols-outlined text-base">error</span>
              <p>{{ modalError }}</p>
            </div>

            <form @submit.prevent="submitForm" id="userForm" class="space-y-4">
              
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Nama Lengkap Karyawan <span class="text-red-500">*</span></label>
                <input type="text" v-model="formData.full_name" required :disabled="actionLoading"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:bg-white transition-colors" 
                  placeholder="Misal: Dinda Pratiwi">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">ID / Username <span class="text-red-500">*</span></label>
                  <input type="text" v-model="formData.username" required :disabled="actionLoading || modalMode === 'edit'"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:bg-white font-mono transition-colors" 
                    placeholder="KSR-016">
                  <p v-if="modalMode === 'edit'" class="text-[9px] text-slate-400 mt-1">Username tidak dapat diubah.</p>
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Peran Utama <span class="text-red-500">*</span></label>
                  <select v-model="formData.role" required :disabled="actionLoading"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:bg-white transition-colors">
                    <option value="Kasir">Kasir POS</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div v-if="modalMode === 'edit'">
                <label class="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">Status Akun</label>
                <select v-model="formData.status" required :disabled="actionLoading"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:bg-white transition-colors">
                  <option value="Active">Aktif (Dapat Login)</option>
                  <option value="Inactive">Non-aktif (Akses Diblokir)</option>
                </select>
              </div>

              <div class="pt-2">
                <div class="flex justify-between items-end mb-1.5">
                  <label class="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                    {{ modalMode === 'add' ? 'Kredensial Awal (Password)' : 'Reset Password Baru' }}
                    <span v-if="modalMode === 'add'" class="text-red-500">*</span>
                  </label>
                  <span class="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Otomatis Terenkripsi</span>
                </div>
                
                <div class="flex gap-2">
                  <input type="text" v-model="formData.password" :required="modalMode === 'add'" :disabled="actionLoading" minlength="6"
                    class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandprimary/50 focus:bg-white font-mono tracking-wider transition-colors placeholder:tracking-normal" 
                    :placeholder="modalMode === 'edit' ? 'Kosongkan jika tidak ingin mereset' : 'Minimal 6 karakter'">
                  <button type="button" @click="generateRandomPassword" :disabled="actionLoading" class="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors whitespace-nowrap">
                    Acak PIN
                  </button>
                </div>
                <p class="text-[10px] text-slate-500 mt-1.5 leading-tight">
                  <span v-if="modalMode === 'add'">Pengguna ini akan dipaksa untuk mengubah password mereka pada saat login pertama kali.</span>
                  <span v-else>Jika diisi, status akun ini akan kembali memerlukan reset password saat login.</span>
                </p>
              </div>

            </form>
          </div>
          
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-2xl">
             <button type="button" @click="closeModal" :disabled="actionLoading" class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors disabled:opacity-50">
               Batal
             </button>
             <button type="submit" form="userForm" :disabled="actionLoading" class="px-6 py-2.5 rounded-xl bg-brandprimary hover:bg-brandprimaryhover text-white text-sm font-semibold shadow-sm shadow-brandprimary/30 transition-colors disabled:opacity-70 flex items-center gap-2">
               <span v-if="actionLoading" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
               {{ modalMode === 'add' ? 'Simpan Akun' : 'Simpan Perubahan' }}
             </button>
          </div>
        </div>
      </div>
      </teleport>

      <!-- MODAL HAPUS / BLOKIR -->
      <teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" @click.self="showDeleteModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-hidden transform transition-all text-center">
          <div class="p-6">
            <div class="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-3xl">person_off</span>
            </div>
            <h3 class="text-lg font-bold text-slate-800 mb-2">Nonaktifkan Akun?</h3>
            <p class="text-sm text-slate-500 mb-1">Pengguna <b class="text-slate-800">{{ selectedUser?.full_name }}</b> tidak akan bisa lagi login atau menggunakan terminal POS.</p>
            <p class="text-xs text-red-500 bg-red-50 p-2 rounded-lg mt-3 inline-block">Data transaksi masa lalu pengguna ini tetap akan tersimpan di sistem.</p>
          </div>
          <div class="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
            <button @click="showDeleteModal = false" :disabled="actionLoading" class="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors">
              Batal
            </button>
            <button @click="executeDelete" :disabled="actionLoading" class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-70 flex justify-center items-center gap-2">
              <span v-if="actionLoading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              Nonaktifkan
            </button>
          </div>
        </div>
      </div>
      </teleport>

    </div>
  `,

  setup() {
    const { ref, computed, onMounted } = Vue;
    
    // UI State
    const loading = ref(true);
    const actionLoading = ref(false);
    const globalError = ref('');
    const searchQuery = ref('');
    const filterRole = ref('');
    
    // Data
    const users = ref([]);
    
    // Modal State
    const showModal = ref(false);
    const modalMode = ref('add');
    const modalError = ref('');
    const formData = ref({
      id: '',
      username: '',
      full_name: '',
      role: 'Kasir',
      password: '',
      status: 'Active'
    });

    const showDeleteModal = ref(false);
    const selectedUser = ref(null);

    // --- COMPUTED PROPERTIES ---
    const filteredUsers = computed(() => {
      let result = users.value;
      if (filterRole.value) {
        result = result.filter(u => u.role === filterRole.value);
      }
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(u => 
          u.full_name.toLowerCase().includes(q) || 
          u.username.toLowerCase().includes(q)
        );
      }
      return result;
    });

    const totalAdmin = computed(() => users.value.filter(u => u.role === 'Admin').length);
    const totalKasir = computed(() => users.value.filter(u => u.role === 'Kasir').length);
    const totalActive = computed(() => users.value.filter(u => u.status === 'Active').length);

    // --- METHODS ---
    const loadUsers = async () => {
      loading.value = true;
      globalError.value = '';
      
      const res = await apiRequest('users.list', {}, authState.token);
      
      if (handleAuthError(res.message)) return;

      if (!res.success) {
        globalError.value = res.message || 'Gagal memuat daftar pengguna.';
      } else {
        users.value = res.data || [];
      }
      loading.value = false;
    };

    const generateRandomPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
      let pass = '';
      for (let i = 0; i < 8; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      formData.value.password = pass;
    };

    const openAddModal = () => {
      modalMode.value = 'add';
      modalError.value = '';
      formData.value = {
        id: '', username: '', full_name: '', role: 'Kasir', password: '', status: 'Active'
      };
      showModal.value = true;
    };

    const openEditModal = (user) => {
      modalMode.value = 'edit';
      modalError.value = '';
      formData.value = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        password: '' // Kosongkan agar aman, hanya diisi jika admin mau mereset
      };
      showModal.value = true;
    };

    const closeModal = () => {
      if (actionLoading.value) return;
      showModal.value = false;
    };

    const submitForm = async () => {
      modalError.value = '';
      actionLoading.value = true;
      
      const action = modalMode.value === 'add' ? 'users.create' : 'users.update';
      
      // Bersihkan spasi kosong
      const payload = { ...formData.value };
      payload.username = payload.username.trim();
      
      const res = await apiRequest(action, payload, authState.token);
      
      actionLoading.value = false;

      if (handleAuthError(res.message)) return;

      if (!res.success) {
        modalError.value = res.message;
        return;
      }

      // Update state lokal
      if (modalMode.value === 'add') {
        users.value.unshift(res.data);
      } else {
        const idx = users.value.findIndex(u => u.id === res.data.id);
        if (idx !== -1) {
          users.value[idx] = res.data;
        }
      }

      closeModal();
    };

    const confirmDelete = (user) => {
      selectedUser.value = user;
      showDeleteModal.value = true;
    };

    const executeDelete = async () => {
      actionLoading.value = true;
      const res = await apiRequest('users.delete', { id: selectedUser.value.id }, authState.token);
      actionLoading.value = false;

      if (handleAuthError(res.message)) return;

      if (!res.success) {
        globalError.value = res.message;
        showDeleteModal.value = false;
        return;
      }

      // Soft delete lokal: Update status di array
      const idx = users.value.findIndex(u => u.id === selectedUser.value.id);
      if (idx !== -1) {
        users.value[idx].status = 'Inactive';
      }
      
      showDeleteModal.value = false;
      selectedUser.value = null;
    };

    const formatDate = (isoString) => {
      if (!isoString) return '-';
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    onMounted(() => {
      loadUsers();
    });

    return {
      loading,
      actionLoading,
      globalError,
      searchQuery,
      filterRole,
      users,
      filteredUsers,
      totalAdmin,
      totalKasir,
      totalActive,
      showModal,
      modalMode,
      modalError,
      formData,
      showDeleteModal,
      selectedUser,
      authState,
      loadUsers,
      generateRandomPassword,
      openAddModal,
      openEditModal,
      closeModal,
      submitForm,
      confirmDelete,
      executeDelete,
      formatDate
    };
  }
};