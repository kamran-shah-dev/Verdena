/* ===== VERDENA — INTERACTIVE LOGIC (REDESIGNED) ===== */

(function () {
    'use strict';

    const TOTAL_FRAMES = 192;
    const FRAME_DIR = 'ezgif-split';

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

    let frames = [];
    let currentFrame = 0;
    let canvasReady = false;
    let activeCategory = 'All';
    let searchQuery = '';

    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloader-bar');
    const preloaderPercent = document.getElementById('preloader-percent');
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('hero-parallax');
    const heroEndCta = document.getElementById('hero-end-cta');
    const scrollHint = document.getElementById('hero-scroll-hint');
    const navbar = document.getElementById('navbar');
    const themeToggle = document.getElementById('theme-toggle');
    const hamburger = document.getElementById('nav-hamburger');
    const mobileNav = document.getElementById('mobile-nav');

    /* FRAME PATHS */
    function getFramePath(index) {
        const idx = String(index).padStart(3, '0');
        return `${FRAME_DIR}/frame_${idx}_delay-0.041s.webp`;
    }

    function getAltFramePath(index) {
        return getFramePath(index);
    }

    /* PRELOAD */
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
                    preloaderPercent.textContent = pct + '%';
                    if (loaded === TOTAL_FRAMES) resolve(images);
                };
                img.onerror = () => {
                    const alt = new Image();
                    alt.onload = () => { images[i] = alt; };
                    alt.onerror = () => { images[i] = null; };
                    alt.src = getAltFramePath(i);
                    loaded++;
                    const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
                    preloaderBar.style.width = pct + '%';
                    preloaderPercent.textContent = pct + '%';
                    if (loaded === TOTAL_FRAMES) resolve(images);
                };
                img.src = getFramePath(i);
            }
        });
    }

    /* CANVAS */
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (canvasReady && frames[currentFrame]) drawFrame(currentFrame);
    }

    function drawFrame(index) {
        const img = frames[index];
        if (!img) return;
        const cw = canvas.width, ch = canvas.height;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, cw, ch);
        const iw = img.naturalWidth, ih = img.naturalHeight;

        // "contain" style image drawing to prevent cropping
        const scale = Math.min(cw / iw, ch / ih);
        const sw = iw * scale, sh = ih * scale;

        const sx = (cw - sw) / 2;
        const sy = (ch - sh) / 2;

        ctx.drawImage(img, sx, sy, sw, sh);
    }

    /* SCROLL */
    let ticking = false;

    function onScroll() {
        if (!ticking) { requestAnimationFrame(updateOnScroll); ticking = true; }
    }

    function updateOnScroll() {
        ticking = false;
        if (!heroSection) return;

        const heroRect = heroSection.getBoundingClientRect();
        const heroH = heroSection.offsetHeight;
        const viewH = window.innerHeight;

        const scrolled = -heroRect.top;
        const scrollRange = heroH - viewH;
        let progress = 0;
        if (scrollRange > 0) {
            progress = Math.max(0, Math.min(1, scrolled / scrollRange));
        }

        const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
        if (frameIndex !== currentFrame && canvasReady) {
            currentFrame = frameIndex;
            drawFrame(currentFrame);
        }

        // Scroll hint
        if (scrollHint) {
            scrollHint.classList.toggle('hidden', progress > 0.04);
        }

        if (heroEndCta) {
            heroEndCta.classList.toggle('visible', progress >= 0.99);
        }

        // Navbar transition
        const inHero = heroRect.bottom > viewH * 0.2;
        if (inHero) {
            navbar.classList.add('hero-mode');
            navbar.classList.remove('scrolled');
        } else {
            navbar.classList.remove('hero-mode');
            navbar.classList.add('scrolled');
        }

        updateActiveSection();
        applyParallax();
    }

    function applyParallax() {
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
    }

    function updateActiveSection() {
        const sections = document.querySelectorAll('.section, .cta-section');
        const navLinks = document.querySelectorAll('.nav-link');
        let currentSection = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 200) currentSection = sec.id;
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === currentSection) link.classList.add('active');
        });
    }

    /* THEME */
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

    /* MOBILE NAV */
    function toggleMobileNav() {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    }

    /* FAQ */
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

    /* REVEAL */
    function initReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
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
        }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    /* COUNTERS */
    function initCounters() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-count'));
                    if (!isNaN(target)) animateCounter(el, target);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
    }

    function animateCounter(el, target) {
        const duration = 1800;
        const start = performance.now();
        function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target;
        }
        requestAnimationFrame(update);
    }

    /* PRODUCT FILTER */
    function initProductFilter() {
        const searchInput = document.getElementById('product-search');
        const categoryBtns = document.querySelectorAll('.category-btn');
        if (!searchInput) return;
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
        if (activeCategory !== 'All') filtered = filtered.filter(p => p.category === activeCategory);
        if (searchQuery) filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.desc.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery)
        );

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="no-results"><p>No products found.</p></div>`;
            return;
        }

        grid.innerHTML = filtered.map((p, i) => {
            const frameIdx = String(p.frame).padStart(3, '0');
            const delay = (p.frame % 3 === 2) ? '0.034' : '0.033';
            const imgPath = `${FRAME_DIR}/frame_${frameIdx}_delay-${delay}s.webp`;
            const badgeHtml = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';
            return `
                <div class="product-card-pro reveal visible" style="animation-delay: ${i * 70}ms">
                    <div class="product-card-pro-image">
                        <img src="${imgPath}" alt="${p.name}" loading="lazy">
                        ${badgeHtml}
                        <div class="product-card-pro-overlay">
                            <button class="btn btn-primary btn-small">Quick View</button>
                        </div>
                    </div>
                    <div class="product-card-pro-content">
                        <span class="product-card-pro-category">${p.category}</span>
                        <h3 class="product-card-pro-name">${p.name}</h3>
                        <p class="product-card-pro-desc">${p.desc}</p>
                        <div class="product-card-pro-footer">
                            <span class="product-card-pro-price">$${p.price}</span>
                            <button class="btn-add-cart" aria-label="Add to cart">
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                            </button>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    /* SMOOTH SCROLL */
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

    /* INIT */
    async function init() {
        initTheme();
        resizeCanvas();

        frames = await preloadFrames();
        canvasReady = true;
        drawFrame(0);

        setTimeout(() => preloader.classList.add('loaded'), 400);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', resizeCanvas);
        themeToggle.addEventListener('click', toggleTheme);
        hamburger.addEventListener('click', toggleMobileNav);

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