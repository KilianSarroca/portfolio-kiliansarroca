/**
 * tracker.js — Suivi visiteurs
 * IP + géolocalisation · durée · onglets actifs · localStorage
 */
(function () {
    'use strict';

    var VISITS_KEY  = 'ksb_visits';
    var ACTIVE_KEY  = 'ksb_active_tabs';
    var MAX_ENTRIES = 800;

    /* ── Objet visite courant ── */
    var visit = {
        id:       Math.random().toString(36).substr(2, 9),
        page:     window.location.pathname.split('/').pop() || 'index.html',
        title:    document.title,
        time:     Date.now(),
        ua:       navigator.userAgent,
        ref:      document.referrer || 'direct',
        ip:       null,
        country:  null,
        city:     null,
        flag:     null,
        duration: 0
    };

    /* ── Sauvegarde dans localStorage ── */
    function saveVisit() {
        try {
            var list = JSON.parse(localStorage.getItem(VISITS_KEY) || '[]');
            /* Met à jour si déjà présent, sinon ajoute */
            var idx = -1;
            for (var i = 0; i < list.length; i++) {
                if (list[i].id === visit.id) { idx = i; break; }
            }
            if (idx >= 0) {
                list[idx] = visit;
            } else {
                list.unshift(visit);
                if (list.length > MAX_ENTRIES) list = list.slice(0, MAX_ENTRIES);
            }
            localStorage.setItem(VISITS_KEY, JSON.stringify(list));
        } catch (e) {}
    }

    /* ── Récupère IP + localisation via ip-api (gratuit, sans clé) ── */
    function fetchGeo() {
        fetch('https://ip-api.com/json/?fields=status,country,countryCode,city,query')
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (d.status === 'success') {
                    visit.ip      = d.query;
                    visit.country = d.country;
                    visit.city    = d.city;
                    visit.flag    = d.countryCode
                        ? 'https://flagcdn.com/16x12/' + d.countryCode.toLowerCase() + '.png'
                        : null;
                } else {
                    /* Fallback IP seulement */
                    return fetch('https://api.ipify.org?format=json')
                        .then(function (r) { return r.json(); })
                        .then(function (d) { visit.ip = d.ip; });
                }
            })
            .catch(function () {
                /* Silencieux — pas d'IP disponible */
            })
            .finally(function () {
                saveVisit();
                /* Expose l'IP pour les pages qui souhaitent l'afficher */
                if (visit.ip) {
                    var el = document.getElementById('visitor-ip');
                    if (el) el.textContent = visit.ip;
                }
            });
    }

    /* ── Durée de visite ── */
    var t0 = Date.now();
    window.addEventListener('beforeunload', function () {
        visit.duration = Math.round((Date.now() - t0) / 1000);
        saveVisit();
    });

    /* ── Onglets actifs (même navigateur via BroadcastChannel) ── */
    if (typeof BroadcastChannel !== 'undefined') {
        var chan  = new BroadcastChannel('ksb_presence');
        var tabId = visit.id;
        var peers = {};

        function heartbeat() {
            chan.postMessage({ type: 'ping', id: tabId, page: visit.page });
        }

        chan.onmessage = function (e) {
            var d = e.data;
            if (d.type === 'ping') {
                peers[d.id] = { page: d.page, time: Date.now() };
                chan.postMessage({ type: 'pong', id: tabId, page: visit.page });
            }
            if (d.type === 'pong') {
                peers[d.id] = { page: d.page, time: Date.now() };
            }
            if (d.type === 'leave') {
                delete peers[d.id];
            }
            /* Nettoie les pairs silencieux > 35s */
            var now = Date.now();
            Object.keys(peers).forEach(function (k) {
                if (now - peers[k].time > 35000) delete peers[k];
            });
            /* Met à jour localStorage */
            try {
                localStorage.setItem(ACTIVE_KEY, JSON.stringify(
                    Object.keys(peers).length + 1 /* soi-même */
                ));
            } catch (e) {}
        };

        heartbeat();
        var hb = setInterval(heartbeat, 12000);

        window.addEventListener('beforeunload', function () {
            clearInterval(hb);
            chan.postMessage({ type: 'leave', id: tabId });
        });

        /* Rafraîchit le compteur d'actifs sur la page admin */
        setInterval(function () {
            var c = document.getElementById('active-count');
            if (c) {
                var n = parseInt(localStorage.getItem(ACTIVE_KEY) || '1', 10);
                c.textContent = n;
            }
        }, 5000);
    }

    /* ── Détecte l'accès admin (Ctrl+Shift+K) ── */
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'K') {
            window.location.href = 'admin.html';
        }
    });

    fetchGeo();

    /* Expose pour admin.js */
    window._ksb = { visit: visit, VISITS_KEY: VISITS_KEY, ACTIVE_KEY: ACTIVE_KEY };
}());
