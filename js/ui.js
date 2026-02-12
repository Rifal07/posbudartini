const UI = {
    formatIDR(n) { return 'Rp ' + n.toLocaleString('id-ID'); }
};

function renderCatalog(search = '') {
    const grid = document.getElementById('productGrid');
    const products = DB.get(DB.KEYS.PRODUCTS);
    
    grid.innerHTML = products
        .filter(p => p.nama.toLowerCase().includes(search.toLowerCase()))
        .map(p => `
            <div onclick="addToCart('${p.id}', this)" 
                 class="bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100 transition-all cursor-pointer relative active:scale-95 group overflow-hidden">
                
                <button onclick="event.stopPropagation(); openEditModal('${p.id}')" 
                    class="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm text-slate-400 hover:text-amber-600 transition-all border border-slate-100">
                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>

                <img src="${p.img}" class="w-full h-32 object-cover rounded-[1.5rem] mb-3 pointer-events-none bg-slate-100">
                
                <h3 class="font-bold text-sm truncate px-1 text-slate-800">${p.nama}</h3>
                <div class="flex justify-between items-center mt-2 px-1">
                    <span class="text-emerald-600 font-extrabold text-sm">${UI.formatIDR(p.harga)}</span>
                    <span class="text-[10px] ${p.stok < 5 ? 'text-red-500 font-bold' : 'text-slate-400'}">Stok: ${p.stok}</span>
                </div>
            </div>
        `).join('');
    lucide.createIcons();
}

function openEditModal(id) {
    const p = DB.get(DB.KEYS.PRODUCTS).find(x => x.id === id);
    document.getElementById('editId').value = p.id;
    document.getElementById('editHpp').value = p.hpp;
    document.getElementById('editHarga').value = p.harga;
    document.getElementById('modalEdit').classList.remove('hidden');
}

function closeEditModal() { document.getElementById('modalEdit').classList.add('hidden'); }

function saveProductUpdate() {
    const id = document.getElementById('editId').value;
    const hpp = parseInt(document.getElementById('editHpp').value);
    const harga = parseInt(document.getElementById('editHarga').value);
    
    let products = DB.get(DB.KEYS.PRODUCTS);
    const idx = products.findIndex(x => x.id === id);
    products[idx] = { ...products[idx], hpp, harga };
    
    DB.save(DB.KEYS.PRODUCTS, products);
    closeEditModal();
    renderCatalog();
    Swal.fire({ title: 'Harga Updated!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
}