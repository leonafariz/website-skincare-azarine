// Azarine Admin Dashboard — Firebase Auth + API-Driven Logic
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// Firebase web config (public, safe to expose)
const firebaseConfig = {
    apiKey: "AIzaSyBlvCztAXiVmGx3wpTs20X0R6duS3Tu520",
    authDomain: "azarine-b7762.firebaseapp.com",
    projectId: "azarine-b7762",
    storageBucket: "azarine-b7762.firebasestorage.app",
    messagingSenderId: "708718117768",
    appId: "1:708718117768:web:b2e99d2064e38f4124303d",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

let skinLeads = [];
let newsLeads = [];
let resellerLeads = [];
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// --- Auth ---
async function checkAuth() {
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            showDashboard(data.user);
        } else {
            showLogin();
        }
    } catch (err) {
        console.error('Auth check failed:', err);
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-gate').style.display = 'flex';
    document.getElementById('admin-layout').style.display = 'none';

    // Bind Google Login button to Firebase signInWithPopup
    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn) {
        loginBtn.onclick = async () => {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Memproses...';
            try {
                const result = await signInWithPopup(auth, provider);
                const idToken = await result.user.getIdToken();

                // Send ID token to backend to create a session
                const res = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });

                const data = await res.json();
                if (data.success) {
                    showDashboard(data.user);
                } else {
                    alert(data.error || 'Akses ditolak.');
                    await signOut(auth);
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('Login gagal. Silakan coba lagi.');
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 48 48">...</svg> Login dengan Google`;
            }
        };
    }
}

function showDashboard(user) {
    document.getElementById('login-gate').style.display = 'none';
    document.getElementById('admin-layout').style.display = 'grid';

    // Set user info
    if (user.picture) {
        document.getElementById('user-avatar').src = user.picture;
    }
    document.getElementById('user-name').textContent = user.name || user.email;

    // Init
    initSidebar();
    initLogout();
    loadAllData();
    initProductModal();
    initExportButtons();
}


// --- Sidebar Navigation ---
function initSidebar() {
    const links = document.querySelectorAll('.sidebar-link');
    const tabs = document.querySelectorAll('.tab-panel');
    const pageTitle = document.getElementById('page-title');

    const titles = {
        'tab-dashboard': 'Dashboard',
        'tab-skin-leads': 'Leads AI Skin Analyzer',
        'tab-newsletter-leads': 'Leads Newsletter',
        'tab-reseller-leads': 'Pengajuan Reseller',
        'tab-products': 'Kelola Produk Katalog',
    };

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            tabs.forEach(t => t.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            pageTitle.textContent = titles[tabId] || 'Dashboard';
        });
    });

    // Goto products link in dashboard
    const gotoProducts = document.getElementById('goto-products');
    if (gotoProducts) {
        gotoProducts.addEventListener('click', (e) => {
            e.preventDefault();
            const prodLink = document.querySelector('[data-tab="tab-products"]');
            if (prodLink) prodLink.click();
        });
    }
}

// --- Logout ---
function initLogout() {
    document.getElementById('btn-logout').addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            await signOut(auth); // Also clear Firebase Auth state
            showLogin();
        } catch (err) {
            console.error('Logout failed:', err);
            showLogin();
        }
    });
}

// --- Load All Data ---
async function loadAllData() {
    await Promise.all([
        loadSkinLeads(),
        loadNewsLeads(),
        loadResellerLeads(),
        loadProducts(),
    ]);
    updateDashboardStats();
}

// --- Skin Analyzer Leads ---
async function loadSkinLeads() {
    try {
        const res = await fetch('/api/leads/skin-analyze');
        skinLeads = await res.json();
        renderSkinLeads();
    } catch (err) {
        console.error('Failed to load skin leads:', err);
        skinLeads = [];
    }
}

function renderSkinLeads() {
    const tbody = document.getElementById('table-skin-tbody');
    if (skinLeads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-msg">Belum ada data lead skin analyzer.</td></tr>';
        return;
    }

    tbody.innerHTML = skinLeads.map(lead => {
        const date = new Date(lead.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const skinType = lead.analysis?.skinType || '-';
        const score = lead.analysis?.overallScore || 0;
        let scoreBadge = 'badge-score-low';
        if (score >= 70) scoreBadge = 'badge-score-high';
        else if (score >= 50) scoreBadge = 'badge-score-med';

        return `<tr>
            <td>${date}</td>
            <td><strong>${lead.name}</strong></td>
            <td>${lead.phone}</td>
            <td>${lead.email || '-'}</td>
            <td>${skinType}</td>
            <td><span class="badge ${scoreBadge}">${score}/100</span></td>
            <td><button class="btn-icon view" onclick="showSkinDetail('${lead.id}')" title="Lihat Detail"><i class="fa-solid fa-eye"></i></button></td>
            <td><button class="btn-icon delete" onclick="deleteLead('skin-analyze','${lead.id}')" title="Hapus"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;
    }).join('');
}

function showSkinDetail(id) {
    const lead = skinLeads.find(l => l.id === id);
    if (!lead || !lead.analysis) return;

    const a = lead.analysis;
    const content = document.getElementById('skin-detail-content');

    content.innerHTML = `
        <div class="skin-detail-grid">
            <div class="skin-detail-item"><span class="dl">Jenis Kulit</span><div class="dv">${a.skinType || '-'}</div></div>
            <div class="skin-detail-item"><span class="dl">Skor Kesehatan</span><div class="dv">${a.overallScore || 0}/100</div></div>
            <div class="skin-detail-item"><span class="dl">Hidrasi</span><div class="dv">${a.hydrationLevel || '-'}</div></div>
            <div class="skin-detail-item"><span class="dl">Ukuran Pori</span><div class="dv">${a.poreSize || '-'}</div></div>
            <div class="skin-detail-item"><span class="dl">Jerawat</span><div class="dv">${a.acneSeverity || '-'}</div></div>
            <div class="skin-detail-item"><span class="dl">Pigmentasi</span><div class="dv">${a.pigmentation || '-'}</div></div>
        </div>
        <div class="skin-detail-section">
            <h5>Kondisi Terdeteksi</h5>
            <div>${(a.skinConditions || []).map(c => `<span class="skin-tag">${c}</span>`).join(' ')}</div>
        </div>
        <div class="skin-detail-section">
            <h5>Analisis Detail</h5>
            <p>${a.detailedAnalysis || '-'}</p>
        </div>
        <div class="skin-detail-section">
            <h5>Rekomendasi Perawatan</h5>
            <p>${a.recommendations || '-'}</p>
        </div>
        <div class="skin-detail-section">
            <h5>Tips Perawatan</h5>
            <ul>${(a.skincareTips || []).map(t => `<li>${t}</li>`).join('')}</ul>
        </div>
        <div class="skin-detail-section">
            <h5>Produk yang Direkomendasikan AI</h5>
            <ul>${(a.recommendedProducts || []).map(p => `<li><strong>${p.productName}</strong> — ${p.reason}</li>`).join('')}</ul>
        </div>
        <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:8px;font-size:12px;color:#8d9296;">
            <strong>Kontak:</strong> ${lead.name} | ${lead.phone} | ${lead.email || '-'}<br>
            <strong>Tanggal:</strong> ${new Date(lead.createdAt).toLocaleString('id-ID')}
        </div>
    `;

    document.getElementById('skin-detail-modal').classList.add('active');
}

// --- Newsletter Leads ---
async function loadNewsLeads() {
    try {
        const res = await fetch('/api/leads/newsletter');
        newsLeads = await res.json();
        renderNewsLeads();
    } catch (err) {
        console.error('Failed to load newsletter leads:', err);
        newsLeads = [];
    }
}

function renderNewsLeads() {
    const tbody = document.getElementById('table-news-tbody');
    if (newsLeads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-msg">Belum ada data lead newsletter.</td></tr>';
        return;
    }

    tbody.innerHTML = newsLeads.map(lead => {
        const date = new Date(lead.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        return `<tr>
            <td>${date}</td>
            <td><strong>${lead.name}</strong></td>
            <td>${lead.email}</td>
            <td><button class="btn-icon delete" onclick="deleteLead('newsletter','${lead.id}')" title="Hapus"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;
    }).join('');
}

// --- Reseller Leads ---
async function loadResellerLeads() {
    try {
        const res = await fetch('/api/leads/reseller');
        resellerLeads = await res.json();
        renderResellerLeads();
    } catch (err) {
        console.error('Failed to load reseller leads:', err);
        resellerLeads = [];
    }
}

function renderResellerLeads() {
    const tbody = document.getElementById('table-reseller-tbody');
    if (resellerLeads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-msg">Belum ada data pengajuan reseller.</td></tr>';
        return;
    }

    tbody.innerHTML = resellerLeads.map(lead => {
        const date = new Date(lead.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        return `<tr>
            <td>${date}</td>
            <td><strong>${lead.name}</strong></td>
            <td>${lead.phone}</td>
            <td>${lead.city || '-'}</td>
            <td>${lead.message || '-'}</td>
            <td><button class="btn-icon delete" onclick="deleteLead('reseller','${lead.id}')" title="Hapus"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;
    }).join('');
}

// --- Delete Lead ---
async function deleteLead(collection, id) {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
        const res = await fetch(`/api/leads/${collection}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await loadAllData();
        }
    } catch (err) {
        console.error('Delete failed:', err);
        alert('Gagal menghapus data.');
    }
}

// --- Products ---
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        products = await res.json();
        renderProducts();
    } catch (err) {
        console.error('Failed to load products:', err);
        products = [];
    }
}

function renderProducts() {
    const tbody = document.getElementById('table-products-tbody');
    const countEl = document.getElementById('product-count');
    if (countEl) countEl.textContent = products.length;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-msg">Belum ada produk. Klik "Tambah Produk" untuk menambahkan.</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => {
        const skinTypesStr = (p.skinTypes || []).join(', ') || '-';
        return `<tr>
            <td><img src="${p.imageUrl || 'https://placehold.co/48x48/faf8f5/0b3d2c?text=N'}" class="product-thumb" alt="${p.name}"></td>
            <td><strong>${p.name}</strong><br><span style="font-size:12px;color:#8d9296;">${p.tag || ''}</span></td>
            <td><span class="badge" style="background:var(--primary-subtle);color:var(--primary);">${p.category}</span></td>
            <td>${p.price}</td>
            <td>⭐ ${p.rating || 0}</td>
            <td style="font-size:12px;">${skinTypesStr}</td>
            <td>
                <button class="btn-icon edit" onclick="editProduct('${p.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon delete" onclick="deleteProduct('${p.id}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// --- Product Modal ---
function initProductModal() {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const addBtn = document.getElementById('btn-add-product');
    const closeBtn = document.getElementById('product-modal-close');
    const cancelBtn = document.getElementById('product-cancel-btn');

    function closeModal() { modal.classList.remove('active'); form.reset(); document.getElementById('prod-id').value = ''; }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    addBtn.addEventListener('click', () => {
        document.getElementById('product-modal-title').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Tambah Produk Baru';
        form.reset();
        document.getElementById('prod-id').value = '';
        modal.classList.add('active');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('prod-id').value;
        const skinTypes = [];
        document.querySelectorAll('.checkbox-grid input[type="checkbox"]:checked').forEach(cb => skinTypes.push(cb.value));

        const data = {
            name: document.getElementById('prod-name').value.trim(),
            category: document.getElementById('prod-category').value,
            price: document.getElementById('prod-price').value.trim(),
            tag: document.getElementById('prod-tag').value.trim(),
            rating: document.getElementById('prod-rating').value,
            reviewsCount: document.getElementById('prod-reviews').value,
            skinTypes,
            imageUrl: document.getElementById('prod-image').value.trim(),
            desc: document.getElementById('prod-desc').value.trim(),
            usage: document.getElementById('prod-usage').value.trim(),
            ingredients: document.getElementById('prod-ingredients').value.trim(),
        };

        try {
            const url = id ? `/api/products/${id}` : '/api/products';
            const method = id ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                closeModal();
                await loadProducts();
                updateDashboardStats();
            } else {
                const err = await res.json();
                alert(err.error || 'Gagal menyimpan produk.');
            }
        } catch (err) {
            console.error('Save product failed:', err);
            alert('Gagal menyimpan produk.');
        }
    });
}

// Edit product
function editProduct(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;

    document.getElementById('product-modal-title').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Produk';
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-name').value = p.name || '';
    document.getElementById('prod-category').value = p.category || '';
    document.getElementById('prod-price').value = p.price || '';
    document.getElementById('prod-tag').value = p.tag || '';
    document.getElementById('prod-rating').value = p.rating || 0;
    document.getElementById('prod-reviews').value = p.reviewsCount || 0;
    document.getElementById('prod-image').value = p.imageUrl || '';
    document.getElementById('prod-desc').value = p.desc || '';
    document.getElementById('prod-usage').value = p.usage || '';
    document.getElementById('prod-ingredients').value = p.ingredients || '';

    // Set checkboxes
    document.querySelectorAll('.checkbox-grid input[type="checkbox"]').forEach(cb => {
        cb.checked = (p.skinTypes || []).includes(cb.value);
    });

    document.getElementById('product-modal').classList.add('active');
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Yakin ingin menghapus produk ini? Produk yang dihapus tidak dapat dikembalikan.')) return;
    try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await loadProducts();
            updateDashboardStats();
        }
    } catch (err) {
        console.error('Delete product failed:', err);
        alert('Gagal menghapus produk.');
    }
}

// --- Dashboard Stats ---
function updateDashboardStats() {
    document.getElementById('count-skin').textContent = skinLeads.length;
    document.getElementById('count-news').textContent = newsLeads.length;
    document.getElementById('count-reseller').textContent = resellerLeads.length;
    document.getElementById('count-total').textContent = skinLeads.length + newsLeads.length + resellerLeads.length;

    // Skin type chart
    const skinTypeCounts = { berminyak: 0, kering: 0, kombinasi: 0, sensitif: 0, normal: 0 };
    const total = skinLeads.length || 1;

    skinLeads.forEach(lead => {
        const type = (lead.analysis?.skinType || '').toLowerCase();
        if (type.includes('berminyak') || type.includes('oily')) skinTypeCounts.berminyak++;
        else if (type.includes('kering') || type.includes('dry')) skinTypeCounts.kering++;
        else if (type.includes('kombinasi') || type.includes('combination')) skinTypeCounts.kombinasi++;
        else if (type.includes('sensitif') || type.includes('sensitive')) skinTypeCounts.sensitif++;
        else if (type.includes('normal')) skinTypeCounts.normal++;
    });

    const pcts = {
        oily: Math.round((skinTypeCounts.berminyak / total) * 100),
        dry: Math.round((skinTypeCounts.kering / total) * 100),
        combo: Math.round((skinTypeCounts.kombinasi / total) * 100),
        sensitive: Math.round((skinTypeCounts.sensitif / total) * 100),
        normal: Math.round((skinTypeCounts.normal / total) * 100),
    };

    const setBar = (id, pct) => {
        const bar = document.getElementById(`bar-${id}`);
        const val = document.getElementById(`val-${id}`);
        if (bar) bar.style.width = `${pct}%`;
        if (val) val.textContent = `${pct}%`;
    };

    setBar('oily', pcts.oily);
    setBar('dry', pcts.dry);
    setBar('combo', pcts.combo);
    setBar('sensitive', pcts.sensitive);
    setBar('normal', pcts.normal);
}

// --- CSV Export ---
function initExportButtons() {
    document.querySelectorAll('.btn-export').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            exportCSV(target);
        });
    });
}

function exportCSV(target) {
    let rows = [];
    let filename = '';

    if (target === 'skin') {
        filename = 'leads_skin_analyzer.csv';
        rows.push(['Tanggal', 'Nama', 'WhatsApp', 'Email', 'Jenis Kulit', 'Skor', 'Analisis']);
        skinLeads.forEach(l => {
            rows.push([
                l.createdAt,
                l.name,
                l.phone,
                l.email || '',
                l.analysis?.skinType || '',
                l.analysis?.overallScore || 0,
                (l.analysis?.detailedAnalysis || '').replace(/"/g, '""'),
            ]);
        });
    } else if (target === 'newsletter') {
        filename = 'leads_newsletter.csv';
        rows.push(['Tanggal', 'Nama', 'Email']);
        newsLeads.forEach(l => rows.push([l.createdAt, l.name, l.email]));
    } else if (target === 'reseller') {
        filename = 'leads_reseller.csv';
        rows.push(['Tanggal', 'Nama', 'WhatsApp', 'Kota', 'Pesan']);
        resellerLeads.forEach(l => rows.push([l.createdAt, l.name, l.phone, l.city || '', (l.message || '').replace(/"/g, '""')]));
    }

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
