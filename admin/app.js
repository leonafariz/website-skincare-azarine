// Azarine Admin Dashboard — Firebase Auth + API-Driven Logic
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

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
let dashboardInitialized = false;

// Escape user-supplied values before injecting into innerHTML (prevents stored XSS)
function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Fetch wrapper that attaches the Firebase ID token (stateless auth, works on serverless)
async function authFetch(url, options = {}) {
    const user = auth.currentUser;
    const headers = { ...(options.headers || {}) };
    if (user) {
        headers['Authorization'] = `Bearer ${await user.getIdToken()}`;
    }
    return fetch(url, { ...options, headers });
}

document.addEventListener('DOMContentLoaded', () => {
    // Firebase keeps the login persistent across reloads; react to auth state
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            showLogin();
            return;
        }
        try {
            const idToken = await user.getIdToken();
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showDashboard(data.user);
            } else {
                alert(data.error || 'Akses ditolak.');
                await signOut(auth);
                showLogin();
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            showLogin();
        }
    });
});

function showLogin() {
    document.getElementById('login-gate').style.display = 'flex';
    document.getElementById('admin-layout').style.display = 'none';

    const loginBtn = document.getElementById('google-login-btn');
    if (loginBtn && !loginBtn.dataset.bound) {
        loginBtn.dataset.bound = '1';
        const originalHTML = loginBtn.innerHTML;
        loginBtn.onclick = async () => {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Memproses...';
            try {
                await signInWithPopup(auth, provider);
                // onAuthStateChanged handles verification + showing the dashboard
            } catch (err) {
                console.error('Login error:', err);
                if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                    alert('Login gagal. Silakan coba lagi.');
                }
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalHTML;
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

    if (!dashboardInitialized) {
        dashboardInitialized = true;
        initSidebar();
        initLogout();
        initProductModal();
        initExportButtons();
    }
    loadAllData();
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
            await signOut(auth); // onAuthStateChanged shows the login gate
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
        const res = await authFetch('/api/leads/skin-analyze');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        skinLeads = await res.json();
    } catch (err) {
        console.error('Failed to load skin leads:', err);
        skinLeads = [];
    }
    renderSkinLeads();
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
            <td>${esc(date)}</td>
            <td><strong>${esc(lead.name)}</strong></td>
            <td>${esc(lead.phone)}</td>
            <td>${esc(lead.email || '-')}</td>
            <td>${esc(skinType)}</td>
            <td><span class="badge ${scoreBadge}">${esc(score)}/100</span></td>
            <td><button class="btn-icon view" onclick="showSkinDetail('${esc(lead.id)}')" title="Lihat Detail"><i class="fa-solid fa-eye"></i></button></td>
            <td><button class="btn-icon delete" onclick="deleteLead('skin-analyze','${esc(lead.id)}')" title="Hapus"><i class="fa-solid fa-trash"></i></button></td>
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
            <div class="skin-detail-item"><span class="dl">Jenis Kulit</span><div class="dv">${esc(a.skinType || '-')}</div></div>
            <div class="skin-detail-item"><span class="dl">Skor Kesehatan</span><div class="dv">${esc(a.overallScore || 0)}/100</div></div>
            <div class="skin-detail-item"><span class="dl">Hidrasi</span><div class="dv">${esc(a.hydrationLevel || '-')}</div></div>
            <div class="skin-detail-item"><span class="dl">Ukuran Pori</span><div class="dv">${esc(a.poreSize || '-')}</div></div>
            <div class="skin-detail-item"><span class="dl">Jerawat</span><div class="dv">${esc(a.acneSeverity || '-')}</div></div>
            <div class="skin-detail-item"><span class="dl">Pigmentasi</span><div class="dv">${esc(a.pigmentation || '-')}</div></div>
        </div>
        <div class="skin-detail-section">
            <h5>Kondisi Terdeteksi</h5>
            <div>${(a.skinConditions || []).map(c => `<span class="skin-tag">${esc(c)}</span>`).join(' ')}</div>
        </div>
        <div class="skin-detail-section">
            <h5>Analisis Detail</h5>
            <p>${esc(a.detailedAnalysis || '-')}</p>
        </div>
        <div class="skin-detail-section">
            <h5>Rekomendasi Perawatan</h5>
            <p>${esc(a.recommendations || '-')}</p>
        </div>
        <div class="skin-detail-section">
            <h5>Tips Perawatan</h5>
            <ul>${(a.skincareTips || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        </div>
        <div class="skin-detail-section">
            <h5>Produk yang Direkomendasikan AI</h5>
            <ul>${(a.recommendedProducts || []).map(p => `<li><strong>${esc(p.productName)}</strong> — ${esc(p.reason)}</li>`).join('')}</ul>
        </div>
        <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:8px;font-size:12px;color:#8d9296;">
            <strong>Kontak:</strong> ${esc(lead.name)} | ${esc(lead.phone)} | ${esc(lead.email || '-')}<br>
            <strong>Tanggal:</strong> ${esc(new Date(lead.createdAt).toLocaleString('id-ID'))}
        </div>
    `;

    document.getElementById('skin-detail-modal').classList.add('active');
}

// --- Newsletter Leads ---
async function loadNewsLeads() {
    try {
        const res = await authFetch('/api/leads/newsletter');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        newsLeads = await res.json();
    } catch (err) {
        console.error('Failed to load newsletter leads:', err);
        newsLeads = [];
    }
    renderNewsLeads();
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
            <td>${esc(date)}</td>
            <td><strong>${esc(lead.name)}</strong></td>
            <td>${esc(lead.email)}</td>
            <td><button class="btn-icon delete" onclick="deleteLead('newsletter','${esc(lead.id)}')" title="Hapus"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;
    }).join('');
}

// --- Reseller Leads ---
async function loadResellerLeads() {
    try {
        const res = await authFetch('/api/leads/reseller');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        resellerLeads = await res.json();
    } catch (err) {
        console.error('Failed to load reseller leads:', err);
        resellerLeads = [];
    }
    renderResellerLeads();
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
            <td>${esc(date)}</td>
            <td><strong>${esc(lead.name)}</strong></td>
            <td>${esc(lead.phone)}</td>
            <td>${esc(lead.city || '-')}</td>
            <td>${esc(lead.message || '-')}</td>
            <td><button class="btn-icon delete" onclick="deleteLead('reseller','${esc(lead.id)}')" title="Hapus"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`;
    }).join('');
}

// --- Delete Lead ---
async function deleteLead(collection, id) {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
        const res = await authFetch(`/api/leads/${collection}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await loadAllData();
        } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || 'Gagal menghapus data.');
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        products = await res.json();
    } catch (err) {
        console.error('Failed to load products:', err);
        products = [];
    }
    renderProducts();
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
            <td><img src="${esc(p.imageUrl || 'https://placehold.co/48x48/faf8f5/0b3d2c?text=N')}" class="product-thumb" alt="${esc(p.name)}"></td>
            <td><strong>${esc(p.name)}</strong><br><span style="font-size:12px;color:#8d9296;">${esc(p.tag || '')}</span></td>
            <td><span class="badge" style="background:var(--primary-subtle);color:var(--primary);">${esc(p.category)}</span></td>
            <td>${esc(p.price)}</td>
            <td>⭐ ${esc(p.rating || 0)}</td>
            <td style="font-size:12px;">${esc(skinTypesStr)}</td>
            <td>
                <button class="btn-icon edit" onclick="editProduct('${esc(p.id)}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon delete" onclick="deleteProduct('${esc(p.id)}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
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
            const res = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                closeModal();
                await loadProducts();
                updateDashboardStats();
            } else {
                const err = await res.json().catch(() => ({}));
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
        const res = await authFetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await loadProducts();
            updateDashboardStats();
        } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || 'Gagal menghapus produk.');
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
                l.analysis?.detailedAnalysis || '',
            ]);
        });
    } else if (target === 'newsletter') {
        filename = 'leads_newsletter.csv';
        rows.push(['Tanggal', 'Nama', 'Email']);
        newsLeads.forEach(l => rows.push([l.createdAt, l.name, l.email]));
    } else if (target === 'reseller') {
        filename = 'leads_reseller.csv';
        rows.push(['Tanggal', 'Nama', 'WhatsApp', 'Kota', 'Pesan']);
        resellerLeads.forEach(l => rows.push([l.createdAt, l.name, l.phone, l.city || '', l.message || '']));
    }

    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Expose handlers used by inline onclick attributes (this file is an ES module,
// so top-level functions are NOT global by default — without this, every
// Detail/Edit/Hapus button throws ReferenceError)
window.showSkinDetail = showSkinDetail;
window.deleteLead = deleteLead;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
