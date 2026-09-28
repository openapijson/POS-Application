const fs = require('fs');
const path = require('path');
const terser = require('terser');

async function minifyDirectory(dir) {
    // Membaca semua isi dalam folder
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        
        // Jika berupa folder, masuk ke dalam folder tersebut (rekursif)
        if (fs.statSync(fullPath).isDirectory()) {
            await minifyDirectory(fullPath);
        } 
        // Jika berupa file Javascript, lakukan minifikasi
        else if (fullPath.endsWith('.js')) {
            console.log('Mengacak file:', fullPath);
            const code = fs.readFileSync(fullPath, 'utf8');
            
            try {
                // Proses Minify & Mangle (Mengubah nama variabel jadi singkatan agar susah dibaca)
                const result = await terser.minify(code, {
                    compress: {
                        drop_console: true, // Menghapus semua console.log di production
                    },
                    mangle: true // Mengacak nama variabel
                });
                
                // Menimpa file asli dengan file yang sudah diacak (Hanya terjadi di server Vercel)
                fs.writeFileSync(fullPath, result.code);
            } catch (e) {
                console.error('Gagal mengacak file:', fullPath, e);
            }
        }
    }
}

console.log('====================================');
console.log('Memulai Proses Obfuskasi JS...');
console.log('====================================');

// Targetkan folder 'js' tempat abang menaruh script
minifyDirectory('./js').then(() => {
    console.log('====================================');
    console.log('Selesai! Semua kode JS telah diacak.');
    console.log('====================================');
});