// Shared surah player script used by all reciter pages.
// Each page must define a global `RECITER` object before including this script, e.g:
// <script>window.RECITER = { name: 'الشيخ ...', base: 'https://server/path/' };</script>

(function () {
    'use strict';

    function getReciterConfig() {
        if (window.RECITER && window.RECITER.base) return window.RECITER;
        try {
            var b = document && document.body;
            if (b) {
                var name = b.getAttribute('data-reciter-name') || (b.dataset && b.dataset.reciterName);
                var base = b.getAttribute('data-reciter-base') || (b.dataset && b.dataset.reciterBase);
                if (base) return { name: name || '', base: base };
            }
        } catch (e) {}
        return null;
    }

    var RECITER = getReciterConfig();
    if (!RECITER || !RECITER.base) {
        console.error('RECITER config missing. Set window.RECITER or <body data-reciter-base="https://.../" data-reciter-name="...">');
        return;
    }

    var surahNames = [
        "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الإنفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"
    ];

    var surahs = surahNames.map(function (name, i) { return { name: name, file: RECITER.base + String(i + 1).padStart(3, '0') + '.mp3' }; });

    var surahListEl = document.getElementById('surah-list');
    var surahTableBody = document.getElementById('surah-table-body');
    var mainAudio = document.getElementById('mainAudio');
    var audioSource = document.getElementById('audioSource');
    var currentSurahEl = document.getElementById('currentSurah');
    var playPauseBtn = document.getElementById('playPauseBtn');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    var toggleBtn = document.getElementById('toggleSideBtn');
    var sideMenu = document.getElementById('side-menu');

    var current = 0;

    function safeText(s) { return String(s || ''); }

    function loadSurah(idx) {
        if (idx < 0) idx = 0;
        if (idx >= surahs.length) idx = surahs.length - 1;
        if (audioSource) audioSource.src = surahs[idx].file;
        try { if (mainAudio) mainAudio.load(); } catch (e) {}
        if (currentSurahEl) currentSurahEl.textContent = 'السورة الحالية: ' + surahs[idx].name;
        if (playPauseBtn) playPauseBtn.textContent = 'تشغيل';
    }

    function playSurah(idx) {
        current = idx;
        loadSurah(current);
        try { if (mainAudio) { mainAudio.play(); if (playPauseBtn) playPauseBtn.textContent = 'إيقاف'; } } catch (e) {}
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { if (current > 0) { current--; loadSurah(current); } });
    if (nextBtn) nextBtn.addEventListener('click', function () { if (current < surahs.length - 1) { current++; loadSurah(current); } });

    if (playPauseBtn) playPauseBtn.addEventListener('click', function () {
        try {
            if (!mainAudio) return;
            if (mainAudio.paused) { mainAudio.play(); if (playPauseBtn) playPauseBtn.textContent = 'إيقاف'; }
            else { mainAudio.pause(); if (playPauseBtn) playPauseBtn.textContent = 'تشغيل'; }
        } catch (e) {}
    });

    if (mainAudio) mainAudio.addEventListener('ended', function () { if (playPauseBtn) playPauseBtn.textContent = 'تشغيل'; });

    if (surahListEl) {
        surahs.forEach(function (s, i) {
            var li = document.createElement('li');
            li.style.marginBottom = '3px';
            var a = document.createElement('a');
            a.textContent = (i + 1) + ' ' + s.name;
            a.href = 'javascript:void(0)';
            a.style.color = '#0097e6';
            a.style.textDecoration = 'none';
            a.style.display = 'block';
            a.style.padding = '2px 0';
            a.onclick = function () { playSurah(i); try { var controls = document.getElementById('audio-controls'); if (controls) window.scrollTo({ top: controls.offsetTop, behavior: 'smooth' }); } catch (e) {}; };
            li.appendChild(a);
            surahListEl.appendChild(li);
        });
    }

    if (surahTableBody) {
        surahs.forEach(function (surah, index) {
            var row = document.createElement('tr');
            row.innerHTML = '\n                    <td>' + (index + 1) + '</td>\n                    <td>' + safeText(surah.name) + '</td>\n                    <td>' + (index + 1) + ' من 114</td>\n                    <td><a class="download-btn" href="' + surah.file + '" download>تحميل</a></td>\n                    <td><button class="listen-btn" data-index="' + index + '">استماع مباشر</button></td>\n                ';
            surahTableBody.appendChild(row);
        });

        surahTableBody.addEventListener('click', function (e) {
            var btn = e.target && e.target.closest ? e.target.closest('.listen-btn') : null;
            if (btn) {
                var idx = parseInt(btn.getAttribute('data-index'), 10);
                if (!isNaN(idx)) playSurah(idx);
            }
        });
    }

    function updateToggleButton() {
        var isHidden = sideMenu && sideMenu.style.display === 'none';
        if (toggleBtn) toggleBtn.textContent = isHidden ? 'إظهار القائمة' : 'إخفاء القائمة';
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(!isHidden));
    }

    if (toggleBtn && sideMenu) {
        toggleBtn.addEventListener('click', function () {
            var isHidden = sideMenu.style.display === 'none';
            sideMenu.style.display = isHidden ? '' : 'none';
            try { localStorage.setItem('sideMenuHidden', sideMenu.style.display === 'none' ? '1' : '0'); } catch (e) {}
            updateToggleButton();
        });
        try { if (localStorage.getItem('sideMenuHidden') === '1') sideMenu.style.display = 'none'; } catch (e) {}
        updateToggleButton();
    }

    (function setReciterName() {
        try {
            var nameEl = document.querySelector('.reciter-name');
            if (nameEl && RECITER.name) nameEl.textContent = RECITER.name;
        } catch (e) {}
    }());

    window.surahPlayer = { playSurah: playSurah, loadSurah: loadSurah, surahs: surahs, reciter: RECITER };
    loadSurah(current);
})();
