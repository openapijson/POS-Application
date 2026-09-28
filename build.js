const fs = require('fs');
const path = require('path');
const terser = require('terser');

//function copyDirSync(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
// }

//async function minifyDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
            await minifyDirectory(fullPath);
        } 
        else if (fullPath.endsWith('.js')) {
            console.log('Mengacak file:', fullPath);
            const code = fs.readFileSync(fullPath, 'utf8');
            
            try {
                const result = await terser.minify(code, {
                    compress: {
                        drop_console: true, // Hapus console.log di production
                    },
                    mangle: true // Acak nama variabel
                });
                
                fs.writeFileSync(fullPath, result.code);
            } catch (e) {
                console.error('Gagal mengacak file:', fullPath, e);
            }
        }
    }
// }

//console.log('====================================');
console.log('Memulai Proses Build & Obfuskasi...');
console.log('====================================');

const outputDir = path.join(__dirname, 'public');

// 1. Bersihkan dan siapkan folder 'public' baru
if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
}
fs.mkdirSync(outputDir);

// 2. Salin index.html ke folder public
if (fs.existsSync(path.join(__dirname, 'index.html'))) {
    fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(outputDir, 'index.html'));
    console.log('Berhasil menyalin index.html');
}

// 3. Salin folder js ke dalam folder public
if (fs.existsSync(path.join(__dirname, 'js'))) {
    copyDirSync(path.join(__dirname, 'js'), path.join(outputDir, 'js'));
    console.log('Berhasil menyalin folder js');
}

// 4. Lakukan proses acak HANYA pada file di dalam folder public/js
minifyDirectory(path.join(outputDir, 'js')).then(() => {
    console.log('====================================');
    console.log('Selesai! Folder "public" siap ditayangkan Vercel.');
    console.log('====================================');
});