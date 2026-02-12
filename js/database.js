const DB = {
    KEYS: { PRODUCTS: 'dartini_products', TRANSACTIONS: 'dartini_transactions' },
    get(k) { return JSON.parse(localStorage.getItem(k)) || []; },
    save(k, d) { localStorage.setItem(k, JSON.stringify(d)); },

    init() {
    if (this.get(this.KEYS.PRODUCTS).length === 0) {
        const seed = [
            // --- KATEGORI PECEL ---
            { 
                id: 'P1', nama: 'Pecel Komplit', kategori: 'pecel', 
                harga: 15000, hpp: 9000, stok: 30, 
                img: 'https://images.unsplash.com/photo-1701103444390-50be35741824?auto=format&fit=crop&w=300&q=80' 
            },
            { 
                id: 'P2', nama: 'Pecel Lele Goreng', kategori: 'pecel', 
                harga: 22000, hpp: 14000, stok: 15, 
                img: 'https://images.unsplash.com/photo-1626202340502-99896792994c?auto=format&fit=crop&w=300&q=80' 
            },
            
            // --- KATEGORI MINUMAN ---
            { 
                id: 'M1', nama: 'Es Teh Manis', kategori: 'minuman', 
                harga: 5000, hpp: 1500, stok: 100, 
                img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=300&q=80' 
            },
            { 
                id: 'M2', nama: 'Es Jeruk Peras', kategori: 'minuman', 
                harga: 8000, hpp: 3500, stok: 50, 
                img: 'https://images.unsplash.com/photo-1590483734724-383b6fcf05ee?auto=format&fit=crop&w=300&q=80' 
            },

            // --- KATEGORI SEMBAKO & LAUK ---
            { 
                id: 'S1', nama: 'Telur Asin (Isi 1)', kategori: 'lauk', 
                harga: 5000, hpp: 3500, stok: 40, 
                img: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=300&q=80' 
            },
            { 
                id: 'S2', nama: 'Minyak Goreng 1L', kategori: 'sembako', 
                harga: 18500, hpp: 16000, stok: 12, 
                img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80' 
            },
            { 
                id: 'S3', nama: 'Beras Premium 1kg', kategori: 'sembako', 
                harga: 16000, hpp: 14000, stok: 25, 
                img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' 
            },
            { 
                id: 'S4', nama: 'Kerupuk Kaleng', kategori: 'lauk', 
                harga: 2000, hpp: 800, stok: 100, 
                img: 'https://images.unsplash.com/photo-1623910380321-460f1e003058?auto=format&fit=crop&w=300&q=80' 
            }
        ];
        this.save(this.KEYS.PRODUCTS, seed);
    }
}
};
DB.init();