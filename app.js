/* ==========================================================================
   MINIMAL LUXURY PORTFOLIO - DEVICE PROOF & TOUCH LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    let activeBrandKey = PORTFOLIO_DATA[0].key;
    let activeSubfilter = 'all';

    let modalQueue = [];
    let modalIndex = 0;

    // DOM Elements
    const brandStrip = document.getElementById('brand-strip');
    const brandActiveSpec = document.getElementById('brand-active-spec');
    const editorialGrid = document.getElementById('editorial-grid');
    const subfilterBtns = document.querySelectorAll('.subfilter-btn');

    // Modals
    const lightboxModal = document.getElementById('lightbox-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitleText = document.getElementById('modal-title-text');
    const modalSubtitleText = document.getElementById('modal-subtitle-text');
    const modalEmbedTarget = document.getElementById('modal-embed-target');
    const modalDriveLink = document.getElementById('modal-drive-link');
    const modalPrev = document.getElementById('modal-prev');
    const modalNext = document.getElementById('modal-next');
    const modalInquireDirect = document.getElementById('modal-inquire-direct');

    const inquiryOverlay = document.getElementById('inquiry-overlay');
    const inquiryClose = document.getElementById('inquiry-close');
    const inquireBtn = document.getElementById('inquire-btn');
    const briefForm = document.getElementById('brief-form');

    const shareLinkBtn = document.getElementById('share-link-btn');
    const mobileShareBtn = document.getElementById('mobile-share-btn');
    const mobileInquireBtn = document.getElementById('mobile-inquire-btn');
    const toastRoot = document.getElementById('toast-root');

    // Toast Notice Helper
    function notify(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast-notice';
        toast.textContent = msg;
        toastRoot.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // Preload thumbnails
    function preloadImages(urls) {
        urls.slice(0, 10).forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    // Render Brand Navigation Strip
    function renderBrandStrip() {
        brandStrip.innerHTML = '';

        PORTFOLIO_DATA.forEach((brand, idx) => {
            const btn = document.createElement('button');
            btn.className = `brand-tab ${brand.key === activeBrandKey ? 'active' : ''}`;
            btn.innerHTML = `
                <span class="brand-tab-idx">0${idx + 1}</span>
                <span>${brand.title.toUpperCase()}</span>
            `;

            btn.addEventListener('click', () => {
                activeBrandKey = brand.key;
                renderBrandStrip();
                renderActiveSpec();
                renderGrid();
            });

            brandStrip.appendChild(btn);
        });
    }

    // Render Active Brand Spec Banner
    function renderActiveSpec() {
        const brand = PORTFOLIO_DATA.find(b => b.key === activeBrandKey) || PORTFOLIO_DATA[0];

        brandActiveSpec.innerHTML = `
            <div class="spec-info">
                <h2>${brand.title}</h2>
                <div class="spec-tagline">// ${brand.category.toUpperCase()} • ${brand.tagline}</div>
                <p class="spec-desc">${brand.description}</p>
            </div>
            <div class="spec-actions">
                <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">
                    DELIVERABLES: <strong style="color: var(--text-color);">${brand.stats.videos} REELS</strong> / <strong style="color: var(--text-color);">${brand.stats.photos} STILLS</strong>
                </div>
                <a href="${brand.drive_folder}" target="_blank" class="btn-gree btn-gold" style="justify-content: center; min-height: 44px;">
                    RAW DRIVE FOLDER ↗
                </a>
            </div>
        `;
    }

    // Render Editorial Deliverables Grid
    function renderGrid() {
        const brand = PORTFOLIO_DATA.find(b => b.key === activeBrandKey) || PORTFOLIO_DATA[0];
        
        let files = brand.files;

        if (activeSubfilter === 'videos') {
            files = files.filter(f => f.type === 'video' || f.category === 'videos');
        } else if (activeSubfilter === 'photos') {
            files = files.filter(f => f.type === 'image' && f.category !== 'bts');
        } else if (activeSubfilter === 'bts') {
            files = files.filter(f => f.category === 'bts');
        }

        modalQueue = files.map(f => ({
            ...f,
            brandTitle: brand.title,
            brandCategory: brand.category
        }));

        preloadImages(files.map(f => f.preview_url));

        editorialGrid.innerHTML = '';

        if (files.length === 0) {
            editorialGrid.innerHTML = `
                <div style="grid-column: 1/-1; padding: 3rem 0; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem;">
                    [ NO DELIVERABLES MATCHING THIS FILTER IN ${brand.title.toUpperCase()} ]
                </div>
            `;
            return;
        }

        files.forEach((file, idx) => {
            const isVideo = file.type === 'video' || file.category === 'videos';
            
            const card = document.createElement('div');
            card.className = 'editorial-card';

            card.innerHTML = `
                <div class="editorial-thumb-wrap">
                    <img src="${file.thumbnail_url}" 
                         alt="${file.title}" 
                         class="editorial-thumb" 
                         loading="lazy" 
                         decoding="async" 
                         onerror="this.onerror=null; this.src='${file.cdn_url}';" />
                    <span class="editorial-type-badge">
                        ${isVideo ? '🎥 REEL' : '📷 STILL'}
                    </span>
                </div>
                <div class="editorial-card-info">
                    <span class="editorial-title">${file.title}</span>
                    <span class="editorial-brand-lbl">${brand.title}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                openModal(idx);
            });

            editorialGrid.appendChild(card);
        });
    }

    // Modal Lightbox Player
    function openModal(idx) {
        modalIndex = idx;
        updateModal();
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function updateModal() {
        const item = modalQueue[modalIndex];
        if (!item) return;

        modalTitleText.textContent = item.title;
        modalSubtitleText.textContent = `${item.brandTitle} • ${item.brandCategory}`;
        modalDriveLink.href = item.drive_url;

        modalEmbedTarget.innerHTML = '<div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.75rem;">[ CONNECTING STREAM... ]</div>';

        const isVideo = item.type === 'video' || item.category === 'videos';

        if (isVideo) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://drive.google.com/file/d/${item.id}/preview`;
            iframe.allow = 'autoplay; fullscreen';
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.onload = () => {
                const loader = modalEmbedTarget.querySelector('div');
                if (loader) loader.remove();
            };
            modalEmbedTarget.appendChild(iframe);
        } else {
            const img = document.createElement('img');
            img.src = item.preview_url;
            img.alt = item.title;
            img.onload = () => {
                const loader = modalEmbedTarget.querySelector('div');
                if (loader) loader.remove();
            };
            img.onerror = () => { img.src = item.cdn_url; };
            modalEmbedTarget.appendChild(img);
        }
    }

    function closeModal() {
        lightboxModal.classList.remove('active');
        modalEmbedTarget.innerHTML = '';
        document.body.style.overflow = 'auto';
    }

    modalPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        if (modalQueue.length > 0) {
            modalIndex = (modalIndex - 1 + modalQueue.length) % modalQueue.length;
            updateModal();
        }
    });

    modalNext.addEventListener('click', (e) => {
        e.stopPropagation();
        if (modalQueue.length > 0) {
            modalIndex = (modalIndex + 1) % modalQueue.length;
            updateModal();
        }
    });

    modalClose.addEventListener('click', closeModal);
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) closeModal();
    });

    // Subfilter Click Handlers
    subfilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            subfilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSubfilter = btn.getAttribute('data-filter');
            renderGrid();
        });
    });

    // Inquiry Overlay
    function openInquiry() {
        inquiryOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeInquiry() {
        inquiryOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    inquireBtn.addEventListener('click', openInquiry);
    if (mobileInquireBtn) mobileInquireBtn.addEventListener('click', openInquiry);
    
    modalInquireDirect.addEventListener('click', () => {
        closeModal();
        openInquiry();
    });

    inquiryClose.addEventListener('click', closeInquiry);
    inquiryOverlay.addEventListener('click', (e) => {
        if (e.target === inquiryOverlay) closeInquiry();
    });

    briefForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const brand = document.getElementById('brief-brand').value;
        closeInquiry();
        briefForm.reset();
        notify(`CAMPAIGN BRIEF RECEIVED FOR ${brand.toUpperCase()}`);
    });

    // Share Directory Button
    function handleShare() {
        const url = "https://drive.google.com/drive/folders/1Xd4R-1ZTqcPNs973CXSwD4q8ETaH_XMv?usp=share_link";
        if (navigator.share) {
            navigator.share({
                title: 'PORTFOLIO // CREATIVE DIRECTION',
                text: 'Check out the commercial film & visual producer portfolio directory',
                url: url
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url).then(() => {
                notify("DIRECTORY LINK COPIED TO CLIPBOARD");
            }).catch(() => {
                notify("DIRECTORY: " + url);
            });
        }
    }

    shareLinkBtn.addEventListener('click', handleShare);
    if (mobileShareBtn) mobileShareBtn.addEventListener('click', handleShare);

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') modalPrev.click();
        if (e.key === 'ArrowRight') modalNext.click();
    });

    // Initial render
    renderBrandStrip();
    renderActiveSpec();
    renderGrid();
});
