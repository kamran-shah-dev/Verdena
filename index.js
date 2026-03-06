/* ===== VERDENA — INTERACTIVE LOGIC ===== */

(function () {
    'use strict';

    /* ---------- CONFIGURATION ---------- */
    const TOTAL_FRAMES = 192;
    const FRAME_DIR = 'ezgif-split';

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

    let currentVariant = 0;
    let frames = [];
    let currentFrame = 0;
    let canvasReady = false;

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
        const delay = (index % 3 === 0) ? '0.041' : '0.042';
        return `${FRAME_DIR}/frame_${idx}_delay-${delay}s.webp`;
    }

    function getAltFramePath(index) {
        const idx = String(index).padStart(3, '0');
        const delay = (index % 3 === 0) ? '0.042' : '0.041';
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
                    // Try alternate delay pattern
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cover fit
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const scale = Math.max(cw / iw, ch / ih);
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

        // Fade out
        heroContentLeft.classList.add('fading');

        setTimeout(() => {
            // Update content
            heroName.textContent = variant.name;
            heroSubtitle.textContent = variant.subtitle;
            heroDesc.textContent = variant.desc;
            heroIndex.textContent = String(newIndex + 1).padStart(2, '0');

            // Update accent color
            document.documentElement.style.setProperty('--variant-accent', variant.accent);
            document.documentElement.style.setProperty('--sage', variant.accent);

            currentVariant = newIndex;

            // Fade in
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
                // Close all
                document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
                // Toggle current
                if (!isOpen) item.classList.add('open');
            });
        });
    }

    /* ---------- SCROLL REVEAL ---------- */
    function initReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    /* ---------- SMOOTH SCROLL ---------- */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Close mobile nav if open
                    if (mobileNav.classList.contains('open')) toggleMobileNav();
                }
            });
        });

        // Mobile nav links
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

        // Preload all frames
        frames = await preloadFrames();
        canvasReady = true;

        // Draw first frame
        drawFrame(0);

        // Hide preloader
        setTimeout(() => preloader.classList.add('loaded'), 300);

        // Bind events
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', resizeCanvas);
        themeToggle.addEventListener('click', toggleTheme);
        hamburger.addEventListener('click', toggleMobileNav);
        prevBtn.addEventListener('click', () => switchVariant(-1));
        nextBtn.addEventListener('click', () => switchVariant(1));

        initFaq();
        initReveal();
        initSmoothScroll();

        // Initial scroll state
        updateOnScroll();
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
