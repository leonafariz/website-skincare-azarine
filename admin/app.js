// Azarine Admin Dashboard Application Logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Tab Navigation
    const menuItems = document.querySelectorAll('.menu-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            tabPanels.forEach(tp => tp.classList.remove('active'));
            const targetPanel = document.getElementById(`tab-${tabId}`);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // 2. Load and Calculate Data
    function initDashboard() {
        const quizLeads = JSON.parse(localStorage.getItem('azarine_quiz_leads') || '[]');
        const newsLeads = JSON.parse(localStorage.getItem('azarine_newsletter_leads') || '[]');
        const resellerLeads = JSON.parse(localStorage.getItem('azarine_reseller_leads') || '[]');

        // Counts
        const countQuiz = quizLeads.length;
        const countNews = newsLeads.length;
        const countReseller = resellerLeads.length;
        const countTotal = countQuiz + countNews + countReseller;

        document.getElementById('count-total').textContent = countTotal;
        document.getElementById('count-quiz').textContent = countQuiz;
        document.getElementById('count-news').textContent = countNews;
        document.getElementById('count-reseller').textContent = countReseller;

        // Render charts based on skin type frequency
        calculateSkinTypeChart(quizLeads);

        // Render Tables
        renderQuizTable(quizLeads);
        renderNewsTable(newsLeads);
        renderResellerTable(resellerLeads);
    }

    function calculateSkinTypeChart(leads) {
        if (leads.length === 0) {
            updateBar('oily', 0);
            updateBar('dry', 0);
            updateBar('sensitive', 0);
            updateBar('acne', 0);
            return;
        }

        const counts = { oily: 0, dry: 0, sensitive: 0, acne: 0 };
        leads.forEach(l => {
            if (counts[l.skinType] !== undefined) {
                counts[l.skinType]++;
            }
        });

        const totalQuiz = leads.length;
        Object.keys(counts).forEach(type => {
            const percentage = Math.round((counts[type] / totalQuiz) * 100);
            updateBar(type, percentage);
        });
    }

    function updateBar(type, percentage) {
        const bar = document.querySelector(`.${type}-bar`);
        const label = document.getElementById(`val-${type}`);
        if (bar && label) {
            bar.style.width = `${percentage}%`;
            label.textContent = `${percentage}%`;
        }
    }

    function renderQuizTable(leads) {
        const tbody = document.getElementById('table-quiz-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (leads.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #8d9296;">Belum ada data masuk.</td></tr>`;
            return;
        }

        leads.forEach((lead, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(lead.date)}</td>
                <td><strong>${escapeHTML(lead.name)}</strong></td>
                <td><a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #25d366; font-weight:600;"><i class="fa-brands fa-whatsapp"></i> ${escapeHTML(lead.phone)}</a></td>
                <td>${escapeHTML(lead.email)}</td>
                <td><span class="badge badge-${lead.skinType}">${lead.skinType}</span></td>
                <td>${escapeHTML(lead.concern || '-')}</td>
                <td>${escapeHTML(lead.goal || '-')}</td>
                <td>
                    <button class="action-btn-delete delete-lead" data-type="quiz" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });

        addDeleteListeners();
    }

    function renderNewsTable(leads) {
        const tbody = document.getElementById('table-news-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (leads.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #8d9296;">Belum ada data masuk.</td></tr>`;
            return;
        }

        leads.forEach((lead, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(lead.date)}</td>
                <td><strong>${escapeHTML(lead.name)}</strong></td>
                <td>${escapeHTML(lead.email)}</td>
                <td>
                    <button class="action-btn-delete delete-lead" data-type="news" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });

        addDeleteListeners();
    }

    function renderResellerTable(leads) {
        const tbody = document.getElementById('table-reseller-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (leads.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #8d9296;">Belum ada data masuk.</td></tr>`;
            return;
        }

        leads.forEach((lead, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(lead.date)}</td>
                <td><strong>${escapeHTML(lead.name)}</strong></td>
                <td><a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #25d366; font-weight:600;"><i class="fa-brands fa-whatsapp"></i> ${escapeHTML(lead.phone)}</a></td>
                <td>${escapeHTML(lead.city)}</td>
                <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(lead.message)}">${escapeHTML(lead.message || '-')}</td>
                <td>
                    <button class="action-btn-delete delete-lead" data-type="reseller" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });

        addDeleteListeners();
    }

    function addDeleteListeners() {
        const deleteButtons = document.querySelectorAll('.delete-lead');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                const index = parseInt(btn.getAttribute('data-index'));

                if (confirm('Apakah Anda yakin ingin menghapus lead ini?')) {
                    if (type === 'quiz') {
                        const leads = JSON.parse(localStorage.getItem('azarine_quiz_leads') || '[]');
                        leads.splice(index, 1);
                        localStorage.setItem('azarine_quiz_leads', JSON.stringify(leads));
                    } else if (type === 'news') {
                        const leads = JSON.parse(localStorage.getItem('azarine_newsletter_leads') || '[]');
                        leads.splice(index, 1);
                        localStorage.setItem('azarine_newsletter_leads', JSON.stringify(leads));
                    } else if (type === 'reseller') {
                        const leads = JSON.parse(localStorage.getItem('azarine_reseller_leads') || '[]');
                        leads.splice(index, 1);
                        localStorage.setItem('azarine_reseller_leads', JSON.stringify(leads));
                    }
                    initDashboard();
                }
            });
        });
    }

    // 3. Clear All Functionality
    const btnClearAll = document.getElementById('btn-clear-all-leads');
    if (btnClearAll) {
        btnClearAll.addEventListener('click', () => {
            if (confirm('HATI-HATI! Langkah ini akan menghapus seluruh data lead (Kuis, Newsletter, Reseller) dari browser ini. Lanjutkan?')) {
                localStorage.removeItem('azarine_quiz_leads');
                localStorage.removeItem('azarine_newsletter_leads');
                localStorage.removeItem('azarine_reseller_leads');
                initDashboard();
            }
        });
    }

    // 4. Seed Mock Data Functionality
    const btnSeed = document.getElementById('btn-seed-mock-data');
    if (btnSeed) {
        btnSeed.addEventListener('click', () => {
            const mockQuiz = [
                { name: "Dewi Lestari", phone: "081298765432", email: "dewi.lestari@gmail.com", skinType: "oily", concern: "acne-care", goal: "glow", date: new Date(Date.now() - 3600000 * 2).toISOString() },
                { name: "Jessica Mila", phone: "082123456789", email: "jessica@outlook.com", skinType: "dry", concern: "hydration", goal: "plump", date: new Date(Date.now() - 3600000 * 5).toISOString() },
                { name: "Budi Santoso", phone: "085699887766", email: "budi.s@yahoo.com", skinType: "acne", concern: "acne-care", goal: "calm", date: new Date(Date.now() - 3600000 * 24).toISOString() },
                { name: "Clarissa Putri", phone: "087855443322", email: "clarissa.p@gmail.com", skinType: "sensitive", concern: "sun-protection", goal: "barrier", date: new Date(Date.now() - 3600000 * 30).toISOString() }
            ];

            const mockNews = [
                { name: "Andini Putri", email: "andini@gmail.com", date: new Date(Date.now() - 3600000 * 1).toISOString() },
                { name: "Fajar Nugraha", email: "fajar.n@gmail.com", date: new Date(Date.now() - 3600000 * 10).toISOString() }
            ];

            const mockReseller = [
                { name: "Toko Kosmetik Ayu Surabaya", phone: "081122334455", city: "Surabaya", message: "Saya memiliki ruko kosmetik di Pasar Atom dan ingin menyuplai produk Azarine yang saat ini sedang sangat laris.", date: new Date(Date.now() - 3600000 * 12).toISOString() },
                { name: "Rina Ritel Bandung", phone: "082266778899", city: "Bandung", message: "Tertarik jualan online lewat shopee live. Mau beli partai besar grosir.", date: new Date(Date.now() - 3600000 * 48).toISOString() }
            ];

            localStorage.setItem('azarine_quiz_leads', JSON.stringify(mockQuiz));
            localStorage.setItem('azarine_newsletter_leads', JSON.stringify(mockNews));
            localStorage.setItem('azarine_reseller_leads', JSON.stringify(mockReseller));

            initDashboard();
            alert('Sukses melakukan seeding data contoh!');
        });
    }

    // 5. Export to CSV Functionality
    const exportButtons = document.querySelectorAll('.btn-export');
    exportButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            let data = [];
            let headers = [];
            let filename = `azarine-leads-${target}.csv`;

            if (target === 'quiz') {
                data = JSON.parse(localStorage.getItem('azarine_quiz_leads') || '[]');
                headers = ['Tanggal', 'Nama', 'WhatsApp', 'Email', 'Jenis Kulit', 'Keluhan', 'Target'];
                data = data.map(l => [l.date, l.name, l.phone, l.email, l.skinType, l.concern, l.goal]);
            } else if (target === 'newsletter') {
                data = JSON.parse(localStorage.getItem('azarine_newsletter_leads') || '[]');
                headers = ['Tanggal', 'Nama', 'Email'];
                data = data.map(l => [l.date, l.name, l.email]);
            } else if (target === 'reseller') {
                data = JSON.parse(localStorage.getItem('azarine_reseller_leads') || '[]');
                headers = ['Tanggal', 'Nama', 'WhatsApp', 'Kota', 'Pesan'];
                data = data.map(l => [l.date, l.name, l.phone, l.city, l.message]);
            }

            if (data.length === 0) {
                alert('Tidak ada data untuk diexport.');
                return;
            }

            // Convert to CSV string
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += headers.join(",") + "\n";
            data.forEach(row => {
                const escapedRow = row.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`);
                csvContent += escapedRow.join(",") + "\n";
            });

            // Trigger Download
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });

    // Helper functions
    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Run Dashboard Initialization
    initDashboard();
});
