/**
 * content-loader.js
 * Lit les données sauvegardées dans l'admin (localStorage)
 * et met à jour le contenu de la page courante en temps réel.
 */
(function () {
    'use strict';

    var K = {
        profil:  'ksb_admin_profil',
        about:   'ksb_admin_about',
        skills:  'ksb_admin_skills',
        projets: 'ksb_admin_projets',
        xp:      'ksb_admin_xp',
        certs:   'ksb_admin_certs',
        veille:  'ksb_admin_veille'
    };

    function get(key) {
        try { return JSON.parse(localStorage.getItem(key) || 'null'); }
        catch (e) { return null; }
    }

    function esc(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    var page = window.location.pathname.split('/').pop() || 'index.html';

    /* ════════════════════════════════════════
       PROFIL — toutes les pages avec hero
    ════════════════════════════════════════ */
    function applyProfil() {
        var p = get(K.profil);
        if (!p) return;

        // Nom complet dans le hero
        var nameEl = document.querySelector('.display-name .name');
        if (nameEl && p.firstname) nameEl.textContent = p.firstname + ' ' + p.lastname;

        // Tagline / typewriter
        var tw = document.getElementById('typewriter');
        if (tw && p.tagline) tw.textContent = p.tagline;

        // Description hero
        var desc = document.querySelector('.hero-subtitle');
        if (desc && p.desc) desc.textContent = p.desc;

        // Stats
        var stats = document.querySelectorAll('.stat-item');
        var sData = [
            { num: p.s1n, lbl: p.s1l },
            { num: p.s2n, lbl: p.s2l },
            { num: p.s3n, lbl: p.s3l }
        ];
        stats.forEach(function (el, i) {
            if (!sData[i]) return;
            var numEl = el.querySelector('.stat-num');
            var lblEl = el.querySelector('.stat-label');
            if (numEl && sData[i].num) numEl.textContent = sData[i].num;
            if (lblEl && sData[i].lbl) lblEl.textContent = sData[i].lbl;
        });

        // Liens sociaux
        if (p.li) {
            var li = document.querySelector('a[aria-label*="LinkedIn"]');
            if (li) li.href = p.li;
        }
        if (p.gh) {
            var gh = document.querySelector('a[aria-label*="GitHub"]');
            if (gh) gh.href = p.gh;
        }
        if (p.email) {
            var em = document.querySelector('a[href^="mailto:"]');
            if (em) em.href = 'mailto:' + p.email;
        }

        // Titre du document
        document.title = (p.firstname ? p.firstname + ' ' + p.lastname : 'Kilian Sarroca Bonnafé') + ' — Portfolio';
    }

    /* ════════════════════════════════════════
       À PROPOS — index.html
    ════════════════════════════════════════ */
    function applyAbout() {
        var a = get(K.about);
        if (!a) return;

        var ps = document.querySelectorAll('.about-body p');
        if (ps[0] && a.p1) ps[0].innerHTML = a.p1;
        if (ps[1] && a.p2) ps[1].innerHTML = a.p2;

        var details = document.querySelectorAll('.detail-item');
        var fields = [
            { label: 'Formation',        value: a.form  },
            { label: 'Spécialisation',   value: a.spec  },
            { label: 'Localisation',     value: a.loc   },
            { label: 'Année',            value: a.dispo }
        ];
        details.forEach(function (item, i) {
            if (!fields[i]) return;
            var valEl = item.querySelector('.detail-value');
            if (valEl && fields[i].value) valEl.innerHTML = fields[i].value;
        });
    }

    /* ════════════════════════════════════════
       COMPÉTENCES — competences.html
    ════════════════════════════════════════ */
    function applySkills() {
        var skills = get(K.skills);
        if (!skills || !skills.length) return;

        var CAT_ORDER  = ['systeme', 'cyber', 'reseau', 'dev'];
        var CAT_LABELS = {
            systeme: "Systèmes &amp; Infrastructure",
            cyber:   "Cybersécurité",
            reseau:  "Réseaux &amp; Protocoles",
            dev:     "Développement Web"
        };
        var CAT_ICONS = {
            systeme: 'fas fa-server',
            cyber:   'fas fa-shield-alt',
            reseau:  'fas fa-network-wired',
            dev:     'fas fa-code'
        };

        // Grouper par catégorie
        var groups = {};
        CAT_ORDER.forEach(function (c) { groups[c] = []; });
        skills.forEach(function (s) {
            var c = s.cat || 'systeme';
            if (!groups[c]) groups[c] = [];
            groups[c].push(s);
        });

        // Construire le HTML
        var html = '';
        CAT_ORDER.forEach(function (cat) {
            if (!groups[cat] || !groups[cat].length) return;
            html += '<div class="skills-category-block">' +
                '<h2 class="skills-category-title" data-reveal>' +
                '<i class="' + CAT_ICONS[cat] + '" aria-hidden="true"></i>' +
                (CAT_LABELS[cat] || cat) +
                '</h2>' +
                '<div class="skills-table" data-reveal data-delay="1">';

            groups[cat].forEach(function (s) {
                html += '<div class="skill-row">' +
                    '<span class="skill-name">' +
                    '<i class="' + esc(s.icon || 'fas fa-tools') + '" aria-hidden="true"></i>' +
                    esc(s.name) +
                    '</span></div>';
            });

            html += '</div></div>';
        });

        var main = document.querySelector('.skills-body .container');
        if (main) {
            // Remplacer tout sauf les éventuels éléments hors skills-category-block
            var existing = main.querySelectorAll('.skills-category-block');
            if (existing.length) {
                // Remplacer tous les blocs existants
                var tmp = document.createElement('div');
                tmp.innerHTML = html;
                // Supprimer les anciens blocs
                existing.forEach(function (el) { el.remove(); });
                // Insérer les nouveaux avant les soft-skills
                var softBlock = main.querySelector('.skills-category-block:last-child');
                Array.from(tmp.children).forEach(function (child) {
                    main.appendChild(child);
                });
            }
        }

        // Relancer les révélations
        if (window._ksbReveal) window._ksbReveal();
    }

    /* ════════════════════════════════════════
       PROJETS — projets.html
    ════════════════════════════════════════ */
    function applyProjets() {
        var projets = get(K.projets);
        if (!projets || !projets.length) return;

        var list = document.querySelector('.project-list');
        if (!list) return;

        list.innerHTML = projets.map(function (p, i) {
            var tags = p.tags ? p.tags.split(',').map(function (t) {
                return '<span class="project-tag">' + esc(t.trim()) + '</span>';
            }).join('') : '';

            var arrow = p.link
                ? '<a href="' + esc(p.link) + '" target="_blank" rel="noopener noreferrer" class="project-arrow" aria-label="Voir sur GitHub"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a>'
                : '<span class="project-arrow"><i class="fas fa-lock" aria-hidden="true"></i></span>';

            return '<article class="project-item" data-reveal data-delay="' + (i + 1) + '">' +
                '<span class="project-num">0' + (i + 1) + '</span>' +
                '<div class="project-info">' +
                '<h3>' + esc(p.title) + '</h3>' +
                '<p>' + esc(p.desc) + '</p>' +
                '<div class="project-tags">' + tags + '</div>' +
                '</div>' +
                arrow +
                '</article>';
        }).join('');

        if (window._ksbReveal) window._ksbReveal();
    }

    /* ════════════════════════════════════════
       EXPÉRIENCES — experiences.html
    ════════════════════════════════════════ */
    function applyXp() {
        var xps = get(K.xp);
        if (!xps || !xps.length) return;

        var timeline = document.querySelector('.xp-timeline');
        if (!timeline) return;

        var TYPE_LABELS = { stage: 'Stage BTS SIO', job: 'Emploi / Saisonnier', formation: 'Formation' };
        var TYPE_ICONS  = { stage: 'fas fa-briefcase', job: 'fas fa-store', formation: 'fas fa-graduation-cap' };

        timeline.innerHTML = xps.map(function (x, i) {
            var missions = x.missions ? x.missions.split('\n').filter(Boolean).map(function (m) {
                return '<div class="xp-mission"><i class="fas fa-angle-right" aria-hidden="true"></i><span>' + esc(m.trim()) + '</span></div>';
            }).join('') : '';

            var tags = x.tags ? x.tags.split(',').map(function (t) {
                return '<span class="xp-tag">' + esc(t.trim()) + '</span>';
            }).join('') : '';

            var linkEl = x.link
                ? '<a href="' + esc(x.link) + '" target="_blank" rel="noopener noreferrer" class="xp-meta-item"><i class="fas fa-external-link-alt" aria-hidden="true"></i>' + esc(x.link.replace(/https?:\/\//,'').split('/')[0]) + '</a>'
                : '';

            return '<article class="xp-item" data-reveal data-delay="' + i + '">' +
                '<div class="xp-header">' +
                '<h2 class="xp-title">' + esc(x.title) + '</h2>' +
                '<span class="xp-badge ' + esc(x.type || 'stage') + '">' +
                '<i class="' + (TYPE_ICONS[x.type] || 'fas fa-briefcase') + '" aria-hidden="true"></i> ' +
                (TYPE_LABELS[x.type] || x.type) +
                '</span></div>' +
                '<div class="xp-meta">' +
                '<span class="xp-meta-item"><i class="fas fa-calendar" aria-hidden="true"></i>' + esc(x.date) + '</span>' +
                (x.lieu ? '<span class="xp-meta-item"><i class="fas fa-map-marker-alt" aria-hidden="true"></i>' + esc(x.lieu) + '</span>' : '') +
                linkEl +
                '</div>' +
                (x.desc ? '<p class="xp-description">' + esc(x.desc) + '</p>' : '') +
                (missions ? '<div class="xp-missions">' + missions + '</div>' : '') +
                (tags ? '<div class="xp-tags">' + tags + '</div>' : '') +
                '</article>';
        }).join('');

        if (window._ksbReveal) window._ksbReveal();
    }

    /* ════════════════════════════════════════
       CERTIFICATIONS — certifications.html
    ════════════════════════════════════════ */
    function applyCerts() {
        var certs = get(K.certs);
        if (!certs || !certs.length) return;

        var container = document.getElementById('certs-dynamic');
        if (!container) return;

        var STATUS_LABELS = { obtained: 'Obtenu', 'in-progress': 'En cours', planned: 'Planifié' };
        var STATUS_ICONS  = { obtained: 'fas fa-check', 'in-progress': 'fas fa-hourglass-half', planned: 'fas fa-calendar-alt' };
        var CREDLY_IDS    = ['1c32d8d7','9946e957','532c18e5','8c211c71','6f798427'];

        // Ne montrer que ceux qui ne sont pas dans la grille Credly
        var filtered = certs.filter(function (c) {
            if (!c.badge) return true;
            return !CREDLY_IDS.some(function (k) { return c.badge.indexOf(k) === 0; });
        });

        if (!filtered.length) {
            container.innerHTML = '<p style="color:var(--muted-lt);font-size:.9rem;">Aucune certification supplémentaire.</p>';
            return;
        }

        var issuerIcon = function (issuer) {
            var low = (issuer || '').toLowerCase();
            if (low.indexOf('cisco') > -1)     return 'fas fa-network-wired';
            if (low.indexOf('comptia') > -1)   return 'fas fa-shield-alt';
            if (low.indexOf('microsoft') > -1) return 'fab fa-microsoft';
            if (low.indexOf('linux') > -1)     return 'fab fa-linux';
            return 'fas fa-certificate';
        };

        container.innerHTML = filtered.map(function (c) {
            var badgeLink = c.badge
                ? '<a href="https://www.credly.com/badges/' + esc(c.badge) + '" target="_blank" rel="noopener noreferrer" style="font-size:.75rem;color:var(--gold);display:inline-flex;align-items:center;gap:.3rem;margin-top:.4rem;">Voir le badge <i class="fas fa-arrow-up-right-from-square" style="font-size:.6rem"></i></a>'
                : '';
            return '<div class="cert-card' + (c.status === 'obtained' ? ' obtained' : '') + '">' +
                '<div class="cert-card-header">' +
                '<div class="cert-logo"><i class="' + issuerIcon(c.issuer) + '"></i></div>' +
                '<span class="cert-status ' + esc(c.status) + '">' + (STATUS_LABELS[c.status] || c.status) + '</span>' +
                '</div>' +
                '<div><h3>' + esc(c.title) + '</h3><p class="cert-issuer">' + esc(c.issuer || '') + '</p></div>' +
                '<p>' + esc(c.desc || '') + '</p>' +
                badgeLink +
                '<div class="cert-date"><i class="' + (STATUS_ICONS[c.status] || 'fas fa-calendar') + '"></i> ' + esc(c.date || '') + '</div>' +
                '</div>';
        }).join('');
    }

    /* ════════════════════════════════════════
       VEILLE — veille.html
       (Les articles admin sont déjà chargés
        par le script inline de veille.html)
    ════════════════════════════════════════ */

    /* ════════════════════════════════════════
       DISPATCH SELON LA PAGE
    ════════════════════════════════════════ */
    function run() {
        // Profil sur toutes les pages avec hero
        applyProfil();

        if (page === 'index.html' || page === '') {
            applyAbout();
        }
        if (page === 'competences.html') {
            applySkills();
        }
        if (page === 'projets.html') {
            applyProjets();
        }
        if (page === 'experiences.html') {
            applyXp();
        }
        if (page === 'certifications.html') {
            applyCerts();
        }
    }

    // Expose la fonction reveal pour la relancer après injection
    window._ksbReveal = function () {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('[data-reveal]:not(.revealed)').forEach(function (el) {
                el.classList.add('revealed');
            });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    var d = parseFloat(e.target.getAttribute('data-delay') || 0) * 80;
                    setTimeout(function () { e.target.classList.add('revealed'); }, d);
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        document.querySelectorAll('[data-reveal]:not(.revealed)').forEach(function (el) {
            io.observe(el);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

}());
