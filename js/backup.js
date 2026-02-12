// 1. KIRIM TOKEN (Hanya Transaksi Hari Ini agar Singkat)
function shareToWhatsApp() {
    const allTrx = DB.get(DB.KEYS.TRANSACTIONS);
    const today = new Date().toISOString().split('T')[0];
    
    // Filter: Cuma ambil transaksi tanggal hari ini
    const todayTrx = allTrx.filter(t => t.date.startsWith(today));

    if (todayTrx.length === 0) {
        return Swal.fire('Kosong', 'Belum ada transaksi hari ini untuk dikirim.', 'info');
    }

    const data = {
        type: 'SYNC_DAILY',
        transactions: todayTrx,
        date: today
    };
    
    // Konversi ke string & perpendek (Base64)
    const token = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const message = `*SYNC CUAN BU DARTINI*%0ATanggal: ${today}%0ATotal: ${todayTrx.length} Trx%0A%0A${token}`;
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
}

// 2. TERIMA TOKEN (Logika Menambah/Merge)
function restoreFromToken() {
    const token = document.getElementById('tokenInput').value.trim();
    if(!token) return Swal.fire('Mana Tokennya?', 'Paste dulu dari WA, Bos!', 'warning');

    try {
        const incoming = JSON.parse(decodeURIComponent(escape(atob(token))));
        
        if (incoming.type !== 'SYNC_DAILY') {
            return Swal.fire('Salah Token', 'Ini bukan token sinkronisasi harian.', 'error');
        }

        let currentTrx = DB.get(DB.KEYS.TRANSACTIONS);
        let currentProducts = DB.get(DB.KEYS.PRODUCTS);
        let newItemsAdded = 0;

        incoming.transactions.forEach(newTrx => {
            // Cek apakah ID transaksi sudah ada (mencegah duplikat jika di-paste 2x)
            const exists = currentTrx.find(t => t.id === newTrx.id);
            
            if (!exists) {
                currentTrx.push(newTrx);
                newItemsAdded++;
                
                // OTOMATIS KURANGI STOK di HP Utama
                newTrx.items.forEach(item => {
                    const p = currentProducts.find(prod => prod.id === item.id);
                    if(p) p.stok -= item.qty;
                });
            }
        });

        if (newItemsAdded === 0) {
            Swal.fire('Sudah Ada', 'Semua transaksi ini sudah tercatat sebelumnya.', 'info');
        } else {
            DB.save(DB.KEYS.TRANSACTIONS, currentTrx);
            DB.save(DB.KEYS.PRODUCTS, currentProducts);
            Swal.fire('Berhasil!', `${newItemsAdded} Transaksi baru ditambahkan ke laporan.`, 'success')
                .then(() => location.reload());
        }
    } catch(e) {
        Swal.fire('Token Rusak', 'Pastikan salin semua teks token dari WA.', 'error');
    }
}