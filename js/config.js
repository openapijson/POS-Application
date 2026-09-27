/**
 * KONFIGURASI FRONTEND
 * File ini dimuat pertama kali di index.html sehingga variabel CONFIG
 * tersedia secara global untuk semua komponen Vue dan script lainnya.
 */

const APP_CONFIG = {
  // ⚠️ GANTI URL DI BAWAH dengan URL Web App hasil deploy Google Apps Script milikmu!
  // Pastikan URL berakhiran /exec
  API_URL: 'https://script.google.com/macros/s/AKfycbzmiMMIMkimvZlosZuK4ETzEvtAYrEdUWaGrcKaEzU1sJo5NkvrZN2HoqQWujPBzpm0HA/exec',
  
  APP_NAME: 'Decoupled POS',
  VERSION: '2.4.0',
  
  // Format mata uang standar aplikasi
  CURRENCY: 'Rp',
  LOCALE: 'id-ID',

  // Pagination default
  ITEMS_PER_PAGE: 10
};

/**
 * Helper global untuk memformat angka ke Rupiah.
 */
function formatRupiah(number) {
  if (isNaN(number) || number === null) return APP_CONFIG.CURRENCY + ' 0';
  return new Intl.NumberFormat(APP_CONFIG.LOCALE, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}