function initReport() {
    const transactions = DB.get(DB.KEYS.TRANSACTIONS);
    
    // 1. HITUNG RINGKASAN DATA
    let totalRevenue = 0;
    let totalProfit = 0;

    transactions.forEach(trx => {
        totalRevenue += trx.total;
        totalProfit += trx.profit; // Profit dihitung saat checkout di cart.js
    });

    document.getElementById('totalRevenue').innerText = formatIDR(totalRevenue);
    document.getElementById('totalProfit').innerText = formatIDR(totalProfit);
    document.getElementById('totalTrx').innerText = transactions.length.toLocaleString('id-ID');

    // 2. RENDER KOMPONEN
    renderTransactionTable(transactions);
    renderCharts(transactions);
}

function renderTransactionTable(transactions) {
    const table = document.getElementById('transactionTable');
    // Ambil 20 transaksi terbaru, urutkan dari yang paling baru
    const latest = [...transactions].sort((a, b) => b.id - a.id).slice(0, 20);

    if (latest.length === 0) {
        table.innerHTML = `<tr><td colspan="4" class="py-20 text-center text-slate-300 italic">Belum ada transaksi terekam</td></tr>`;
        return;
    }

    table.innerHTML = latest.map(trx => `
        <tr class="hover:bg-slate-50 transition-colors group">
            <td class="px-8 py-5">
                <p class="text-xs font-bold text-slate-800">${new Date(trx.date).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}</p>
                <p class="text-[10px] text-slate-400 font-medium">${new Date(trx.date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</p>
            </td>
            <td class="px-8 py-5">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-black uppercase">${trx.customer.substring(0,2)}</div>
                    <p class="text-sm font-bold text-slate-700">${trx.customer}</p>
                </div>
            </td>
            <td class="px-8 py-5 text-sm font-bold text-right text-slate-800">${formatIDR(trx.total)}</td>
            <td class="px-8 py-5 text-sm font-black text-right text-emerald-600">
                <span class="bg-emerald-50 px-2 py-1 rounded-lg">+${formatIDR(trx.profit)}</span>
            </td>
        </tr>
    `).join('');
}

function renderCharts(transactions) {
    // --- GRAFIK TREN 7 HARI ---
    const ctxSales = document.getElementById('salesChart').getContext('2d');
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
    }

    const salesData = last7Days.map(label => {
        return transactions
            .filter(t => new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) === label)
            .reduce((acc, t) => acc + t.total, 0);
    });

    if (window.salesChartInstance) window.salesChartInstance.destroy();
    window.salesChartInstance = new Chart(ctxSales, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                data: salesData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                fill: true,
                tension: 0.4,
                borderWidth: 4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
                y: { display: false }, 
                x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } } 
            }
        }
    });

    // --- GRAFIK TOP PRODUK (Logic: Top 4 + Lainnya) ---
    const ctxProd = document.getElementById('productChart').getContext('2d');
    const productMap = {};
    transactions.forEach(t => {
        t.items.forEach(item => {
            productMap[item.nama] = (productMap[item.nama] || 0) + item.qty;
        });
    });

    const sorted = Object.entries(productMap).sort((a, b) => b[1] - a[1]);
    const top4 = sorted.slice(0, 4);
    const othersCount = sorted.slice(4).reduce((acc, curr) => acc + curr[1], 0);
    
    const finalLabels = top4.map(p => p[0]);
    const finalData = top4.map(p => p[1]);
    if (othersCount > 0) {
        finalLabels.push('Lainnya');
        finalData.push(othersCount);
    }

    if (window.productChartInstance) window.productChartInstance.destroy();
    window.productChartInstance = new Chart(ctxProd, {
        type: 'doughnut',
        data: {
            labels: finalLabels,
            datasets: [{
                data: finalData,
                backgroundColor: ['#10b981', '#3b82f6', '#fbbf24', '#f87171', '#94a3b8'],
                borderWidth: 5,
                borderColor: '#fff'
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: 'bottom', 
                    labels: { usePointStyle: true, font: { size: 11, weight: 'bold' }, padding: 15 } 
                } 
            },
            cutout: '75%'
        }
    });
}

function formatIDR(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
}