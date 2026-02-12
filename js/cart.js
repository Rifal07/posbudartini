let cart = [];

/**
 * 🔊 Helper untuk memainkan suara lokal
 */
function playSound(id) {
    const snd = document.getElementById(id);
    if (snd) {
        snd.currentTime = 0;
        snd.play().catch(e => console.warn("Audio play blocked: ", e));
    }
}

/**
 * 🛒 Tambahkan produk ke keranjang
 */
function addToCart(id, element) {
    // 🔊 Audio Blip
    playSound('sndClick');

    // ✨ Animasi Feedback
    if(element) {
        element.classList.add('animate-click', 'success-glow');
        setTimeout(() => element.classList.remove('animate-click', 'success-glow'), 300);
    }

    const products = DB.get(DB.KEYS.PRODUCTS);
    const item = products.find(p => p.id === id);
    
    // 🛡️ Cek Stok
    if(!item || item.stok <= 0) return Swal.fire('Stok Habis!', `Maaf, stok ${item ? item.nama : 'produk'} sudah nol.`, 'error');

    const existing = cart.find(c => c.id === id);
    if (existing) {
        if (existing.qty < item.stok) {
            existing.qty++;
        } else {
            return Swal.fire('Stok Terbatas', 'Jumlah sudah mencapai batas stok tersedia.', 'warning');
        }
    } else {
        cart.push({ ...item, qty: 1 });
    }
    
    updateCartUI();

    // Notifikasi kecil
    const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1000 });
    Toast.fire({ icon: 'success', title: `${item.nama} masuk!` });
}

/**
 * 🔄 Update UI Keranjang
 */
function updateCartUI() {
    const list = document.getElementById('cartItems');
    const badge = document.getElementById('cartBadge');
    
    if(cart.length === 0) {
        list.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                <i data-lucide="shopping-basket" class="w-12 h-12 mb-2 opacity-20"></i>
                <p class="text-xs italic font-medium">Belum ada pesanan...</p>
            </div>`;
    } else {
        list.innerHTML = cart.map(item => `
            <div class="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-white shadow-sm">
                <img src="${item.img}" class="w-12 h-12 rounded-xl object-cover shadow-sm">
                <div class="flex-grow">
                    <h4 class="text-xs font-bold truncate w-32 text-slate-800">${item.nama}</h4>
                    <p class="text-xs text-emerald-600 font-extrabold">${UI.formatIDR(item.harga)}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="changeQty('${item.id}', -1)" class="w-7 h-7 bg-white rounded-lg border border-slate-200 shadow-sm hover:text-red-500">-</button>
                    <span class="text-sm font-bold w-4 text-center">${item.qty}</span>
                    <button onclick="changeQty('${item.id}', 1)" class="w-7 h-7 bg-white rounded-lg border border-slate-200 shadow-sm hover:text-emerald-500">+</button>
                </div>
            </div>`).join('');
    }

    const total = cart.reduce((s, i) => s + (i.harga * i.qty), 0);
    const totalQty = cart.reduce((s, i) => s + i.qty, 0);

    document.getElementById('totalDisplay').innerText = UI.formatIDR(total);
    if (badge) badge.innerText = totalQty;
    lucide.createIcons();
}

/**
 * ➕➖ Ubah Quantity dengan Notif & Suara Hapus
 */
function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    const product = DB.get(DB.KEYS.PRODUCTS).find(p => p.id === id);
    
    if (item) {
        // Jika User mau ngurangin barang yang jumlahnya tinggal 1
        if (delta === -1 && item.qty === 1) {
            Swal.fire({
                title: 'Hapus Item?',
                text: `Yakin mau hapus ${item.nama} dari pesanan?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#94a3b8',
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    // 🔊 Suara Hapus
                    playSound('sndDelete');
                    cart = cart.filter(i => i.id !== id);
                    updateCartUI();
                    
                    const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                    Toast.fire({ icon: 'info', title: 'Barang dihapus' });
                }
            });
        } 
        // Logika tambah barang (Cek Stok)
        else if (delta === 1) {
            if (item.qty < product.stok) {
                playSound('sndClick');
                item.qty += delta;
                updateCartUI();
            } else {
                Swal.fire('Stok Habis', 'Tidak bisa menambah lebih dari stok di gudang.', 'error');
            }
        } 
        // Logika kurang barang (Selain dari 1 ke 0)
        else {
            playSound('sndClick');
            item.qty += delta;
            updateCartUI();
        }
    }
}

/**
 * 💳 Modal Pembayaran
 */
async function showCheckoutModal() {
    if (cart.length === 0) return;
    const total = cart.reduce((s, i) => s + (i.harga * i.qty), 0);

    const { value: bayar } = await Swal.fire({
        title: 'Pembayaran',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Terima Uang',
        html: `
            <div class="text-left">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tagihan:</p>
                <h2 class="text-4xl font-black text-emerald-600 mb-6 tracking-tighter">${UI.formatIDR(total)}</h2>
                <input id="swal-input-bayar" class="swal2-input !m-0 !w-full !rounded-2xl !bg-slate-100 !border-none !text-xl !font-bold" type="number" placeholder="Input Uang Tunai">
                <div class="mt-4 p-5 bg-emerald-50 rounded-[1.5rem] border border-dashed border-emerald-200">
                    <p class="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Kembalian:</p>
                    <h3 id="kembalian-text" class="text-2xl font-black text-emerald-700 tracking-tighter">Rp 0</h3>
                </div>
            </div>`,
        didOpen: () => {
            const input = document.getElementById('swal-input-bayar');
            input.focus();
            input.oninput = () => {
                const bayarValue = parseInt(input.value) || 0;
                const kembali = bayarValue - total;
                document.getElementById('kembalian-text').innerText = UI.formatIDR(kembali < 0 ? 0 : kembali);
            };
        },
        preConfirm: () => {
            const val = document.getElementById('swal-input-bayar').value;
            if (!val || parseInt(val) < total) return Swal.showValidationMessage('Uang pembayaran kurang!');
            return parseInt(val);
        }
    });

    if (bayar) processTransaction(total, bayar);
}

/**
 * 🚀 Finalisasi & Simpan
 */
function processTransaction(total, pay) {
    // 🔊 Audio Kaching!
    playSound('sndSuccess');

    const trx = {
        id: Date.now(),
        customer: document.getElementById('customerName').value || 'Umum',
        items: [...cart],
        total: total,
        profit: cart.reduce((s, i) => s + ((i.harga - i.hpp) * i.qty), 0),
        date: new Date().toISOString()
    };
    
    // Simpan Transaksi
    let history = DB.get(DB.KEYS.TRANSACTIONS);
    history.push(trx);
    DB.save(DB.KEYS.TRANSACTIONS, history);

    // Potong Stok
    let products = DB.get(DB.KEYS.PRODUCTS);
    cart.forEach(c => {
        let p = products.find(x => x.id === c.id);
        if(p) p.stok -= c.qty;
    });
    DB.save(DB.KEYS.PRODUCTS, products);

    // Confetti!
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    
    Swal.fire({ 
        title: 'Transaksi Lunas!', 
        html: `Cuan: <span class="text-emerald-600 font-bold">${UI.formatIDR(trx.profit)}</span><br/>Kembali: <b>${UI.formatIDR(pay - total)}</b>`, 
        icon: 'success' 
    });
    
    // Reset State
    cart = [];
    document.getElementById('customerName').value = ''; // Membersihkan nama pembeli
    updateCartUI();
    if (typeof renderCatalog === 'function') renderCatalog();
}