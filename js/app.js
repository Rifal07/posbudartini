// js/app.js
let cart = [];

function initDashboard() {
    renderProducts();
}

function renderProducts(search = '') {
    const grid = document.getElementById('productGrid');
    const products = DB.get(DB.KEYS.PRODUCTS);
    grid.innerHTML = '';
    
    products.filter(p => p.nama.toLowerCase().includes(search.toLowerCase())).forEach(p => {
        grid.innerHTML += `
            <div class="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer" onclick="addToCart('${p.id}')">
                <div class="h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-3">${p.img}</div>
                <h3 class="font-bold text-sm truncate">${p.nama}</h3>
                <p class="text-emerald-600 font-bold">${formatRupiah(p.harga)}</p>
                <p class="text-[10px] text-slate-400 mt-1">Stok: ${p.stok}</p>
            </div>`;
    });
}

function addToCart(id) {
    const products = DB.get(DB.KEYS.PRODUCTS);
    const p = products.find(x => x.id === id);
    if(p.stok <= 0) return Swal.fire('Stok Habis!', '', 'error');
    
    const inCart = cart.find(x => x.id === id);
    if(inCart) inCart.qty++; else cart.push({...p, qty: 1});
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cartList');
    list.innerHTML = cart.map(item => `
        <div class="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-50 shadow-sm">
            <div class="text-xs font-bold">${item.nama} (x${item.qty})</div>
            <div class="text-emerald-600 font-bold text-xs">${formatRupiah(item.harga * item.qty)}</div>
        </div>
    `).join('');
    
    const total = cart.reduce((s, i) => s + (i.harga * i.qty), 0);
    document.getElementById('totalText').innerText = formatRupiah(total);
    document.getElementById('cartCount').innerText = `${cart.length} Item`;
    document.getElementById('btnPay').disabled = cart.length === 0;
}

async function checkout() {
    const total = cart.reduce((s, i) => s + (i.harga * i.qty), 0);
    const { value: bayar } = await Swal.fire({
        title: 'Pembayaran',
        input: 'number',
        inputLabel: `Total: ${formatRupiah(total)}`,
        confirmButtonText: 'Bayar',
        confirmButtonColor: '#10b981'
    });

    if(bayar && bayar >= total) {
        const trx = { 
            id: Date.now(), 
            items: cart, 
            total, 
            bayar, 
            kembali: bayar - total,
            profit: cart.reduce((s, i) => s + ((i.harga - i.hpp) * i.qty), 0),
            date: new Date().toISOString()
        };
        const allTrx = DB.get(DB.KEYS.TRANSACTIONS);
        allTrx.push(trx);
        DB.save(DB.KEYS.TRANSACTIONS, allTrx);
        DB.updateStock(cart);
        
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        Swal.fire('Sukses!', `Kembalian: ${formatRupiah(trx.kembali)}`, 'success');
        cart = []; updateCartUI(); renderProducts();
    }
}

function formatRupiah(n) { return 'Rp ' + n.toLocaleString('id-ID'); }
function filterProducts() { renderProducts(document.getElementById('searchInput').value); }