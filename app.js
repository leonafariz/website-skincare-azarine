// Azarine Cosmetic Landing Page — API-driven Application Logic

let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => { mobileMenuBtn.classList.toggle('active'); navMenu.classList.toggle('active'); });
        navMenu.querySelectorAll('a').forEach(link => { link.addEventListener('click', () => { mobileMenuBtn.classList.remove('active'); navMenu.classList.remove('active'); }); });
    }

    // Header scroll
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => { header.classList.toggle('scrolled', window.scrollY > 50); });

    // 2. Load Products from API
    loadProducts();

    // 3. AI Skin Analyzer Logic
    initAnalyzer();

    // 4. Newsletter Form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('news-name').value.trim();
            const email = document.getElementById('news-email').value.trim();
            if (!document.getElementById('news-consent').checked) { alert('Setujui kebijakan privasi.'); return; }

            try {
                const res = await fetch('/api/leads/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email }),
                });
                const data = await res.json();
                if (data.success) {
                    showToast(data.message);
                    document.getElementById('news-name').value = '';
                    document.getElementById('news-email').value = '';
                }
            } catch (err) { console.error(err); alert('Gagal mengirim. Coba lagi.'); }
        });
    }

    // 5. Reseller Form
    const resellerForm = document.getElementById('reseller-form');
    if (resellerForm) {
        resellerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('res-name').value.trim();
            const phone = document.getElementById('res-phone').value.trim();
            const city = document.getElementById('res-city').value.trim();
            const message = document.getElementById('res-message').value.trim();
            if (!document.getElementById('res-consent').checked) { alert('Setujui kebijakan privasi.'); return; }

            try {
                const res = await fetch('/api/leads/reseller', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone, city, message }),
                });
                const data = await res.json();
                if (data.success) {
                    showToast(data.message);
                    ['res-name', 'res-phone', 'res-city', 'res-message'].forEach(id => document.getElementById(id).value = '');
                }
            } catch (err) { console.error(err); alert('Gagal mengirim. Coba lagi.'); }
        });
    }
});

// --- Product Catalog ---
async function loadProducts() {
    try {
        const res = await fetch('/api/products');
        allProducts = await res.json();
        renderProducts(allProducts);
        initFilters();
    } catch (err) {
        console.error('Failed to load products:', err);
        document.getElementById('catalog-products-container').innerHTML = '<p style="text-align:center;color:#e76f51;grid-column:1/-1;">Gagal memuat produk. Pastikan server berjalan.</p>';
    }
}

function renderProducts(list) {
    const container = document.getElementById('catalog-products-container');
    if (!container) return;
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#8d9296;grid-column:1/-1;">Belum ada produk tersedia.</p>';
        return;
    }

    list.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);
        card.innerHTML = `
            <div class="product-img-wrapper">
                <span class="product-tag">${product.tag || product.category}</span>
                <img src="${product.imageUrl || 'https://placehold.co/400x400/faf8f5/0b3d2c?text=No+Image'}" alt="${product.name}" class="product-img" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-rating"><i class="fa-solid fa-star"></i><span>${product.rating || 0} (${product.reviewsCount || 0} Ulasan)</span></div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.desc || ''}</p>
                <div class="product-bottom">
                    <span class="product-price">${product.price}</span>
                    <button type="button" class="btn btn-outline btn-sm view-detail-btn" style="padding:8px 16px;font-size:13px;">Detail</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    container.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.closest('.product-card').getAttribute('data-id');
            openProductModal(id);
        });
    });
}

function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const f = btn.getAttribute('data-filter');
            renderProducts(f === 'all' ? allProducts : allProducts.filter(p => p.category === f));
        });
    });
}

function openProductModal(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    const modal = document.getElementById('product-modal');
    document.getElementById('modal-product-img').src = product.imageUrl || '';
    document.getElementById('modal-product-tag').textContent = product.tag || product.category;
    document.getElementById('modal-product-title').textContent = product.name;
    document.getElementById('modal-product-price').textContent = product.price;
    document.getElementById('modal-product-desc').textContent = product.desc || '';
    document.getElementById('modal-product-usage').textContent = product.usage || '-';
    document.getElementById('modal-product-ingredients').textContent = product.ingredients || '-';
    const waMsg = encodeURIComponent(`Halo Azarine, saya tertarik dengan produk *${product.name}* seharga *${product.price}*`);
    document.getElementById('modal-buy-btn').href = `https://wa.me/6281234567890?text=${waMsg}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Modal close handlers
const modalCloseBtn = document.getElementById('modal-close-btn');
const productModal = document.getElementById('product-modal');
if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => { productModal.classList.remove('active'); document.body.style.overflow = ''; });
if (productModal) productModal.addEventListener('click', (e) => { if (e.target === productModal) { productModal.classList.remove('active'); document.body.style.overflow = ''; } });

// --- AI Skin Analyzer ---
function initAnalyzer() {
    let selectedFile = null;

    const step1 = document.getElementById('analyzer-step-1');
    const step2 = document.getElementById('analyzer-step-2');
    const stepLoading = document.getElementById('analyzer-step-loading');
    const stepResults = document.getElementById('analyzer-step-results');
    const nextBtn1 = document.getElementById('analyzer-next-1');
    const prevBtn2 = document.getElementById('analyzer-prev-2');
    const submitBtn = document.getElementById('analyzer-submit');
    const restartBtn = document.getElementById('restart-analyzer');
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const previewImg = document.getElementById('preview-image');
    const placeholder = document.getElementById('upload-placeholder');

    function showStep(step) {
        [step1, step2, stepLoading, stepResults].forEach(s => s && s.classList.remove('active'));
        if (step) step.classList.add('active');
    }

    // Step 1 → Step 2
    if (nextBtn1) {
        nextBtn1.addEventListener('click', () => {
            const name = document.getElementById('az-name').value.trim();
            const phone = document.getElementById('az-phone').value.trim();
            if (!name || !phone) { alert('Nama dan nomor HP harus diisi.'); return; }
            if (!document.getElementById('az-consent').checked) { alert('Setujui kebijakan privasi.'); return; }
            showStep(step2);
        });
    }

    // Step 2 → Step 1
    if (prevBtn2) prevBtn2.addEventListener('click', () => showStep(step1));

    // File upload handling
    if (uploadZone) {
        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) handleFile(fileInput.files[0]);
        });
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) { alert('Hanya file gambar yang diperbolehkan.'); return; }
        if (file.size > 10 * 1024 * 1024) { alert('Ukuran file maksimal 10MB.'); return; }
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            placeholder.style.display = 'none';
            submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    // Submit analysis
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            if (!selectedFile) { alert('Upload foto wajah terlebih dahulu.'); return; }

            showStep(stepLoading);

            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('name', document.getElementById('az-name').value.trim());
            formData.append('phone', document.getElementById('az-phone').value.trim());
            formData.append('email', document.getElementById('az-email').value.trim());

            try {
                const res = await fetch('/api/leads/skin-analyze', {
                    method: 'POST',
                    body: formData,
                });

                const data = await res.json();

                if (data.success && data.analysis) {
                    displayResults(data.analysis);
                    showStep(stepResults);
                } else {
                    alert(data.error || 'Analisis gagal. Silakan coba lagi.');
                    showStep(step2);
                }
            } catch (err) {
                console.error('Analysis error:', err);
                alert('Terjadi kesalahan koneksi. Pastikan server berjalan.');
                showStep(step2);
            }
        });
    }

    // Restart
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            selectedFile = null;
            previewImg.style.display = 'none';
            placeholder.style.display = 'flex';
            submitBtn.disabled = true;
            fileInput.value = '';
            ['az-name', 'az-phone', 'az-email'].forEach(id => document.getElementById(id).value = '');
            showStep(step1);
        });
    }
}

function displayResults(analysis) {
    // Score
    const scoreNum = document.getElementById('score-number');
    const scoreCircle = document.getElementById('score-circle');
    const score = analysis.overallScore || 0;
    scoreNum.textContent = score;

    // Color based on score
    let scoreColor = '#e76f51';
    if (score >= 70) scoreColor = '#2a9d8f';
    else if (score >= 50) scoreColor = '#e9c46a';
    scoreCircle.style.borderColor = scoreColor;
    scoreNum.style.color = scoreColor;

    // Skin type
    document.getElementById('result-skin-type').textContent = analysis.skinType || '-';

    // Metrics
    document.getElementById('metric-hydration').textContent = analysis.hydrationLevel || '-';
    document.getElementById('metric-pore').textContent = analysis.poreSize || '-';
    document.getElementById('metric-acne').textContent = analysis.acneSeverity || '-';
    document.getElementById('metric-pigmentation').textContent = analysis.pigmentation || '-';

    // Conditions tags
    const condContainer = document.getElementById('result-conditions');
    condContainer.innerHTML = '';
    (analysis.skinConditions || []).forEach(c => {
        const tag = document.createElement('span');
        tag.className = 'condition-tag';
        tag.textContent = c;
        condContainer.appendChild(tag);
    });

    // Text sections
    document.getElementById('result-analysis').textContent = analysis.detailedAnalysis || '-';
    document.getElementById('result-recommendations').textContent = analysis.recommendations || '-';

    // Tips
    const tipsList = document.getElementById('result-tips');
    tipsList.innerHTML = '';
    (analysis.skincareTips || []).forEach(tip => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${tip}`;
        tipsList.appendChild(li);
    });

    // Recommended products
    const prodsContainer = document.getElementById('result-products');
    prodsContainer.innerHTML = '';
    (analysis.recommendedProducts || []).forEach(rec => {
        const matchedProduct = allProducts.find(p => p.id === rec.productId || p.name === rec.productName);
        const card = document.createElement('div');
        card.className = 'rec-product-card';
        card.innerHTML = `
            <img src="${matchedProduct ? matchedProduct.imageUrl : 'https://placehold.co/80x80/faf8f5/0b3d2c?text=P'}" alt="${rec.productName}">
            <div class="rec-product-info">
                <h5>${rec.productName}</h5>
                <p>${matchedProduct ? matchedProduct.price : ''}</p>
                <span class="rec-reason">${rec.reason}</span>
            </div>
        `;
        prodsContainer.appendChild(card);
    });
}

// --- Toast ---
function showToast(msg) {
    const toast = document.getElementById('success-toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
}
