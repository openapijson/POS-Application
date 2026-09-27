/**
 * AUTH.JS
 * Mengelola state login, token di localStorage, dan hak akses UI kosmetik.
 * Bergantung pada Vue (dideklarasikan global via CDN di index.html).
 */

const { reactive, computed } = Vue;

// State reaktif global untuk otentikasi
const authState = reactive({
  token: localStorage.getItem('pos_token') || null,
  user: JSON.parse(localStorage.getItem('pos_user') || 'null'),
  // Flag ini akan diset dari backend jika user masih pakai password default
  mustChangePassword: false 
});

// Helpers kosmetik untuk UI (Backend tetap akan memvalidasi ulang)
const isLoggedIn = computed(() => authState.token !== null);
const isAdmin = computed(() => authState.user && authState.user.role === 'Admin');
const isKasir = computed(() => authState.user && (authState.user.role === 'Kasir' || authState.user.role === 'Admin'));

/**
 * Memproses aksi login dan menyimpan sesi ke localStorage.
 */
async function performLogin(username, password) {
  const res = await apiRequest('login', { username, password });
  
  if (res.success) {
    // Simpan ke state reaktif dan localStorage
    authState.token = res.token;
    authState.user = res.data;
    
    localStorage.setItem('pos_token', res.token);
    localStorage.setItem('pos_user', JSON.stringify(res.data));
    
    // Cek apakah user wajib ganti password (akun default/baru)
    if (res.mustChangePassword) {
      authState.mustChangePassword = true;
    }
  }
  
  return res;
}

/**
 * Memproses aksi logout, menghapus token di server dan lokal.
 * @param {boolean} force - Jika true, logout paksa tanpa memanggil backend (untuk token invalid)
 */
async function performLogout(force = false) {
  if (!force && authState.token) {
    // Beritahu backend untuk menghapus token dari CacheService
    await apiRequest('logout', {}, authState.token);
  }
  
  // Bersihkan state dan storage
  authState.token = null;
  authState.user = null;
  authState.mustChangePassword = false;
  
  localStorage.removeItem('pos_token');
  localStorage.removeItem('pos_user');
  
  // Reset view utama ke halaman login
  if (typeof currentView !== 'undefined') {
    currentView.value = 'login-view';
  }
}

/**
 * Memproses penggantian password ke backend. WAJIB ASLI (Bukan Dummy).
 */
async function performChangePassword(oldPassword, newPassword) {
  const res = await apiRequest('changePassword', {
    oldPassword: oldPassword,
    newPassword: newPassword
  }, authState.token);
  
  if (res.success) {
    // Hapus status wajib ganti password HANYA setelah backend konfirmasi sukses
    authState.mustChangePassword = false;
  }
  
  return res;
}

/**
 * Interceptor/Handler Terpusat untuk Auth Error.
 * Dipanggil oleh Views setiap kali mendapat pesan berawalan "AUTH_ERROR:"
 * Mencegah pengguna nyangkut di dashboard jika tokennya sudah hangus di server.
 */
function handleAuthError(message) {
  if (message && message.startsWith('AUTH_ERROR:')) {
    console.warn('[AUTH] Sesi tidak valid atau ditolak server:', message);
    alert('Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.');
    
    // Logout paksa (hapus memori lokal dan paksa ke layar login)
    performLogout(true);
    return true; // Menandakan bahwa error ini adalah error otentikasi
  }
  return false;
}