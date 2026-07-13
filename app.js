// Azarine Cosmetic Landing Page Application Logic

// Mock Product Database
const products = [
    {
        id: 1,
        name: "Hydrasoothe Sunscreen Gel SPF 45 PA++++",
        category: "sunscreen",
        price: "Rp 65.000",
        tag: "Best Seller",
        rating: 4.9,
        reviewsCount: 1542,
        skinTypes: ["oily", "acne", "sensitive"],
        img: "https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=400&q=80",
        desc: "Sunscreen wajah dalam bentuk gel (water base) yang sangat ringan, dingin dan mudah meresap untuk seluruh jenis kulit termasuk kulit berminyak dan acne prone skin. Diformulasikan dengan kandungan bahan alami propolis, aloe vera, green tea dan delima untuk melindungi kulit dari sinar UV A & UV B serta menutrisi kulit.",
        usage: "Oleskan secara merata pada bagian wajah, leher, atau bagian tubuh lainnya yang mungkin terkena sinar matahari 15 menit sebelum melakukan aktivitas luar ruangan.",
        ingredients: "Aloe Vera (melembapkan & menenangkan), Propolis (anti-bakteri alami), Green Tea (antioksidan tinggi), Pomegranate (anti-aging & melembutkan)."
    },
    {
        id: 2,
        name: "C-White Lightening Serum",
        category: "serum",
        price: "Rp 52.500",
        tag: "Brightening",
        rating: 4.8,
        reviewsCount: 934,
        skinTypes: ["dry", "oily"],
        img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80",
        desc: "Serum wajah dengan kandungan tinggi Kakadu Plum (sumber Vitamin C terbesar di dunia) yang berfungsi mencerahkan kulit kusam, menyamarkan noda hitam/hiperpigmentasi, dan mengembalikan kekenyalan kulit.",
        usage: "Teteskan 2-3 tetes serum pada wajah yang telah dibersihkan. Usapkan secara merata dan tepuk perlahan hingga meresap. Gunakan pagi dan malam hari sebelum pelembap.",
        ingredients: "Kakadu Plum Extract (Vit C konsentrasi tinggi), Lemon Extract (mencerahkan), Papaya Extract (eksfoliasi ringan), Hyaluronic Acid (menghidrasi)."
    },
    {
        id: 3,
        name: "Intense Luminous Barrier Moisturizer",
        category: "moisturizer",
        price: "Rp 69.000",
        tag: "Skin Barrier",
        rating: 4.9,
        reviewsCount: 812,
        skinTypes: ["dry", "sensitive"],
        img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&q=80",
        desc: "Pelembap pagi dan malam hari untuk memperbaiki skin barrier yang rusak, meredakan kemerahan, dan mengunci kelembapan hingga 24 jam tanpa rasa lengket. Diperkaya dengan Ceramide Complex.",
        usage: "Oleskan secara merata pada wajah dan leher setelah menggunakan serum. Pijat lembut dengan gerakan memutar ke atas.",
        ingredients: "Ceramide 3 & 4 (memperbaiki skin barrier), Panthenol / Pro Vit B5 (menenangkan iritasi), Hyaluronic Acid (melembapkan mendalam)."
    },
    {
        id: 4,
        name: "Acne Spot Gel",
        category: "acne",
        price: "Rp 35.000",
        tag: "Acne Care",
        rating: 4.7,
        reviewsCount: 1102,
        skinTypes: ["acne", "sensitive"],
        img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80",
        desc: "Gel totol jerawat dengan formula cepat meresap untuk meredakan peradangan jerawat aktif, membunuh bakteri penyebab jerawat, dan mencegah terbentuknya bekas jerawat dalam 2-3 hari saja.",
        usage: "Totolkan gel pada area kulit yang berjerawat aktif setelah langkah skincare terakhir Anda. Gunakan 2-3 kali sehari untuk hasil maksimal.",
        ingredients: "Salicylic Acid / BHA (membersihkan pori), Centella Asiatica (menenangkan kemerahan), Sulfur (mengeringkan jerawat), Allantoin (regenerasi kulit)."
    },
    {
        id: 5,
        name: "Invisipore Ultra Matte Sunscreen SPF 50",
        category: "sunscreen",
        price: "Rp 72.000",
        tag: "Award Winner",
        rating: 4.9,
        reviewsCount: 689,
        skinTypes: ["oily", "acne"],
        img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80",
        desc: "Pemenang Penghargaan Internasional C&T Allē Awards 2026 di New York. Sunscreen dengan hasil akhir matte bebas kilap seharian, membantu mengecilkan tampilan pori-pori, dan menahan sebum berlebih.",
        usage: "Oleskan pada wajah dan leher secara merata sebelum beraktivitas di luar ruangan. Cocok digunakan sebagai base make-up.",
        ingredients: "Canadian Willowherb (mengontrol sebum), Centella Asiatica, Ectoin (anti-polusi), SPF 50 PA++++."
    },
    {
        id: 6,
        name: "Niacinamide 5% + Moisture Serum",
        category: "serum",
        price: "Rp 59.000",
        tag: "Bright & Glow",
        rating: 4.8,
        reviewsCount: 754,
        skinTypes: ["dry", "oily", "sensitive"],
        img: "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=400&q=80",
        desc: "Serum dengan Niacinamide konsentrasi optimal 5% untuk mencerahkan noda hitam, meratakan warna kulit wajah, meredakan kemerahan akibat jerawat, sekaligus melembapkan kulit secara mendalam.",
        usage: "Gunakan 2-3 tetes pada seluruh wajah setelah toner dan sebelum pelembap, pada pagi dan malam hari.",
        ingredients: "Niacinamide 5% (meratakan warna kulit & sebum control), Acetyl Glucosamine (sinergi mencerahkan), Fermented Honey (melembutkan kulit)."
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Header scroll background effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Product Catalog Render & Filter
    const catalogContainer = document.getElementById('catalog-products-container');
    const filterButtons = document.querySelectorAll('.filter-btn');

    function renderProducts(filteredList) {
        if (!catalogContainer) return;
        catalogContainer.innerHTML = '';
        
        filteredList.forEach(product => {
            const card = document.createElement('div');
            card.className = `product-card`;
            card.setAttribute('data-id', product.id);
            card.innerHTML = `
                <div class="product-img-wrapper">
                    <span class="product-tag">${product.tag}</span>
                    <img src="${product.img}" alt="${product.name}" class="product-img" loading="lazy">
                </div>
                <div class="product-info">
                    <div class="product-rating">
                        <i class="fa-solid fa-star"></i>
                        <span>${product.rating} (${product.reviewsCount} Ulasan)</span>
                    </div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.desc}</p>
                    <div class="product-bottom">
                        <span class="product-price">${product.price}</span>
                        <button type="button" class="btn btn-outline btn-sm view-detail-btn" style="padding: 8px 16px; font-size: 13px;">Detail</button>
                    </div>
                </div>
            `;
            catalogContainer.appendChild(card);
        });

        // Add event listeners to the detail buttons
        const detailButtons = catalogContainer.querySelectorAll('.view-detail-btn');
        detailButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.product-card');
                const id = parseInt(card.getAttribute('data-id'));
                openProductModal(id);
            });
        });
    }

    // Initial render
    renderProducts(products);

    // Filter Buttons Event Handler
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            if (filterValue === 'all') {
                renderProducts(products);
            } else {
                const filtered = products.filter(p => p.category === filterValue || p.skinTypes.includes(filterValue));
                renderProducts(filtered);
            }
        });
    });

    // 3. Product Modal Logic
    const productModal = document.getElementById('product-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    
    function openProductModal(id) {
        const product = products.find(p => p.id === id);
        if (!product || !productModal) return;
        
        document.getElementById('modal-product-img').src = product.img;
        document.getElementById('modal-product-img').alt = product.name;
        document.getElementById('modal-product-tag').textContent = product.tag;
        document.getElementById('modal-product-title').textContent = product.name;
        document.getElementById('modal-product-price').textContent = product.price;
        document.getElementById('modal-product-desc').textContent = product.desc;
        document.getElementById('modal-product-usage').textContent = product.usage;
        document.getElementById('modal-product-ingredients').textContent = product.ingredients;
        
        // Update Buy Button WhatsApp Message
        const buyBtn = document.getElementById('modal-buy-btn');
        const waMessage = encodeURIComponent(`Halo Azarine, saya tertarik dengan produk *${product.name}* seharga *${product.price}* yang saya lihat di Landing Page. Apakah produk ini ready?`);
        buyBtn.href = `https://wa.me/6281234567890?text=${waMessage}`;
        
        productModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (modalCloseBtn && productModal) {
        modalCloseBtn.addEventListener('click', () => {
            productModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) {
                productModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // 4. Skin Quiz Logic
    const quizSlides = document.querySelectorAll('.quiz-slide');
    const quizPrevBtn = document.getElementById('quiz-prev-btn');
    const quizNextBtn = document.getElementById('quiz-next-btn');
    const quizStepTitle = document.getElementById('quiz-step-title');
    const quizProgressText = document.getElementById('quiz-progress-text');
    const quizProgressBar = document.getElementById('quiz-progress-bar');
    const quizFooterButtons = document.getElementById('quiz-footer-buttons');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');

    let currentStep = 1;
    let quizAnswers = {
        step1: '',
        step2: '',
        step3: ''
    };

    // Handle Quiz Selection Option
    quizSlides.forEach(slide => {
        const options = slide.querySelectorAll('.quiz-option');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                
                const step = parseInt(slide.getAttribute('data-step'));
                const val = opt.getAttribute('data-value');
                
                if (step === 1) quizAnswers.step1 = val;
                if (step === 2) quizAnswers.step2 = val;
                if (step === 3) quizAnswers.step3 = val;
            });
        });
    });

    function updateQuizUI() {
        quizSlides.forEach(slide => slide.classList.remove('active'));
        const activeSlide = document.querySelector(`.quiz-slide[data-step="${currentStep}"]`);
        if (activeSlide) activeSlide.classList.add('active');

        // Progress Calculations
        if (currentStep <= 4) {
            quizStepTitle.textContent = currentStep === 4 ? "Klaim Hasil" : `Pertanyaan ${currentStep}`;
            quizProgressText.textContent = `${currentStep} dari 4`;
            quizProgressBar.style.width = `${(currentStep / 4) * 100}%`;
            quizFooterButtons.style.display = 'flex';
            
            // Prev button visibility
            quizPrevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
            
            // Next button text
            quizNextBtn.innerHTML = currentStep === 4 ? 'Kirim & Lihat Hasil <i class="fa-solid fa-square-check"></i>' : 'Lanjut <i class="fa-solid fa-arrow-right"></i>';
        } else {
            // Results step
            quizStepTitle.textContent = "Hasil Analisa Kulit";
            quizProgressText.textContent = "Selesai";
            quizProgressBar.style.width = '100%';
            quizFooterButtons.style.display = 'none';
        }
    }

    if (quizNextBtn && quizPrevBtn) {
        quizNextBtn.addEventListener('click', () => {
            // Validate selections for Q1-Q3
            if (currentStep <= 3) {
                const answerForCurrentStep = quizAnswers[`step${currentStep}`];
                if (!answerForCurrentStep) {
                    alert('Harap pilih salah satu jawaban terlebih dahulu.');
                    return;
                }
                currentStep++;
                updateQuizUI();
            } else if (currentStep === 4) {
                // Form validation on step 4
                const name = document.getElementById('quiz-name').value.trim();
                const phone = document.getElementById('quiz-phone').value.trim();
                const email = document.getElementById('quiz-email').value.trim();
                const consent = document.getElementById('quiz-consent').checked;

                if (!name || !phone || !email) {
                    alert('Harap lengkapi semua bidang kontak.');
                    return;
                }
                if (!consent) {
                    alert('Anda harus menyetujui kebijakan privasi.');
                    return;
                }

                // Save Lead to localStorage
                const leads = JSON.parse(localStorage.getItem('azarine_quiz_leads') || '[]');
                leads.push({
                    name,
                    phone,
                    email,
                    skinType: quizAnswers.step1,
                    concern: quizAnswers.step2,
                    goal: quizAnswers.step3,
                    date: new Date().toISOString()
                });
                localStorage.setItem('azarine_quiz_leads', JSON.stringify(leads));

                // Process recommendations
                displayQuizRecommendations(quizAnswers.step1);
                
                // Show Success Toast
                showToast("Skin Quiz terkirim! Menganalisis kulit...");

                currentStep = 5;
                updateQuizUI();
            }
        });

        quizPrevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateQuizUI();
            }
        });
    }

    if (restartQuizBtn) {
        restartQuizBtn.addEventListener('click', () => {
            currentStep = 1;
            quizAnswers = { step1: '', step2: '', step3: '' };
            
            // Clear inputs
            document.getElementById('quiz-name').value = '';
            document.getElementById('quiz-phone').value = '';
            document.getElementById('quiz-email').value = '';
            
            // Clear selected options in UI
            document.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            
            updateQuizUI();
        });
    }

    function displayQuizRecommendations(skinType) {
        const resultBadge = document.getElementById('skin-type-result');
        const container = document.getElementById('recommended-products-container');
        if (!container || !resultBadge) return;

        let badgeText = '';
        let matchingProducts = [];

        switch(skinType) {
            case 'oily':
                badgeText = 'KULIT BERMINYAK / KUSAM';
                matchingProducts = products.filter(p => p.skinTypes.includes('oily'));
                break;
            case 'dry':
                badgeText = 'KULIT KERING / DEHIDRASI';
                matchingProducts = products.filter(p => p.skinTypes.includes('dry'));
                break;
            case 'sensitive':
                badgeText = 'KULIT SENSITIF / MUDAH MERAH';
                matchingProducts = products.filter(p => p.skinTypes.includes('sensitive'));
                break;
            case 'acne':
                badgeText = 'KULIT ACNE-PRONE / BERJERAWAT';
                matchingProducts = products.filter(p => p.skinTypes.includes('acne'));
                break;
            default:
                badgeText = 'KULIT NORMAL / KOMBINASI';
                matchingProducts = products.slice(0, 2);
        }

        resultBadge.textContent = badgeText;
        container.innerHTML = '';

        // Select top 2 products for recommendation
        matchingProducts.slice(0, 2).forEach(p => {
            const card = document.createElement('div');
            card.style.cssText = 'background:#fdfbf7; border:1px solid #e9ecef; border-radius:12px; padding:16px; text-align:left; display:flex; gap:16px; align-items:center;';
            card.innerHTML = `
                <img src="${p.img}" alt="${p.name}" style="width:70px; height:70px; object-fit:contain; border-radius:8px; background:#faf8f5;">
                <div style="flex-grow:1;">
                    <h4 style="font-size:14px; font-weight:700; margin-bottom:4px; line-height:1.3; color:#0b3d2c;">${p.name}</h4>
                    <p style="font-size:13px; font-weight:700; color:#d4a373; margin-bottom:4px;">${p.price}</p>
                    <span style="font-size:10px; padding:2px 8px; background:#eef5f2; color:#0b3d2c; border-radius:99px; font-weight:700; text-transform:uppercase;">${p.tag}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // 5. Newsletter Form Logic
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('news-name').value.trim();
            const email = document.getElementById('news-email').value.trim();
            const consent = document.getElementById('news-consent').checked;

            if (!consent) {
                alert('Anda harus menyetujui kebijakan privasi.');
                return;
            }

            // Save to LocalStorage
            const leads = JSON.parse(localStorage.getItem('azarine_newsletter_leads') || '[]');
            leads.push({
                name,
                email,
                date: new Date().toISOString()
            });
            localStorage.setItem('azarine_newsletter_leads', JSON.stringify(leads));

            // Clear Form
            document.getElementById('news-name').value = '';
            document.getElementById('news-email').value = '';

            // Show toast voucher notification
            showToast("Sukses! Gunakan Kode: AZARINEGLOW15 diskon 15%");
        });
    }

    // 6. Reseller Form Logic
    const resellerForm = document.getElementById('reseller-form');
    if (resellerForm) {
        resellerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('res-name').value.trim();
            const phone = document.getElementById('res-phone').value.trim();
            const city = document.getElementById('res-city').value.trim();
            const message = document.getElementById('res-message').value.trim();
            const consent = document.getElementById('res-consent').checked;

            if (!consent) {
                alert('Anda harus menyetujui kebijakan privasi.');
                return;
            }

            // Save to LocalStorage
            const leads = JSON.parse(localStorage.getItem('azarine_reseller_leads') || '[]');
            leads.push({
                name,
                phone,
                city,
                message,
                date: new Date().toISOString()
            });
            localStorage.setItem('azarine_reseller_leads', JSON.stringify(leads));

            // Clear Form
            document.getElementById('res-name').value = '';
            document.getElementById('res-phone').value = '';
            document.getElementById('res-city').value = '';
            document.getElementById('res-message').value = '';

            showToast("Pendaftaran reseller terkirim! Tim kami akan segera menghubungi WA Anda.");
        });
    }

    // Toast show helper
    function showToast(msg) {
        const toast = document.getElementById('success-toast');
        const toastMsg = document.getElementById('toast-message');
        if (!toast || !toastMsg) return;

        toastMsg.textContent = msg;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }
});
