/**
 * Portfolio — Kilian Sarroca Bonnafé
 * JS v2 : navigation · animations · transitions · filtres
 */
(function () {
    'use strict';

    /* ══ NAVIGATION MOBILE ══ */
    function initNav() {
        var burger   = document.querySelector('.burger');
        var navLinks = document.querySelector('.nav-links');
        if (!burger || !navLinks) return;

        burger.addEventListener('click', function () {
            var open = navLinks.classList.toggle('open');
            burger.classList.toggle('open', open);
            burger.setAttribute('aria-expanded', String(open));
            document.body.style.overflow = open ? 'hidden' : '';
        });

        navLinks.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                navLinks.classList.remove('open');
                burger.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('click', function (e) {
            if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('open');
                burger.classList.remove('open');
                burger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    /* ══ NAVBAR SCROLL ══ */
    function initNavScroll() {
        var nav = document.querySelector('.navbar');
        if (!nav) return;
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    nav.classList.toggle('scrolled', window.scrollY > 30);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
        nav.classList.toggle('scrolled', window.scrollY > 30);
    }

    /* ══ LIEN ACTIF ══ */
    function setActiveLink() {
        var page = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(function (a) {
            if (a.getAttribute('href') === page) a.classList.add('active');
        });
    }

    /* ══ BARRE DE PROGRESSION SCROLL ══ */
    function initScrollProgress() {
        var bar = document.getElementById('scroll-progress');
        if (!bar) return;
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(function () {
                    var total = document.documentElement.scrollHeight - window.innerHeight;
                    bar.style.transform = 'scaleX(' + (total > 0 ? Math.min(window.scrollY / total, 1) : 0) + ')';
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* ══ TRANSITION DE PAGE ══ */
    function initPageTransition() {
        var overlay = document.getElementById('page-overlay');
        if (!overlay) return;

        requestAnimationFrame(function () {
            setTimeout(function () { overlay.classList.add('out'); }, 10);
        });

        document.querySelectorAll('a[href]').forEach(function (a) {
            var href = a.getAttribute('href');
            if (!href || href.charAt(0) === '#' ||
                href.indexOf('mailto') === 0 ||
                href.indexOf('tel') === 0 ||
                href.indexOf('http') === 0 ||
                a.hasAttribute('download') ||
                a.getAttribute('target') === '_blank') return;

            a.addEventListener('click', function (e) {
                e.preventDefault();
                var dest = href;
                overlay.classList.remove('out');
                setTimeout(function () { window.location.href = dest; }, 350);
            });
        });
    }

    /* ══ HERO STAGGER ══ */
    function initHeroStagger() {
        var hero = document.querySelector('.hero');
        if (!hero) return;
        hero.querySelectorAll('[data-reveal]').forEach(function (el) {
            var d = parseFloat(el.getAttribute('data-delay') || 0) * 120 + 80;
            setTimeout(function () { el.classList.add('revealed'); }, d);
        });
    }

    /* ══ COMPTEURS ANIMÉS ══ */
    function initCounters() {
        var counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        function run(el) {
            var target   = parseFloat(el.getAttribute('data-count'));
            var suffix   = el.getAttribute('data-suffix') || '';
            var duration = 1600;
            var t0       = performance.now();
            (function tick(now) {
                var p = Math.min((now - t0) / duration, 1);
                var e = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(e * target) + suffix;
                if (p < 1) requestAnimationFrame(tick);
                else el.textContent = target + suffix;
            })(t0);
        }

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
                });
            }, { threshold: 0.6 });
            counters.forEach(function (c) { io.observe(c); });
        } else {
            counters.forEach(run);
        }
    }

    /* ══ SCROLL REVEAL ══ */
    function initReveal() {
        var hero = document.querySelector('.hero');
        var els  = [];
        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            if (hero && hero.contains(el)) return;
            if (!el.classList.contains('revealed')) els.push(el);
        });
        if (!els.length) return;

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var d = parseFloat(entry.target.getAttribute('data-delay') || 0) * 80;
                        setTimeout(function () { entry.target.classList.add('revealed'); }, d);
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
            els.forEach(function (el) { io.observe(el); });
        } else {
            els.forEach(function (el) { el.classList.add('revealed'); });
        }
    }

    /* ══ BARRES DE COMPÉTENCES ══ */
    function initSkillBars() {
        var fills = document.querySelectorAll('.skill-fill[data-level]');
        if (!fills.length) return;
        fills.forEach(function (f) { f.style.width = '0'; });

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        setTimeout(function () { el.style.width = el.getAttribute('data-level') + '%'; }, 100);
                        io.unobserve(el);
                    }
                });
            }, { threshold: 0.4 });
            fills.forEach(function (f) { io.observe(f); });
        } else {
            fills.forEach(function (f) { f.style.width = f.getAttribute('data-level') + '%'; });
        }
    }

    /* ══ BOUTONS MAGNÉTIQUES ══ */
    function initMagnetic() {
        if (window.matchMedia('(hover: none)').matches) return;
        document.querySelectorAll('.btn-gold, .btn-outline').forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                var r  = btn.getBoundingClientRect();
                var dx = (e.clientX - r.left - r.width  / 2) * 0.2;
                var dy = (e.clientY - r.top  - r.height / 2) * 0.2;
                btn.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
            });
            btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
        });
    }

    /* ══ BACK TO TOP ══ */
    function initBackTop() {
        var btn = document.querySelector('.back-top');
        if (!btn) return;
        window.addEventListener('scroll', function () {
            btn.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ══ FORMULAIRE ══ */
    function initForm() {
        var form = document.getElementById('contact-form');
        if (!form) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn  = form.querySelector('.submit-btn');
            var span = btn.querySelector('span');
            if (span) span.textContent = 'Ouverture…';
            btn.disabled = true;
            var n = form.querySelector('[name="name"]').value.trim();
            var m = form.querySelector('[name="email"]').value.trim();
            var s = form.querySelector('[name="subject"]').value.trim();
            var t = form.querySelector('[name="message"]').value.trim();
            window.location.href =
                'mailto:kilian.sarroca@icloud.com' +
                '?subject=' + encodeURIComponent('[Portfolio] ' + s) +
                '&body='    + encodeURIComponent('De : ' + n + ' (' + m + ')\n\n' + t);
            setTimeout(function () {
                if (span) span.textContent = 'Envoyer le message';
                btn.disabled = false;
                var ok = document.getElementById('form-success');
                if (ok) { form.style.display = 'none'; ok.style.display = 'block'; }
            }, 700);
        });
    }

    /* ══ FILTRE VEILLE ══ */
    function initVeilleFilter() {
        var tabs  = document.querySelectorAll('[data-filter]');
        var cards = document.querySelectorAll('[data-category]');
        if (!tabs.length) return;

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var cat = tab.getAttribute('data-filter');
                tabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');

                cards.forEach(function (card) {
                    if (cat === 'all' || card.getAttribute('data-category') === cat) {
                        card.style.display = '';
                        requestAnimationFrame(function () { card.classList.add('revealed'); });
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    /* ══ INIT ══ */
    function init() {
        initPageTransition();
        initNav();
        initNavScroll();
        setActiveLink();
        initScrollProgress();
        initHeroStagger();
        initReveal();
        initCounters();
        initSkillBars();
        initMagnetic();
        initBackTop();
        initForm();
        initVeilleFilter();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());
