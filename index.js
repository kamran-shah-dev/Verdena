/* ===== VERDENA — INTERACTIVE LOGIC ===== */

(function () {
    'use strict';

    /* ---------- CONFIGURATION ---------- */
    const TOTAL_FRAMES = 120;
    const FRAME_DIR = 'frames_prod_1';

    const VARIANTS = [
        {
            name: 'VITAMIN C',
            subtitle: 'BRIGHTENING SERUM',
            desc: 'A lightweight daily serum packed with stabilized Vitamin C to visibly even skin tone, fade dark spots, and restore a natural lit-from-within glow.',
            accent: '#7C9070'
        },
        {
            name: 'HYALURONIC',
            subtitle: 'DEEP HYDRATION SERUM',
            desc: 'An ultra-hydrating formula with three molecular weights of hyaluronic acid that draw moisture deep into the skin for 72-hour plump, dewy hydration.',
            accent: '#7089A0'
        },
        {
            name: 'RETINOL',
            subtitle: 'NIGHT RENEWAL CREAM',
            desc: 'A gentle yet effective retinol cream that works overnight to smooth fine lines, improve skin texture, and reveal visibly younger-looking skin by morning.',
            accent: '#907C90'
        }
    ];

    /* ---------- PRODUCT CATALOG FOR SEARCH / FILTER ---------- */
    const ALL_PRODUCTS = [
        { name: 'Vitamin C Brightening Serum', category: 'Serums', price: 48, badge: 'Bestseller', desc: 'Stabilized Vitamin C to even skin tone and restore radiance.', frame: 10 },
        { name: 'Hyaluronic Deep Hydration Serum', category: 'Serums', price: 52, badge: 'New', desc: 'Triple-weight hyaluronic acid for 72-hour dewy hydration.', frame: 40 },
        { name: 'Retinol Night Renewal Cream', category: 'Creams', price: 56, badge: '', desc: 'Gentle retinol that works overnight to smooth fine lines.', frame: 70 },
        { name: 'Niacinamide Pore Refiner', category: 'Serums', price: 42, badge: '', desc: 'Minimizes pores and evens skin tone for a smoother complexion.', frame: 85 },
        { name: 'Green Tea Calming Moisturizer', category: 'Creams', price: 44, badge: 'Popular', desc: 'Soothes and hydrates sensitive skin with antioxidant-rich green tea.', frame: 95 },
        { name: 'Squalane Oil Cleanser', category: 'Cleansers', price: 36, badge: '', desc: 'Dissolves makeup and impurities without stripping natural oils.', frame: 105 },
        { name: 'AHA/BHA Exfoliating Toner', category: 'Toners', price: 38, badge: 'New', desc: 'Gently removes dead skin cells for brighter, smoother skin.', frame: 20 },
        { name: 'Peptide Eye Cream', category: 'Creams', price: 58, badge: '', desc: 'Reduces dark circles and puffiness around the delicate eye area.', frame: 55 },
        { name: 'Centella Recovery Gel', category: 'Treatments', price: 40, badge: '', desc: 'Calms irritation and speeds skin barrier recovery.', frame: 30 },
    ];

    let currentVariant = 0;
    let frames = [];
    let currentFrame = 0;
    let canvasReady = false;
    let activeCategory = 'All';
    let searchQuery = '';

    /* ---------- DOM ELEMENTS ---------- */
    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloader-bar');
    const preloaderPercent = document.getElementById('preloader-percent');
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('hero');
    const heroName = document.getElementById('hero-product-name');
    const heroSubtitle = document.getElementById('hero-product-subtitle');
    const heroDesc = document.getElementById('hero-product-desc');
    const heroIndex = document.getElementById('hero-index');
    const heroContentLeft = document.querySelector('.hero-content-left');
    const scrollHint = document.getElementById('hero-scroll-hint');
    const navbar = document.getElementById('navbar');
    const themeToggle = document.getElementById('theme-toggle');
    const hamburger = document.getElementById('nav-hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const prevBtn = document.getElementById('variant-prev');
    const nextBtn = document.getElementById('variant-next');

    /* ---------- FRAME PATH BUILDER ---------- */
    function getFramePath(index) {
        const idx = String(index).padStart(3, '0');
        const delay = (index % 3 === 0) ? '0.033' : ((index % 3 === 2) ? '0.034' : '0.033');
        return `${FRAME_DIR}/frame_${idx}_delay-${delay}s.webp`;
    }

    function getAltFramePath(index) {
        const idx = String(index).padStart(3, '0');
        const delay = (index % 3 === 2) ? '0.033' : '0.034';
        return `${FRAME_DIR}/frame_${idx}_delay-${delay}s.webp`;
    }

    /* ---------- PRELOAD FRAMES ---------- */
    function preloadFrames() {
        return new Promise((resolve) => {
            let loaded = 0;
            const images = new Array(TOTAL_FRAMES);

            for (let i = 0; i < TOTAL_FRAMES; i++) {
                const img = new Image();
                img.onload = () => {
                    images[i] = img;
                    loaded++;
                    const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
                    preloaderBar.style.width = pct + '%';
                    preloaderPercent.textContent = 'Loading ' + pct + '%';
                    if (loaded === TOTAL_FRAMES) resolve(images);
                };
                img.onerror = () => {
                    const altImg = new Image();
                    altImg.onload = () => {
                        images[i] = altImg;
                        loaded++;
                        const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
                        preloaderBar.style.width = pct + '%';
                        preloaderPercent.textContent = 'Loading ' + pct + '%';
                        if (loaded === TOTAL_FRAMES) resolve(images);
                    };
                    altImg.onerror = () => {
                        images[i] = null;
                        loaded++;
                        const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
                        preloaderBar.style.width = pct + '%';
                        preloaderPercent.textContent = 'Loading ' + pct + '%';
                        if (loaded === TOTAL_FRAMES) resolve(images);
                    };
                    altImg.src = getAltFramePath(i);
                };
                img.src = getFramePath(i);
            }
        });
    }

    /* ---------- CANVAS RENDERING ---------- */
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (canvasReady && frames[currentFrame]) drawFrame(currentFrame);
    }

    function drawFrame(index) {
        const img = frames[index];
        if (!img) return;

        const cw = canvas.width;
        const ch = canvas.height;

        // Fill black background for letterboxing
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, cw, ch);

        // Contain fit — frame is scaled to fit fully inside the canvas
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const scale = Math.min(cw / iw, ch / ih);
        const sw = iw * scale;
        const sh = ih * scale;
        const sx = (cw - sw) / 2;
        const sy = (ch - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh);
    }

    /* ---------- SCROLL HANDLER ---------- */
    let ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    }

    function updateOnScroll() {
        ticking = false;
        const heroRect = heroSection.getBoundingClientRect();
        const heroH = heroSection.offsetHeight;
        const viewH = window.innerHeight;

        // Scroll progress within hero (0 → 1)
        const scrolled = -heroRect.top;
        const scrollRange = heroH - viewH;
        const progress = Math.max(0, Math.min(1, scrolled / scrollRange));

        // Map to frame index
        const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * (TOTAL_FRAMES - 1)));
        if (frameIndex !== currentFrame && canvasReady) {
            currentFrame = frameIndex;
            drawFrame(currentFrame);
        }

        // Scroll hint fade
        if (scrollHint) {
            if (progress > 0.05) scrollHint.classList.add('hidden');
            else scrollHint.classList.remove('hidden');
        }

        // Navbar scrolled state
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');

        // Active nav section
        updateActiveSection();

        // Parallax effects on sections
        applyParallax();
    }

    /* ---------- PARALLAX EFFECTS ---------- */
    function applyParallax() {
        // Parallax for section backgrounds and elements
        document.querySelectorAll('[data-parallax]').forEach(el => {
            const rect = el.getBoundingClientRect();
            const viewH = window.innerHeight;
            if (rect.top < viewH && rect.bottom > 0) {
                const progress = (viewH - rect.top) / (viewH + rect.height);
                const speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
                const offset = (progress - 0.5) * speed * 200;
                el.style.transform = `translateY(${offset}px)`;
            }
        });

        // Floating parallax for stat numbers
        document.querySelectorAll('.stat-card').forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            const viewH = window.innerHeight;
            if (rect.top < viewH && rect.bottom > 0) {
                const progress = (viewH - rect.top) / (viewH + rect.height);
                const offset = Math.sin(progress * Math.PI) * (5 + i * 2);
                card.style.transform = `translateY(${-offset}px)`;
            }
        });
    }

    /* ---------- ACTIVE SECTION ---------- */
    function updateActiveSection() {
        const sections = document.querySelectorAll('.section, .cta-section');
        const navLinks = document.querySelectorAll('.nav-link');
        let currentSection = '';

        sections.forEach(sec => {
            const top = sec.offsetTop - 200;
            if (window.scrollY >= top) currentSection = sec.id;
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === currentSection) link.classList.add('active');
        });
    }

    /* ---------- VARIANT SWITCHING ---------- */
    function switchVariant(direction) {
        const newIndex = (currentVariant + direction + VARIANTS.length) % VARIANTS.length;
        const variant = VARIANTS[newIndex];

        heroContentLeft.classList.add('fading');

        setTimeout(() => {
            heroName.textContent = variant.name;
            heroSubtitle.textContent = variant.subtitle;
            heroDesc.textContent = variant.desc;
            heroIndex.textContent = String(newIndex + 1).padStart(2, '0');

            document.documentElement.style.setProperty('--variant-accent', variant.accent);
            document.documentElement.style.setProperty('--sage', variant.accent);

            currentVariant = newIndex;
            heroContentLeft.classList.remove('fading');
        }, 400);
    }

    /* ---------- THEME TOGGLE ---------- */
    function initTheme() {
        const saved = localStorage.getItem('verdena-theme');
        if (saved) document.documentElement.setAttribute('data-theme', saved);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('verdena-theme', next);
    }

    /* ---------- MOBILE NAV ---------- */
    function toggleMobileNav() {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    }

    /* ---------- FAQ ACCORDION ---------- */
    function initFaq() {
        document.querySelectorAll('.faq-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.parentElement;
                const isOpen = item.classList.contains('open');
                document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
                if (!isOpen) item.classList.add('open');
            });
        });
    }

    /* ---------- SCROLL REVEAL WITH STAGGER ---------- */
    function initReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Stagger siblings
                    const parent = entry.target.parentElement;
                    const siblings = parent.querySelectorAll('.reveal');
                    let delay = 0;
                    siblings.forEach(sib => {
                        if (!sib.classList.contains('visible')) {
                            const rect = sib.getBoundingClientRect();
                            if (rect.top < window.innerHeight + 50) {
                                setTimeout(() => sib.classList.add('visible'), delay);
                                delay += 100;
                            }
                        }
                    });
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    /* ---------- COUNTER ANIMATION ---------- */
    function initCounters() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-count'));
                    if (isNaN(target)) return;
                    animateCounter(el, target);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
    }

    function animateCounter(el, target) {
        let current = 0;
        const duration = 1800;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutQuart
            const eased = 1 - Math.pow(1 - progress, 4);
            current = Math.round(eased * target);
            el.textContent = current;
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target;
        }
        requestAnimationFrame(update);
    }

    /* ---------- PRODUCT SEARCH & FILTER ---------- */
    function initProductFilter() {
        const searchInput = document.getElementById('product-search');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const grid = document.getElementById('products-catalog-grid');

        if (!searchInput || !grid) return;

        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderProducts();
        });

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.getAttribute('data-category');
                renderProducts();
            });
        });

        renderProducts();
    }

    function renderProducts() {
        const grid = document.getElementById('products-catalog-grid');
        if (!grid) return;

        let filtered = ALL_PRODUCTS;

        if (activeCategory !== 'All') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery) ||
                p.desc.toLowerCase().includes(searchQuery) ||
                p.category.toLowerCase().includes(searchQuery)
            );
        }

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="no-results"><p>No products match your search.</p></div>`;
            return;
        }

        grid.innerHTML = filtered.map((p, i) => {
            const frameIdx = String(p.frame).padStart(3, '0');
            const delay = (p.frame % 3 === 0) ? '0.033' : ((p.frame % 3 === 2) ? '0.034' : '0.033');
            const imgPath = `${FRAME_DIR}/frame_${frameIdx}_delay-${delay}s.webp`;
            const badgeHtml = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';
            return `
                <div class="product-card-pro reveal visible" style="animation-delay: ${i * 80}ms">
                    <div class="product-card-pro-image">
                        <img src="${imgPath}" alt="${p.name}" loading="lazy">
                        ${badgeHtml}
                        <div class="product-card-pro-overlay">
                            <button class="btn btn-solid btn-small">Quick View</button>
                        </div>
                    </div>
                    <div class="product-card-pro-content">
                        <span class="product-card-pro-category">${p.category}</span>
                        <h3 class="product-card-pro-name">${p.name}</h3>
                        <p class="product-card-pro-desc">${p.desc}</p>
                        <div class="product-card-pro-footer">
                            <span class="product-card-pro-price">$${p.price}.00</span>
                            <button class="btn-add-cart" aria-label="Add to cart">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                            </button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    /* ---------- SMOOTH SCROLL ---------- */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    if (mobileNav.classList.contains('open')) toggleMobileNav();
                }
            });
        });

        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    toggleMobileNav();
                }
            });
        });
    }

    /* ---------- INITIALIZE ---------- */
    async function init() {
        initTheme();
        resizeCanvas();

        frames = await preloadFrames();
        canvasReady = true;
        drawFrame(0);

        setTimeout(() => preloader.classList.add('loaded'), 300);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', resizeCanvas);
        themeToggle.addEventListener('click', toggleTheme);
        hamburger.addEventListener('click', toggleMobileNav);
        prevBtn.addEventListener('click', () => switchVariant(-1));
        nextBtn.addEventListener('click', () => switchVariant(1));

        initFaq();
        initReveal();
        initSmoothScroll();
        initCounters();
        initProductFilter();

        updateOnScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
