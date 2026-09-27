/**
 * API WRAPPER
 * Menangani komunikasi dengan backend Google Apps Script.
 */

/**
 * Fungsi utama untuk melakukan HTTP POST ke backend.
 * 
 * @param {string} action - Nama aksi (sesuai API Contract di ROUTES backend)
 * @param {object} data - Payload data yang akan dikirim
 * @param {string} token - Session token (null jika request publik seperti login)
 * @returns {Promise<object>} Objek response standar { success, message, data }
 */
async function apiRequest(action, data = {}, token = null) {
  try {
    // ATURAN WAJIB: Content-Type HARUS text/plain;charset=utf-8
    // Menggunakan application/json akan memicu browser mengirim OPTIONS preflight
    // yang TIDAK DIDUKUNG dan akan digagalkan oleh Google Apps Script Web App.
    const res = await fetch(APP_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      // Backend menerima sebagai JSON string di e.postData.contents
      body: JSON.stringify({
        action: action,
        data: data,
        token: token
      })
    });

    // Cek jika response bukan 200 OK (biasanya URL salah atau server down)
    if (!res.ok) {
      throw new Error(`Server error (${res.status})`);
    }

    // Proses parsing dari string ke JSON objek.
    // Jika ada error 'Unexpected token <', biasanya karena salah setting "Execute as: Me"
    // saat mendeploy backend, sehingga GAS mengembalikan halaman HTML Login Google.
    const json = await res.json();
    return json;

  } catch (error) {
    console.error(`[API ERROR - ${action}]:`, error);
    
    // Kembalikan format standar (Graceful error handling) agar UI tidak crash
    return {
      success: false,
      message: 'Gagal terhubung ke server. Periksa koneksi internet atau periksa pengaturan deployment Web App Anda.',
      error: error.message
    };
  }
}